'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login, signInWithGoogle } from '@/lib/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-11 font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm" disabled={pending}>
      {pending ? 'Memproses...' : 'Masuk'}
    </Button>
  );
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  async function clientAction(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      router.push('/w');
      router.refresh(); // Force a refresh of Server Components to pick up the new session
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Masuk</h2>
        <p className="text-sm text-slate-500 mt-2">
          Silakan masuk ke akun Anda untuk melanjutkan.
        </p>
      </div>
      
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-medium text-slate-700">Password</Label>
            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Lupa Password?
            </Link>
          </div>
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
        <SubmitButton />
      </form>
      
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400 font-medium tracking-wider">
            Atau masuk dengan
          </span>
        </div>
      </div>

      <form action={async () => {
        const result = await signInWithGoogle();
        if (result?.error) {
          setError(result.error);
        }
      }}>
        <Button variant="outline" type="submit" className="w-full h-11 font-medium bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="font-semibold text-slate-900 hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </motion.div>
  );
}
