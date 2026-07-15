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
const page_numbers_utils_1 = require("./page-numbers.utils");
let ExportService = class ExportService {
    async generatePdf(title, html, pageSettings) {
        let browser = null;
        try {
            let displayHeaderFooter = false;
            if (pageSettings?.enabled) {
                displayHeaderFooter = true;
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
                const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBufferOrig);
                const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.TimesRoman);
                const pages = pdfDoc.getPages();
                const { position = 'bottom', align = 'center' } = pageSettings;
                const sortedSections = [...pageSettings.sections].sort((a, b) => a.startPage - b.startPage);
                pages.forEach((pdfPage, index) => {
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
                        }
                        else if (activeSection.format === 'roman_lower') {
                            text = (0, page_numbers_utils_1.toRoman)(currentNumber).toLowerCase();
                        }
                        else if (activeSection.format === 'roman_upper') {
                            text = (0, page_numbers_utils_1.toRoman)(currentNumber);
                        }
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
                            if (position === 'top') {
                                y = height - 45;
                            }
                            pdfPage.drawText(text, {
                                x, y, size: fontSize, font: font, color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            });
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
    async generateDocx(title, content) {
        return Buffer.from('');
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