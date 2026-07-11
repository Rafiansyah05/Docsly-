import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IntentClassifier } from './intent.service';
import { ContextBuilder } from './context.service';
import { TaskExecutor } from './executor.service';

@Processor('ai-agent')
export class AiProcessor extends WorkerHost {
  constructor(
    private intentClassifier: IntentClassifier,
    private contextBuilder: ContextBuilder,
    private taskExecutor: TaskExecutor,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { prompt, documentJson, activeBlockIndex, intent: passedIntent } = job.data;
    
    await job.updateProgress(10);

    // Step 1: Classify intent (if not passed)
    let intent = passedIntent;
    if (!intent) {
      intent = await this.intentClassifier.classify(prompt);
    }
    await job.updateProgress(40);

    // Step 2: Build document context
    const context = this.contextBuilder.build(documentJson, activeBlockIndex);
    await job.updateProgress(60);

    // Step 3: Execute task via Claude
    const result = await this.taskExecutor.execute(intent, prompt, context);
    await job.updateProgress(100);

    return {
      intent,
      ...result,
    };
  }
}
