export declare class ExportService {
    generatePdf(title: string, html: string, pageSettings: any): Promise<Buffer>;
    generateDocx(title: string, html: string): Promise<Buffer>;
    importDocx(buffer: Buffer): Promise<string>;
}
