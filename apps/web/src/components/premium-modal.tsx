'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import Script from 'next/script';
export function PremiumModal({ compact = false, className = '', currentPlan = 'Free Plan' }: { compact?: boolean; className?: string; currentPlan?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ status: 'success' | 'failed', message?: string } | null>(null);

  useEffect(() => {
    // Load Midtrans Snap script on component mount
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const snapScriptUrl = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    const myMidtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

    if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = snapScriptUrl;
      script.setAttribute("data-client-key", myMidtransClientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleUpgrade = (plan: string) => {
    setLoadingPlan(plan);
    // Redirect ke custom payment page
    window.location.href = `/payment/checkout?plan=${plan}`;
  };

  const isPro = currentPlan.includes('Pro');
  const isPremium = currentPlan.includes('Premium');
  const isFree = !isPro && !isPremium;

  const triggerText = isPro ? 'Pro Plan' : isPremium ? 'Premium Plan' : 'Upgrade';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open && paymentResult?.status === 'success') {
        window.location.reload();
      }
    }}>
      <DialogTrigger
        render={
          <Button variant="outline" className={`h-9 ${compact ? 'w-9 px-0' : 'px-4 gap-2'} ${isFree ? 'bg-[#2563EB] hover:bg-blue-700 text-white border-0' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'} font-medium transition-all rounded-[8px] ${className}`}>
            <Sparkles className={`h-4 w-4 ${isFree ? 'text-white/80' : 'text-[#2563EB] dark:text-blue-400'}`} />
            {!compact ? <span className="hidden sm:inline">{triggerText}</span> : <span className="sr-only">{triggerText}</span>}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[1050px] rounded-2xl bg-white dark:bg-zinc-900 p-0 overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-xl">

        {paymentResult ? (
          <div className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
            {paymentResult.status === 'success' ? (
              <>
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Pembayaran Berhasil!</h2>
                <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-8 text-base">
                  Terima kasih, akun Anda telah di-upgrade. Silakan klik tombol di bawah untuk menyegarkan halaman dan mulai menikmati fitur premium.
                </p>
                <Button
                  onClick={() => { setIsOpen(false); window.location.reload(); }}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white px-8 h-12 rounded-lg font-medium"
                >
                  Lanjutkan <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                  <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Pembayaran Gagal</h2>
                <p className="text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-8 text-base">
                  {paymentResult.message || 'Maaf, terjadi kesalahan saat memproses pembayaran Anda.'}
                </p>
                <Button
                  onClick={() => setPaymentResult(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white px-8 h-12 rounded-lg font-medium"
                >
                  Coba Lagi
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-white dark:bg-zinc-900 px-8 pt-8 pb-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-[#EFF6FF] dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-[#2563EB] dark:text-blue-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Pilih Paket Docsly Anda</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-zinc-400 max-w-lg mx-auto text-[14px] leading-relaxed">
                Lepas semua batasan dan tingkatkan produktivitas dengan asisten AI Docsly.
              </DialogDescription>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-10 max-w-[1000px] mx-auto">



              {/* Free Plan */}
              <div className={`p-8 rounded-2xl flex flex-col transition-all border ${isFree ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/20 ring-1 ring-[#2563EB]/20' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-slate-300 dark:hover:border-zinc-700'}`}>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Free</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 h-10">Cocok untuk penggunaan dasar.</p>

                <div className="my-6 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-zinc-100">Rp 0</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1 mt-2">
                  {['Editor & Export Dasar', '10 AI Credit / hari', 'Template Akademik', 'Storage 100MB'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 className="h-5 w-5 text-[#2563EB] dark:text-blue-400 shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  disabled={true}
                  className={`w-full font-medium h-12 rounded-xl text-sm border-0 transition-colors ${isFree ? 'bg-slate-200 dark:bg-zinc-700/80 text-slate-500 dark:text-zinc-300 opacity-100' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}
                >
                  {isFree ? 'Paket Saat Ini' : 'Otomatis (Bawaan)'}
                </Button>
              </div>

              {/* Pro Plan */}
              <div className={`p-8 rounded-2xl flex flex-col relative transition-all border ${isPro ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/20 ring-1 ring-[#2563EB]/20 shadow-md shadow-blue-500/5 dark:shadow-blue-900/10' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm'}`}>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Pro</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 h-10">Untuk mahasiswa & pelajar.</p>

                <div className="my-6 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-zinc-100">Rp 39rb</span>
                  <span className="text-sm text-slate-500 dark:text-zinc-400 font-medium pb-1">/ bln</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1 mt-2">
                  {['500 AI Credit / 4 Jam', '50 Citation / 4 Jam', 'Template Akademik', 'Storage 2GB'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 className="h-5 w-5 text-[#2563EB] dark:text-blue-400 shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade('Pro')}
                  disabled={!!loadingPlan || isPro}
                  className={`w-full font-medium h-12 rounded-xl text-sm border-0 transition-all ${isPro ? 'bg-slate-200 dark:bg-zinc-700/80 text-slate-500 dark:text-zinc-300 opacity-100 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 text-white dark:bg-blue-600 dark:hover:bg-blue-500'}`}
                >
                  {loadingPlan === 'Pro' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : isPro ? (
                    'Paket Saat Ini'
                  ) : (
                    'Pilih Pro'
                  )}
                </Button>
              </div>

              {/* Premium Plan */}
              <div className={`p-8 rounded-2xl flex flex-col relative transition-all border ${isPremium ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/20 ring-1 ring-[#2563EB]/20 shadow-md shadow-blue-500/5 dark:shadow-blue-900/10' : 'border-[#2563EB]/30 dark:border-blue-500/30 bg-white dark:bg-zinc-800/40 hover:border-[#2563EB]/60 dark:hover:border-blue-500/60 shadow-sm relative'}`}>
                {!isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Premium</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 h-10">Untuk profesional & tim.</p>

                <div className="my-6 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-zinc-100">Rp 89rb</span>
                  <span className="text-sm text-slate-500 dark:text-zinc-400 font-medium pb-1">/ bln</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1 mt-2">
                  {['1500 AI Credit / Jam', 'Unlimited Citation', 'Priority Server', 'Storage 20GB'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 className="h-5 w-5 text-[#2563EB] dark:text-blue-400 shrink-0" />
                      <span className="font-medium leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade('Premium')}
                  disabled={!!loadingPlan || isPremium}
                  className={`w-full font-medium h-12 rounded-xl text-sm border-0 transition-all ${isPremium ? 'bg-slate-200 dark:bg-zinc-700/80 text-slate-500 dark:text-zinc-300 opacity-100 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 text-white'}`}
                >
                  {loadingPlan === 'Premium' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : isPremium ? (
                    'Paket Saat Ini'
                  ) : (
                    'Pilih Premium'
                  )}
                </Button>
              </div>

            </div>

            {/* Footer Powered By Claude */}
            <div className="bg-slate-50/50 dark:bg-zinc-900/50 py-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-slate-500 dark:text-zinc-400 text-[12px]">
              <span>Powered by</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">Claude</span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
