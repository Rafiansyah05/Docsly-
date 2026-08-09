import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  LevelFormat,
  convertInchesToTwip,
  convertMillimetersToTwip,
  UnderlineType,
  Header,
  Footer,
  PageNumber
} from 'docx';
import { toRoman } from './page-numbers.utils';

// ─── Constants ────────────────────────────────────────────────────────────────

// Half-points (docx unit). 1pt = 2 half-points.
const PT = (pt: number) => pt * 2;

// Twip from pt (for spacing). 1pt = 20 twip.
const TWIP = (pt: number) => pt * 20;

// Indentation per heading level (matching CSS: heading-level-2 = 1.5rem = ~24px, heading-level-3 = 3rem = ~48px)
// 1 rem = 16px = ~12pt, so 1.5rem ≈ 18pt ≈ 360 twip
const HEADING_INDENT: Record<number, number> = {
  1: 0,
  2: TWIP(18),  // 1.5rem
  3: TWIP(36),  // 3rem
  4: TWIP(54),  // 4.5rem
  5: TWIP(54),
  6: TWIP(54),
};

// Font sizes per heading level (from globals.css)
const HEADING_FONT_SIZE: Record<number, number> = {
  1: PT(16),
  2: PT(14),
  3: PT(13),
  4: PT(12),
  5: PT(11),
  6: PT(11),
};

const HEADING_LEVELS_MAP: Record<number, any> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

const DEFAULT_FONT = 'Times New Roman';
const DEFAULT_SIZE = PT(11);   // 11pt = 22 half-points
const LINE_SPACING = 360;      // 1.5 line spacing (240 = single, 276 = 1.15, 360 = 1.5)

// ─── Type Definitions ─────────────────────────────────────────────────────────

interface TipTapMark {
  type: string;
  attrs?: Record<string, any>;
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
}

// ─── Helper: Convert inline text nodes to TextRun array ──────────────────────

function inlineToRuns(node: TipTapNode, overrideSize?: number): TextRun[] {
  if (!node.content) return [];

  const runs: TextRun[] = [];
  for (const child of node.content) {
    if (child.type === 'text') {
      const text = child.text || '';
      const marks = child.marks || [];
      const isBold = marks.some(m => m.type === 'bold');
      const isItalic = marks.some(m => m.type === 'italic');
      const isUnderline = marks.some(m => m.type === 'underline');
      const isStrike = marks.some(m => m.type === 'strike');
      const textStyleMark = marks.find(m => m.type === 'textStyle');
      const color = textStyleMark?.attrs?.color;
      let font = DEFAULT_FONT;
      if (textStyleMark?.attrs?.fontFamily) {
        font = textStyleMark.attrs.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      }
      
      let size = overrideSize || DEFAULT_SIZE;
      if (textStyleMark?.attrs?.fontSize) {
        // TipTap fontSize is usually in pt or px (e.g., '14pt' or '16px')
        const fsMatch = textStyleMark.attrs.fontSize.match(/^(\d+(?:\.\d+)?)(pt|px)$/);
        if (fsMatch) {
          const val = parseFloat(fsMatch[1]);
          const unit = fsMatch[2];
          size = unit === 'pt' ? PT(val) : Math.round(val * 1.5); // 1px = 0.75pt = 1.5 half-points
        }
      }

      runs.push(new TextRun({
        text,
        bold: isBold || undefined,
        italics: isItalic || undefined,
        underline: isUnderline ? { type: UnderlineType.SINGLE } : undefined,
        strike: isStrike || undefined,
        color: color ? color.replace('#', '') : undefined, // Leave undefined instead of 000000 for inherit
        font: font,
        size: size,
      }));
    } else if (child.type === 'hardBreak') {
      runs.push(new TextRun({ text: '', break: 1 }));
    }
  }
  return runs;
}

// ─── Helper: Paragraph attrs → indent in twips ───────────────────────────────

