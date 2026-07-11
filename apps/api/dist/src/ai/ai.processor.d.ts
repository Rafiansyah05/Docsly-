import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IntentClassifier } from './intent.service';
import { ContextBuilder } from './context.service';
import { TaskExecutor } from './executor.service';
export declare class AiProcessor extends WorkerHost {
    private intentClassifier;
    private contextBuilder;
    private taskExecutor;
    constructor(intentClassifier: IntentClassifier, contextBuilder: ContextBuilder, taskExecutor: TaskExecutor);
    process(job: Job<any, any, string>): Promise<any>;
}
