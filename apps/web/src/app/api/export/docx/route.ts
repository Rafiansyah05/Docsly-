import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    let backendResponse;
    try {
      backendResponse = await fetch(`${baseUrl}/api/export/docx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
    } catch (fetchErr) {
      // Fallback attempt to port 3005 if default baseUrl localhost:3001 connection failed
      if (baseUrl.includes('localhost:3001')) {
        const fallbackUrl = 'http://localhost:3005';
        backendResponse = await fetch(`${fallbackUrl}/api/export/docx`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        });
      } else {
        throw fetchErr;
      }
    }

    if (!backendResponse.ok) {
      const errText = await backendResponse.text();
      return NextResponse.json({ error: `DOCX Export Error: ${errText}` }, { status: backendResponse.status });
    }

    const docxBuffer = await backendResponse.arrayBuffer();
    const safeTitle = (body.title || 'Dokumen').replace(/[^\w\s\-().]/g, '_');
    const contentDisposition = backendResponse.headers.get('Content-Disposition') || `attachment; filename="${safeTitle}.docx"`;

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error: any) {
    console.error('DOCX Export Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
