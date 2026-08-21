"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const export_service_1 = require("./export.service");
let ExportController = class ExportController {
    exportService;
    constructor(exportService) {
        this.exportService = exportService;
    }
    async processDocx(req, file, body, res) {
        try {
            if (!file)
                throw new common_1.BadRequestException('File is required');
            if (!file.originalname.toLowerCase().endsWith('.docx')) {
                throw new common_1.BadRequestException('Unsupported file format. Only DOCX is supported.');
            }
            let config = { pageNumbering: null, bibliography: null };
            if (body.config) {
                try {
                    config = JSON.parse(body.config);
                }
                catch (e) {
                    throw new common_1.BadRequestException('Invalid configuration format');
                }
            }
            const docxBuffer = await this.exportService.processDocx(file.buffer, config);
            let featureType = null;
            if (config.bibliography && config.pageNumbering) {
                featureType = 'bibliography_page_numbering';
            }
            else if (config.bibliography) {
                featureType = 'bibliography';
            }
            else if (config.pageNumbering) {
                featureType = 'page_numbering';
            }
            if (featureType) {
                try {
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
                    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
                    if (supabaseUrl && supabaseKey) {
                        const { createClient } = require('@supabase/supabase-js');
                        const supabase = createClient(supabaseUrl, supabaseKey);
                        supabase.rpc('increment_usage', { feature_name: featureType }).then();
                    }
                }
                catch (e) {
                    console.error('Failed to record usage analytics:', e);
                }
            }
            const safeTitle = (file.originalname || 'Dokumen').replace(/\.docx$/i, '_processed.docx');
            res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Length', docxBuffer.length);
            res.status(200).send(docxBuffer);
        }
        catch (error) {
            console.error('Process DOCX error:', error);
            res.status(error.status || 500).send(error.message || 'Internal Server Error');
        }
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Post)('process'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "processDocx", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('api/export'),
    __metadata("design:paramtypes", [export_service_1.ExportService])
], ExportController);
//# sourceMappingURL=export.controller.js.map