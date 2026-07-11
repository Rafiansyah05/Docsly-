import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export type UserIntent = 'grammar_check' | 'generate_outline' | 'generate_content' | 'general_chat' | 'summarize';

@Injectable()
export class IntentClassifier {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY') || '',
    });
  }

  async classify(prompt: string): Promise<UserIntent> {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');

    const systemInstruction = `You are an Intent Classifier for an AI document assistant. Your job is to classify the user's request into one of the following exact categories:
- 'grammar_check': When the user wants to fix spelling, grammar, PUEBI, EYD, typo, formatting or rewrite text for better phrasing.
- 'generate_outline': When the user asks to create a new document from scratch, draft a new outline, or create section structures.
- 'generate_content': When the user asks to write the actual content of a section, fill in a paragraph, write text based on an outline, extend/shorten content, or add new sections.
- 'summarize': When the user asks to summarize, compress, or abstract existing text.
- 'general_chat': For any other conversational query or questions about the document that doesn't fit the above.

Output only the category name in lowercase without punctuation or other characters.`;

    if (hasAnthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-haiku-4-5', // Gunakan Haiku karena ini task klasifikasi yang sangat ringan dan butuh kecepatan
          max_tokens: 20,
          system: systemInstruction,
          messages: [{ role: 'user', content: prompt }],
        });

        const intent = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'general_chat';
        const validIntents: UserIntent[] = ['grammar_check', 'generate_outline', 'generate_content', 'general_chat', 'summarize'];
        return validIntents.includes(intent as UserIntent) ? (intent as UserIntent) : 'general_chat';
      } catch (e) {
        console.error('Error in IntentClassifier (Claude):', e);
      }
    }

    // Fallback if no valid API key is configured or API calls fail
    const lower = prompt.toLowerCase();
    if (lower.includes('outline') || lower.includes('buat dokumen') || lower.includes('kerangka') || lower.includes('dari nol')) {
      return 'generate_outline';
    }
    if (lower.includes('tata bahasa') || lower.includes('grammar') || lower.includes('puebi') || lower.includes('perbaiki')) {
      return 'grammar_check';
    }
    if (lower.includes('tulis') || lower.includes('lanjutkan') || lower.includes('isi') || lower.includes('generate')) {
      return 'generate_content';
    }
    if (lower.includes('ringkas') || lower.includes('rangkum') || lower.includes('summarize')) {
      return 'summarize';
    }
    return 'general_chat';
  }
}
