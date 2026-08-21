import type { Response, Request } from 'express';
import { ExportService } from './export.service';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    processDocx(req: Request, file: Express.Multer.File, body: any, res: Response): Promise<void>;
}
