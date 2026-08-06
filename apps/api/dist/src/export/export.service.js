"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = __importStar(require("puppeteer"));
const mammoth = __importStar(require("mammoth"));
const pdf_lib_1 = require("pdf-lib");
const docx_1 = require("docx");
const page_numbers_utils_1 = require("./page-numbers.utils");
const PT = (pt) => pt * 2;
const TWIP = (pt) => pt * 20;
const HEADING_INDENT = {
    1: 0,
    2: TWIP(18),
    3: TWIP(36),
    4: TWIP(54),
    5: TWIP(54),
    6: TWIP(54),
};
const HEADING_FONT_SIZE = {
    1: PT(16),
    2: PT(14),
    3: PT(13),
    4: PT(12),
    5: PT(11),
    6: PT(11),
};
const HEADING_LEVELS_MAP = {
    1: docx_1.HeadingLevel.HEADING_1,
    2: docx_1.HeadingLevel.HEADING_2,
    3: docx_1.HeadingLevel.HEADING_3,
    4: docx_1.HeadingLevel.HEADING_4,
    5: docx_1.HeadingLevel.HEADING_5,
    6: docx_1.HeadingLevel.HEADING_6,
};
const DEFAULT_FONT = 'Times New Roman';
const DEFAULT_SIZE = PT(11);
const LINE_SPACING = 276;
function inlineToRuns(node, overrideSize) {
    if (!node.content)
        return [];
    const runs = [];
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
                const fsMatch = textStyleMark.attrs.fontSize.match(/^(\d+(?:\.\d+)?)(pt|px)$/);
                if (fsMatch) {
                    const val = parseFloat(fsMatch[1]);
                    const unit = fsMatch[2];
                    size = unit === 'pt' ? PT(val) : Math.round(val * 1.5);
                }
            }
            runs.push(new docx_1.TextRun({
                text,
                bold: isBold || undefined,
                italics: isItalic || undefined,
                underline: isUnderline ? { type: docx_1.UnderlineType.SINGLE } : undefined,
                strike: isStrike || undefined,
                color: color ? color.replace('#', '') : undefined,
                font: font,
                size: size,
            }));
        }
        else if (child.type === 'hardBreak') {
            runs.push(new docx_1.TextRun({ text: '', break: 1 }));
        }
    }
    return runs;
}
function getIndent(attrs = {}) {
    const indent = attrs.indent || 0;
    const firstLineIndent = attrs.firstLineIndent || 0;
    const hangingIndent = attrs.hangingIndent || false;
    let left = 0;
    let hanging = undefined;
    let firstLine = undefined;
    if (indent > 0) {
        left = indent * 480;
    }
    if (firstLineIndent > 0) {
        firstLine = firstLineIndent * 720;
    }
    if (hangingIndent) {
        left += 720;
        hanging = 720;
    }
    if (left === 0 && !hanging && !firstLine)
        return undefined;
    return {
        ...(left > 0 ? { left } : {}),
        ...(hanging ? { hanging } : {}),
        ...(firstLine ? { firstLine } : {})
    };
}
function getAlignment(attrs = {}) {
    if (attrs.textAlign === 'center')
        return docx_1.AlignmentType.CENTER;
    if (attrs.textAlign === 'right')
        return docx_1.AlignmentType.RIGHT;
    if (attrs.textAlign === 'justify')
        return docx_1.AlignmentType.JUSTIFIED;
    return undefined;
}
function convertNode(node) {
    const type = node.type;
    const attrs = node.attrs || {};
    const alignment = getAlignment(attrs);
    if (type === 'heading') {
        const level = attrs.level || 1;
        const baseIndentTwips = HEADING_INDENT[level] || 0;
        const customIndentObj = getIndent(attrs) || {};
        const finalIndentLeft = baseIndentTwips + (customIndentObj.left || 0);
        const indentObj = finalIndentLeft > 0 ? { ...customIndentObj, left: finalIndentLeft } : customIndentObj;
        const runs = inlineToRuns(node, HEADING_FONT_SIZE[level] || DEFAULT_SIZE);
        if (attrs.preserveFormat) {
            return [new docx_1.Paragraph({
                    children: runs.length > 0 ? runs : [new docx_1.TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })],
                    spacing: { line: LINE_SPACING, before: 0, after: 0 },
                    indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
                    alignment,
                })];
        }
        return [new docx_1.Paragraph({
                heading: HEADING_LEVELS_MAP[level] || docx_1.HeadingLevel.HEADING_1,
                children: runs.length > 0 ? runs : [new docx_1.TextRun({ text: '', font: DEFAULT_FONT, size: HEADING_FONT_SIZE[level] || DEFAULT_SIZE })],
                spacing: { line: LINE_SPACING, before: 0, after: 0 },
                indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
                alignment,
            })];
    }
    if (type === 'paragraph') {
        const listType = attrs.listType;
        const listPrefix = attrs.listPrefix || '';
        const hasListType = listType && listType !== 'none' && listType !== '';
        const indentObj = getIndent(attrs) || {};
        const runs = inlineToRuns(node);
        if (runs.length === 0 && !hasListType) {
            return [new docx_1.Paragraph({
                    children: [new docx_1.TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })],
                    spacing: { line: LINE_SPACING, before: 0, after: 0 },
                    indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
                    alignment,
                })];
        }
        if (listType === 'bullet') {
            const prefix = listPrefix || '•';
            const baseIndentLeft = 480;
            const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
            return [new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({ text: `${prefix}\t`, font: DEFAULT_FONT, size: DEFAULT_SIZE }),
                        ...runs,
                    ],
                    spacing: { line: LINE_SPACING, before: 0, after: 0 },
                    indent: { ...indentObj, left: finalIndentLeft, hanging: 480 },
                    alignment,
                })];
        }
        if (listType === 'decimal' || listType === 'ordered') {
            const prefix = listPrefix || '1.';
            const baseIndentLeft = 480;
            const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
            return [new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({ text: `${prefix}\t`, font: DEFAULT_FONT, size: DEFAULT_SIZE }),
                        ...runs,
                    ],
                    spacing: { line: LINE_SPACING, before: 0, after: 0 },
                    indent: { ...indentObj, left: finalIndentLeft, hanging: 480 },
                    alignment,
                })];
        }
        return [new docx_1.Paragraph({
                children: runs,
                spacing: { line: LINE_SPACING, before: 0, after: 0 },
                indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
                alignment,
            })];
    }
    if (type === 'bulletList') {
        const items = [];
        for (const li of node.content || []) {
            for (const para of li.content || []) {
                if (para.type === 'paragraph') {
                    const indentObj = getIndent(para.attrs) || {};
                    const baseIndentLeft = 480;
                    const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
                    const alignment = getAlignment(para.attrs);
                    const runs = inlineToRuns(para);
                    items.push(new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({ text: '•\t', font: DEFAULT_FONT, size: DEFAULT_SIZE }),
                            ...runs,
                        ],
                        spacing: { line: LINE_SPACING, before: 0, after: 0 },
                        indent: { ...indentObj, left: finalIndentLeft, hanging: 480 },
                        alignment,
                    }));
                }
                else if (para.type === 'bulletList' || para.type === 'orderedList') {
                    items.push(...convertNode(para));
                }
            }
        }
        return items;
    }
    if (type === 'orderedList') {
        const items = [];
        let counter = (attrs.start || 1);
        for (const li of node.content || []) {
            for (const para of li.content || []) {
                if (para.type === 'paragraph') {
                    const indentObj = getIndent(para.attrs) || {};
                    const baseIndentLeft = 480;
                    const finalIndentLeft = baseIndentLeft + (indentObj.left || 0);
                    const alignment = getAlignment(para.attrs);
                    const runs = inlineToRuns(para);
                    items.push(new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({ text: `${counter}.\t`, font: DEFAULT_FONT, size: DEFAULT_SIZE }),
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
    if (type === 'table') {
        const tableRows = [];
        for (const rowNode of node.content || []) {
            if (rowNode.type !== 'tableRow')
                continue;
            const cells = [];
            for (const cellNode of rowNode.content || []) {
                if (cellNode.type !== 'tableCell' && cellNode.type !== 'tableHeader')
                    continue;
                const isHeader = cellNode.type === 'tableHeader';
                const cellParagraphs = [];
                for (const para of cellNode.content || []) {
                    const indentObj = getIndent(para.attrs) || {};
                    const alignment = getAlignment(para.attrs);
                    const runs = inlineToRuns(para);
                    cellParagraphs.push(new docx_1.Paragraph({
                        children: isHeader
                            ? runs.map(r => new docx_1.TextRun({ text: r._options?.text ?? '', bold: true, font: DEFAULT_FONT, size: DEFAULT_SIZE }))
                            : (runs.length > 0 ? runs : [new docx_1.TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })]),
                        spacing: { line: LINE_SPACING, before: 0, after: 0 },
                        indent: Object.keys(indentObj).length > 0 ? indentObj : undefined,
                        alignment,
                    }));
                }
                if (cellParagraphs.length === 0) {
                    cellParagraphs.push(new docx_1.Paragraph({
                        children: [new docx_1.TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })],
                    }));
                }
                cells.push(new docx_1.TableCell({
                    children: cellParagraphs,
                    borders: {
                        top: { style: docx_1.BorderStyle.SINGLE, size: 1, color: '000000' },
                        bottom: { style: docx_1.BorderStyle.SINGLE, size: 1, color: '000000' },
                        left: { style: docx_1.BorderStyle.SINGLE, size: 1, color: '000000' },
                        right: { style: docx_1.BorderStyle.SINGLE, size: 1, color: '000000' },
                    },
                }));
            }
            if (cells.length > 0) {
                tableRows.push(new docx_1.TableRow({ children: cells }));
            }
        }
        if (tableRows.length === 0)
            return [];
        return [new docx_1.Table({
                rows: tableRows,
                width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            })];
    }
    return [];
}
let ExportService = class ExportService {
    async generatePdf(title, html, pageSettings) {
        let browser = null;
        try {
            const cheerio = require('cheerio');
            const $ = cheerio.load(html);
            $('p').each((_, el) => {
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
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              background: white;
              color: #000000;
              font-size: 11pt;
              line-height: 1.15;
              margin: 0;
              padding: 0;
            }
            .prose { max-width: none; }
            .prose p { margin-top: 0; margin-bottom: 0; font-size: 11pt; }
            .prose h1 { font-size: 16pt; font-weight: bold; margin-top: 0; margin-bottom: 0; page-break-after: avoid; }
            .prose h2 { font-size: 14pt; font-weight: bold; margin-top: 0; margin-bottom: 0; page-break-after: avoid; }
            .prose h3 { font-size: 13pt; font-weight: bold; margin-top: 0; margin-bottom: 0; page-break-after: avoid; }
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
            @page { size: A4; margin: 2.54cm; }
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
                const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBufferOrig);
                const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
                const pages = pdfDoc.getPages();
                const { position = 'bottom', align = 'center' } = pageSettings;
                const sortedSections = [...pageSettings.sections].sort((a, b) => a.startPage - b.startPage);
                pages.forEach((pdfPage, index) => {
                    const pageNum = index + 1;
                    let activeSection = null;
                    for (const sec of sortedSections) {
                        if (pageNum >= sec.startPage)
                            activeSection = sec;
                    }
                    if (activeSection) {
                        let text = '';
                        const currentNumber = activeSection.startNumber + (pageNum - activeSection.startPage);
                        if (activeSection.format === 'arabic')
                            text = currentNumber.toString();
                        else if (activeSection.format === 'roman_lower')
                            text = (0, page_numbers_utils_1.toRoman)(currentNumber).toLowerCase();
                        else if (activeSection.format === 'roman_upper')
                            text = (0, page_numbers_utils_1.toRoman)(currentNumber);
                        if (text) {
                            const fontSize = 11;
                            const textWidth = font.widthOfTextAtSize(text, fontSize);
                            const { width, height } = pdfPage.getSize();
                            let x = width / 2 - textWidth / 2;
                            if (align === 'left')
                                x = 72;
                            else if (align === 'right')
                                x = width - 72 - textWidth;
                            let y = 35;
                            if (position === 'top')
                                y = height - 45;
                            pdfPage.drawText(text, { x, y, size: fontSize, font, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
                        }
                    }
                });
                const modifiedPdfBytes = await pdfDoc.save();
                finalPdfBuffer = Buffer.from(modifiedPdfBytes);
            }
            return Buffer.from(finalPdfBuffer);
        }
        catch (error) {
            if (browser)
                await browser.close();
            throw error;
        }
    }
    async generateDocx(title, documentJson, html) {
        if (documentJson) {
            return this.generateDocxFromJson(title, documentJson);
        }
        return this.generateDocxFromHtmlFallback(title, html || '');
    }
    async generateDocxFromJson(title, documentJson) {
        const docChildren = [];
        const layout = documentJson?.attrs?.layout || { top: 96, bottom: 96, left: 96, right: 96 };
        const pxToTwip = (px) => Math.round(px * 15);
        const content = documentJson?.content || [];
        let currentListRef = null;
        let currentListFormat = null;
        let listCounter = 0;
        const numberingConfigs = [];
        function getLevelFormat(prefix, listType) {
            prefix = (prefix || '').trim();
            if (listType === 'bullet')
                return docx_1.LevelFormat.BULLET;
            if (/^[a-z]\.$/.test(prefix))
                return docx_1.LevelFormat.LOWER_LETTER;
            if (/^[A-Z]\.$/.test(prefix))
                return docx_1.LevelFormat.UPPER_LETTER;
            if (/^[ivxlc]+\.$/i.test(prefix)) {
                return prefix === prefix.toLowerCase() ? docx_1.LevelFormat.LOWER_ROMAN : docx_1.LevelFormat.UPPER_ROMAN;
            }
            return docx_1.LevelFormat.DECIMAL;
        }
        for (const node of content) {
            if (['aiTyping', 'imagePlaceholder', 'doc'].includes(node.type))
                continue;
            if (node.type === 'paragraph' && node.attrs?.listType && node.attrs.listType !== 'none') {
                const listType = node.attrs.listType;
                const listPrefix = node.attrs.listPrefix || (listType === 'bullet' ? '•' : '1.');
                const indentObj = getIndent(node.attrs) || {};
                const format = getLevelFormat(listPrefix, listType);
                if (currentListFormat !== format) {
                    listCounter++;
                    currentListRef = `list-ref-${listCounter}`;
                    currentListFormat = format;
                    numberingConfigs.push({
                        reference: currentListRef,
                        levels: Array.from({ length: 9 }).map((_, i) => ({
                            level: i,
                            format: format,
                            text: listType === 'bullet' ? '•' : (format === docx_1.LevelFormat.LOWER_LETTER || format === docx_1.LevelFormat.UPPER_LETTER) ? `%${i + 1}.` : `%${i + 1}.`,
                            alignment: docx_1.AlignmentType.LEFT,
                            style: {
                                paragraph: {
                                    indent: { left: 480 + (i * 480), hanging: 480 }
                                }
                            }
                        }))
                    });
                }
                const level = Math.min((node.attrs.indent || 0), 8);
                const runs = inlineToRuns(node);
                const alignment = getAlignment(node.attrs);
                docChildren.push(new docx_1.Paragraph({
                    children: runs,
                    spacing: { line: LINE_SPACING, before: 0, after: 0 },
                    numbering: { reference: currentListRef, level },
                    alignment,
                }));
                continue;
            }
            if (node.type !== 'bulletList' && node.type !== 'orderedList') {
                currentListFormat = null;
                currentListRef = null;
            }
            const converted = convertNode(node);
            docChildren.push(...converted);
        }
        if (docChildren.length === 0) {
            docChildren.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: '', font: DEFAULT_FONT, size: DEFAULT_SIZE })] }));
        }
        const docOptions = {
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
                                width: (0, docx_1.convertMillimetersToTwip)(210),
                                height: (0, docx_1.convertMillimetersToTwip)(297),
                            },
                            margin: {
                                top: pxToTwip(layout.top),
                                right: pxToTwip(layout.right),
                                bottom: pxToTwip(layout.bottom),
                                left: pxToTwip(layout.left),
                            },
                        },
                    },
                    children: docChildren,
                },
            ],
        };
        if (numberingConfigs.length > 0) {
            docOptions.numbering = {
                config: numberingConfigs
            };
        }
        const doc = new docx_1.Document(docOptions);
        return await docx_1.Packer.toBuffer(doc);
    }
    async generateDocxFromHtmlFallback(title, html) {
        const HTMLtoDOCX = require('html-to-docx');
        const cheerio = require('cheerio');
        const $ = cheerio.load(html, { decodeEntities: false });
        const children = $('body').children().toArray();
        let currentList = null;
        let currentListType = null;
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
            }
            else {
                currentList = null;
                currentListType = null;
            }
        }
        $('p').each((_, el) => {
            if ($(el).text().trim() === '' && $(el).find('img').length === 0) {
                $(el).html('&nbsp;');
            }
        });
        $('*').each((_, el) => {
            if (el.type !== 'tag')
                return;
            const attribs = el.attribs || {};
            Object.keys(attribs).forEach(attr => {
                const isSafe = (el.name === 'a' && attr === 'href') ||
                    (el.name === 'img' && ['src', 'alt', 'width', 'height'].includes(attr)) ||
                    ((el.name === 'td' || el.name === 'th') && ['colspan', 'rowspan'].includes(attr));
                if (!isSafe)
                    $(el).removeAttr(attr);
            });
        });
        ['span', 'div', 'section', 'article', 'figure', 'figcaption'].forEach(tag => {
            $(tag).each((_, el) => { $(el).replaceWith($(el).html() || ''); });
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
        return fileBuffer;
    }
    async importDocx(buffer) {
        const result = await mammoth.convertToHtml({ buffer });
        return result.value;
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)()
], ExportService);
//# sourceMappingURL=export.service.js.map