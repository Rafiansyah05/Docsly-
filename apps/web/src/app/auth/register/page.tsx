'use client';
export const runtime = 'edge';


import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithGoogle } from '@/lib/actions/auth';
import { sendOtp, verifyAndRegister } from '@/lib/actions/otp';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SubmitButton({ pending, text, disabled = false }: { pending: boolean; text: string; disabled?: boolean }) {
  return (
    <Button 
      type="submit" 
      className="w-full h-11 font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
      disabled={pending || disabled}
    >
      {pending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : text}
    </Button>
  );
}

function OtpInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void, autoFocus?: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  const [selection, setSelection] = useState(value.length);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  const handleSelect = (e: React.SyntheticEvent<HTMLInputElement, Event>) => {
    setSelection(e.currentTarget.selectionStart || 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, ''));
    setSelection(e.target.selectionStart || 0);
  };

  return (
    <div className="relative flex justify-between w-full gap-3 cursor-text" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text"
      />
      {Array.from({ length: 6 }).map((_, index) => {
        const char = value[index];
        // Active if cursor is on this specific box (or the last box if fully typed and cursor at end)
        const isActive = isFocused && (selection === index || (index === 5 && selection === 6));

        return (
          <div
            key={index}
            className={`flex-1 h-14 text-center text-2xl font-bold rounded-lg border-2 flex items-center justify-center bg-white shadow-sm transition-all ${
              isActive ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-200'
            }`}
          >
            {char ? char : (isActive ? <span className="w-[2px] h-6 bg-blue-600 animate-pulse" /> : null)}
          </div>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isPending, setIsPending] = useState(false);

  // Form Data State
  const [formDataState, setFormDataState] = useState({
    nama_lengkap: '',
    email: '',
    password: ''
  });

  // OTP State
  const [otp, setOtp] = useState('');
  const router = useRouter();

  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const nama_lengkap = formData.get('nama_lengkap') as string;
    
    setFormDataState({ nama_lengkap, email, password });

    const result = await sendOtp(email, nama_lengkap);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setStep('otp');
    }
    
    setIsPending(false);
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    if (otp.length !== 6) {
      setError('Kode OTP harus 6 digit.');
      setIsPending(false);
      return;
    }

    const verificationData = new FormData();
    verificationData.append('email', formDataState.email);
    verificationData.append('password', formDataState.password);
    verificationData.append('nama_lengkap', formDataState.nama_lengkap);
    verificationData.append('otp', otp);

    const result = await verifyAndRegister(verificationData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    } else if (result?.success) {
      // Force a hard navigation to guarantee the new session cookie is sent and the layout re-fetches
      window.location.href = '/w';
    }
  }

  return (
    <div className="w-full font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Yuk, mulai</h2>
              <p className="text-sm text-slate-500 mt-2">
                Buat akun Docsly Anda sekarang.
              </p>
            </div>
            
            <form onSubmit={handleSendOtp} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="nama_lengkap" className="font-medium text-slate-700">Nama Lengkap</Label>
                <Input
                  id="nama_lengkap"
                  name="nama_lengkap"
                  type="text"
                  placeholder="John Doe"
                  className="h-11 text-slate-900 bg-white border-slate-200 placeholder:text-slate-400 focus-visible:border-slate-400"
                  required
                />
              </div>
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
                <Label htmlFor="password" className="font-medium text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="h-11 pr-10 text-slate-900 bg-white border-slate-200 placeholder:text-slate-400 focus-visible:border-slate-400"
                    required
                    minLength={6}
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
              <SubmitButton pending={isPending} text="Lanjutkan" />
            </form>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium tracking-wider">
                  Atau daftar dengan
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
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="font-semibold text-slate-900 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <button 
                onClick={() => setStep('form')}
                className="flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
              </button>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Verifikasi Email</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Kami telah mengirimkan 6 digit kode verifikasi ke <span className="font-semibold text-slate-800">{formDataState.email}</span>. Silakan periksa kotak masuk atau spam email Anda.
              </p>
            </div>
            
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 font-medium">
                  {error}
                </div>
              )}
              
              <OtpInput 
                value={otp} 
                onChange={setOtp} 
                autoFocus={true} 
              />

              <SubmitButton pending={isPending} text="Verifikasi & Daftar" disabled={otp.length !== 6} />
              
              <p className="text-center text-sm text-slate-500">
                Tidak menerima kode?{' '}
                <button 
                  type="button" 
                  className="font-semibold text-blue-600 hover:underline"
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsPending(true);
                    const res = await sendOtp(formDataState.email, formDataState.nama_lengkap);
                    if (res?.error) setError(res.error);
                    else setError('Kode OTP baru telah dikirim ulang!');
                    setIsPending(false);
                  }}
                  disabled={isPending}
                >
                  Kirim Ulang
                </button>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
