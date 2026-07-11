import { ConfigService } from '@nestjs/config';
export type UserIntent = 'grammar_check' | 'generate_outline' | 'generate_content' | 'general_chat' | 'summarize';
export declare class IntentClassifier {
    private configService;
    private anthropic;
    constructor(configService: ConfigService);
    classify(prompt: string): Promise<UserIntent>;
}
