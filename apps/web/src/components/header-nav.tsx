'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { UserMenu } from '@/components/user-menu';
import { PremiumModal } from '@/components/premium-modal';
import { Bell, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function HeaderNav({ user, profile, workspaces }: { user: any, profile: any, workspaces: any[] }) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  
  const isWorkspaceDetail = pathname && pathname !== '/w' && pathname !== '/w/settings' && pathname !== '/w/template';

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      
      {/* Left side: Logo & Navigation */}
      <div className="flex items-center gap-6">
        <Link href="/w" className="flex items-center gap-2 font-semibold">
          <Image src="/images/logo2.png" alt="Docsly Logo" width={100} height={100} className="object-contain" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            href="/w" 
            className={`px-3 py-1.5 text-[14px] font-medium rounded-md transition-colors ${
              pathname === '/w' 
                ? 'bg-slate-100 text-slate-900' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/w/template" 
            className={`px-3 py-1.5 text-[14px] font-medium rounded-md transition-colors ${
              pathname === '/w/template' 
                ? 'bg-slate-100 text-slate-900' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Template
          </Link>
        </nav>

        {isWorkspaceDetail && (
          <div className="hidden md:flex items-center gap-4">
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <WorkspaceSwitcher workspaces={workspaces || []} />
          </div>
        )}
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3">
        <PremiumModal />
        
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
        
        {/* Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 outline-none">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          } />
          <DropdownMenuContent align="end" className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm min-w-[120px] p-1">
            <DropdownMenuItem onClick={() => setTheme("light")} className="text-[13px] rounded-lg cursor-pointer">
              <Sun className="mr-2 h-4 w-4" /> Terang
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="text-[13px] rounded-lg cursor-pointer">
              <Moon className="mr-2 h-4 w-4" /> Gelap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="text-[13px] rounded-lg cursor-pointer">
              <Monitor className="mr-2 h-4 w-4" /> Sistem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 outline-none relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-red-500"></span>
        </Button>
        
        <div className="ml-1">
          <UserMenu user={user} profile={profile} />
        </div>
      </div>
      
    </header>
  );
}
