
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/w';

  if (error) {
    const errorMsg = error_description || 'Autentikasi gagal. Akun mungkin sudah terdaftar.';
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(errorMsg)}`, request.url));
  }

  if (code) {
    const supabase = createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
        
        if (!existingProfile) {
          const { data: profileByEmail } = await supabase.from('profiles').select('id').eq('email', user.email).single();
          
          if (!profileByEmail) {
            await supabase.from('profiles').insert([
              { 
                id: user.id, 
                email: user.email, 
                full_name: user.user_metadata.full_name || user.user_metadata.name || '',
                avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || ''
              }
            ]);
          }
        }
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/login?error=Tidak%20dapat%20melakukan%20autentikasi', request.url));
}
