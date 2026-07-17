'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, Copy, Loader2, RefreshCcw, Wallet, Building2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // Load payment data from sessionStorage
    const stored = sessionStorage.getItem('pending_payment');
    if (stored) {
      try {
        setPaymentData(JSON.parse(stored));
      } catch (e) {
        console.error("Gagal memparsing data pembayaran", e);
      }
    } else if (!orderId) {
      router.push('/payment/checkout');
    }
  }, [router, orderId]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!orderId || status === 'success') return;

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${baseUrl}/api/payment/sync-status`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({ order_id: orderId })
        });
        
        if (response.ok) {
          const result = await response.json();
          const { status: paymentStatus } = result;
            
          if (paymentStatus === 'success') {
            setStatus('success');
            setIsPolling(false);
            clearInterval(pollInterval);
            toast.success("Pembayaran berhasil dikonfirmasi!");
            
            // Redirect after 3 seconds
            setTimeout(() => {
              router.push('/w');
            }, 3000);
          } else if (paymentStatus === 'failed') {
            setStatus('failed');
            setIsPolling(false);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    if (isPolling) {
      // Check immediately
      checkStatus();
      // Then poll every 5 seconds
      pollInterval = setInterval(checkStatus, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [orderId, isPolling, status, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard!');
  };

  const renderPaymentInstructions = () => {
    if (!paymentData) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
    
    // Virtual Account BCA/BNI
    if (paymentData.payment_type === 'bca_va' || paymentData.payment_type === 'bni_va') {
      const vaNumber = paymentData.va_numbers?.[0]?.va_number || 'Tidak tersedia';
      const bank = paymentData.va_numbers?.[0]?.bank?.toUpperCase() || 'Bank';
      
      return (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Nomor Virtual Account {bank}</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-slate-900 break-all">{vaNumber}</div>
            <button 
              onClick={() => copyToClipboard(vaNumber)}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" /> Salin Nomor
            </button>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Cara Pembayaran:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-600">
              <li>Buka aplikasi Mobile Banking atau kunjungi ATM {bank}.</li>
              <li>Pilih menu Transfer &gt; Virtual Account {bank}.</li>
              <li>Masukkan nomor VA di atas.</li>
              <li>Pastikan jumlah tagihan sesuai.</li>
              <li>Selesaikan pembayaran dan tunggu konfirmasi otomatis di halaman ini.</li>
            </ol>
          </div>
        </div>
      );
    }
    
    // Virtual Account Mandiri
    if (paymentData.payment_type === 'mandiri_va') {
      const billKey = paymentData.bill_key || 'Tidak tersedia';
      const billerCode = paymentData.biller_code || 'Tidak tersedia';
      
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 text-center space-y-3">
              <div className="text-[12px] sm:text-[13px] font-medium text-slate-500 uppercase tracking-wide">Biller Code</div>
              <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-slate-900 break-all">{billerCode}</div>
              <button 
                onClick={() => copyToClipboard(billerCode)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Salin
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6 text-center space-y-3">
              <div className="text-[12px] sm:text-[13px] font-medium text-slate-500 uppercase tracking-wide">Bill Key / VA</div>
              <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-slate-900 break-all">{billKey}</div>
              <button 
                onClick={() => copyToClipboard(billKey)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Salin
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Cara Pembayaran:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-[14px] text-slate-600">
              <li>Buka Livin' by Mandiri atau ATM Mandiri.</li>
              <li>Pilih menu Bayar &gt; Multipayment.</li>
              <li>Masukkan Biller Code ({billerCode}).</li>
              <li>Masukkan Bill Key ({billKey}).</li>
              <li>Selesaikan pembayaran dan halaman ini akan terupdate otomatis.</li>
            </ol>
          </div>
        </div>
      );
    }
    
    // GoPay / QRIS
    if (paymentData.payment_type === 'gopay' || paymentData.payment_type === 'qris') {
      // Find the QR action
      const qrAction = paymentData.actions?.find((a: any) => a.name === 'generate-qr-code');
      const deeplinkAction = paymentData.actions?.find((a: any) => a.name === 'deeplink-redirect');
      
      return (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
            {qrAction?.url ? (
              <div className="p-4 bg-white rounded-xl border border-slate-200 inline-block">
                <img src={qrAction.url} alt="QR Code" className="w-48 h-48 object-contain" />
              </div>
            ) : (
              <div className="text-slate-500 text-sm">QR Code tidak tersedia.</div>
            )}
            <p className="text-[14px] text-slate-600 text-center max-w-[250px]">Scan kode QR ini menggunakan GoPay atau e-wallet pilihan Anda.</p>
            
            {deeplinkAction?.url && (
              <a 
                href={deeplinkAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full block text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-[14px] font-medium transition-colors"
              >
                Buka Aplikasi GoPay
              </a>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm">
        Metode pembayaran belum didukung sepenuhnya di tampilan ini. Silakan cek email Anda untuk instruksi pembayaran dari Midtrans.
      </div>
    );
  };

  const isSandbox = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION !== 'true';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Sandbox Indicator */}
      {isSandbox && (
        <div className="w-full max-w-xl bg-[#F2A128] text-white text-xs font-bold text-center py-3 px-4 rounded-t-xl uppercase tracking-wider mb-[-10px] relative z-10">
          Sandbox Mode - <a href="https://simulator.sandbox.midtrans.com/" target="_blank" className="underline hover:text-white/80">Buka Midtrans Simulator</a>
        </div>
      )}

      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 overflow-hidden relative z-20">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          {status === 'success' ? (
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          ) : status === 'failed' ? (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold">X</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          )}
          
          <div>
            <h1 className="font-bold text-slate-900 text-lg">
              {status === 'success' ? 'Pembayaran Berhasil!' : status === 'failed' ? 'Pembayaran Gagal' : 'Menunggu Pembayaran'}
            </h1>
            <p className="text-slate-500 text-[13px] font-medium">
              Order ID: <span className="font-mono text-slate-700">{orderId}</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-[15px] text-slate-600 leading-relaxed">
                Terima kasih, langganan Anda telah aktif. Anda akan segera dialihkan ke workspace Anda dalam beberapa detik.
              </p>
              <button 
                onClick={() => router.push('/w')}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg py-3 text-[14px] font-medium transition-colors"
              >
                Ke Workspace Sekarang
              </button>
            </div>
          ) : status === 'failed' ? (
            <div className="text-center py-6 space-y-4">
              <p className="text-[15px] text-slate-600 leading-relaxed">
                Waktu pembayaran telah habis atau pembayaran dibatalkan.
              </p>
              <button 
                onClick={() => router.push('/payment/checkout')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg py-3 text-[14px] font-medium transition-colors"
              >
                Coba Bayar Lagi
              </button>
            </div>
          ) : (
            <div>
              {renderPaymentInstructions()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
