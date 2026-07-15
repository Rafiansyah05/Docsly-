'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

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
