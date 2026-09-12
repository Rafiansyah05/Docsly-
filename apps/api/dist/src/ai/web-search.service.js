"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const cheerio = __importStar(require("cheerio"));
let WebSearchService = class WebSearchService {
    configService;
    anthropic;
    constructor(configService) {
        this.configService = configService;
        this.anthropic = new sdk_1.default({
            apiKey: this.configService.get('ANTHROPIC_API_KEY') || '',
        });
    }
    async searchIfNeeded(prompt) {
        const hasAnthropic = this.configService.get('ANTHROPIC_API_KEY');
        if (!hasAnthropic || hasAnthropic.includes('xxxxxxxx'))
            return '';
        try {
            const checkResponse = await this.anthropic.messages.create({
                model: 'claude-haiku-4-5',
                max_tokens: 100,
                system: `You are a Web Search Decider for an Academic Writing AI. Does the user's prompt require fetching real-time facts, statistical data, specific external data, or general knowledge from the internet?
CRITICAL: If the user asks to write a "Latar Belakang" (Background), Introduction, or any section that needs public data, facts, or statistics to be credible, you MUST output needsSearch: true and create a query to find the relevant data on the internet.
Output a JSON object exactly like this:
{ "needsSearch": boolean, "query": "search query if true, else empty string" }
Do not output anything else.`,
                messages: [{ role: 'user', content: prompt }],
            });
            const text = checkResponse.content[0].type === 'text' ? checkResponse.content[0].text : '';
            let needsSearch = false;
            let query = '';
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    needsSearch = parsed.needsSearch;
                    query = parsed.query;
                }
            }
            catch (e) { }
            if (!needsSearch || !query) {
                return '';
            }
            console.log(`[WebSearchService] Executing search for: ${query}`);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                }
            });
            clearTimeout(timeout);
            if (!res.ok) {
                console.error(`[WebSearchService] Search failed with status ${res.status}`);
                return '';
            }
            const html = await res.text();
            const $ = cheerio.load(html);
            const results = [];
            $('.result__body').each((_, element) => {
                const title = $(element).find('.result__title').text().trim();
                const snippet = $(element).find('.result__snippet').text().trim();
                if (title && snippet) {
                    results.push(`* ${title}: ${snippet}`);
                }
            });
            if (results.length === 0)
                return '';
            const searchContext = `\n[HASIL PENCARIAN INTERNET (Sebagai referensi untuk AI)]\n${results.slice(0, 5).join('\n')}\n[AKHIR PENCARIAN INTERNET]\n`;
            return searchContext;
        }
        catch (error) {
            console.error('WebSearchService Error:', error);
            return '';
        }
    }
};
exports.WebSearchService = WebSearchService;
exports.WebSearchService = WebSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebSearchService);
//# sourceMappingURL=web-search.service.js.map