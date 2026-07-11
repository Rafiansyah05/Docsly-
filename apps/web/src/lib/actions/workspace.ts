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

  // First delete all documents inside the workspace
  const { error: docsError } = await supabase
    .from('documents')
    .delete()
    .eq('workspace_id', workspaceId);

  if (docsError) return { error: docsError.message };

  // Then delete the workspace
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/w');
  return { success: true };
}
