import {
  Controller,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { IntentClassifier, UserIntent } from './intent.service';
import { ContextBuilder } from './context.service';
import { TaskExecutor } from './executor.service';
import { SmartQuestionService } from './smart-question.service';
import { LanguageComplianceService } from './language-compliance.service';

@Controller('ai')
export class AiController {
  constructor(
    private intentClassifier: IntentClassifier,
    private contextBuilder: ContextBuilder,
    private taskExecutor: TaskExecutor,
    private smartQuestion: SmartQuestionService,
    private languageCompliance: LanguageComplianceService,
  ) {}

  /**
   * Main execute endpoint — streams progress via SSE
   */
  @Post('execute')
  async execute(
    @Body() body: { prompt: string; documentJson: any; activeBlockIndex?: number; intent?: string; action?: string },
    @Res() res: Response,
  ): Promise<void> {
    const { prompt, documentJson, activeBlockIndex, intent: passedIntent, action } = body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const send = (event: string, data: object) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Stage 1 — Classify Intent
      send('progress', { stage: 'classify', label: 'Menganalisis perintah Anda...', percent: 15 });
      let intent = passedIntent;
      if (!intent) {
        intent = await this.intentClassifier.classify(prompt);
      }
      const intentLabel = this.getIntentLabel(intent);
      send('progress', { stage: 'classified', label: `Terdeteksi: ${intentLabel}`, percent: 30 });

      // Stage 2 — Build context
      send('progress', { stage: 'context', label: 'Membaca isi dokumen...', percent: 45 });
      const context = this.contextBuilder.build(documentJson, activeBlockIndex);

      // Stage 3 — Smart Question Engine Check
      if (action !== 'skip_questions' && action !== 'submit_answers') {
        send('progress', { stage: 'analyze_requirements', label: 'Menganalisis kelengkapan informasi...', percent: 55 });
        const analysis = await this.smartQuestion.analyzeCompleteness(prompt, intent as UserIntent, context);
        
        if (analysis.needsQuestions && analysis.questions && analysis.questions.length > 0) {
          send('progress', { stage: 'questions_needed', label: 'Menunggu detail tambahan...', percent: 100 });
          send('result', { 
            intent: 'ask_questions', 
            questions: analysis.questions, 
            assumedFields: analysis.assumedFields,
            explanation: 'Saya memerlukan beberapa informasi tambahan untuk menyusun dokumen yang sempurna.'
          });
          return;
        }
      }

      // Stage 4 — Execute AI
      send('progress', { stage: 'execute', label: 'AI sedang menulis & memproses...', percent: 70 });
      let result = await this.taskExecutor.execute(intent as UserIntent, prompt, context, action === 'skip_questions');

      // Stage 5 - Language Compliance Layer
      if (result.operations && result.operations.length > 0) {
        send('progress', { stage: 'compliance', label: 'Memeriksa tata bahasa & PUEBI...', percent: 90 });
        result.operations = await this.languageCompliance.verify(result.operations);
      }

      send('progress', { stage: 'done', label: 'Selesai!', percent: 100 });
      send('result', { intent, ...result });
    } catch (error: any) {
      console.error('[AiController] Error:', error);
      send('error', { message: error?.message || 'Terjadi kesalahan internal.' });
    } finally {
      res.end();
    }
  }

  private getIntentLabel(intent: string): string {
    const map: Record<string, string> = {
      generate_outline: 'Buat Kerangka Dokumen',
      generate_content: 'Tulis Konten',
      grammar_check: 'Periksa Tata Bahasa',
      summarize: 'Ringkasan Dokumen',
      general_chat: 'Percakapan Umum',
      ask_questions: 'Tanya Detail Tambahan',
    };
    return map[intent] || intent;
  }
}
