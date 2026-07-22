'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CreditCard, CheckCircle2, XCircle, Clock, ReceiptText, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumModal } from '@/components/premium-modal';

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  plan_type: string;
  status: string;
  created_at: string;
}

interface Subscription {
  plan_type: string;
  status: string;
  berlaku_sampai: string;
}

interface BillingClientProps {
  subscription: Subscription | null;
  payments: Payment[];
}

export function BillingClient({ subscription, payments }: BillingClientProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Derive current status
  const isActive = subscription?.status === 'active' && new Date(subscription.berlaku_sampai) > new Date();
  const activePlanName = isActive ? subscription.plan_type : 'free';
  const planNameDisplay = activePlanName.charAt(0).toUpperCase() + activePlanName.slice(1);
  const expiryDate = isActive ? new Date(subscription.berlaku_sampai) : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Billing & Akun</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Kelola status langganan dan lihat riwayat pembayaran Anda.</p>
      </div>

      {/* Current Plan Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 mb-4">Paket Saat Ini</h2>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl flex-shrink-0 ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                  {planNameDisplay} Plan
                </h3>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 dark:text-zinc-400 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    Tidak Aktif
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400">
                {isActive 
                  ? `Berlaku hingga ${format(expiryDate!, 'dd MMMM yyyy', { locale: id })}`
                  : 'Anda saat ini menggunakan paket gratis dengan batas fitur harian.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <PremiumModal 
              currentPlan={isActive ? `${planNameDisplay} Plan` : 'Free Plan'} 
              triggerText={isActive ? 'Perpanjang / Upgrade' : 'Upgrade ke Premium'}
              className="w-full md:w-auto"
            />
          </div>
        </div>
      </section>

      {/* Billing History Section */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 mb-4">Riwayat Pembayaran</h2>
        
        {payments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl border-dashed">
            <ReceiptText className="h-10 w-10 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
            <h3 className="text-slate-700 dark:text-zinc-300 font-medium">Belum ada riwayat transaksi</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">Transaksi langganan Anda akan muncul di sini.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {payments.map((payment) => (
                <button
                  key={payment.id}
                  onClick={() => setSelectedPayment(payment)}
                  className="w-full flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${
                      payment.status === 'success' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                        : payment.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                    }`}>
                      <ReceiptText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                        Docsly {payment.plan_type.charAt(0).toUpperCase() + payment.plan_type.slice(1)} Plan
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 capitalize">
                        {payment.status === 'success' ? 'Berhasil' : payment.status === 'pending' ? 'Menunggu' : 'Gagal'}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Modal Detail Transaksi */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPayment(null)}>
          <div 
            className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-100">Detail Transaksi</h3>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Total Pembayaran</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-zinc-100">
                  {formatCurrency(selectedPayment.amount)}
                </p>
                <div className="mt-3 flex justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedPayment.status === 'success'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : selectedPayment.status === 'pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  }`}>
                    {selectedPayment.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {selectedPayment.status === 'pending' && <Clock className="h-3.5 w-3.5" />}
                    {selectedPayment.status === 'failed' && <XCircle className="h-3.5 w-3.5" />}
                    <span className="capitalize">{selectedPayment.status === 'success' ? 'Berhasil' : selectedPayment.status === 'pending' ? 'Menunggu Pembayaran' : 'Dibatalkan / Gagal'}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-slate-100 dark:border-zinc-800/80">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Order ID</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-zinc-100">{selectedPayment.order_id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Paket</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100">Docsly {selectedPayment.plan_type.charAt(0).toUpperCase() + selectedPayment.plan_type.slice(1)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Tanggal</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100 text-right">{formatDate(selectedPayment.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-zinc-800 text-center">
              <Button onClick={() => setSelectedPayment(null)} className="w-full">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
