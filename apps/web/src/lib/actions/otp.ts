'use server';

import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxxxxxxx' 
  ? process.env.RESEND_API_KEY 
  : 're_eyVmLqwf_6DbhtidHUe7WDWaVPeHER5ow';

const resend = new Resend(resendApiKey);

// Template email profesional
const getEmailTemplate = (otp: string, fullName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Verifikasi Docsly</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      color: #0f172a;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 40px;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 32px;
      letter-spacing: -0.5px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-container {
      background-color: #f1f5f9;
      border-radius: 6px;
      padding: 24px;
      text-align: center;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #2563eb;
      margin: 0;
    }
    .footer {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
    }
    .warning {
      color: #ef4444;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Docsly</div>
    <div class="title">Kode Verifikasi Anda</div>
    <div class="text">
      Halo ${fullName},<br><br>
      Terima kasih telah mendaftar di Docsly. Silakan gunakan kode verifikasi berikut untuk menyelesaikan proses registrasi Anda:
    </div>
    <div class="otp-container">
      <div class="otp-code">${otp}</div>
    </div>
    <div class="text">
      Kode ini hanya berlaku selama <span class="warning">5 menit</span>. Jangan bagikan kode ini kepada siapapun untuk menjaga keamanan akun Anda.
    </div>
    <div class="text">
      Jika Anda tidak merasa melakukan pendaftaran ini, Anda dapat mengabaikan email ini.
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Docsly. Hak Cipta Dilindungi.<br>
      Pesan ini dikirimkan secara otomatis, mohon tidak membalas email ini.
    </div>
  </div>
</body>
</html>
`;

export async function sendOtp(email: string, fullName: string) {
  try {
    const supabase = createClient();
    
    // We need service role key to bypass RLS when checking profiles
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return { error: 'Kesalahan konfigurasi server.' };
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // Check if email already exists bypassing RLS
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
      
    if (existingProfile) {
      return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan Google.' };
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Upsert to otp_requests table
    const { error: dbError } = await supabase
      .from('otp_requests')
      .upsert({ 
        email, 
        otp, 
        expires_at: expiresAt 
      }, { onConflict: 'email' });

    if (dbError) {
      console.error('Failed to save OTP:', dbError);
      return { error: 'Gagal memproses permintaan OTP. Silakan coba lagi.' };
    }

    // Send email using Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Docsly <onboarding@resend.dev>',
      to: [email],
      subject: 'Kode Verifikasi Registrasi Docsly',
      html: getEmailTemplate(otp, fullName),
    });

    if (emailError) {
      console.error('Failed to send email:', emailError);
      return { error: 'Gagal mengirim email OTP. Pastikan email yang Anda masukkan valid.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('sendOtp error:', err);
    return { error: 'Terjadi kesalahan sistem.' };
  }
}

export async function verifyAndRegister(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('nama_lengkap') as string;
  const otp = formData.get('otp') as string;

  if (!email || !password || !fullName || !otp) {
    return { error: 'Data tidak lengkap.' };
  }

  const supabase = createClient();

  try {
    // 1. Verify OTP
    const { data: request, error: fetchError } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !request) {
      return { error: 'Sesi OTP tidak ditemukan atau sudah kadaluarsa. Silakan minta kode baru.' };
    }

    if (request.otp !== otp) {
      return { error: 'Kode OTP salah.' };
    }

    if (new Date(request.expires_at) < new Date()) {
      return { error: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.' };
    }

    // 2. Register user via Supabase Admin API
    // We need service role key to bypass email confirmation and auto confirm
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return { error: 'Kesalahan konfigurasi server.' };
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    let { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      // If the email exists in auth.users but NOT in profiles, it means the profile was manually deleted (orphaned account).
      if (authError.message.toLowerCase().includes('already been registered') || authError.message.toLowerCase().includes('already exists')) {
        const { data: existingProfile } = await supabaseAdmin.from('profiles').select('email').eq('email', email).single();
        if (!existingProfile) {
          // It is an orphaned account. Let's find it and delete it.
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          const orphanedUser = usersData?.users.find((u: any) => u.email === email);
          if (orphanedUser) {
            await supabaseAdmin.auth.admin.deleteUser(orphanedUser.id);
            // Retry creation
            const retryResult = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { full_name: fullName }
            });
            if (retryResult.error) {
              return { error: retryResult.error.message };
            }
            authData = retryResult.data;
            authError = null;
          } else {
            return { error: 'Email sudah terdaftar. Silakan masuk.' };
          }
        } else {
          return { error: 'Email sudah terdaftar. Silakan masuk.' };
        }
      } else {
        console.error('Create user error:', authError);
        return { error: authError.message };
      }
    }

    // 3. Create profile entry
    if (authData.user) {
      // NOTE: Normally a trigger might do this, but if your DB trigger requires 
      // certain conditions, we can let it run. Let's check if the trigger exists.
      // Assuming handle_new_user trigger exists and runs on insert to auth.users,
      // it will create the profile. We just need to make sure we don't duplicate it.
      
      // Delete OTP request to prevent reuse
      await supabase.from('otp_requests').delete().eq('email', email);

      // 4. Sign in the user so they get the session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Auto login error:', signInError);
        // Even if auto-login fails, registration succeeded
        return { success: true, warning: 'Akun berhasil dibuat, namun gagal login otomatis. Silakan login manual.' };
      }

      return { success: true };
    }

    return { error: 'Terjadi kesalahan sistem saat membuat akun.' };
  } catch (err: any) {
    console.error('verifyAndRegister error:', err);
    return { error: 'Terjadi kesalahan sistem.' };
  }
}
