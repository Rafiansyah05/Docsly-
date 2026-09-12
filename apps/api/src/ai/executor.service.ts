import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { UserIntent } from './intent.service';
const { PDFParse } = require('pdf-parse');
import * as mammoth from 'mammoth';

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
  op: 'insert' | 'replace' | 'delete' | 'setDocumentSettings';
  index?: number;
  node?: ProseMirrorBlockNode;
  settings?: {
    margin?: { top?: number; bottom?: number; left?: number; right?: number };
    pageSettings?: {
      enabled: boolean;
      position?: 'top' | 'bottom';
      align?: 'left' | 'center' | 'right';
      sections?: Array<{
        startPage: number;
        format: 'arabic' | 'roman_lower' | 'roman_upper';
        startNumber: number;
      }>;
    };
  };
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
    isAssuming: boolean = false,
    attachments: any[] = [],
    plan: string = 'Free',
    send?: (event: string, data: object) => void
  ): Promise<{ operations: BlockOperation[]; explanation?: string }> {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');

    let fullPrompt = prompt;
    if (attachments && attachments.length > 0) {
      const parsedTexts = await this.parseAttachments(attachments);
      if (parsedTexts) {
        fullPrompt = `[DOKUMEN LAMPIRAN PENGGUNA]\n${parsedTexts}\n\n[AKHIR LAMPIRAN]\n\n${prompt}`;
      }
    }

    if (!hasAnthropic) {
      return this.getMockResponse(intent, fullPrompt);
    }

    const systemPrompt = this.getSystemPrompt(intent, isAssuming);

    try {
      return await this.executeWithClaude(intent, fullPrompt, documentContext, systemPrompt, plan, send);
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
    plan: string,
    send?: (event: string, data: object) => void
  ): Promise<{ operations: BlockOperation[]; explanation?: string }> {
    const isLightTask = intent === 'grammar_check' || intent === 'summarize' || intent === 'general_chat';
    const model = isLightTask ? 'claude-haiku-4-5' : 'claude-sonnet-5';
    const maxTokens = isLightTask ? 4096 : 8192;

    const messages: any[] = [
      {
        role: 'user',
        content: `Document Current State:\n${documentContext}\n\nUser Request: ${prompt}`,
      },
    ];

    let fullText = '';
    let isComplete = false;
    let loops = 0;
    
    // Dynamic Limits: We allow up to 50 loops (approx 400k tokens) so the AI acts like a proper agent that doesn't stop until finished.
    const MAX_LOOPS = 50;
    let reachedLimit = false;

    // State for extracting text for real-time preview
    let windowBuf = '';
    let inStr = false;
    let esc = false;
    let explanationEnded = false;

    while (!isComplete && loops < MAX_LOOPS) {
      loops++;
      const stream = await this.anthropic.messages.stream({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages,
      });
      
      let chunkCount = 0;
      let lastTextLength = fullText.length;
      let hasHitMarker = false;
      let explanationStreamedLength = 0;
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const textChunk = chunk.delta.text;
          fullText += textChunk;
          chunkCount++;
          
          if (!hasHitMarker && loops === 1) {
            const markerIndex = fullText.indexOf('===JSON_START===');
            if (markerIndex !== -1) {
              hasHitMarker = true;
              explanationEnded = true;
              const explanationText = fullText.substring(0, markerIndex).trim();
              const newText = explanationText.substring(explanationStreamedLength);
              if (newText.length > 0 && send) {
                 send('explanation_chunk', { text: newText });
              }
            } else {
              // stream safely, leaving last 20 chars in buffer
              const safeLen = Math.max(0, fullText.length - 20);
              const safeText = fullText.substring(0, safeLen);
              const newText = safeText.substring(explanationStreamedLength);
              if (newText.length > 0 && send) {
                 send('explanation_chunk', { text: newText });
                 explanationStreamedLength += newText.length;
              }
            }
          }

          // Real-time Text Streaming Extraction
          if (explanationEnded) {
            for (const char of textChunk) {
              if (inStr) {
                if (esc) {
                  if (char === 'n') {
                    if (send) send('draft_text', { text: '\n' });
                  } else {
                    if (send) send('draft_text', { text: char });
                  }
                  esc = false;
                } else if (char === '\\') {
                  esc = true;
                } else if (char === '"') {
                  inStr = false;
                  if (send) send('draft_text', { text: ' ' }); // space after a text block
                } else {
                  if (send) send('draft_text', { text: char });
                }
              } else {
                windowBuf += char;
                if (windowBuf.length > 20) windowBuf = windowBuf.slice(-20);
                if (windowBuf.endsWith('"text": "') || windowBuf.endsWith('"text":"')) {
                  inStr = true;
                }
              }
            }
          }

          if (send && chunkCount % 5 === 0) {
            send('typing', { chunks: chunkCount, length: fullText.length });
          }
        }
      }
      
      const finalMessage = await stream.finalMessage();
      
      if (finalMessage.stop_reason === 'max_tokens') {
        if (loops >= MAX_LOOPS) {
          reachedLimit = true;
          isComplete = true; // Force stop
        } else {
          // Keep looping to get more tokens
          // Use Anthropic's Assistant Prefill feature:
          // Provide the generated text so far as the last assistant message.
          // Claude will seamlessly continue from this exact point without conversational fluff.
          if (messages.length === 1) {
            messages.push({ role: 'assistant', content: fullText });
          } else {
            messages[1].content = fullText;
          }
        }
      } else {
        isComplete = true;
      }
    }

    if (reachedLimit) {
      // Auto-JSON Recovery: Try to force close the JSON to salvage the operations
      fullText += '"]}]}'; 
    }

    let finalExplanation = 'Selesai! Perubahan telah diterapkan.';
    const markerIdx = fullText.indexOf('===JSON_START===');
    if (markerIdx !== -1) {
      finalExplanation = fullText.substring(0, markerIdx).trim();
    } else {
      // Fallback
      const firstBrace = fullText.indexOf('{');
      if (firstBrace > 0) {
         finalExplanation = fullText.substring(0, firstBrace).trim();
      }
    }

    const jsonStart = fullText.indexOf('{');
    const jsonEnd = fullText.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      let jsonStr = fullText.substring(jsonStart, jsonEnd);
      try {
        const parsed = JSON.parse(jsonStr);
        parsed.explanation = finalExplanation;
        if (reachedLimit) {
          parsed.explanation += ' (Output dipotong karena batas limit plan Anda mencapai batas maksimal token untuk sekali permintaan.)';
        }
        return parsed;
      } catch (parseError: any) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw Claude Output:', fullText);
        return {
          operations: [],
          explanation: 'Maaf, balasan AI terlalu panjang atau memiliki format yang salah sehingga gagal diproses secara sempurna. Mohon persempit instruksi Anda.'
        };
      }
    }

    return {
      operations: [],
      explanation: 'Maaf, format balasan AI tidak valid. Mohon ulangi permintaan Anda.'
    };
  }

  private async parseAttachments(attachments: any[]): Promise<string> {
    let combinedText = '';
    const MAX_CHARS_PER_FILE = 15000;

    for (const file of attachments) {
      try {
        const response = await fetch(file.url);
        if (!response.ok) continue;

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let extractedText = '';

        if (file.name.endsWith('.pdf') || file.type.includes('pdf')) {
          const parser = new PDFParse({ data: buffer });
          const data = await parser.getText();
          extractedText = data.text;
        } else if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml.document')) {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } else {
          // Fallback to plain text for csv, txt, json, html
          extractedText = buffer.toString('utf-8');
        }

        if (extractedText.length > MAX_CHARS_PER_FILE) {
          extractedText = extractedText.substring(0, MAX_CHARS_PER_FILE) + '\n...[TEKS DIPOTONG KARENA TERLALU PANJANG]...';
        }

        combinedText += `--- Isi File: ${file.name} ---\n${extractedText}\n\n`;
      } catch (err) {
        console.error(`Gagal mem-parsing file ${file.name}:`, err);
      }
    }
    return combinedText;
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

