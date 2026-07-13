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

  const handleUpgrade = (plan: string) => {
    setIsLoading(true);
    // Simulasi integrasi Mayar.id (redirect ke payment link)
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      toast.success(`Selamat! Anda kini telah berlangganan paket ${plan}.`);
    }, 1500);
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

      <DialogContent className="sm:max-w-[950px] rounded-xl bg-white p-0 overflow-hidden border border-slate-100 shadow-sm">
        {/* Header Section */}
        <div className="bg-white px-8 pt-8 pb-4 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-[#2563EB]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">Pilih Paket Docsly Anda</DialogTitle>
          <DialogDescription className="text-slate-500 max-w-lg mx-auto text-[14px] leading-relaxed">
            Lepas semua batasan dan tingkatkan produktivitas dengan asisten AI Docsly.
          </DialogDescription>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pb-8">

          {/* Free Trial Plan */}
          <div className={`p-5 rounded-xl flex flex-col transition-all border ${isFreeTrial ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <h3 className="text-lg font-semibold text-slate-900">Free Trial</h3>
            <p className="text-[12px] text-slate-500 mt-1 h-8">Coba gratis 30 hari.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900">Rp 0</span>
              <span className="text-[12px] text-slate-500 font-medium"> / 30 hari</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['Akses semua fitur', '50 AI Credit / 7 jam', 'Semua template Docsly', 'Storage 2GB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              disabled={true}
              className="w-full font-medium h-9 rounded-lg text-[12px] border-0 bg-slate-100 text-slate-500 opacity-100"
            >
              {isFreeTrial ? 'Paket Saat Ini' : 'Tidak Tersedia'}
            </Button>
          </div>

          {/* Free Plan */}
          <div className={`p-5 rounded-xl flex flex-col transition-all border ${isFree ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <h3 className="text-lg font-semibold text-slate-900">Free</h3>
            <p className="text-[12px] text-slate-500 mt-1 h-8">Penggunaan dasar.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900">Rp 0</span>
              <span className="text-[12px] text-slate-500 font-medium"> selamanya</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['Editor & Export Dasar', '10 AI Credit / hari', 'Template Dasar', 'Storage 100MB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              disabled={true}
              className={`w-full font-medium h-9 rounded-lg text-[12px] border-0 transition-colors ${isFree ? 'bg-slate-200 text-slate-500 opacity-100' : 'bg-slate-100 text-slate-500'}`}
            >
              {isFree ? 'Paket Saat Ini' : 'Otomatis (Bawaan)'}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className={`p-5 rounded-xl flex flex-col relative transition-all border ${isPro ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
            <p className="text-[12px] text-slate-500 mt-1 h-8">Mahasiswa & pelajar.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900">Rp 39.000</span>
              <span className="text-[12px] text-slate-500 font-medium"> / bln</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['500 AI Credit / bln', '50 Citation / bln', 'Semua Template', 'Storage 2GB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade('Pro')}
              disabled={isLoading || isPro}
              className={`w-full font-medium h-9 rounded-lg text-[12px] border-0 transition-colors ${isPro ? 'bg-slate-200 text-slate-500 hover:bg-slate-200 opacity-100' : 'bg-[#2563EB] hover:bg-blue-700 text-white'}`}
            >
              {isPro ? 'Paket Saat Ini' : 'Pilih Pro'}
            </Button>
          </div>

          {/* Premium Plan */}
          <div className={`p-5 rounded-xl flex flex-col relative transition-all border ${isPremium ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            {!isPremium && (
              <div className="absolute top-3 right-3 bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Best Value
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900">Premium</h3>
            <p className="text-[12px] text-slate-500 mt-1 h-8">Profesional & peneliti.</p>

            <div className="my-3">
              <span className="text-2xl font-bold text-slate-900">Rp 89.000</span>
              <span className="text-[12px] text-slate-500 font-medium"> / bln</span>
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {['1500 AI Credit / bln', 'Unlimited Citation', 'Priority Server', 'Storage 20GB'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade('Premium')}
              disabled={isLoading || isPremium}
              className={`w-full font-medium h-9 rounded-lg text-[12px] border-0 transition-colors ${isPremium ? 'bg-slate-200 text-slate-500 hover:bg-slate-200 opacity-100' : 'bg-[#2563EB] hover:bg-blue-700 text-white'}`}
            >
              {isPremium ? 'Paket Saat Ini' : 'Pilih Premium'}
            </Button>
          </div>

        </div>

        {/* Footer Powered By Claude */}
        <div className="bg-slate-50/50 py-3 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-[12px]">
          <span>Powered by</span>
          <Claude.Color
            size={18}

          />
          <span className="font-semibold text-slate-700">Claude</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
