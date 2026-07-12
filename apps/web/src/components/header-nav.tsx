'use client';

import React, { useState } from 'react';
import { Moon, Sun, Monitor, Search, ArrowLeft, Home, LayoutGrid, BookOpen, Bell, LifeBuoy, FolderOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PremiumModal } from '@/components/premium-modal';

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
}

export function HeaderNav({ variant = 'fixed', pathname = '', workspaceName }: HeaderNavProps) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

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
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors duration-200"
            aria-label="Kembali ke Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
              <span className="mx-0.5">/</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#EFF6FF] flex items-center justify-center">
                <FolderOpen className="h-3.5 w-3.5 text-[#2563EB]" />
              </div>
              <span className="text-sm font-semibold text-[#111827] max-w-[200px] truncate">
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
          <div className="h-7 w-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Icon className="h-4 w-4 text-[#2563EB]" />
          </div>
          <span className="text-[15px] font-semibold text-[#111827]">{label}</span>
        </div>
      );
    }

    // Fallback
    return <span className="text-[15px] font-semibold text-[#111827]">Docsly</span>;
  };

  return (
    <nav
      className={[
        'flex h-14 items-center justify-between gap-4 bg-white border-b border-[#E2E8F0]',
        isFixed ? 'fixed top-0 left-0 right-0 z-50 px-6' : 'px-6 w-full shrink-0',
      ].join(' ')}
    >
      {/* Kiri: info halaman / breadcrumb workspace */}
      <div className="flex items-center min-w-0">{renderLeft()}</div>

      {/* Kanan: searchbar + upgrade + theme */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search */}
        <div className="relative w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Cari dokumen..."
            className="h-9 rounded-[10px] border border-slate-200 bg-[#F8FAFC] pl-9 pr-4 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#2563EB]"
          />
        </div>

        {/* Upgrade */}
        <PremiumModal />

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 outline-none">
                <Sun className="h-4 w-4" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="bg-white rounded-xl p-1 text-sm">
            <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-lg px-2 py-2 text-slate-700">
              <Sun className="mr-2 h-4 w-4" /> Terang
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-lg px-2 py-2 text-slate-700">
              <Moon className="mr-2 h-4 w-4" /> Gelap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="rounded-lg px-2 py-2 text-slate-700">
              <Monitor className="mr-2 h-4 w-4" /> Sistem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
