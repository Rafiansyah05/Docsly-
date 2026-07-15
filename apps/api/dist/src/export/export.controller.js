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
const supabase_js_1 = require("@supabase/supabase-js");
let ExportController = class ExportController {
    exportService;
    constructor(exportService) {
        this.exportService = exportService;
    }
    async verifyAuth(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new common_1.UnauthorizedException('Missing Authorization header');
        const token = authHeader.split(' ')[1];
        if (!token)
            throw new common_1.UnauthorizedException('Invalid token format');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase environment variables missing');
        }
        const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
    async exportPdf(req, body, res) {
        try {
            await this.verifyAuth(req);
            const { title, html, pageSettings } = body;
            if (!html)
                throw new common_1.BadRequestException('HTML content is required');
            const pdfBuffer = await this.exportService.generatePdf(title, html, pageSettings);
            res.setHeader('Content-Disposition', `attachment; filename="${title || 'Dokumen'}.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');
            res.status(200).send(pdfBuffer);
        }
        catch (error) {
            console.error('Export PDF error:', error);
            res.status(error.status || 500).send(error.message || 'Internal Server Error');
        }
    }
    async exportDocx(req, body, res) {
        try {
            await this.verifyAuth(req);
            const { title, content } = body;
            if (!content)
                throw new common_1.BadRequestException('Content is required');
            const docxBuffer = await this.exportService.generateDocx(title, content);
            res.setHeader('Content-Disposition', `attachment; filename="${title || 'Dokumen'}.docx"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.status(200).send(docxBuffer);
        }
        catch (error) {
            console.error('Export DOCX error:', error);
            res.status(error.status || 500).send(error.message || 'Internal Server Error');
        }
    }
    async importDocument(req, file, res) {
        try {
            await this.verifyAuth(req);
            if (!file)
                throw new common_1.BadRequestException('File is required');
            if (!file.originalname.toLowerCase().endsWith('.docx')) {
                throw new common_1.BadRequestException('Unsupported file format. Only DOCX is supported.');
            }
            const htmlContent = await this.exportService.importDocx(file.buffer);
            res.status(200).json({ html: htmlContent });
        }
        catch (error) {
            console.error('Import Document error:', error);
            res.status(error.status || 500).send(error.message || 'Internal Server Error');
        }
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Post)('pdf'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Post)('docx'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "exportDocx", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "importDocument", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('api/export'),
    __metadata("design:paramtypes", [export_service_1.ExportService])
], ExportController);
//# sourceMappingURL=export.controller.js.map