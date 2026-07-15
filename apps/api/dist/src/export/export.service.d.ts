export declare class ExportService {
    generatePdf(title: string, html: string, pageSettings: any): Promise<Buffer>;
    generateDocx(title: string, content: any): Promise<Buffer>;
    importDocx(buffer: Buffer): Promise<string>;
}
