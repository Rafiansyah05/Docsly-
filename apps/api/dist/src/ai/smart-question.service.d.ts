import { ConfigService } from '@nestjs/config';
import { UserIntent } from './intent.service';
export interface SmartQuestionResult {
    needsQuestions: boolean;
    score: number;
    questions?: string[];
    assumedFields?: string[];
    documentType?: string;
}
export declare class SmartQuestionService {
    private configService;
    private anthropic;
    constructor(configService: ConfigService);
    analyzeCompleteness(prompt: string, intent: UserIntent, documentContext: string): Promise<SmartQuestionResult>;
}
