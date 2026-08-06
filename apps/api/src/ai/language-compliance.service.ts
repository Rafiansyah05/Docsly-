import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { BlockOperation } from './executor.service';

@Injectable()
export class LanguageComplianceService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY') || '',
    });
  }

  async verify(operations: BlockOperation[]): Promise<BlockOperation[]> {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');

    if (!hasAnthropic || operations.length === 0) {
      return operations; // Skip LCL if no API key or empty ops
    }

    const systemPrompt = `You are the Language Compliance Layer for Docsly AI. 
Your job is to take an array of ProseMirror JSON block operations and apply the following rules WITHOUT changing the overall JSON structure or deleting nodes:
1. KBBI & PUEBI/EYD: Fix any Indonesian spelling or grammar mistakes in the "text" fields. Ensure all vocabulary conforms to Kamus Besar Bahasa Indonesia (KBBI).
2. Italicize Foreign Terms: Any non-Indonesian words (e.g. English scientific terms, tech jargon like "download", "online", "server") MUST be wrapped in an italic mark: { "type": "italic" } in the "marks" array of the text node.
3. Glossary Consistency: Ensure terms are translated consistently.
4. Heading Numbers: Ensure heading text numbers (e.g. "1. Pendahuluan") are logically sequential.

You will receive the JSON array of operations. You MUST return ONLY the modified JSON array of operations. 
DO NOT wrap in \`\`\`json. DO NOT change the "op" or "index" fields. ONLY modify the "node" contents.
Return valid JSON. Escape newlines as \\n. Make sure the entire JSON array is complete and properly closed.`;

    const MAX_LCL_TOKENS = 8000;
    const MAX_LOOPS = 3;

    try {
      const messages: any[] = [
        {
          role: 'user',
          content: JSON.stringify(operations),
        }
      ];

      let fullText = '';
      let isComplete = false;
      let loops = 0;

      while (!isComplete && loops < MAX_LOOPS) {
        loops++;
        const response = await this.anthropic.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: MAX_LCL_TOKENS,
          system: systemPrompt,
          messages,
        });

        const textBlock = response.content.find((c: any) => c.type === 'text');
        const text = textBlock ? (textBlock as any).text : '';
        fullText += text;

        if (response.stop_reason === 'max_tokens' && loops < MAX_LOOPS) {
          // JSON got cut off, ask Claude to continue
          messages.push({ role: 'assistant', content: text });
          messages.push({
            role: 'user',
            content: 'Lanjutkan output JSON dari karakter terakhir yang terpotong. JANGAN mengulang dari awal. Pastikan output JSON array ditutup dengan benar.',
          });
        } else {
          isComplete = true;
        }
      }

      // Try to extract JSON array
      const jsonStart = fullText.indexOf('[');
      const jsonEnd = fullText.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = fullText.substring(jsonStart, jsonEnd);
        try {
          return JSON.parse(jsonStr) as BlockOperation[];
        } catch (parseError) {
          // Try auto-recovery: close any unclosed JSON
          console.warn('LCL JSON parse failed, attempting auto-recovery...');
          const recovered = this.attemptJsonRecovery(jsonStr);
          if (recovered) return recovered as BlockOperation[];
        }
      }

      return operations; // Fallback if parsing fails
    } catch (error) {
      console.error('Error in LanguageComplianceService:', error);
      return operations; // Fallback to original ops on error
    }
  }

  private attemptJsonRecovery(jsonStr: string): any[] | null {
    try {
      // Try closing with common endings
      const endings = [']}', '}]', ']'];
      for (const ending of endings) {
        try {
          return JSON.parse(jsonStr + ending);
        } catch {
          // try next
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
