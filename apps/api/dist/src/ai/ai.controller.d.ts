import type { Response } from 'express';
import { IntentClassifier } from './intent.service';
import { ContextBuilder } from './context.service';
import { TaskExecutor } from './executor.service';
import { SmartQuestionService } from './smart-question.service';
import { LanguageComplianceService } from './language-compliance.service';
import { WebSearchService } from './web-search.service';
export declare class AiController {
    private intentClassifier;
    private contextBuilder;
    private taskExecutor;
    private smartQuestion;
    private languageCompliance;
    private webSearch;
    constructor(intentClassifier: IntentClassifier, contextBuilder: ContextBuilder, taskExecutor: TaskExecutor, smartQuestion: SmartQuestionService, languageCompliance: LanguageComplianceService, webSearch: WebSearchService);
    execute(body: {
        prompt: string;
        documentJson: any;
        activeBlockIndex?: number;
        intent?: string;
        action?: string;
        attachments?: any[];
        plan?: string;
    }, res: Response): Promise<void>;
    translate(body: {
        text: string;
        targetLanguage: 'english' | 'indonesian';
    }, res: Response): Promise<void>;
    private getIntentLabel;
}
