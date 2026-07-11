'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function PremiumModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = (plan: string) => {
    setIsLoading(true);
    // Simulasi proses upgrade
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      toast.success(`Selamat! Anda kini telah berlangganan paket ${plan}. Nikmati fitur eksklusifnya!`);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button 
          variant="outline" 
          className="h-9 px-4 gap-2 bg-[#006EFF] hover:bg-[#005bcc] text-white border-0 font-medium transition-all shadow-sm rounded-full"
        >
          <Sparkles className="h-4 w-4 text-white/80" />
          <span className="hidden sm:inline">Upgrade Premium</span>
        </Button>
      } />
      
      <DialogContent className="sm:max-w-[750px] rounded-2xl border-slate-200 bg-white p-0 shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-slate-50 px-8 py-10 border-b border-slate-200 flex flex-col items-center text-center">
          <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mb-5 border border-slate-200 shadow-sm">
            <Sparkles className="h-7 w-7 text-[#2E75B6]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
            Kerja Lebih Cepat, Hasil Lebih Maksimal
          </DialogTitle>
          <DialogDescription className="text-slate-500 max-w-lg mx-auto text-[15px] leading-relaxed">
            Lepas semua batasan. Dapatkan asisten AI tanpa henti dan ruang kerja yang dirancang untuk mendukung performa terbaik Anda.
          </DialogDescription>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-0">
          
          {/* Pro Plan */}
          <div className="p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-white">
            <h3 className="text-xl font-semibold text-slate-900">Docsly Pro</h3>
            <p className="text-[14px] text-slate-500 mt-1 h-10">
              Pilihan cerdas untuk pelajar & pekerja individu.
            </p>
            
            <div className="my-6">
              <span className="text-4xl font-bold text-slate-900">Rp 29.000</span>
              <span className="text-[14px] text-slate-500 font-medium"> / bulan</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Kuota cerdas AI 50.000 kata',
                'Ditenagai model unggulan GPT-4o',
                'Ekspor dokumen bersih (tanpa watermark)',
                'Akses ke semua template standar'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-[#2E75B6] shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleUpgrade('Docsly Pro')}
              disabled={isLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border-0 h-12 rounded-xl transition-colors text-[14px]"
            >
              Pilih Paket Pro
            </Button>
          </div>

          {/* Business Plan */}
          <div className="p-8 relative flex flex-col bg-white">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#2E75B6]"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Docsly Business</h3>
                <p className="text-[14px] text-slate-500 mt-1 h-10">
                  Kekuatan penuh untuk profesional & tim.
                </p>
              </div>
              <span className="bg-slate-100 text-[#1F3B57] text-[12px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" fill="currentColor" /> Terfavorit
              </span>
            </div>
            
            <div className="my-6">
              <span className="text-4xl font-bold text-slate-900">Rp 79.000</span>
              <span className="text-[14px] text-slate-500 font-medium"> / bulan</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Kuota AI tanpa batas (Unlimited)',
                'Jalur prioritas saat server sibuk',
                'Fitur kolaborasi real-time (Segera)',
                'Dukungan bantuan prioritas'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-[#1F3B57] shrink-0" />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={() => handleUpgrade('Docsly Business')}
              disabled={isLoading}
              className="w-full bg-[#2E75B6] hover:bg-[#245f96] text-white font-semibold border-0 h-12 rounded-xl transition-colors text-[14px]"
            >
              Mulai Langganan Business
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
