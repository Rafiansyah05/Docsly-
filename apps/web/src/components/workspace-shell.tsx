'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderNav } from '@/components/header-nav';
import { UserMenu } from '@/components/user-menu';
import { PremiumModal } from '@/components/premium-modal';
import { Home, LayoutGrid, BookOpen, Bell, LifeBuoy, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/w', icon: Home },
  { label: 'Template', href: '/w/template', icon: LayoutGrid },
  { label: 'Panduan', href: '/w/panduan', icon: BookOpen },
  { label: 'Notifikasi', href: '/w/notifications', icon: Bell },
  { label: 'FAQ & Support', href: '/w/faq', icon: LifeBuoy },
];

export function WorkspaceShell({ user, profile, workspaces, children }: { user: any; profile: any; workspaces: any[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isEditor = /^\/w\/[^/]+\/d\/[^/]+/.test(pathname);

  const profileName = profile?.nama_lengkap || user.email || 'Pengguna';
  const profileEmail = user.email || '';
  const accountStatus = profile?.plan || 'Free Plan';

  // Ekstrak workspace_id dari pathname (format: /w/<workspace_id> atau /w/<workspace_id>/...)
  const workspaceMatch = pathname.match(/^\/w\/([^/]+)/);
  const activeWorkspaceId = workspaceMatch ? workspaceMatch[1] : null;
  const activeWorkspace = activeWorkspaceId ? workspaces.find((ws) => ws.id === activeWorkspaceId) : null;
  const activeWorkspaceName = activeWorkspace?.nama_workspace ?? undefined;

  // Untuk halaman non-editor: sidebar full-height di kiri, navbar inline di kanan atas
  // Untuk halaman editor: gunakan fixed header (AppHeader) dan tidak tampilkan sidebar
  if (isEditor) {
    return (
      <div className="h-screen overflow-hidden bg-slate-50 text-slate-900">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 flex">
      {/* Sidebar — full viewport height, di atas navbar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-[260px]'} hidden lg:flex flex-col justify-between bg-white border-r border-[#E2E8F0] h-full transition-all duration-300 ease-out relative shrink-0 z-40`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-5">
            {collapsed ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  <Image src="/images/icon.png" alt="Docsly" fill className="object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors duration-200"
                  aria-label="Expand sidebar"
                >
                  <span className="sr-only">Toggle sidebar</span>
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    <Image src="/images/icon.png" alt="Docsly" fill className="object-contain" />
                  </div>
                  <span className="text-[18px] font-semibold text-[#111827]">Docsly</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors duration-200"
                  aria-label="Collapse sidebar"
                >
                  <span className="sr-only">Toggle sidebar</span>
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <nav className="px-2 py-2 flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Make Home ('/w') exact-match only to avoid always matching other '/w/*' routes.
              const active = item.href === '/w' ? pathname === '/w' : pathname === item.href || pathname.startsWith(item.href + '/');

              // When collapsed: center icons with consistent height and no bg highlight.
              // When expanded: show label and active background per PRD.
              const baseClass = collapsed
                ? 'flex items-center justify-center h-11 w-full rounded-[10px] transition-colors duration-200'
                : 'flex items-center h-11 gap-3 rounded-[10px] px-3 transition-colors duration-200';

              const activeClass = !collapsed && active ? 'bg-[#EFF6FF] text-[#2563EB]' : '';
              const inactiveClass = !collapsed && !active ? 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]' : '';
              const collapsedIconClass = collapsed ? 'text-[#64748B]' : '';

              return (
                <Link key={item.label} href={item.href} title={collapsed ? item.label : undefined} className={`${baseClass} ${activeClass} ${inactiveClass}`}>
                  <Icon className={`${active ? 'text-[#2563EB]' : collapsedIconClass} h-5 w-5`} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-5 left-4 right-4">
          <div className={`rounded-3xl ${collapsed ? 'p-2' : 'p-4'} bg-white border-t border-[#E2E8F0]`}>
            <div className="flex items-center gap-3">
              <UserMenu user={user} profile={profile} />
              {!collapsed && (
                <div className="min-w-0 font-sans">
                  <p className="text-sm font-medium text-slate-700 truncate">{profileName}</p>
                  <p className="text-[13px] text-slate-500 truncate">{profileEmail}</p>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">{accountStatus}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Area kanan: navbar + konten */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Navbar inline — hanya mengisi area di sebelah kanan sidebar */}
        <HeaderNav
          variant="inline"
          pathname={pathname}
          workspaceName={activeWorkspaceName}
          currentPlan={accountStatus}
        />

        {/* Konten halaman */}
        <main className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
