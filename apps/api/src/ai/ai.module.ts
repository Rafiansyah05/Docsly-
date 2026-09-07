import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { IntentClassifier } from './intent.service';
import { ContextBuilder } from './context.service';
import { TaskExecutor } from './executor.service';
import { SmartQuestionService } from './smart-question.service';
import { LanguageComplianceService } from './language-compliance.service';
import { WebSearchService } from './web-search.service';

@Module({
  imports: [],
  controllers: [AiController],
  providers: [
    IntentClassifier,
    ContextBuilder,
    TaskExecutor,
    SmartQuestionService,
    LanguageComplianceService,
    WebSearchService,
  ],
  exports: [
    IntentClassifier,
    ContextBuilder,
    TaskExecutor,
    SmartQuestionService,
    LanguageComplianceService,
    WebSearchService,
  ],
})
export class AiAgentModule {}
