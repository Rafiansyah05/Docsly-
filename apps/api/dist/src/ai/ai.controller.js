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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const intent_service_1 = require("./intent.service");
const context_service_1 = require("./context.service");
const executor_service_1 = require("./executor.service");
const smart_question_service_1 = require("./smart-question.service");
const language_compliance_service_1 = require("./language-compliance.service");
let AiController = class AiController {
    intentClassifier;
    contextBuilder;
    taskExecutor;
    smartQuestion;
    languageCompliance;
    constructor(intentClassifier, contextBuilder, taskExecutor, smartQuestion, languageCompliance) {
        this.intentClassifier = intentClassifier;
        this.contextBuilder = contextBuilder;
        this.taskExecutor = taskExecutor;
        this.smartQuestion = smartQuestion;
        this.languageCompliance = languageCompliance;
    }
    async execute(body, res) {
        const { prompt, documentJson, activeBlockIndex, intent: passedIntent, action, attachments } = body;
        if (!prompt) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();
        const send = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };
        try {
            send('progress', { stage: 'classify', label: 'Menganalisis perintah Anda...', percent: 15 });
            let intent = passedIntent;
            if (!intent) {
                intent = await this.intentClassifier.classify(prompt);
            }
            const intentLabel = this.getIntentLabel(intent);
            send('progress', { stage: 'classified', label: `Terdeteksi: ${intentLabel}`, percent: 30 });
            send('progress', { stage: 'context', label: 'Membaca isi dokumen...', percent: 45 });
            const context = this.contextBuilder.build(documentJson, activeBlockIndex);
            if (action !== 'skip_questions' && action !== 'submit_answers') {
                send('progress', { stage: 'analyze_requirements', label: 'Menganalisis kelengkapan informasi...', percent: 55 });
                const analysis = await this.smartQuestion.analyzeCompleteness(prompt, intent, context);
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
            send('progress', { stage: 'execute', label: 'AI sedang menulis & memproses...', percent: 70 });
            let result = await this.taskExecutor.execute(intent, prompt, context, action === 'skip_questions', attachments);
            if (result.operations && result.operations.length > 0) {
                send('progress', { stage: 'compliance', label: 'Memeriksa tata bahasa & PUEBI...', percent: 90 });
                result.operations = await this.languageCompliance.verify(result.operations);
            }
            send('progress', { stage: 'done', label: 'Selesai!', percent: 100 });
            send('result', { intent, ...result });
        }
        catch (error) {
            console.error('[AiController] Error:', error);
            send('error', { message: error?.message || 'Terjadi kesalahan internal.' });
        }
        finally {
            res.end();
        }
    }
    getIntentLabel(intent) {
        const map = {
            generate_outline: 'Buat Kerangka Dokumen',
            generate_content: 'Tulis Konten',
            grammar_check: 'Periksa Tata Bahasa',
            summarize: 'Ringkasan Dokumen',
            general_chat: 'Percakapan Umum',
            ask_questions: 'Tanya Detail Tambahan',
        };
        return map[intent] || intent;
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('execute'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "execute", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [intent_service_1.IntentClassifier,
        context_service_1.ContextBuilder,
        executor_service_1.TaskExecutor,
        smart_question_service_1.SmartQuestionService,
        language_compliance_service_1.LanguageComplianceService])
], AiController);
//# sourceMappingURL=ai.controller.js.map