import { ConfigService } from '@nestjs/config';
export interface CitationMetadata {
    title: string | null;
    authors: string[];
    year: string | null;
    journal: string | null;
    publisher: string | null;
    volume: string | null;
    issue: string | null;
    pages: string | null;
    doi: string | null;
    type: string | null;
}
export declare class CitationService {
    private configService;
    private anthropic;
    constructor(configService: ConfigService);
    extractFromFile(file: Express.Multer.File): Promise<{
        success: boolean;
        data?: CitationMetadata;
        message?: string;
    }>;
    extractFromUrl(urlStr: string): Promise<{
        success: boolean;
        data?: CitationMetadata;
        message?: string;
    }>;
    private extractMetadataWithClaude;
    private validateMetadata;
}
