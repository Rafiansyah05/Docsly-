import type { Response, Request } from 'express';
import { ExportService } from './export.service';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    private verifyAuth;
    exportPdf(req: Request, body: any, res: Response): Promise<void>;
    exportDocx(req: Request, body: any, res: Response): Promise<void>;
    importDocument(req: Request, file: Express.Multer.File, res: Response): Promise<void>;
}
