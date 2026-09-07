import { ConfigService } from '@nestjs/config';
export declare class WebSearchService {
    private configService;
    private anthropic;
    constructor(configService: ConfigService);
    searchIfNeeded(prompt: string): Promise<string>;
}
