// export const runtime = 'edge';

import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { TemplateList } from '@/components/template-list';

export default async function TemplatePage() {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return null;
  }

  // Fetch workspaces for the dropdown in TemplateList
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, nama_workspace, dibuat_pada')
    .eq('user_id', userData.user.id)
    .order('dibuat_pada', { ascending: false });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-8 md:py-10 space-y-10">
      <div className="flex flex-col border-b border-slate-200 dark:border-zinc-800 pb-6 space-y-1">
        <h1 className="text-[32px] font-semibold tracking-tight text-slate-900 dark:text-zinc-100 leading-none">Template Dokumen</h1>
        <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl">
          Temukan berbagai template dokumen yang siap digunakan untuk membantu Anda membuat dokumen dengan lebih mudah dan cepat.
        </p>
      </div>

      <TemplateList workspaces={workspaces || []} />
    </div>
  );
}
