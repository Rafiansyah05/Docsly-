'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createDocument(workspaceId: string, formData: FormData) {
  const judul = formData.get('judul') as string || 'Dokumen Tanpa Judul';
  const jenis = formData.get('jenis_dokumen') as string || 'Umum';
  
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda harus masuk terlebih dahulu.' };
  }

  // Check if workspace belongs to user (RLS will handle this, but it's good practice to log error)
  const { data, error } = await supabase
    .from('documents')
    .insert({
      workspace_id: workspaceId,
      judul,
      jenis_dokumen: jenis,
      status: 'draft',
      konten_json_terkini: {
        type: "doc",
        content: [
          {
            type: "paragraph"
          }
        ]
      },
    })
    .select('id')
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/w/${workspaceId}`);
  revalidatePath(`/w/${workspaceId}`);
  redirect(`/w/${workspaceId}/d/${data.id}`);
}

export async function createDocumentClient(workspaceId: string, judul: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Anda harus masuk terlebih dahulu.' };

  const { data, error } = await supabase
    .from('documents')
    .insert({
      workspace_id: workspaceId,
      judul,
      jenis_dokumen: 'Umum',
      status: 'draft',
      konten_json_terkini: { type: "doc", content: [{ type: "paragraph" }] },
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/w/${workspaceId}`);
  return { id: data.id };
}

export async function autosaveDocument(documentId: string, kontenJson: any) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('documents')
    .update({ 
      konten_json_terkini: kontenJson,
      diperbarui_pada: new Date().toISOString()
    })
    .eq('id', documentId);
    
  if (error) {
    console.error('Autosave error:', error);
    return { error: error.message };
  }
  return { success: true };
}

export async function updateDocumentTitle(documentId: string, judul: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('documents')
    .update({ 
      judul,
      diperbarui_pada: new Date().toISOString()
    })
    .eq('id', documentId);
    
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteDocument(documentId: string, workspaceId: string) {
  const supabase = createClient();
  
  // 1. ai_conversations (and prompt_history)
  const { data: convs } = await supabase.from('ai_conversations').select('id').eq('document_id', documentId);
  if (convs && convs.length > 0) {
    const convIds = convs.map(c => c.id);
    await supabase.from('prompt_history').delete().in('conversation_id', convIds);
    await supabase.from('ai_conversations').delete().in('id', convIds);
  }
  
  // 2. document_versions
  await supabase.from('document_versions').delete().eq('document_id', documentId);
  
  // 3. attachments
  await supabase.from('attachments').delete().eq('document_id', documentId);
  
  // 4. image_placeholders
  await supabase.from('image_placeholders').delete().eq('document_id', documentId);
  
  // 5. bibliography_entries
  await supabase.from('bibliography_entries').delete().eq('document_id', documentId);
  
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath(`/w/${workspaceId}`);
  revalidatePath('/w');
  revalidatePath('/', 'layout');
  return { success: true };
}
export async function getVersions(documentId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('dibuat_pada', { ascending: false });
    
  if (error) {
    return { error: error.message };
  }
  return { versions: data };
}

export async function createVersion(documentId: string, kontenJson: any, ringkasan: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      konten_json_snapshot: kontenJson,
      ringkasan_perubahan: ringkasan,
      dibuat_oleh: user.email,
    });
    
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function restoreVersion(documentId: string, versionId: string) {
  const supabase = createClient();
  
  const { data: version, error: versionError } = await supabase
    .from('document_versions')
    .select('konten_json_snapshot')
    .eq('id', versionId)
    .single();
    
  if (versionError || !version) {
    return { error: 'Versi tidak ditemukan' };
  }
  
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      konten_json_terkini: version.konten_json_snapshot,
      diperbarui_pada: new Date().toISOString()
    })
    .eq('id', documentId);
    
  if (updateError) {
    return { error: updateError.message };
  }
  
  // Revalidate to reflect changes
  revalidatePath('/', 'layout');
  return { success: true, content: version.konten_json_snapshot };
}
