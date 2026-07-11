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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const mammoth = __importStar(require("mammoth"));
const cheerio = __importStar(require("cheerio"));
const pdf_parse_1 = require("pdf-parse");
let CitationService = class CitationService {
    configService;
    anthropic;
    constructor(configService) {
        this.configService = configService;
        this.anthropic = new sdk_1.default({
            apiKey: this.configService.get('ANTHROPIC_API_KEY') || '',
        });
    }
    async extractFromFile(file) {
        let text = '';
        try {
            if (file.mimetype === 'application/pdf') {
                const parser = new pdf_parse_1.PDFParse({ data: file.buffer });
                const data = await parser.getText();
                text = data.text;
            }
            else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                text = result.value;
            }
            else if (file.mimetype === 'text/plain') {
                text = file.buffer.toString('utf-8');
            }
            else {
                return { success: false, message: 'Format file tidak didukung. Harap upload PDF, DOCX, atau TXT.' };
            }
        }
        catch (e) {
            console.error(e);
            return { success: false, message: 'Gagal mengekstrak teks dari dokumen.' };
        }
        if (!text || text.trim().length === 0) {
            return { success: false, message: 'Dokumen kosong atau tidak memiliki teks yang dapat dibaca.' };
        }
        const contextText = text.substring(0, 10000);
        return this.extractMetadataWithClaude(contextText, 'file');
    }
    async extractFromUrl(urlStr) {
        try {
            new URL(urlStr);
        }
        catch {
            return { success: false, message: 'URL tidak valid.' };
        }
        try {
            const response = await fetch(urlStr, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                }
            });
            if (!response.ok) {
                return { success: false, message: 'Tidak dapat mengakses halaman web.' };
            }
            const html = await response.text();
            const $ = cheerio.load(html);
            let metaInfo = '';
            const pageTitle = $('title').text();
            metaInfo += `Title Tag: ${pageTitle}\n`;
            $('meta').each((_, el) => {
                const name = $(el).attr('name') || $(el).attr('property');
                const content = $(el).attr('content');
                if (name && content) {
                    if (name.includes('citation_') || name.includes('og:') || name.includes('author') || name.includes('article:')) {
                        metaInfo += `${name}: ${content}\n`;
                    }
                }
            });
            $('script, style, noscript, nav, footer').remove();
            const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
            const combinedContext = `Meta Tags:\n${metaInfo}\n\nPage Content:\n${bodyText}`;
            return this.extractMetadataWithClaude(combinedContext, 'url');
        }
        catch (e) {
            console.error(e);
            return { success: false, message: 'Gagal mengekstrak data dari URL.' };
        }
    }
    async extractMetadataWithClaude(contextText, sourceType) {
        const anthropicKey = this.configService.get('ANTHROPIC_API_KEY');
        if (!anthropicKey || anthropicKey.includes('xxxxxxxx')) {
            return {
                success: true,
                data: {
                    title: "Mock AI Title",
                    authors: ["Mock Author"],
                    year: "2026",
                    journal: "Mock Journal",
                    publisher: null,
                    volume: null,
                    issue: null,
                    pages: null,
                    doi: null,
                    type: "journal"
                }
            };
        }
        const systemPrompt = `Extract metadata (title, author, publication year, etc.) from the provided document or webpage content. The source might be an academic paper, a news article, a blog post, or a general website.
Return ONLY a valid JSON object with the following structure:
{
  "title": string | null,
  "authors": string[] | [],
  "year": string | null,
  "journal": string | null,
  "publisher": string | null,
  "volume": string | null,
  "issue": string | null,
  "pages": string | null,
  "doi": string | null,
  "type": "journal" | "book" | "website" | "conference" | "report" | "unknown"
}
If information is unavailable, return null. Do not guess missing information, but try your best to find the title, author, and year from the provided Meta Tags or Content.
Only output the JSON object without any formatting like \`\`\`json.`;
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-haiku-4-5',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: `Content Source:\n${contextText}`,
                    },
                ],
            });
            const textBlock = response.content.find((c) => c.type === 'text');
            const text = textBlock ? textBlock.text : '';
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = text.substring(jsonStart, jsonEnd);
                const metadata = JSON.parse(jsonStr);
                return this.validateMetadata(metadata, sourceType);
            }
            return { success: false, message: 'AI gagal menghasilkan output JSON yang valid.' };
        }
        catch (e) {
            console.error('Claude API Error:', e);
            return { success: false, message: `Terjadi kesalahan saat memproses data dengan AI: ${e.message}` };
        }
    }
    validateMetadata(metadata, sourceType) {
        const isCompletelyEmpty = !metadata.title && (!metadata.authors || metadata.authors.length === 0) && !metadata.year;
        if (isCompletelyEmpty) {
            return { success: false, message: 'Tidak dapat membuat sitasi otomatis.\nSumber yang Anda masukkan tidak memiliki informasi yang cukup untuk diekstrak (Judul, Penulis, dan Tahun kosong). Silakan gunakan metode input manual.' };
        }
        return { success: true, data: metadata };
    }
};
exports.CitationService = CitationService;
exports.CitationService = CitationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CitationService);
//# sourceMappingURL=citation.service.js.map