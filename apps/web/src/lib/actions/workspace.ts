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

  // First fetch all documents in the workspace
  const { data: workspaceDocs } = await supabase
    .from('documents')
    .select('id')
    .eq('workspace_id', workspaceId);

  if (workspaceDocs && workspaceDocs.length > 0) {
    const docIds = workspaceDocs.map(d => d.id);
    
    // 1. ai_conversations (and prompt_history)
    const { data: convs } = await supabase.from('ai_conversations').select('id').in('document_id', docIds);
    if (convs && convs.length > 0) {
      const convIds = convs.map(c => c.id);
      await supabase.from('prompt_history').delete().in('conversation_id', convIds);
      await supabase.from('ai_conversations').delete().in('id', convIds);
    }
    
    // 2. document_versions
    await supabase.from('document_versions').delete().in('document_id', docIds);
    
    // 3. attachments
    await supabase.from('attachments').delete().in('document_id', docIds);
    
    // 4. image_placeholders
    await supabase.from('image_placeholders').delete().in('document_id', docIds);
    
    // 5. bibliography_entries
    await supabase.from('bibliography_entries').delete().in('document_id', docIds);
    
    // 6. Delete documents
    await supabase.from('documents').delete().in('id', docIds);
  }

  // 7. Delete references (workspace level)
  await supabase.from('references').delete().eq('workspace_id', workspaceId);

  // 8. Then delete the workspace
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/w');
  revalidatePath('/', 'layout');
  return { success: true };
}
