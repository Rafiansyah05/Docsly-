"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const intent_service_1 = require("./intent.service");
const context_service_1 = require("./context.service");
const executor_service_1 = require("./executor.service");
let AiProcessor = class AiProcessor extends bullmq_1.WorkerHost {
    intentClassifier;
    contextBuilder;
    taskExecutor;
    constructor(intentClassifier, contextBuilder, taskExecutor) {
        super();
        this.intentClassifier = intentClassifier;
        this.contextBuilder = contextBuilder;
        this.taskExecutor = taskExecutor;
    }
    async process(job) {
        const { prompt, documentJson, activeBlockIndex, intent: passedIntent } = job.data;
        await job.updateProgress(10);
        let intent = passedIntent;
        if (!intent) {
            intent = await this.intentClassifier.classify(prompt);
        }
        await job.updateProgress(40);
        const context = this.contextBuilder.build(documentJson, activeBlockIndex);
        await job.updateProgress(60);
        const result = await this.taskExecutor.execute(intent, prompt, context);
        await job.updateProgress(100);
        return {
            intent,
            ...result,
        };
    }
};
exports.AiProcessor = AiProcessor;
exports.AiProcessor = AiProcessor = __decorate([
    (0, bullmq_1.Processor)('ai-agent'),
    __metadata("design:paramtypes", [intent_service_1.IntentClassifier,
        context_service_1.ContextBuilder,
        executor_service_1.TaskExecutor])
], AiProcessor);
//# sourceMappingURL=ai.processor.js.map