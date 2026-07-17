'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendResetPasswordEmail } from '@/lib/actions/auth';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { motion } from 'framer-motion';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-11 font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm" disabled={pending}>
      {pending ? 'Memproses...' : 'Kirim Link Reset'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function clientAction(formData: FormData) {
    const email = formData.get('email') as string;
    setError(null);
    
    const result = await sendResetPasswordEmail(email);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Lupa Password?</h2>
        <p className="text-sm text-slate-500 mt-2">
          Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
        </p>
      </div>
      
      {success ? (
        <div className="space-y-6">
          <div className="p-4 text-sm text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 font-medium leading-relaxed">
            Link reset password telah dikirim ke email Anda. Silakan cek kotak masuk atau folder spam Anda.
          </div>
          <Link href="/auth/login" className="block w-full">
            <Button variant="outline" className="w-full h-11 font-medium bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm">
              Kembali ke Login
            </Button>
          </Link>
        </div>
      ) : (
        <form action={clientAction} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-slate-700">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              className="h-11 text-slate-900 bg-white border-slate-200 placeholder:text-slate-400 focus-visible:border-slate-400"
              required
            />
          </div>
          <SubmitButton />
          
          <p className="mt-8 text-center text-sm text-slate-500">
            Ingat password Anda?{' '}
            <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}
