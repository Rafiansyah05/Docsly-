import { CitationService } from './citation.service';
export declare class CitationController {
    private readonly citationService;
    constructor(citationService: CitationService);
    extractFromFile(file: Express.Multer.File): Promise<{
        success: boolean;
        data?: import("./citation.service").CitationMetadata;
        message?: string;
    }>;
    extractFromUrl(url: string): Promise<{
        success: boolean;
        data?: import("./citation.service").CitationMetadata;
        message?: string;
    }>;
}
