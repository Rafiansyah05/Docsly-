import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  let browser = null;
  try {
    const body = await req.json();
    const { title, html, pageSettings } = body;

    if (!html) {
      return new NextResponse('HTML content is required', { status: 400 });
    }

    let displayHeaderFooter = false;
    let headerTemplate = '<span></span>';
    let footerTemplate = '<span></span>';

    if (pageSettings?.enabled) {
      displayHeaderFooter = true;
      const { position = 'bottom', align = 'center' } = pageSettings;
      
      const alignStr = align === 'left' ? 'text-align: left; padding-left: 2.54cm;' : 
                       align === 'right' ? 'text-align: right; padding-right: 2.54cm;' : 
                       'text-align: center;';

      const template = `
        <div style="width: 100%; font-size: 11pt; font-family: 'Times New Roman', Times, serif; ${alignStr} color: black;">
          <span class="pageNumber"></span>
        </div>
      `;

      if (position === 'top') {
        headerTemplate = template;
      } else {
        footerTemplate = template;
      }
    }

    browser = await puppeteer.launch({
      headless: true,
      channel: 'chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title || 'Dokumen'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            background: white;
            color: #000000;
            font-size: 11pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
          }
          .prose {
            max-width: none;
          }
          .prose p { margin-top: 0; margin-bottom: 0; }
          .prose h1 { font-size: 16pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; page-break-after: avoid; }
          .prose h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; margin-bottom: 8pt; page-break-after: avoid; }
          .prose h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; page-break-after: avoid; }
          .prose img { display: block; max-width: 100%; height: auto; margin: 0; }
          .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1em; page-break-inside: avoid; }
          .prose table td, .prose table th { border: 1px solid black; padding: 4px 8px; vertical-align: top; }
          .prose ul, .prose ol { padding-left: 2em; margin-bottom: 1em; }
          
          @page {
            size: A4;
            margin: 2.54cm;
          }
          
          /* Force page breaks */
          .page-break-spacer {
            page-break-after: always;
            height: 0;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="prose">
          ${html}
        </div>
      </body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
    
    const pdfBufferOrig = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '2.54cm',
        right: '2.54cm',
        bottom: '2.54cm',
        left: '2.54cm',
      },
    });

    await browser.close();

    let finalPdfBuffer = pdfBufferOrig;

    if (pageSettings?.enabled && pageSettings.sections?.length > 0) {
      const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
      const { toRoman } = require('@/lib/page-numbers');
      
      const pdfDoc = await PDFDocument.load(pdfBufferOrig);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const pages = pdfDoc.getPages();
      const { position = 'bottom', align = 'center' } = pageSettings;
      
      const sortedSections = [...pageSettings.sections].sort((a: any, b: any) => a.startPage - b.startPage);

      pages.forEach((pdfPage: any, index: number) => {
        const pageNum = index + 1; 
        
        let activeSection = null;
        for (const sec of sortedSections) {
          if (pageNum >= sec.startPage) {
            activeSection = sec;
          }
        }
        
        if (activeSection) {
          let text = '';
          const currentNumber = activeSection.startNumber + (pageNum - activeSection.startPage);
          
          if (activeSection.format === 'arabic') {
            text = currentNumber.toString();
          } else if (activeSection.format === 'roman_lower') {
            text = toRoman(currentNumber).toLowerCase();
          } else if (activeSection.format === 'roman_upper') {
            text = toRoman(currentNumber);
          }
          
          if (text) {
            const fontSize = 11;
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const { width, height } = pdfPage.getSize();
            
            let x = width / 2 - textWidth / 2;
            if (align === 'left') x = 72; 
            else if (align === 'right') x = width - 72 - textWidth;
            
            let y = 35; // bottom margin
            if (position === 'top') {
              y = height - 45; // top margin
            }
            
            pdfPage.drawText(text, {
              x,
              y,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
          }
        }
      });
      
      const modifiedPdfBytes = await pdfDoc.save();
      finalPdfBuffer = Buffer.from(modifiedPdfBytes);
    }

    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename="${title || 'Dokumen'}.pdf"`);
    headers.append('Content-Type', 'application/pdf');

    return new NextResponse(Buffer.from(finalPdfBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Export PDF error:', error);
    if (browser) await browser.close();
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
