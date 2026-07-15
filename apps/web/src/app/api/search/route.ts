export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch documents that match the query, joining with workspaces for the workspace name
  const { data, error } = await supabase
    .from('documents')
    .select(
      `
      id,
      judul,
      diperbarui_pada,
      workspace_id,
      workspaces!inner (
        id,
        nama_workspace,
        user_id
      )
    `
    )
    .ilike('judul', `%${query}%`)
    .eq('workspaces.user_id', user.id)
    .order('diperbarui_pada', { ascending: false })
    .limit(8);

  if (error) {
    console.error('[search] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = (data ?? []).map((doc: any) => ({
    id: doc.id,
    judul: doc.judul || 'Dokumen Tanpa Judul',
    workspace_id: doc.workspace_id,
    workspace_name: doc.workspaces?.nama_workspace ?? 'Workspace',
    diperbarui_pada: doc.diperbarui_pada,
  }));

  return NextResponse.json({ results });
}
