import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { UserIntent } from './intent.service';

export interface ProseMirrorTextNode {
  type: 'text';
  text: string;
  marks?: Array<{ type: 'bold' | 'italic' | 'underline' | 'strike' }>;
}

export interface ProseMirrorBlockNode {
  type: 'paragraph' | 'heading' | 'bulletList' | 'orderedList' | 'listItem';
  attrs?: {
    level?: number;
    indent?: number;
  };
  content?: Array<ProseMirrorTextNode | ProseMirrorBlockNode>;
}

export interface BlockOperation {
  op: 'insert' | 'replace' | 'delete';
  index: number;
  node?: ProseMirrorBlockNode;
}

@Injectable()
export class TaskExecutor {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY') || '',
    });
  }

  async execute(
    intent: UserIntent,
    prompt: string,
    documentContext: string,
    isAssuming: boolean = false
  ): Promise<{ operations: BlockOperation[]; explanation?: string }> {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');

    if (!hasAnthropic) {
      return this.getMockResponse(intent, prompt);
    }

    const systemPrompt = this.getSystemPrompt(intent, isAssuming);

    try {
      return await this.executeWithClaude(intent, prompt, documentContext, systemPrompt);
    } catch (error: any) {
      console.error(`Error in TaskExecutor (Claude):`, error);
      return {
        operations: [],
        explanation: `[DEBUG ERROR]: ${error?.message || String(error)}`,
      };
    }
  }

  private async executeWithClaude(
    intent: UserIntent,
    prompt: string,
    documentContext: string,
    systemPrompt: string,
  ): Promise<{ operations: BlockOperation[]; explanation?: string }> {
    // Model Selection for Cost Efficiency
    // Light tasks use Haiku (very fast, very cheap)
    // Complex tasks use Sonnet 5 (powerful for coding/writing)
    const isLightTask = intent === 'grammar_check' || intent === 'summarize' || intent === 'general_chat';
    const model = isLightTask 
      ? 'claude-haiku-4-5' 
      : 'claude-sonnet-5';
      
    // Limit max_tokens to prevent billing spikes, but give enough for JSON
    const maxTokens = isLightTask ? 4096 : 8192;

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Document Current State:\n${documentContext}\n\nUser Request: ${prompt}`,
        },
      ],
    });

    const textBlock = response.content.find((c: any) => c.type === 'text');
    const text = textBlock ? (textBlock as any).text : '';
    
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      let jsonStr = text.substring(jsonStart, jsonEnd);
      // Clean up common Claude JSON issues like unescaped newlines in text
      // jsonStr = jsonStr.replace(/\n/g, '\\n');
      try {
        return JSON.parse(jsonStr);
      } catch (parseError: any) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw Claude Output:', text);
        throw new Error(`Claude returned malformed JSON: ${parseError.message}`);
      }
    }

    throw new Error(`Claude response did not contain valid JSON. Raw text: ${text}`);
  }

  private getSystemPrompt(intent: UserIntent, isAssuming: boolean): string {
    const assumptionRule = isAssuming ? 
      `\n8. [ASSUMPTION MODE]: The user skipped providing some necessary details. You MUST make reasonable, professional assumptions to fill in the missing gaps (e.g. dummy names, dates, budgets). Add the attribute "assumed": true inside the "attrs" object of any block node that contains assumed information.` : '';

    return `# ROLE
You are Docsly AI, an autonomous Document AI Agent.
Your primary responsibility is executing document editing tasks inside the editor.
You always think in terms of actions, not conversations.
Your goal is helping users produce high quality documents while keeping the user fully in control.
You NEVER modify the document directly.
Instead, you always generate a proposed patch (operations) that the user can Review -> Accept -> Reject.

# DOCUMENT PERMISSION
You have full permission to inspect the document. You may read, search, replace, rewrite, delete, insert, create new sections, rename headings, fix formatting, etc.
But every modification MUST become a proposed change. Never silently change the document.

# EDITING PRINCIPLE
Every user request should become an executable editing task.
Example: "Tambahkan abstrak." -> Action: Insert new Abstract section.
Never answer with instructions explaining how. Always perform the requested operation.

# OUTPUT MODE (JSON STRUCTURE)
You never output the final document directly. Instead generate structured editing operations in JSON format.
Each operation MUST follow this JSON schema exactly:

{
  "operations": [
    {
      "op": "insert" | "replace" | "delete",
      "index": number, // 0-indexed position in the document content array
      "node": { // Required for "insert" and "replace"
        "type": "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem" | "imagePlaceholder" | "table" | "tableRow" | "tableHeader" | "tableCell",
        "attrs": { 
          "level": number, 
          "indent": number, 
          "assumed": boolean,
          "caption": string // used for imagePlaceholder
        }, // Optional
        "content": [
          {
            "type": "text",
            "text": "The text content",
            "marks": [ { "type": "bold" | "italic" | "underline" | "strike" } ]
          }
        ]
      }
    }
  ],
  "explanation": "Pesan balasan ke user."
}

CRITICAL RULES:
1. Output ONLY the valid JSON object. Do NOT wrap it in markdown block like \`\`\`json. Make sure the JSON is fully complete and not cut off.
2. Escape all newlines as \\n inside strings to ensure valid JSON!
3. For the "explanation", gunakan gaya bahasa santai, natural, seperti manusia biasa dengan sedikit lelucon lucu atau witty, namun tetap menunjukkan kinerja serius dan profesional.
4. Gunakan formatting (bold, bulletList, orderedList) jika struktur konten membutuhkannya. Gunakan indentasi atau node paragraph ekstra jika perlu memberikan jarak/spacing profesional.
5. The document text color must be default black. Do not add any text color to the nodes.
6. STRUKTUR ILMIAH & STANDAR INDONESIA (PUEBI/EYD STRICT COMPLIANCE): Anda WAJIB 100% menggunakan Bahasa Indonesia baku sesuai KBBI, PUEBI, dan EYD tanpa terkecuali!
   - Tanda Baca & Huruf Kapital: Terapkan secara absolut aturan titik, koma, huruf kapital (awal kalimat, nama, tempat, instansi).
   - Cetak Miring (Italic): ANDA WAJIB MENCETAK MIRING (gunakan mark { "type": "italic" }) untuk SEMUA kata asing, istilah bahasa Inggris, atau bahasa daerah yang belum diserap (misal: *download*, *online*, *database*).
   - Pastikan struktur dokumen selaras dengan format akademik formal di Indonesia.
7. HEMAT TOKEN (Token Efficiency): Generate MINIMAL patches. Never rewrite or output unchanged parts of the document. Only generate operations for the exact nodes that are being inserted, replaced, or deleted. Keep your output as concise as possible while fulfilling the prompt.
8. [TABEL OTOMATIS]: Apabila Anda diinstruksikan untuk membandingkan atribut, menjelaskan jadwal rinci, atau mendeskripsikan data/spesifikasi numerik, Anda WAJIB membuat tabel Tiptap (\`type: "table"\` berisi \`tableRow\`, \`tableHeader\`, \`tableCell\`). Berikan judul tabel sebelumnya dengan paragraf biasa (misal: "Tabel 1.1 Perbandingan...").
9. [PLACEHOLDER GAMBAR]: Jika Anda diminta membuat arsitektur, diagram alir, atau dokumentasi visual, Anda WAJIB menyisipkan node \`type: "imagePlaceholder"\` dengan atribut \`caption: "Gambar [Bab].[Urutan] [Deskripsi]"\` alih-alih hanya menulis teks placeholder biasa.
10. [SITASI]: Anda dapat menginsert node sitasi dengan format \`{ "type": "citation", "attrs": { "refId": "id-referensi", "style": "APA" } }\` jika diminta menyisipkan sitasi in-text. Tetapi ini hanya berlaku jika Anda sudah diberi ID referensi.
${assumptionRule}`;
  }

  private getMockResponse(intent: UserIntent, prompt: string): { operations: BlockOperation[]; explanation: string } {
    // Generate simple mock response for testing when API key is not present
    if (intent === 'generate_outline') {
      return {
        explanation: 'Outline dokumen baru telah disusun (Mock Mode).',
        operations: [
          {
            op: 'insert',
            index: 0,
            node: {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '1. Pendahuluan' }],
            },
          },
          {
            op: 'insert',
            index: 1,
            node: {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Tuliskan latar belakang dokumen di sini.' }],
            },
          },
          {
            op: 'insert',
            index: 2,
            node: {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '2. Pembahasan Utama' }],
            },
          },
          {
            op: 'insert',
            index: 3,
            node: {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Tuliskan isi pembahasan di sini.' }],
            },
          },
          {
            op: 'insert',
            index: 4,
            node: {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '3. Penutup' }],
            },
          },
        ],
      };
    }

    if (intent === 'grammar_check') {
      return {
        explanation: 'Tata bahasa telah diperbaiki (Mock Mode).',
        operations: [
          {
            op: 'replace',
            index: 0,
            node: {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Ini adalah hasil koreksi tata bahasa yang benar sesuai PUEBI.' },
              ],
            },
          },
        ],
      };
    }

    return {
      explanation: 'Pesan diproses dalam Mock Mode.',
      operations: [
        {
          op: 'insert',
          index: 0,
          node: {
            type: 'paragraph',
            content: [{ type: 'text', text: `Respons otomatis untuk: "${prompt}"` }],
          },
        },
      ],
    };
  }
}
