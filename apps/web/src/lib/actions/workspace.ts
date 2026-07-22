'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createWorkspace(namaWorkspace: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda harus masuk terlebih dahulu.' };
  }

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      user_id: user.id,
      nama_workspace: namaWorkspace,
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/w');
  return { id: data.id };
}

export async function renameWorkspace(workspaceId: string, newName: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('workspaces')
    .update({ nama_workspace: newName })
    .eq('id', workspaceId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/w/${workspaceId}`);
  revalidatePath('/w');
  return { success: true };
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // Verifikasi bahwa user adalah pemilik workspace
  const { data: workspaceInfo, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (wsError || !workspaceInfo) return { error: 'Workspace tidak ditemukan atau bukan milik Anda' };

  // Gunakan Admin Client untuk menghapus data berelasi agar terhindar dari RLS blocking di production
  const { createClient: createSupabaseJs } = await import('@supabase/supabase-js');
  const adminSupabase = createSupabaseJs(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // First fetch all documents in the workspace
  const { data: workspaceDocs } = await adminSupabase
    .from('documents')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (workspaceDocs && workspaceDocs.length > 0) {
    const docIds = workspaceDocs.map(d => d.id);
    
    // 1. ai_conversations (and prompt_history)
    const { data: convs } = await adminSupabase.from('ai_conversations').select('id').in('document_id', docIds);
    if (convs && convs.length > 0) {
      const convIds = convs.map(c => c.id);
      await Promise.all([
        adminSupabase.from('prompt_history').delete().in('conversation_id', convIds),
        adminSupabase.from('ai_conversations').delete().in('id', convIds)
      ]);
    }
    
    // Hapus secara paralel untuk menghindari timeout di Vercel (batas 10 detik)
    await Promise.all([
      adminSupabase.from('document_versions').delete().in('document_id', docIds),
      adminSupabase.from('attachments').delete().in('document_id', docIds),
      adminSupabase.from('image_placeholders').delete().in('document_id', docIds),
      adminSupabase.from('bibliography_entries').delete().in('document_id', docIds)
    ]);
    
    // 6. Delete documents
    await adminSupabase.from('documents').delete().in('id', docIds);
  }

  // 7. Delete references (workspace level)
  await adminSupabase.from('references').delete().eq('workspace_id', workspaceId);

  // 8. Then delete the workspace
  const { error } = await adminSupabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (error) return { error: error.message };

  revalidatePath('/w');
  revalidatePath('/', 'layout');
  return { success: true };
}
