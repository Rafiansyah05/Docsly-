'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Resend } from 'resend';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const namaLengkap = formData.get('nama_lengkap') as string;
  
  const supabase = createClient();

  const { data: existingProfile } = await supabase.from('profiles').select('email').eq('email', email).single();
  
  if (existingProfile) {
    return { error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk dengan Google.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: namaLengkap,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await supabase.from('profiles').insert([
      {
        id: data.user.id,
        email: data.user.email,
        full_name: namaLengkap,
        avatar_url: ''
      }
    ]);
  }

  return { success: true };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const siteUrl = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url); // Redirect to Google OAuth URL
  }
}

export async function sendResetPasswordEmail(email: string) {
  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Cek apakah akun benar-benar terdaftar untuk menghemat limit resend
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (profileError || !existingProfile) {
      return { error: 'Email tidak terdaftar di sistem kami.' };
    }

    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
    const siteUrl = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/reset-password`
      }
    });

    if (error) {
      console.error('Generate link error:', error);
      return { error: 'Gagal membuat link reset password.' };
    }

    if (!data.properties?.action_link) {
      return { error: 'Link reset tidak tersedia.' };
    }

    const actionLink = data.properties.action_link;
    const resend = new Resend(process.env.RESEND_API_KEY!);
    
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; padding: 40px 0; color: #111827;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="padding: 32px;">
            <h2 style="margin-top: 0; font-size: 20px; font-weight: 600; color: #111827;">Permintaan Reset Password</h2>
            <p style="margin: 16px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
              Kami menerima permintaan untuk mereset password akun Docsly Anda. Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.
            </p>
            <p style="margin: 16px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
              Untuk membuat password baru, silakan klik tombol di bawah ini:
            </p>
            <div style="margin: 32px 0;">
              <a href="${actionLink}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; display: inline-block;">Reset Password</a>
            </div>
            <p style="margin: 16px 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
              Link ini hanya berlaku selama 24 jam.<br>
              Jika tombol tidak berfungsi, salin dan tempel URL berikut di browser Anda:<br>
              <span style="color: #3b82f6; word-break: break-all;">${actionLink}</span>
            </p>
          </div>
          <div style="background-color: #f3f4f6; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
              &copy; ${new Date().getFullYear()} Docsly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    // Gunakan 'noreply@pradatelyu.online' karena domain ini sudah diverifikasi di Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@pradatelyu.online';
    
    const { error: resendError } = await resend.emails.send({
      from: `Docsly <${fromEmail}>`,
      to: email,
      subject: 'Reset Password Akun Docsly Anda',
      html: emailHtml,
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      
      if (resendError.message?.includes('not verified')) {
        return { error: 'Domain email pengirim belum diverifikasi di Resend. Silakan set RESEND_FROM_EMAIL=onboarding@resend.dev di .env untuk masa uji coba.' };
      }
      
      if (resendError.message?.toLowerCase().includes('own email address') || resendError.message?.toLowerCase().includes('testing')) {
        return { error: 'Akun Resend masih dalam mode testing. Anda HANYA BISA mengirim email ke alamat Anda sendiri yang terdaftar di akun Resend.' };
      }
      
      return { error: 'Gagal mengirim email reset password. Pastikan kuota Resend masih tersedia.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('sendResetPasswordEmail error:', err);
    return { error: 'Terjadi kesalahan internal server.' };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string;
  const supabase = createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  return { success: true };
}
