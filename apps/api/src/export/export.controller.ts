import { Controller, Post, Body, Res, Req, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { ExportService } from './export.service';
import { createClient } from '@supabase/supabase-js';

@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  private async verifyAuth(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
    
    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid token format');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    return user;
  }

  @Post('pdf')
  async exportPdf(@Req() req: Request, @Body() body: any, @Res() res: Response) {
    try {
      await this.verifyAuth(req);
      
      const { title, html, pageSettings } = body;
      if (!html) throw new BadRequestException('HTML content is required');

      const pdfBuffer = await this.exportService.generatePdf(title, html, pageSettings);
      
      res.setHeader('Content-Disposition', `attachment; filename="${title || 'Dokumen'}.pdf"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.status(200).send(pdfBuffer);
    } catch (error: any) {
      console.error('Export PDF error:', error);
      res.status(error.status || 500).send(error.message || 'Internal Server Error');
    }
  }

  @Post('docx')
  async exportDocx(@Req() req: Request, @Body() body: any, @Res() res: Response) {
    try {
      await this.verifyAuth(req);
      
      const { title, content } = body;
      if (!content) throw new BadRequestException('Content is required');

      const docxBuffer = await this.exportService.generateDocx(title, content);
      
      res.setHeader('Content-Disposition', `attachment; filename="${title || 'Dokumen'}.docx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.status(200).send(docxBuffer);
    } catch (error: any) {
      console.error('Export DOCX error:', error);
      res.status(error.status || 500).send(error.message || 'Internal Server Error');
    }
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importDocument(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      await this.verifyAuth(req);
      
      if (!file) throw new BadRequestException('File is required');
      if (!file.originalname.toLowerCase().endsWith('.docx')) {
        throw new BadRequestException('Unsupported file format. Only DOCX is supported.');
      }

      const htmlContent = await this.exportService.importDocx(file.buffer);
      res.status(200).json({ html: htmlContent });
    } catch (error: any) {
      console.error('Import Document error:', error);
      res.status(error.status || 500).send(error.message || 'Internal Server Error');
    }
  }
}
