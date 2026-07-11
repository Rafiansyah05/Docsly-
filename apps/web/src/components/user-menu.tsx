'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/actions/auth';
import { User } from '@supabase/supabase-js';
import { Settings, LogOut, Sparkles } from 'lucide-react';

export function UserMenu({ user, profile }: { user: User, profile: any }) {
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nama_lengkap || user.email || 'User')}&background=random`;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-8 w-8 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full border border-slate-200 w-full h-full object-cover"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-xl border border-slate-200 bg-white shadow-lg" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-slate-900">{profile?.nama_lengkap || 'Pengguna'}</p>
              <p className="text-xs leading-none text-slate-500">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-100 my-1" />
        <DropdownMenuItem className="p-2 cursor-pointer rounded-md text-red-600 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white group" onClick={() => logout()}>
          <LogOut className="mr-3 h-4 w-4 group-hover:text-white group-focus:text-white" />
          <span className="text-sm font-medium">Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
