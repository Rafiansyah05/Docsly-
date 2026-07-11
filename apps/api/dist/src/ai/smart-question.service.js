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
exports.SmartQuestionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let SmartQuestionService = class SmartQuestionService {
    configService;
    anthropic;
    constructor(configService) {
        this.configService = configService;
        this.anthropic = new sdk_1.default({
            apiKey: this.configService.get('ANTHROPIC_API_KEY') || '',
        });
    }
    async analyzeCompleteness(prompt, intent, documentContext) {
        const anthropicKey = this.configService.get('ANTHROPIC_API_KEY');
        const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');
        if (intent !== 'generate_outline' && intent !== 'generate_content') {
            return { needsQuestions: false, score: 100 };
        }
        if (!hasAnthropic) {
            const words = prompt.split(' ').length;
            if (words < 5) {
                return {
                    needsQuestions: true,
                    score: 30,
                    documentType: 'Umum',
                    questions: ['Apa topik utama dokumen ini?', 'Siapa target pembacanya?'],
                    assumedFields: ['Gaya bahasa formal'],
                };
            }
            return { needsQuestions: false, score: 90 };
        }
        const systemPrompt = `You are a Document Requirement Analyzer for Docsly AI. 
Your task is to analyze the user's prompt to determine what information is missing to create a high-quality document of the requested type.
Follow these steps:
1. Identify the document type (e.g., Proposal, Essay, Letter, Article, Report).
2. Determine the "mandatory information slots" for that document type.
3. Check which of these slots are provided in the user's prompt (or document context).
4. Calculate a completeness score from 0 to 100.
   - If score > 80: We have enough info to proceed. Return needsQuestions = false.
   - If score between 40 and 80: We are missing key info. Return needsQuestions = true, and generate exactly 3-5 specific questions targeting the highest priority missing slots AT ONCE (not one-by-one).
   - If score < 40: The prompt is too vague. Return needsQuestions = true, and generate 1-3 general opening questions (e.g., "Apa topik utamanya?", "Untuk keperluan apa?").
5. Output MUST be valid JSON matching this schema:
{
  "score": number,
  "needsQuestions": boolean,
  "documentType": string,
  "questions": string[], // List of questions for the user (in Indonesian). Empty if needsQuestions is false.
  "assumedFields": string[] // Fields that you will just assume if the user skips answering.
}
Do not include markdown blocks like \`\`\`json. Just raw JSON.`;
        try {
            const response = await this.anthropic.messages.create({
                model: 'claude-haiku-4-5',
                max_tokens: 500,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: `User Prompt: ${prompt}\n\nCurrent Document Context: ${documentContext || 'Empty Document'}`,
                    }
                ],
            });
            const textBlock = response.content.find((c) => c.type === 'text');
            const text = textBlock ? textBlock.text : '{}';
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = text.substring(jsonStart, jsonEnd);
                return JSON.parse(jsonStr);
            }
            return { needsQuestions: false, score: 100 };
        }
        catch (error) {
            console.error('Error in SmartQuestionService:', error);
            return { needsQuestions: false, score: 100 };
        }
    }
};
exports.SmartQuestionService = SmartQuestionService;
exports.SmartQuestionService = SmartQuestionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmartQuestionService);
//# sourceMappingURL=smart-question.service.js.map