
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, content } = body;

    if (!documentId || !content) {
      return NextResponse.json(
        { error: 'documentId and content are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('documents')
      .update({
        konten_json_terkini: content,
        diperbarui_pada: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) {
      console.error('[autosave] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[autosave] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
