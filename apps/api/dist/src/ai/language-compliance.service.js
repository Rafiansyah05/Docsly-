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
exports.LanguageComplianceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
let LanguageComplianceService = class LanguageComplianceService {
    configService;
    anthropic;
    constructor(configService) {
        this.configService = configService;
        this.anthropic = new sdk_1.default({
            apiKey: this.configService.get('ANTHROPIC_API_KEY') || '',
        });
    }
    async verify(operations) {
        const anthropicKey = this.configService.get('ANTHROPIC_API_KEY');
        const hasAnthropic = anthropicKey && !anthropicKey.includes('xxxxxxxx');
        if (!hasAnthropic || operations.length === 0) {
            return operations;
        }
        const systemPrompt = `You are the Language Compliance Layer for Docsly AI. 
Your job is to take an array of ProseMirror JSON block operations and apply the following rules WITHOUT changing the overall JSON structure or deleting nodes:
1. KBBI & PUEBI/EYD: Fix any Indonesian spelling or grammar mistakes in the "text" fields. Ensure all vocabulary conforms to Kamus Besar Bahasa Indonesia (KBBI).
2. Italicize Foreign Terms: Any non-Indonesian words (e.g. English scientific terms, tech jargon like "download", "online", "server") MUST be wrapped in an italic mark: { "type": "italic" } in the "marks" array of the text node.
3. Glossary Consistency: Ensure terms are translated consistently.
4. Heading Numbers: Ensure heading text numbers (e.g. "1. Pendahuluan") are logically sequential.

You will receive the JSON array of operations. You MUST return ONLY the modified JSON array of operations. 
DO NOT wrap in \`\`\`json. DO NOT change the "op" or "index" fields. ONLY modify the "node" contents.
Return valid JSON. Escape newlines as \\n. Make sure the entire JSON array is complete and properly closed.`;
        const MAX_LCL_TOKENS = 8000;
        const MAX_LOOPS = 20;
        try {
            const messages = [
                {
                    role: 'user',
                    content: JSON.stringify(operations),
                }
            ];
            let fullText = '';
            let isComplete = false;
            let loops = 0;
            while (!isComplete && loops < MAX_LOOPS) {
                loops++;
                const response = await this.anthropic.messages.create({
                    model: 'claude-haiku-4-5',
                    max_tokens: MAX_LCL_TOKENS,
                    system: systemPrompt,
                    messages,
                });
                const textBlock = response.content.find((c) => c.type === 'text');
                const text = textBlock ? textBlock.text : '';
                fullText += text;
                if (response.stop_reason === 'max_tokens' && loops < MAX_LOOPS) {
                    if (messages.length === 1) {
                        messages.push({ role: 'assistant', content: fullText });
                    }
                    else {
                        messages[1].content = fullText;
                    }
                }
                else {
                    isComplete = true;
                }
            }
            const jsonStart = fullText.indexOf('[');
            const jsonEnd = fullText.lastIndexOf(']') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                const jsonStr = fullText.substring(jsonStart, jsonEnd);
                try {
                    return JSON.parse(jsonStr);
                }
                catch (parseError) {
                    console.warn('LCL JSON parse failed, attempting auto-recovery...');
                    const recovered = this.attemptJsonRecovery(jsonStr);
                    if (recovered)
                        return recovered;
                }
            }
            return operations;
        }
        catch (error) {
            console.error('Error in LanguageComplianceService:', error);
            return operations;
        }
    }
    attemptJsonRecovery(jsonStr) {
        try {
            const endings = [']}', '}]', ']'];
            for (const ending of endings) {
                try {
                    return JSON.parse(jsonStr + ending);
                }
                catch {
                }
            }
            return null;
        }
        catch {
            return null;
        }
    }
};
exports.LanguageComplianceService = LanguageComplianceService;
exports.LanguageComplianceService = LanguageComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LanguageComplianceService);
//# sourceMappingURL=language-compliance.service.js.map