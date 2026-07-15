export const runtime = 'edge';
import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { SettingsContent } from '@/components/settings-content';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return null;
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-8 md:py-10 space-y-10">
      <div className="flex flex-col border-b border-slate-200 dark:border-zinc-800 pb-6 space-y-1">
        <h1 className="text-[32px] font-semibold tracking-tight text-slate-900 dark:text-zinc-100 leading-none">Pengaturan</h1>
        <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl">
          Kelola preferensi akun, tampilan antarmuka, dan pantau penggunaan kuota AI bulanan Anda di sini.
        </p>
      </div>

      <SettingsContent user={userData.user} />
    </div>
  );
}
