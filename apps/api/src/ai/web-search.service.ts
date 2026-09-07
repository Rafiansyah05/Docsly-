import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';

@Injectable()
export class WebSearchService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY') || '',
    });
  }

  async searchIfNeeded(prompt: string): Promise<string> {
    const hasAnthropic = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!hasAnthropic || hasAnthropic.includes('xxxxxxxx')) return '';

    try {
      // 1. Ask Haiku if we need a web search
      const checkResponse = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 100,
        system: `You are a Web Search Decider. Does the user's prompt require fetching real-time facts, current events, specific external data, or general knowledge from the internet that might not be in the current document context?
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
      } catch (e) {}

      if (!needsSearch || !query) {
        return '';
      }

      // 2. Perform the DuckDuckGo Search
      console.log(`[WebSearchService] Executing search for: ${query}`);
      const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      });
      
      if (!res.ok) {
        console.error(`[WebSearchService] Search failed with status ${res.status}`);
        return '';
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      const results: string[] = [];

      $('.result__body').each((_, element) => {
        const title = $(element).find('.result__title').text().trim();
        const snippet = $(element).find('.result__snippet').text().trim();
        if (title && snippet) {
          results.push(`* ${title}: ${snippet}`);
        }
      });

      if (results.length === 0) return '';

      const searchContext = `\n[HASIL PENCARIAN INTERNET (Sebagai referensi untuk AI)]\n${results.slice(0, 5).join('\n')}\n[AKHIR PENCARIAN INTERNET]\n`;
      return searchContext;
    } catch (error) {
      console.error('WebSearchService Error:', error);
      return ''; // Graceful degradation
    }
  }
}
