'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor, ArrowLeft, Home, LayoutGrid, BookOpen, Bell, LifeBuoy, FolderOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PremiumModal } from '@/components/premium-modal';
import { SearchBar } from '@/components/search-bar';
import { createClient } from '@/lib/supabase/client';

/** Peta label + ikon untuk setiap tab nav */
const PAGE_META: Record<string, { label: string; Icon: React.ElementType }> = {
  '/w': { label: 'Home', Icon: Home },
  '/w/template': { label: 'Template', Icon: LayoutGrid },
  '/w/panduan': { label: 'Panduan', Icon: BookOpen },
  '/w/notifications': { label: 'Notifikasi', Icon: Bell },
  '/w/faq': { label: 'FAQ & Support', Icon: LifeBuoy },
};

interface HeaderNavProps {
  /** 'fixed' = posisi fixed full-width (default, dipakai di editor).
   *  'inline' = dalam flex layout non-editor (tidak fixed). */
  variant?: 'fixed' | 'inline';
  /** Pathname saat ini — diperlukan agar HeaderNav bisa menentukan label halaman */
  pathname?: string;
  /** Nama workspace (jika sedang di halaman workspace) */
  workspaceName?: string;
  /** Paket/plan pengguna saat ini */
  currentPlan?: string;
}

export function HeaderNav({ variant = 'fixed', pathname = '', workspaceName, currentPlan }: HeaderNavProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const [limitResetAt, setLimitResetAt] = useState<Date | null>(null);
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    
    const fetchLimit = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: limits } = await supabase
        .from('user_limits')
        .select('ai_limit_reset_at, ai_credits_used')
        .eq('user_id', user.id)
        .single();
        
      if (limits?.ai_limit_reset_at) {
        // Cek kapasitas asli
        const plan = (currentPlan || 'free').toLowerCase();
        const maxCredits = plan === 'premium' ? 1500 : plan === 'pro' ? 500 : 25;
        
        if ((limits.ai_credits_used || 0) >= maxCredits) {
          const resetDate = new Date(limits.ai_limit_reset_at);
          if (resetDate.getTime() > Date.now()) {
            setLimitResetAt(resetDate);
            return;
          }
        }
      }
      setLimitResetAt(null);
    };
    
    fetchLimit();
  }, []);

  useEffect(() => {
    if (!limitResetAt) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = limitResetAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setLimitResetAt(null);
        setCountdownText('');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownText(`${h}j ${m}m ${s}s`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [limitResetAt]);

  const isFixed = variant === 'fixed';

  // Deteksi apakah sedang di halaman workspace detail
  const isWorkspacePage = /^\/w\/[^/]+$/.test(pathname);

  // Cari meta halaman yang cocok (exact match dulu, lalu prefix)
  const pageMeta = (() => {
    if (PAGE_META[pathname]) return PAGE_META[pathname];
    // Cek prefix (misal /w/template/xxx)
    for (const [key, meta] of Object.entries(PAGE_META)) {
      if (key !== '/w' && pathname.startsWith(key + '/')) return meta;
    }
    return null;
  })();

  /** Sisi kiri navbar */
  const renderLeft = () => {
    // Halaman workspace detail → tampilkan back button + nama workspace
    if (isWorkspacePage && workspaceName) {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/w')}
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors duration-200"
            aria-label="Kembali ke Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-zinc-500">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
              <span className="mx-0.5">/</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#EFF6FF] dark:bg-blue-900/30 flex items-center justify-center">
                <FolderOpen className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-[#111827] dark:text-zinc-200 max-w-[200px] truncate">
                {workspaceName}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Halaman tab biasa → tampilkan ikon + label tab
    if (pageMeta) {
      const { label, Icon } = pageMeta;
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#EFF6FF] dark:bg-blue-900/30 flex items-center justify-center">
            <Icon className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
          </div>
          <span className="text-[15px] font-semibold text-[#111827] dark:text-zinc-200">{label}</span>
        </div>
      );
    }

    // Fallback
    return <span className="text-[15px] font-semibold text-[#111827] dark:text-zinc-200">Docsly</span>;
  };

  return (
    <nav
      className={[
        'flex h-14 items-center justify-between gap-4 bg-white dark:bg-zinc-900 border-b border-[#E2E8F0] dark:border-zinc-800',
        isFixed ? 'fixed top-0 left-0 right-0 z-50 px-6' : 'px-6 w-full shrink-0',
      ].join(' ')}
    >
      {/* Kiri: info halaman / breadcrumb workspace */}
      <div className="flex items-center min-w-0">{renderLeft()}</div>

      {/* Kanan: searchbar + upgrade + theme */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Countdown */}
        {countdownText && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 mr-2 shadow-sm transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="hidden lg:inline">Limit AI pulih dalam: </span>
            <span className="font-bold w-[65px]">{countdownText}</span>
          </div>
        )}

        {/* Search */}
        <SearchBar />

        {/* Upgrade */}
        <PremiumModal currentPlan={currentPlan} />

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center shrink-0 h-9 w-9 rounded-full text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 outline-none transition-colors">
            {mounted ? (
              theme === 'dark' ? <Moon className="h-4 w-4" /> :
              theme === 'system' ? <Monitor className="h-4 w-4" /> :
              <Sun className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-1 text-sm">
            <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-lg px-2 py-2 text-slate-700 dark:text-zinc-300 focus:bg-slate-100 dark:focus:bg-zinc-800 focus:text-slate-900 dark:focus:text-white cursor-pointer">
              <Sun className="mr-2 h-4 w-4" /> Terang
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-lg px-2 py-2 text-slate-700 dark:text-zinc-300 focus:bg-slate-100 dark:focus:bg-zinc-800 focus:text-slate-900 dark:focus:text-white cursor-pointer">
              <Moon className="mr-2 h-4 w-4" /> Gelap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="rounded-lg px-2 py-2 text-slate-700 dark:text-zinc-300 focus:bg-slate-100 dark:focus:bg-zinc-800 focus:text-slate-900 dark:focus:text-white cursor-pointer">
              <Monitor className="mr-2 h-4 w-4" /> Sistem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
