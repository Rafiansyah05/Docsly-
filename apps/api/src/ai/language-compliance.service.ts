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
Return valid JSON. Escape newlines as \\n.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5', // Haiku is fast enough for LCL
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(operations),
          }
        ],
      });

      const textBlock = response.content.find((c: any) => c.type === 'text');
      const text = textBlock ? (textBlock as any).text : '';
      
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr) as BlockOperation[];
      }
      
      return operations; // Fallback if parsing fails
    } catch (error) {
      console.error('Error in LanguageComplianceService:', error);
      return operations; // Fallback to original ops on error
    }
  }
}
