// export const runtime = 'edge';

import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createDocument, deleteDocument } from '@/lib/actions/document';
import Link from 'next/link';
import { FileText, Plus, Clock, Trash2 } from 'lucide-react';
import { WorkspaceOptions } from '@/components/workspace-options';
import { CreateDocumentButton } from '@/components/create-document-button';
import { ImportDocumentButton } from '@/components/import-document-button';
import { WorkspaceDocuments } from '@/components/workspace-documents';

import { WorkspaceDetailTour } from './workspace-detail-tour';

export default async function WorkspacePage({ params }: { params: { workspace_id: string } }) {
  const supabase = createClient();
  await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', params.workspace_id)
    .single();

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', params.workspace_id)
    .order('diperbarui_pada', { ascending: false });

  const { data: profile } = await supabase
    .from('profiles')
    .select('tours_status')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  const toursStatus = profile?.tours_status || {};
  const hasSeenTour = toursStatus['workspace_detail_tour'];
  const userResponse = await supabase.auth.getUser();

  if (!workspace) {
    return <div className="p-8">Workspace tidak ditemukan.</div>;
  }

  const handleCreateNew = async (formData: FormData) => {
    'use server';
    await createDocument(params.workspace_id, formData);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-8 md:py-10 space-y-10 relative">
      <WorkspaceDetailTour hasSeen={hasSeenTour} userId={userResponse.data.user?.id} />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] font-semibold tracking-tight text-slate-900 dark:text-zinc-100 leading-none">{workspace.nama_workspace}</h1>
            <div id="tour-workspace-options">
              <WorkspaceOptions workspaceId={workspace.id} initialName={workspace.nama_workspace} />
            </div>
          </div>
          <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-2">Kelola dan buat dokumen pintar Anda di sini.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div id="tour-import-doc">
            <ImportDocumentButton workspaceId={workspace.id} />
          </div>
          <form action={handleCreateNew} id="tour-create-doc">
            <input type="hidden" name="judul" value="Dokumen Tanpa Judul" />
            <CreateDocumentButton />
          </form>
        </div>
      </div>

      <WorkspaceDocuments initialDocuments={documents || []} workspaceId={workspace.id} />
    </div>
  );
}