function getIndent(attrs: Record<string, any> = {}): any {
  const indent = attrs.indent || 0;
  const firstLineIndent = attrs.firstLineIndent || 0;
  const hangingIndent = attrs.hangingIndent || false;

  let left = 0;
  let hanging = undefined;
  let firstLine = undefined;

  // 1 indent level = 2rem = 32px = 480 twips
  if (indent > 0) {
    left = indent * 480;
  }

  // firstLineIndent = 1.27cm = 720 twips
  if (firstLineIndent > 0) {
    firstLine = firstLineIndent * 720;
  }

  // hangingIndent = 1.27cm (left +720, hanging 720)
  if (hangingIndent) {
    left += 720;
    hanging = 720;
  }

  if (left === 0 && !hanging && !firstLine) return undefined;

  return {
    ...(left > 0 ? { left } : {}),
    ...(hanging ? { hanging } : {}),
    ...(firstLine ? { firstLine } : {})
  };
}

function getAlignment(attrs: Record<string, any> = {}): any {
  if (attrs.textAlign === 'center') return AlignmentType.CENTER;
  if (attrs.textAlign === 'right') return AlignmentType.RIGHT;
  if (attrs.textAlign === 'justify') return AlignmentType.JUSTIFIED;
  return undefined;
}

// ─── Helper: Convert a TipTap node to docx Paragraph/Table ──────────────────

