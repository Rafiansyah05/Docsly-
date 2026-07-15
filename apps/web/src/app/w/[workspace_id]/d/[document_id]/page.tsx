
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { Button } from '@/components/ui/button';

export default async function DocumentPage({ params }: { params: { workspace_id: string; document_id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout handles redirect
  }

  const { data: document } = await supabase.from('documents').select('*').eq('id', params.document_id).eq('workspace_id', params.workspace_id).single();

  if (!document) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Editor Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <TiptapEditor documentId={document.id} initialTitle={document.judul} initialContent={document.konten_json_terkini || { type: 'doc', content: [{ type: 'paragraph' }] }} workspaceId={params.workspace_id} />
      </div>
    </div>
  );
}
