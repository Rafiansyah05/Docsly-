import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import * as mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';

export interface CitationMetadata {
  title: string | null;
  authors: string[];
  year: string | null;
  journal: string | null;
  publisher: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  type: string | null; // journal, book, website, etc.
}

@Injectable()
export class CitationService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY') || '',
    });
  }

  async extractFromFile(file: Express.Multer.File): Promise<{ success: boolean; data?: CitationMetadata; message?: string }> {
    let text = '';

    try {
      if (file.mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: file.buffer });
        const data = await parser.getText();
        text = data.text;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else if (file.mimetype === 'text/plain') {
        text = file.buffer.toString('utf-8');
      } else {
        return { success: false, message: 'Format file tidak didukung. Harap upload PDF, DOCX, atau TXT.' };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Gagal mengekstrak teks dari dokumen.' };
    }

    if (!text || text.trim().length === 0) {
      return { success: false, message: 'Dokumen kosong atau tidak memiliki teks yang dapat dibaca.' };
    }

    // Only send the first 10,000 characters to Claude to save tokens and find metadata (usually at the beginning)
    const contextText = text.substring(0, 10000);
    return this.extractMetadataWithClaude(contextText, 'file');
  }

  async extractFromUrl(urlStr: string): Promise<{ success: boolean; data?: CitationMetadata; message?: string }> {
    try {
      new URL(urlStr);
    } catch {
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

      // Extract specific meta tags usually used in academic sites
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

      // Remove scripts and styles for cleaner text
      $('script, style, noscript, nav, footer').remove();
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
      const combinedContext = `Meta Tags:\n${metaInfo}\n\nPage Content:\n${bodyText}`;

      return this.extractMetadataWithClaude(combinedContext, 'url');
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Gagal mengekstrak data dari URL.' };
    }
  }

  private async extractMetadataWithClaude(contextText: string, sourceType: 'file' | 'url'): Promise<{ success: boolean; data?: CitationMetadata; message?: string }> {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
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

      const textBlock = response.content.find((c: any) => c.type === 'text');
      const text = textBlock ? (textBlock as any).text : '';
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd);
        const metadata: CitationMetadata = JSON.parse(jsonStr);
        
        return this.validateMetadata(metadata, sourceType);
      }
      
      return { success: false, message: 'AI gagal menghasilkan output JSON yang valid.' };
    } catch (e: any) {
      console.error('Claude API Error:', e);
      return { success: false, message: `Terjadi kesalahan saat memproses data dengan AI: ${e.message}` };
    }
  }

  private validateMetadata(metadata: CitationMetadata, sourceType: 'file' | 'url'): { success: boolean; data?: CitationMetadata; message?: string } {
    const isCompletelyEmpty = !metadata.title && (!metadata.authors || metadata.authors.length === 0) && !metadata.year;
    
    if (isCompletelyEmpty) {
      return { success: false, message: 'Tidak dapat membuat sitasi otomatis.\nSumber yang Anda masukkan tidak memiliki informasi yang cukup untuk diekstrak (Judul, Penulis, dan Tahun kosong). Silakan gunakan metode input manual.' };
    }

    return { success: true, data: metadata };
  }
}
