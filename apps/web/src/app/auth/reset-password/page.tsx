'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full h-11 font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm" disabled={pending}>
      {pending ? 'Menyimpan...' : 'Ganti Password'}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isReady, setIsReady] = useState(false); // Untuk memastikan session sudah terbaca
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function setupSession() {
      // Coba parse secara manual dari hash URL jika Supabase melewatkannya (sering terjadi di Next.js App Router)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          
          if (sessionError) {
            setError('Gagal membaca token otorisasi: ' + sessionError.message);
          }
        }
        // Hapus hash dari URL demi keamanan agar tidak tersimpan di history browser
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Pastikan sesi sekarang sudah tersedia
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsReady(true);
      } else {
        setError('Sesi reset password tidak ditemukan atau sudah kedaluwarsa. Silakan minta tautan baru.');
      }
    }

    setupSession();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isReady) {
      setError('Sesi tidak valid.');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;
    
    setError(null);
    setPending(true);

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      setPending(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password minimal terdiri dari 6 karakter.');
      setPending(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message || 'Gagal mengubah password. Sesi mungkin sudah kedaluwarsa.');
      setPending(false);
    } else {
      await supabase.auth.signOut();
      window.location.href = '/auth/login?reset_success=1';
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full font-sans"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h2>
        <p className="text-sm text-slate-500 mt-2">
          Silakan masukkan password baru Anda.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 font-medium leading-relaxed">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="password" className="font-medium text-slate-700">Password Baru</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="h-11 pr-10 text-slate-900 bg-white border-slate-200 placeholder:text-slate-400 focus-visible:border-slate-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm_password" className="font-medium text-slate-700">Konfirmasi Password Baru</Label>
          <div className="relative">
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              className="h-11 pr-10 text-slate-900 bg-white border-slate-200 placeholder:text-slate-400 focus-visible:border-slate-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <SubmitButton pending={pending} />
      </form>
    </motion.div>
  );
}
