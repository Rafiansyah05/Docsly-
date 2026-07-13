'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Claude } from '@lobehub/icons';

export function PremiumModal({ compact = false, className = '', currentPlan = 'Free Plan' }: { compact?: boolean; className?: string; currentPlan?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ganti URL ini dengan URL Payment Link dari Dashboard Mayar.id Anda
  const MAYAR_PRO_LINK = "https://t.mayar.id/your-pro-link"; 
  const MAYAR_PREMIUM_LINK = "https://t.mayar.id/your-premium-link";

  const handleUpgrade = (plan: string) => {
    setIsLoading(true);
    
    // Redirect ke halaman checkout Mayar
    const checkoutUrl = plan === 'Pro' ? MAYAR_PRO_LINK : MAYAR_PREMIUM_LINK;
    
    // Anda bisa menambahkan parameter email jika Mayar mendukungnya agar otomatis terisi
    // const finalUrl = `${checkoutUrl}?email=${encodeURIComponent(userEmail)}`;
    
    window.open(checkoutUrl, '_blank');
    
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
    }, 1000);
  };

  const isFreeTrial = currentPlan === 'Free Trial';
  const isFree = currentPlan === 'Free Plan' || currentPlan === 'Free';
  const isPro = currentPlan === 'Docsly Pro' || currentPlan === 'Pro';
  const isPremium = currentPlan === 'Docsly Premium' || currentPlan === 'Premium';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className={`h-9 ${compact ? 'w-9 px-0' : 'px-4 gap-2'} bg-[#2563EB] hover:bg-blue-700 text-white border-0 font-medium transition-all rounded-[8px] ${className}`}>
            <Sparkles className="h-4 w-4 text-white/80" />
            {!compact ? <span className="hidden sm:inline">Upgrade</span> : <span className="sr-only">Upgrade</span>}
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[950px] rounded-xl bg-white dark:bg-zinc-900 p-0 overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-8">

          {/* Free Trial Plan */}
          <div className={`p-5 rounded-xl flex flex-col transition-all border ${isFreeTrial ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/20' : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:border-slate-200 dark:hover:border-zinc-700'}`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Free Trial</h3>
            <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1 h-8">Coba gratis 30 hari.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Rp 0</span>
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-medium"> / 30 hari</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['Akses semua fitur', '50 AI Credit / 7 jam', 'Semua template Docsly', 'Storage 2GB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              disabled={true}
              className="w-full font-medium h-9 rounded-lg text-[12px] border-0 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 opacity-100"
            >
              {isFreeTrial ? 'Paket Saat Ini' : 'Tidak Tersedia'}
            </Button>
          </div>

          {/* Free Plan */}
          <div className={`p-5 rounded-xl flex flex-col transition-all border ${isFree ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/20' : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:border-slate-200 dark:hover:border-zinc-700'}`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Free</h3>
            <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1 h-8">Penggunaan dasar.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Rp 0</span>
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-medium"> selamanya</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['Editor & Export Dasar', '10 AI Credit / hari', 'Template Dasar', 'Storage 100MB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              disabled={true}
              className={`w-full font-medium h-9 rounded-lg text-[12px] border-0 transition-colors ${isFree ? 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300 opacity-100' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'}`}
            >
              {isFree ? 'Paket Saat Ini' : 'Otomatis (Bawaan)'}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className={`p-5 rounded-xl flex flex-col relative transition-all border ${isPro ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/20' : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:border-slate-200 dark:hover:border-zinc-700'}`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Pro</h3>
            <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1 h-8">Mahasiswa & pelajar.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Rp 39.000</span>
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-medium"> / bln</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['500 AI Credit / bln', '50 Citation / bln', 'Semua Template', 'Storage 2GB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade('Pro')}
              disabled={isLoading || isPro}
              className={`w-full font-medium h-9 rounded-lg text-[12px] border-0 transition-colors ${isPro ? 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-600 opacity-100' : 'bg-[#2563EB] hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500'}`}
            >
              {isPro ? 'Paket Saat Ini' : 'Pilih Pro'}
            </Button>
          </div>

          {/* Premium Plan */}
          <div className={`p-5 rounded-xl flex flex-col relative transition-all border ${isPremium ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-900/20' : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:border-slate-200 dark:hover:border-zinc-700'}`}>
            {!isPremium && (
              <div className="absolute top-3 right-3 bg-[#EFF6FF] dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Best Value
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Premium</h3>
            <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1 h-8">Profesional & peneliti.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Rp 89.000</span>
              <span className="text-[12px] text-slate-500 dark:text-zinc-400 font-medium"> / bln</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['1500 AI Credit / bln', 'Unlimited Citation', 'Priority Server', 'Storage 20GB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade('Premium')}
              disabled={isLoading || isPremium}
              className={`w-full font-medium h-9 rounded-lg text-[12px] border-0 transition-colors ${isPremium ? 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-600 opacity-100' : 'bg-[#2563EB] hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500'}`}
            >
              {isPremium ? 'Paket Saat Ini' : 'Pilih Premium'}
            </Button>
          </div>

        </div>

        {/* Footer Powered By Claude */}
        <div className="bg-slate-50/50 dark:bg-zinc-900/50 py-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-slate-500 dark:text-zinc-400 text-[12px]">
          <span>Powered by</span>
          <Claude.Color size={18} />
          <span className="font-semibold text-slate-700 dark:text-zinc-300">Claude</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
