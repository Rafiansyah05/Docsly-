'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  CreditCard, 
  Wallet,
  ChevronDown,
  Check,
  ArrowLeft,
  Loader2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

// Payment Methods Config
const BankLogo = ({ bank }: { bank: string }) => {
  if (bank === 'mandiri') {
    return <div className="text-[#003D79] font-bold text-[17px] tracking-tighter flex items-center">mandiri<span className="text-[#F2A128] ml-0.5 mt-[-4px] text-lg">~</span></div>
  }
  if (bank === 'bni') {
    return <div className="text-[#005E6A] font-extrabold text-[16px] italic tracking-tighter">BNI<span className="text-[#F15A24] text-xs font-bold ml-0.5 relative -top-1">46</span></div>
  }
  return null;
};

const PAYMENT_METHODS = [
  {
    id: 'bca_va',
    category: 'virtual_account',
    title: 'BCA Virtual Account',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
    description: 'Bayar melalui ATM BCA, KlikBCA, atau m-BCA.'
  },
  {
    id: 'mandiri_va',
    category: 'virtual_account',
    title: 'Mandiri Virtual Account',
    bank: 'mandiri',
    description: 'Bayar melalui ATM Mandiri atau Livin\' by Mandiri.'
  },
  {
    id: 'bni_va',
    category: 'virtual_account',
    title: 'BNI Virtual Account',
    bank: 'bni',
    description: 'Bayar melalui ATM BNI atau BNI Mobile Banking.'
  },
  {
    id: 'qris',
    category: 'ewallet',
    title: 'QRIS',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg',
    description: 'Scan QR menggunakan semua aplikasi E-Wallet atau Mobile Banking.'
  },
  {
    id: 'gopay',
    category: 'ewallet',
    title: 'GoPay',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
    description: 'Bayar instan menggunakan saldo GoPay Anda.'
  }
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const plan = searchParams ? (searchParams.get('plan') || 'Pro') : 'Pro'; // Default to Pro if not specified
  const isPremium = plan === 'Premium';
  
  const price = isPremium ? 89000 : 39000;
  const total = price; // Pajak ditanggung perusahaan

  const [selectedMethod, setSelectedMethod] = useState<string>('bca_va');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Anda harus login terlebih dahulu.');
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    };
    checkAuth();
  }, [router]);

  const handlePayment = async () => {
    if (typeof window === 'undefined' || !user) return;
    
    setIsProcessing(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${baseUrl}/api/payment/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ 
          plan,
          paymentMethod: selectedMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Terjadi kesalahan saat memproses pembayaran');
      }

      // Backend now returns the Midtrans CoreAPI charge response.
      // We will save it to session storage to display on the next page (or pass via URL).
      window.sessionStorage.setItem('pending_payment', JSON.stringify(data));
      
      router.push(`/payment/status?order_id=${data.order_id}`);
      
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses pembayaran');
      setIsProcessing(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sandbox Indicator */}
      {process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION !== 'true' && (
        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold text-center py-1.5 uppercase tracking-wider">
          Sandbox Mode - Uang Bohongan
        </div>
      )}

      {/* Top Navbar Simple */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <div className="flex items-center justify-center">
          <img src="/images/logo2.png" alt="Docsly Logo" className="h-7 w-auto object-contain" />
        </div>
        <div className="w-20"></div> {/* Spacer for center alignment */}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Checkout</h1>
          <p className="text-slate-500 mt-2 text-[15px]">Pilih metode pembayaran untuk menyelesaikan pesanan Anda.</p>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
          
          {/* Left Column - Payment Form */}
          <div className="space-y-8">
            
            <section>
              <h2 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
                Metode Pembayaran
              </h2>
              
              <div className="border border-slate-200 bg-white rounded-xl overflow-hidden flex flex-col">
                {PAYMENT_METHODS.map((method, index) => (
                  <div key={method.id} className={`border-b border-slate-100 last:border-b-0`}>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-start gap-4 p-5 text-left transition-colors ${selectedMethod === method.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selectedMethod === method.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                        {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold text-[15px] text-slate-900 flex items-center justify-between">
                          <span>{method.title}</span>
                          {method.imageUrl ? (
                            <img src={method.imageUrl} alt={method.title} className="h-4 object-contain" />
                          ) : (
                            method.bank && <BankLogo bank={method.bank} />
                          )}
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {selectedMethod === method.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 6 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="text-[14px] text-slate-600 leading-relaxed overflow-hidden"
                            >
                              {method.description}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="border border-slate-200 bg-white rounded-xl p-6 lg:p-8">
              <h2 className="text-lg font-semibold mb-6 text-slate-900">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 text-[15px]">
                <div className="flex items-start justify-between">
                  <div className="text-slate-600">
                    <span className="font-medium text-slate-900 block mb-1">Paket {plan} (1 Bulan)</span>
                    <span className="text-[13px]">Docsly AI Office Agent</span>
                  </div>
                  <div className="font-medium text-slate-900">{formatRupiah(price)}</div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatRupiah(price)}</span>
                </div>
                
                <div className="flex items-center justify-between text-slate-600">
                  <span>Pajak (PPN 11%)</span>
                  <span className="font-medium text-emerald-600">Ditanggung Perusahaan</span>
                </div>
                
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Total Tagihan</span>
                  <span className="text-xl font-bold text-slate-900">{formatRupiah(total)}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    `Bayar ${formatRupiah(total)}`
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500 font-medium pt-2">
                  <Lock className="w-3.5 h-3.5" />
                  Pembayaran Terenkripsi Aman via Midtrans
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4 text-[12px] font-medium text-slate-500 justify-center">
              <a href="/terms" target="_blank" className="hover:text-slate-900 transition-colors">Ketentuan Layanan</a>
              <span>&bull;</span>
              <a href="/privacy" target="_blank" className="hover:text-slate-900 transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Memuat halaman checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
