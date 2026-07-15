import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { toRoman } from './page-numbers.utils';

@Injectable()
export class ExportService {
  async generatePdf(title: string, html: string, pageSettings: any): Promise<Buffer> {
    let browser = null;
    try {
      let displayHeaderFooter = false;
      
      if (pageSettings?.enabled) {
        displayHeaderFooter = true;
      }

      browser = await puppeteer.launch({
        headless: true,
        channel: 'chrome', // Use chromium or chrome based on environment
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
            .prose { max-width: none; }
            .prose p { margin-top: 0; margin-bottom: 0; }
            .prose h1 { font-size: 16pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; page-break-after: avoid; }
            .prose h2 { font-size: 14pt; font-weight: bold; margin-top: 18pt; margin-bottom: 8pt; page-break-after: avoid; }
            .prose h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; page-break-after: avoid; }
            .prose img { display: block; max-width: 100%; height: auto; margin: 0; }
            .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1em; page-break-inside: avoid; }
            .prose table td, .prose table th { border: 1px solid black; padding: 4px 8px; vertical-align: top; }
            .prose ul, .prose ol { padding-left: 2em; margin-bottom: 1em; }
            @page { size: A4; margin: 2.54cm; }
            .page-break-spacer { page-break-after: always; height: 0; display: block; }
          </style>
        </head>
        <body>
          <div class="prose">${html}</div>
        </body>
        </html>
      `;

      await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
      
      const pdfBufferOrig = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false,
        margin: { top: '2.54cm', right: '2.54cm', bottom: '2.54cm', left: '2.54cm' },
      });

      await browser.close();

      let finalPdfBuffer = pdfBufferOrig;

      if (pageSettings?.enabled && pageSettings.sections?.length > 0) {
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
                x, y, size: fontSize, font: font, color: rgb(0, 0, 0),
              });
            }
          }
        });
        
        const modifiedPdfBytes = await pdfDoc.save();
        finalPdfBuffer = Buffer.from(modifiedPdfBytes);
      }

      return Buffer.from(finalPdfBuffer);
    } catch (error) {
      if (browser) await browser.close();
      throw error;
    }
  }

  async generateDocx(title: string, content: any): Promise<Buffer> {
    // Basic stub for DOCX export. You can migrate the DOCX logic similarly.
    // In the old next.js code, DOCX generation is handled by docx library.
    // For now we return a dummy buffer or import docx logic.
    return Buffer.from('');
  }

  async importDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
  }
}
