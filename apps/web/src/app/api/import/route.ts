export const runtime = 'edge';
import { NextResponse } from 'next/server';
import mammoth from 'mammoth';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('File is required', { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let htmlContent = '';
    
    if (file.name.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.convertToHtml({ buffer });
      htmlContent = result.value; // The generated HTML
    } 
    else {
      return new NextResponse('Unsupported file format. Only DOCX is supported.', { status: 400 });
    }

    return NextResponse.json({ html: htmlContent });
  } catch (error) {
    console.error('Import Document error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