function convertNode(node: TipTapNode): (Paragraph | Table)[] {
  const type = node.type;
  const attrs = node.attrs || {};
  const alignment = getAlignment(attrs);

  // ── Table of Contents ──────────────────────────────────────────────────────
  if (type === 'tableOfContents') {
    const title = attrs.title || 'DAFTAR ISI';
    const headings = attrs.headings || [];
    let baseFontFamily = attrs.baseFontFamily || DEFAULT_FONT;
    if (baseFontFamily === 'inherit') baseFontFamily = DEFAULT_FONT;
    
    let baseFontSize = DEFAULT_SIZE; // 11pt
    if (attrs.baseFontSize && attrs.baseFontSize.endsWith('pt')) {
       baseFontSize = PT(parseFloat(attrs.baseFontSize));
    }
    
    const paragraphs: Paragraph[] = [];
    
    // TOC Title
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: title, bold: true, font: baseFontFamily, size: PT(14) })],
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE_SPACING, before: TWIP(12), after: TWIP(12) },
    }));

    if (headings.length === 0) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: 'Belum ada heading di dokumen ini.', font: baseFontFamily, size: PT(11), color: '94a3b8' })],
        spacing: { line: LINE_SPACING, before: 0, after: 0 },
      }));
    } else {
      for (const h of headings) {
        const indentLeft = (h.level - 1) * TWIP(18); // 1.5rem = 18pt
        const text = h.customText || h.text || '';
        const pageNumStr = h.pageNumStr || '';
        
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: text, font: baseFontFamily, size: baseFontSize }),
            new TextRun({ text: '\t', font: baseFontFamily, size: baseFontSize }),
            new TextRun({ text: pageNumStr, font: baseFontFamily, size: baseFontSize }),
          ],
          tabStops: [
            {
              type: "right",
              position: TWIP(430), // Align page numbers to the right
              leader: "dot",
            },
          ],
          indent: { left: indentLeft },
          spacing: { line: LINE_SPACING, before: 0, after: TWIP(4) }, 
        }));
      }
    }
    
    return paragraphs;
  }

  // ── Heading ────────────────────────────────────────────────────────────────
  if (type === 'heading') {
    const level = attrs.level || 1;
    // Combine base heading indent with potential user-applied custom indent
    const baseIndentTwips = HEADING_INDENT[level] || 0;
    const customIndentObj = getIndent(attrs) || {};
    const finalIndentLeft = baseIndentTwips + (customIndentObj.left || 0);
    const indentObj = finalIndentLeft > 0 ? { ...customIndentObj, left: finalIndentLeft } : customIndentObj;
    
    const runs = inlineToRuns(node, HEADING_FONT_SIZE[level] || DEFAULT_SIZE);

    // If preserveFormat — treat like a plain paragraph
    if (attrs.preserveFormat) {
      return [new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })],
        spacing: { line: LINE_SPACING, before: 0, after: 0 },
        indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
        alignment,
      })];
    }

    return [new Paragraph({
      heading: HEADING_LEVELS_MAP[level] || HeadingLevel.HEADING_1,
      children: runs.length > 0 ? runs : [new TextRun({ text: '', font: DEFAULT_FONT, size: HEADING_FONT_SIZE[level] || DEFAULT_SIZE })],
      spacing: { line: LINE_SPACING, before: 0, after: 0 },
      indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
      alignment,
    })];
  }

  // ── Paragraph (also handles flat list items via listType attr) ────────────
  if (type === 'paragraph') {
    const listType = attrs.listType;
    const listPrefix = attrs.listPrefix || '';
    const hasListType = listType && listType !== 'none' && listType !== '';
    const indentObj = getIndent(attrs) || {};
    const runs = inlineToRuns(node);

    // Empty paragraph → blank line (preserve spacing)
    if (runs.length === 0 && !hasListType) {
      return [new Paragraph({
        children: [new TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })],
        spacing: { line: LINE_SPACING, before: 0, after: 0 },
        indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
        alignment,
      })];
    }

    // Bullet list item
    if (listType === 'bullet') {
      const prefix = listPrefix || '•';
      const baseIndentLeft = 480;
      const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
      return [new Paragraph({
        children: [
          new TextRun({ text: `${prefix}\t`, font: DEFAULT_FONT, size: DEFAULT_SIZE }),
          ...runs,
        ],
        spacing: { line: LINE_SPACING, before: 0, after: 0 },
        indent: { ...indentObj, left: finalIndentLeft, hanging: 480 },
        alignment,
      })];
    }

    // Numbered/decimal list item
    if (listType === 'decimal' || listType === 'ordered') {
      const prefix = listPrefix || '1.';
      const baseIndentLeft = 480;
      const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
      return [new Paragraph({
        children: [
          new TextRun({ text: `${prefix}\t`, font: DEFAULT_FONT, size: DEFAULT_SIZE }),
          ...runs,
        ],
        spacing: { line: LINE_SPACING, before: 0, after: 0 },
        indent: { ...indentObj, left: finalIndentLeft, hanging: 480 },
        alignment,
      })];
    }

    // Normal paragraph
    return [new Paragraph({
      children: runs,
      spacing: { line: LINE_SPACING, before: 0, after: 0 },
      indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
      alignment,
    })];
  }

  // ── Bullet List (native TipTap bulletList / orderedList) ──────────────────
  if (type === 'bulletList') {
    const items: Paragraph[] = [];
    for (const li of node.content || []) {
      for (const para of li.content || []) {
        if (para.type === 'paragraph') {
          const indentObj = getIndent(para.attrs) || {};
          const baseIndentLeft = 480;
          const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
          const alignment = getAlignment(para.attrs);
          const runs = inlineToRuns(para);
          items.push(new Paragraph({
            children: [
              new TextRun({ text: '•\t', font: DEFAULT_FONT, size: DEFAULT_SIZE }),
              ...runs,
            ],
            spacing: { line: LINE_SPACING, before: 0, after: 0 },
            indent: { ...indentObj, left: finalIndentLeft, hanging: 480 },
            alignment,
          }));
        } else if (para.type === 'bulletList' || para.type === 'orderedList') {
          // Nested list
          items.push(...convertNode(para) as Paragraph[]);
        }
      }
    }
    return items;
  }

  if (type === 'orderedList') {
    const items: Paragraph[] = [];
    let counter = (attrs.start || 1);
    for (const li of node.content || []) {
      for (const para of li.content || []) {
        if (para.type === 'paragraph') {
          const indentObj = getIndent(para.attrs) || {};
          const baseIndentLeft = 480;
          const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
          const alignment = getAlignment(para.attrs);
          const runs = inlineToRuns(para);
          items.push(new Paragraph({
            children: [
              new TextRun({ text: `${counter}.\t`, font: DEFAULT_FONT, size: DEFAULT_SIZE }),
              ...runs,
            ],
            spacing: { line: LINE_SPACING, before: 0, after: 0 },
            indent: { ...indentObj, left: finalIndentLeft, hanging: 480 },
            alignment,
          }));
          counter++;
        }
      }
    }
    return items;
  }

  // ── Table ─────────────────────────────────────────────────────────────────
  if (type === 'table') {
    const tableRows: TableRow[] = [];
    for (const rowNode of node.content || []) {
      if (rowNode.type !== 'tableRow') continue;
      const cells: TableCell[] = [];
      for (const cellNode of rowNode.content || []) {
        if (cellNode.type !== 'tableCell' && cellNode.type !== 'tableHeader') continue;
        const isHeader = cellNode.type === 'tableHeader';
        const cellParagraphs: Paragraph[] = [];

        for (const para of cellNode.content || []) {
          const indentObj = getIndent(para.attrs) || {};
          const alignment = getAlignment(para.attrs);
          const runs = inlineToRuns(para);
          cellParagraphs.push(new Paragraph({
            children: isHeader
              ? runs.map(r => new TextRun({ text: (r as any)._options?.text ?? '', bold: true, font: DEFAULT_FONT, size: DEFAULT_SIZE }))
              : (runs.length > 0 ? runs : [new TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })]),
            spacing: { line: LINE_SPACING, before: 0, after: 0 },
            indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
            alignment,
          }));
        }

        if (cellParagraphs.length === 0) {
          cellParagraphs.push(new Paragraph({
            children: [new TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })],
          }));
        }

        cells.push(new TableCell({
          children: cellParagraphs,
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            left:   { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            right:  { style: BorderStyle.SINGLE, size: 1, color: '000000' },
          },
        }));
      }
      if (cells.length > 0) {
        tableRows.push(new TableRow({ children: cells }));
      }
    }
    if (tableRows.length === 0) return [];
    return [new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    })];
  }

  // ── Skip non-content nodes ─────────────────────────────────────────────────
  return [];
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class ExportService {

  async generatePdf(title: string, html: string, pageSettings: any, layout?: any, pageRanges?: string): Promise<Buffer> {
    let browser = null;
    try {
      const cheerio = require('cheerio');
      const $ = cheerio.load(html);
      
      $('p').each((_: any, el: any) => {
        if ($(el).text().trim() === '' && $(el).find('img').length === 0 && $(el).find('br').length === 0) {
          $(el).html('<br>');
        }
      });
      html = $('body').html() || html;

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
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --font-sans: 'Plus Jakarta Sans', sans-serif;
            }
            body {
              background: white;
              margin: 0;
              padding: 0;
            }
            .editor-prose {
              font-family: 'Times New Roman', Times, serif;
              color: #000000;
              font-size: 12pt;
              line-height: 1.5;
              padding: 0;
              margin: 0;
              display: flow-root;
              overflow-wrap: break-word;
              word-break: break-word;
              white-space: pre-wrap;
            }
            .editor-prose * { max-width: 100%; }
            .editor-prose > *:first-child { margin-top: 0 !important; }
            .editor-prose [style*="nowrap"] { white-space: pre-wrap !important; }
            .editor-prose p { margin-top: 0 !important; margin-bottom: 0 !important; }
            .editor-prose table { border: none !important; }
            
            .prose { max-width: none; }
            .prose h1 { font-size: 16pt; font-weight: bold; page-break-after: avoid; }
            .prose h2 { font-size: 14pt; font-weight: bold; page-break-after: avoid; }
            .prose h3 { font-size: 13pt; font-weight: bold; page-break-after: avoid; }
            .prose h4, .prose h5, .prose h6 { font-size: 12pt; font-weight: bold; margin-top: 0; margin-bottom: 0; }
            .prose img { display: block; max-width: 100%; height: auto; margin: 0; }
            .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1em; page-break-inside: avoid; }
            .prose table td, .prose table th { border: 1px solid black; padding: 4px 8px; vertical-align: top; }
            .prose ul, .prose ol { padding-left: 2em; margin-bottom: 1em; }
            .prose .heading-level-2 { margin-left: 1.5rem; }
            .prose .heading-level-3 { margin-left: 3rem; }
            .prose .heading-level-4 { margin-left: 4.5rem; }
            .prose [data-list-type]:not([data-list-type='none']) { position: relative; padding-left: 32px; }
            .prose [data-list-type]:not([data-list-type='none'])::before { content: attr(data-list-prefix); position: absolute; left: 0; top: 0; width: 28px; padding-right: 4px; white-space: nowrap; text-align: right; font-weight: 400; color: inherit; }
            @page { size: A4; }
          </style>
          </head>
          <body>
            <div class="prose editor-prose max-w-none text-justify">
              ${html}
            </div>
          </body>
        </html>
      `;

      await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });
      
      // Editor canvas uses 96 DPI pixels. Puppeteer works in mm.
      // 1px (96 DPI) = 25.4mm / 96 = 0.264583mm
      const pxToMm = (px: number) => `${(px * 25.4 / 96).toFixed(3)}mm`;
      const topMargin = layout?.top != null ? pxToMm(layout.top) : '25.4mm';   // Default 1 inch
      const rightMargin = layout?.right != null ? pxToMm(layout.right) : '25.4mm';
      const bottomMargin = layout?.bottom != null ? pxToMm(layout.bottom) : '25.4mm';
      const leftMargin = layout?.left != null ? pxToMm(layout.left) : '25.4mm';

      const pdfBufferOrig = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false,
        margin: { top: topMargin, right: rightMargin, bottom: bottomMargin, left: leftMargin },
        pageRanges: pageRanges || '',
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
            if (pageNum >= sec.startPage) activeSection = sec;
          }
          
          if (activeSection) {
            let text = '';
            const currentNumber = activeSection.startNumber + (pageNum - activeSection.startPage);
            
            if (activeSection.format === 'arabic') text = currentNumber.toString();
            else if (activeSection.format === 'roman_lower') text = toRoman(currentNumber).toLowerCase();
            else if (activeSection.format === 'roman_upper') text = toRoman(currentNumber);
            
            if (text) {
              const fontSize = 11;
              const textWidth = font.widthOfTextAtSize(text, fontSize);
              const { width, height } = pdfPage.getSize();
              
              let x = width / 2 - textWidth / 2;
              if (align === 'left') x = 72; 
              else if (align === 'right') x = width - 72 - textWidth;
              
              let y = 35;
              if (position === 'top') y = height - 45;
              
              pdfPage.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
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

  async generateDocx(title: string, documentJson: any | null, html: string | null): Promise<Buffer> {
    if (documentJson) {
      return this.generateDocxFromJson(title, documentJson);
    }
    return this.generateDocxFromHtmlFallback(title, html || '');
  }

  private async generateDocxFromJson(title: string, documentJson: any): Promise<Buffer> {
    const docChildren: (Paragraph | Table)[] = [];

    // Get document-level layout from JSON attrs (margins in px, 1px ≈ 0.75pt)
    const layout = documentJson?.attrs?.layout || { top: 96, bottom: 96, left: 96, right: 96 };
    // Convert px to twip: 1px = 0.75pt, 1pt = 20twip → 1px = 15 twip
    const pxToTwip = (px: number) => Math.round(px * 15);

    const content: TipTapNode[] = documentJson?.content || [];

    let currentListRef: string | null = null;
    let currentListFormat: string | null = null;
    let listCounter = 0;
    const numberingConfigs: any[] = [];

    function getLevelFormat(prefix: string, listType: string) {
      prefix = (prefix || '').trim();
      if (listType === 'bullet') return LevelFormat.BULLET;
      if (/^[a-z]\.$/.test(prefix)) return LevelFormat.LOWER_LETTER;
      if (/^[A-Z]\.$/.test(prefix)) return LevelFormat.UPPER_LETTER;
      if (/^[ivxlc]+\.$/i.test(prefix)) {
        return prefix === prefix.toLowerCase() ? LevelFormat.LOWER_ROMAN : LevelFormat.UPPER_ROMAN;
      }
      return LevelFormat.DECIMAL;
    }

    for (const node of content) {
      // Skip editor-only nodes
      if (['aiTyping', 'imagePlaceholder', 'doc'].includes(node.type)) continue;
      
      // Native List Handling
      if (node.type === 'paragraph' && node.attrs?.listType && node.attrs.listType !== 'none') {
        const listType = node.attrs.listType;
        const listPrefix = node.attrs.listPrefix || (listType === 'bullet' ? '•' : '1.');
        const indentObj = getIndent(node.attrs) || {};
        const format = getLevelFormat(listPrefix, listType);
        
        // Start a new numbering instance if list format changes or previous node wasn't this list
        if (currentListFormat !== format) {
          listCounter++;
          currentListRef = `list-ref-${listCounter}`;
          currentListFormat = format;
          
          numberingConfigs.push({
            reference: currentListRef,
            levels: Array.from({ length: 9 }).map((_, i) => ({
              level: i,
              format: format,
              text: listType === 'bullet' ? '•' : (format === LevelFormat.LOWER_LETTER || format === LevelFormat.UPPER_LETTER) ? `%${i + 1}.` : `%${i + 1}.`,
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 480 + (i * 480), hanging: 480 } // Dynamic indent based on level
                }
              }
            }))
          });
        }
        
        const level = Math.min((node.attrs.indent || 0), 8); // TipTap indent acts as level
        const runs = inlineToRuns(node);
        const alignment = getAlignment(node.attrs);
        
        docChildren.push(new Paragraph({
          children: runs,
          spacing: { line: LINE_SPACING, before: 0, after: 0 },
          numbering: { reference: currentListRef as string, level },
          alignment,
        }));
        continue;
      }
      
      // Reset list tracking if normal node
      if (node.type !== 'bulletList' && node.type !== 'orderedList') {
        currentListFormat = null;
        currentListRef = null;
      }

      const converted = convertNode(node);
      docChildren.push(...converted);
    }

    if (docChildren.length === 0) {
      docChildren.push(new Paragraph({ children: [new TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })] }));
    }

    const docOptions: any = {
      styles: {
        default: {
          document: {
            run: { font: DEFAULT_FONT, size: DEFAULT_SIZE, color: '000000' },
            paragraph: { spacing: { line: LINE_SPACING, before: 0, after: 0 } },
          },
        },
        paragraphStyles: [
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            run: { bold: true, size: PT(16), font: DEFAULT_FONT, color: '000000' },
            paragraph: { spacing: { line: LINE_SPACING, before: 0, after: 0 } },
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            next: 'Normal',
            run: { bold: true, size: PT(14), font: DEFAULT_FONT, color: '000000' },
            paragraph: { spacing: { line: LINE_SPACING, before: 0, after: 0 }, indent: { left: TWIP(18) } },
          },
          {
            id: 'Heading3',
            name: 'Heading 3',
            basedOn: 'Normal',
            next: 'Normal',
            run: { bold: true, size: PT(13), font: DEFAULT_FONT, color: '000000' },
            paragraph: { spacing: { line: LINE_SPACING, before: 0, after: 0 }, indent: { left: TWIP(36) } },
          },
          {
            id: 'Heading4',
            name: 'Heading 4',
            basedOn: 'Normal',
            next: 'Normal',
            run: { bold: true, size: PT(12), font: DEFAULT_FONT, color: '000000' },
            paragraph: { spacing: { line: LINE_SPACING, before: 0, after: 0 }, indent: { left: TWIP(54) } },
          },
          {
            id: 'Heading5',
            name: 'Heading 5',
            basedOn: 'Normal',
            next: 'Normal',
            run: { bold: true, size: PT(11), font: DEFAULT_FONT, color: '000000' },
            paragraph: { spacing: { line: LINE_SPACING, before: 0, after: 0 }, indent: { left: TWIP(54) } },
          },
          {
            id: 'Heading6',
            name: 'Heading 6',
            basedOn: 'Normal',
            next: 'Normal',
            run: { bold: true, size: PT(11), font: DEFAULT_FONT, color: '000000' },
            paragraph: { spacing: { line: LINE_SPACING, before: 0, after: 0 }, indent: { left: TWIP(54) } },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: {
                width: convertMillimetersToTwip(210),  // A4
                height: convertMillimetersToTwip(297),
              },
              margin: {
                top:    pxToTwip(layout.top),
                right:  pxToTwip(layout.right),
                bottom: pxToTwip(layout.bottom),
                left:   pxToTwip(layout.left),
              },
            },
          },
          ...(this.buildPageNumberSettings(documentJson?.attrs?.pageSettings)),
          children: docChildren,
        },
      ],
    };

    if (numberingConfigs.length > 0) {
      docOptions.numbering = {
        config: numberingConfigs
      };
    }

    const doc = new Document(docOptions);

    return await Packer.toBuffer(doc);
  }

  private buildPageNumberSettings(pageSettings: any): { headers?: any, footers?: any } {
    if (!pageSettings || !pageSettings.enabled) return {};

    const position = pageSettings.position || 'bottom';
    const align = pageSettings.align || 'center';
    
    let alignment: any = AlignmentType.CENTER;
    if (align === 'left') alignment = AlignmentType.LEFT;
    if (align === 'right') alignment = AlignmentType.RIGHT;
    
    const pageNumberParagraph = new Paragraph({
      children: [new TextRun({ children: [PageNumber.CURRENT], font: DEFAULT_FONT, size: DEFAULT_SIZE })],
      alignment: alignment,
    });

    if (position === 'top') {
      return { headers: { default: new Header({ children: [pageNumberParagraph] }) } };
    } else {
      return { footers: { default: new Footer({ children: [pageNumberParagraph] }) } };
    }
  }

  private async generateDocxFromHtmlFallback(title: string, html: string): Promise<Buffer> {
    const HTMLtoDOCX = require('html-to-docx');
    const cheerio = require('cheerio');
    const $ = cheerio.load(html, { decodeEntities: false });

    const children = $('body').children().toArray();
    let currentList: any = null;
    let currentListType: string | null = null;

    for (const el of children) {
      const listType = $(el).attr('data-list-type');
      if (listType === 'bullet' || listType === 'ordered') {
        const isOrdered = listType === 'ordered';
        if (currentListType !== listType) {
          const listTag = isOrdered ? '<ol></ol>' : '<ul></ul>';
          currentList = $(listTag);
          $(el).before(currentList);
          currentListType = listType;
        }
        const li = $('<li></li>').html($(el).html() || '');
        currentList.append(li);
        $(el).remove();
      } else {
        currentList = null;
        currentListType = null;
      }
    }

    $('p').each((_: any, el: any) => {
      if ($(el).text().trim() === '' && $(el).find('img').length === 0) {
        $(el).html('&nbsp;');
      }
    });

    $('*').each((_: any, el: any) => {
      if (el.type !== 'tag') return;
      const attribs = el.attribs || {};
      Object.keys(attribs).forEach(attr => {
        const isSafe =
          (el.name === 'a' && attr === 'href') ||
          (el.name === 'img' && ['src', 'alt', 'width', 'height'].includes(attr)) ||
          ((el.name === 'td' || el.name === 'th') && ['colspan', 'rowspan'].includes(attr));
        if (!isSafe) $(el).removeAttr(attr);
      });
    });

    ['span', 'div', 'section', 'article', 'figure', 'figcaption'].forEach(tag => {
      $(tag).each((_: any, el: any) => { $(el).replaceWith($(el).html() || ''); });
    });

    $('script, style, link, noscript').remove();

    const processedHtml = $.html('body').replace('<body>', '').replace('</body>', '').trim();
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title || 'Dokumen'}</title></head><body>${processedHtml}</body></html>`;

    const fileBuffer = await HTMLtoDOCX(fullHtml, null, {
      title: title || 'Dokumen',
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      font: DEFAULT_FONT,
      fontSize: DEFAULT_SIZE,
    });
    return fileBuffer as Buffer;
  }

  async importDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
  }
}
