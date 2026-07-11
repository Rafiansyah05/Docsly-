import type { Response } from 'express';
import { IntentClassifier } from './intent.service';
import { ContextBuilder } from './context.service';
import { TaskExecutor } from './executor.service';
import { SmartQuestionService } from './smart-question.service';
import { LanguageComplianceService } from './language-compliance.service';
export declare class AiController {
    private intentClassifier;
    private contextBuilder;
    private taskExecutor;
    private smartQuestion;
    private languageCompliance;
    constructor(intentClassifier: IntentClassifier, contextBuilder: ContextBuilder, taskExecutor: TaskExecutor, smartQuestion: SmartQuestionService, languageCompliance: LanguageComplianceService);
    execute(body: {
        prompt: string;
        documentJson: any;
        activeBlockIndex?: number;
        intent?: string;
        action?: string;
    }, res: Response): Promise<void>;
    private getIntentLabel;
}
