import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { UserIntent } from './intent.service';

export interface SmartQuestionResult {
  needsQuestions: boolean;
  score: number;
  questions?: string[];
  assumedFields?: string[];
  documentType?: string;
}

@Injectable()
export class SmartQuestionService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY') || '',
    });
  }

  async analyzeCompleteness(prompt: string, intent: UserIntent, documentContext: string): Promise<SmartQuestionResult> {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');

    // Only analyze completeness for generating outline or content
    if (intent !== 'generate_outline' && intent !== 'generate_content') {
      return { needsQuestions: false, score: 100 };
    }

    if (!hasAnthropic) {
      // Mock logic for local testing without API key
      const words = prompt.split(' ').length;
      if (words < 5) {
        return {
          needsQuestions: true,
          score: 30,
          documentType: 'Umum',
          questions: ['Apa topik utama dokumen ini?', 'Siapa target pembacanya?'],
          assumedFields: ['Gaya bahasa formal'],
        };
      }
      return { needsQuestions: false, score: 90 };
    }

    const systemPrompt = `You are a Document Requirement Analyzer for Docsly AI. 
Your task is to analyze the user's prompt to determine what information is missing to create a high-quality document of the requested type.
Follow these steps:
1. Identify the document type (e.g., Proposal, Essay, Letter, Article, Report).
2. Determine the "mandatory information slots" for that document type.
3. Check which of these slots are provided in the user's prompt (or document context).
4. Calculate a completeness score from 0 to 100.
   - If score > 80: We have enough info to proceed. Return needsQuestions = false.
   - If score between 40 and 80: We are missing key info. Return needsQuestions = true, and generate exactly 3-5 specific questions targeting the highest priority missing slots AT ONCE (not one-by-one).
   - If score < 40: The prompt is too vague. Return needsQuestions = true, and generate 1-3 general opening questions (e.g., "Apa topik utamanya?", "Untuk keperluan apa?").
5. Output MUST be valid JSON matching this schema:
{
  "score": number,
  "needsQuestions": boolean,
  "documentType": string,
  "questions": string[], // List of questions for the user (in Indonesian). Empty if needsQuestions is false.
  "assumedFields": string[] // Fields that you will just assume if the user skips answering.
}
Do not include markdown blocks like \`\`\`json. Just raw JSON.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5', // Haiku is fast enough for requirement parsing
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `User Prompt: ${prompt}\n\nCurrent Document Context: ${documentContext || 'Empty Document'}`,
          }
        ],
      });

      const textBlock = response.content.find((c: any) => c.type === 'text');
      const text = textBlock ? (textBlock as any).text : '{}';
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr) as SmartQuestionResult;
      }
      
      return { needsQuestions: false, score: 100 }; // Fallback
    } catch (error) {
      console.error('Error in SmartQuestionService:', error);
      return { needsQuestions: false, score: 100 }; // Fallback to generating outline directly on error
    }
  }
}