# OUTPUT MODE
You never output the final document directly. Instead generate structured editing operations.
Your response MUST be divided into exactly TWO parts:

PART 1: The Explanation
A natural, conversational response to the user explaining what you did or answering their question. Gunakan gaya bahasa santai dan profesional.
You MUST write this part first.

PART 2: The JSON Operations
The exact marker ===JSON_START=== on a new line, followed by a valid JSON object containing the editing operations.
Each operation MUST follow this JSON schema exactly:

{
  "operations": [
    {
      "op": "insert" | "replace" | "delete" | "setDocumentSettings",
      "index": number,
      "node": { 
339:         "type": "paragraph" | "heading" | "imagePlaceholder" | "table" | "tableRow" | "tableHeader" | "tableCell",
340:         "attrs": { 
341:           "level": number, 
342:           "indent": number,
343:           "listType": "bullet" | "decimal" | "none",
344:           "listPrefix": string,
345:           "assumed": boolean,
346:           "caption": string 
347:         },
348:         "content": [
349:           {
350:             "type": "text",
351:             "text": "The text content",
352:             "marks": [ { "type": "bold" | "italic" | "underline" | "strike" } ]
353:           }
354:         ]
355:       },
356:       "settings": {
357:         "margin": { "top": 96, "bottom": 96, "left": 96, "right": 96 },
358:         "pageSettings": {
359:           "enabled": true,
360:           "position": "bottom",
361:           "align": "center",
362:           "sections": [ { "startPage": 1, "format": "arabic", "startNumber": 1 } ]
363:         }
364:       }
365:     }
366:   ]
367: }
368: 
369: Example Response:
370: Tentu, saya telah menambahkan bab pendahuluan untuk Anda.
371: ===JSON_START===
372: {
373:   "operations": [ ... ]
374: }
375: 
376: CRITICAL RULES:
377: 1. Output ONLY the valid JSON object after the ===JSON_START=== marker. Do NOT wrap it in markdown block like \`\`\`json. Make sure the JSON is fully complete and not cut off.
378: 2. Escape all newlines as \\n inside strings to ensure valid JSON!
379: 3. For the Explanation part (Part 1), gunakan gaya bahasa santai, natural, seperti manusia biasa dengan sedikit lelucon lucu atau witty, namun tetap menunjukkan kinerja serius dan profesional.
380: 4. [FLAT LISTS]: NEVER use "bulletList", "orderedList", or "listItem" node types. To create lists, you MUST use "paragraph" node type and set "attrs" {"listType": "bullet", "listPrefix": "\\u2022", "indent": 1} for bullets, or {"listType": "decimal", "listPrefix": "1.", "indent": 1} for numbered lists. Increase "indent" for nested lists.
381: 5. The document text color must be default black. Do not add any text color to the nodes.
382: 6. STRUKTUR & FORMAT DOKUMEN INDONESIA (SANGAT KETAT): Anda WAJIB 100% menggunakan format dokumen resmi/akademis Indonesia (Makalah, Skripsi, Proposal).
- Penomoran Sub-bab WAJIB berformat seperti 1.1, 1.2, 1.2.1, 2.1, dst. atau A., B., a., b. yang hirarkis.
- JANGAN menyertakan kalimat basa-basi atau kata-kata pengantar AI ("Berikut adalah hasil...", "Dalam makalah ini kita akan...", dll) di dalam isi kertas. Isi kertas murni HANYA teks konten langsung ke intinya (to the point).
- Jangan kebanyakan "cerita" naratif yang bertele-tele; tuliskan poin-poin argumen yang akurat, nyambung, dan berbobot.
- Jika membuat dokumen baru, Anda WAJIB membuatkan Halaman Sampul (Cover).
383: 7. DATA PUBLIK & INTERNET KNOWLEDGE: Jika Anda menulis bagian "Latar Belakang", "Pendahuluan", atau bagian analisis yang membutuhkan fakta/statistik nyata, Anda WAJIB menggunakan data publik yang akurat. Jika ada "[HASIL PENCARIAN INTERNET]" di prompt, Anda WAJIB mengutip dan memasukkan data tersebut ke dalam isi dokumen secara natural dan relevan.
384: 8. [KUALITAS AKADEMIS & ANTI-PLAGIARISME]: Seluruh teks yang Anda hasilkan harus mendalam, analitis, koheren (nyambung antar paragraf), dan diparafrase dengan baik. Argumen harus berbobot dan berbasis data/fakta, bukan sekadar narasi kosong.
385: 9. [PANJANG & KELENGKAPAN OUTPUT - SANGAT KRITIS]: Jika user meminta pembuatan konten panjang (misal: "buatkan 6 bab", "buatkan makalah lengkap", "jelaskan secara detail"), Anda WAJIB menghasilkan teks yang SANGAT PANJANG, LENGKAP, dan MENDETAIL. JANGAN PERNAH meringkas menjadi hanya 1-2 paragraf jika tidak secara eksplisit diminta! Jika diminta 6 BAB, hasilkan 6 BAB lengkap dengan isinya. Manfaatkan token limit Anda secara maksimal untuk memberikan output terlengkap! Patuhi perintah user 100% tanpa melenceng.
386: 10. [EFISIENSI PATCH & FILE ATTACHMENT]: Saat MENGEDIT dokumen yang sudah ada, generate operasi seminimal mungkin (hanya node yang berubah). Namun saat MENGHASILKAN konten BARU, Anda harus sangat komprehensif. Jika pengguna melampirkan file, pastikan Anda menjawab berdasarkan isinya secara akurat.
387: 11. [TABEL OTOMATIS]: Apabila Anda diinstruksikan untuk membandingkan atribut, menjelaskan jadwal rinci, atau mendeskripsikan data/spesifikasi numerik, Anda WAJIB membuat tabel Tiptap (\`type: "table"\` berisi \`tableRow\`, \`tableHeader\`, \`tableCell\`).
388: 12. [PLACEHOLDER GAMBAR]: Jika Anda diminta membuat arsitektur, diagram alir, atau dokumentasi visual, Anda WAJIB menyisipkan node \`type: "imagePlaceholder"\` dengan atribut \`caption: "Gambar [Bab].[Urutan] [Deskripsi]"\` alih-alih hanya menulis teks placeholder biasa.
389: 13. [SITASI]: Anda dapat menginsert node sitasi dengan format \`{ "type": "citation", "attrs": { "refId": "id-referensi", "style": "APA" } }\` jika diminta menyisipkan sitasi in-text. Tetapi ini hanya berlaku jika Anda sudah diberi ID referensi.
390: 14. [PENGATURAN HALAMAN & MARGIN]: Anda dapat mengubah nomor halaman dan margin melalui operasi \`setDocumentSettings\`. PENTING: Satuan di dalam JSON adalah PIXEL. 1 cm = 38 px, 1 inci = 96 px. Jika user meminta margin 3 cm, konversikan menjadi \`3 * 38 = 114\`. Jika perintah mengenai pengaturan halaman bersifat AMBIGU, ajukan pertanyaan klarifikasi melalui field \`explanation\`.
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

  async translateText(text: string, targetLanguage: 'english' | 'indonesian'): Promise<string> {
    const sl = targetLanguage === 'english' ? 'id' : 'en';
    const tl = targetLanguage === 'english' ? 'en' : 'id';
    
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Translate API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data[0] && Array.isArray(data[0])) {
        return data[0].map((segment: any[]) => segment[0]).join('');
      }
      
      return text;
    } catch (error: any) {
      console.error('Error translating text:', error);
      throw new Error('Gagal menerjemahkan teks: ' + error.message);
    }
  }
}

