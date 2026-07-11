import { NextResponse } from 'next/server';
import { Packer } from 'docx';
import { convertToDocx } from '@/lib/export/docx';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!content) {
      return new NextResponse('Content is required', { status: 400 });
    }

    const doc = await convertToDocx(content);
    const buffer = await Packer.toBuffer(doc);

    // Provide the file as an attachment
    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename="${title || 'Dokumen'}.docx"`);
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Export DOCX error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
