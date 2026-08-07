export declare class ExportService {
    generatePdf(title: string, html: string, pageSettings: any): Promise<Buffer>;
    generateDocx(title: string, documentJson: any | null, html: string | null): Promise<Buffer>;
    private generateDocxFromJson;
    private buildPageNumberSettings;
    private generateDocxFromHtmlFallback;
    importDocx(buffer: Buffer): Promise<string>;
}
