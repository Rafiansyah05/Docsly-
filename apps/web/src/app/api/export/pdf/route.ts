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
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.docsly.space';

    const targetUrls = [baseUrl];

    let backendResponse: Response | null = null;
    let lastError: any = null;

    for (const url of targetUrls) {
      try {
        const targetEndpoint = `${url.replace(/\/$/, '')}/api/export/pdf`;
        const res = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          backendResponse = res;
          break;
        } else {
          lastError = new Error(`HTTP ${res.status}: ${await res.text()}`);
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!backendResponse) {
      throw lastError || new Error('Backend export service unreachable');
    }

    const pdfBuffer = await backendResponse.arrayBuffer();
    const contentDisposition = backendResponse.headers.get('Content-Disposition') || `attachment; filename="${body.title || 'Dokumen'}.pdf"`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error: any) {
    console.error('PDF Export Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
