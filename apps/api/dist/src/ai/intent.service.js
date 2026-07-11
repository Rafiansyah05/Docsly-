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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentClassifier = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let IntentClassifier = class IntentClassifier {
    configService;
    anthropic;
    constructor(configService) {
        this.configService = configService;
        this.anthropic = new sdk_1.default({
            apiKey: this.configService.get('ANTHROPIC_API_KEY') || '',
        });
    }
    async classify(prompt) {
        const anthropicKey = this.configService.get('ANTHROPIC_API_KEY');
        const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');
        const systemInstruction = `You are an Intent Classifier for an AI document assistant. Your job is to classify the user's request into one of the following exact categories:
- 'grammar_check': When the user wants to fix spelling, grammar, PUEBI, EYD, typo, formatting or rewrite text for better phrasing.
- 'generate_outline': When the user asks to create a new document from scratch, draft a new outline, or create section structures.
- 'generate_content': When the user asks to write the actual content of a section, fill in a paragraph, write text based on an outline, extend/shorten content, or add new sections.
- 'summarize': When the user asks to summarize, compress, or abstract existing text.
- 'general_chat': For any other conversational query or questions about the document that doesn't fit the above.

Output only the category name in lowercase without punctuation or other characters.`;
        if (hasAnthropic) {
            try {
                const response = await this.anthropic.messages.create({
                    model: 'claude-haiku-4-5',
                    max_tokens: 20,
                    system: systemInstruction,
                    messages: [{ role: 'user', content: prompt }],
                });
                const intent = response.content[0].type === 'text' ? response.content[0].text.trim().toLowerCase() : 'general_chat';
                const validIntents = ['grammar_check', 'generate_outline', 'generate_content', 'general_chat', 'summarize'];
                return validIntents.includes(intent) ? intent : 'general_chat';
            }
            catch (e) {
                console.error('Error in IntentClassifier (Claude):', e);
            }
        }
        const lower = prompt.toLowerCase();
        if (lower.includes('outline') || lower.includes('buat dokumen') || lower.includes('kerangka') || lower.includes('dari nol')) {
            return 'generate_outline';
        }
        if (lower.includes('tata bahasa') || lower.includes('grammar') || lower.includes('puebi') || lower.includes('perbaiki')) {
            return 'grammar_check';
        }
        if (lower.includes('tulis') || lower.includes('lanjutkan') || lower.includes('isi') || lower.includes('generate')) {
            return 'generate_content';
        }
        if (lower.includes('ringkas') || lower.includes('rangkum') || lower.includes('summarize')) {
            return 'summarize';
        }
        return 'general_chat';
    }
};
exports.IntentClassifier = IntentClassifier;
exports.IntentClassifier = IntentClassifier = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IntentClassifier);
//# sourceMappingURL=intent.service.js.map