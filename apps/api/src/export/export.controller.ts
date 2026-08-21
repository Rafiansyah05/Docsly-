import { Controller, Post, Body, Res, Req, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { ExportService } from './export.service';

@Controller('api/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  async processDocx(
    @Req() req: Request, 
    @UploadedFile() file: Express.Multer.File, 
    @Body() body: any, 
    @Res() res: Response
  ) {
    try {
      if (!file) throw new BadRequestException('File is required');
      if (!file.originalname.toLowerCase().endsWith('.docx')) {
        throw new BadRequestException('Unsupported file format. Only DOCX is supported.');
      }

      // Parse JSON configuration from multipart form data
      let config = { pageNumbering: null, bibliography: null };
      if (body.config) {
        try {
          config = JSON.parse(body.config);
        } catch (e) {
          throw new BadRequestException('Invalid configuration format');
        }
      }

      const docxBuffer = await this.exportService.processDocx(file.buffer, config);
      
      // Determine feature type for analytics
      let featureType = null;
      if (config.bibliography && config.pageNumbering) {
        featureType = 'bibliography_page_numbering';
      } else if (config.bibliography) {
        featureType = 'bibliography';
      } else if (config.pageNumbering) {
        featureType = 'page_numbering';
      }

      // Record usage asynchronously if feature used
      if (featureType) {
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (supabaseUrl && supabaseKey) {
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);
            // Fire and forget
            supabase.rpc('increment_usage', { feature_name: featureType }).then();
          }
        } catch (e) {
          console.error('Failed to record usage analytics:', e);
        }
      }

      const safeTitle = (file.originalname || 'Dokumen').replace(/\.docx$/i, '_processed.docx');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Length', docxBuffer.length);
      res.status(200).send(docxBuffer);
    } catch (error: any) {
      console.error('Process DOCX error:', error);
      res.status(error.status || 500).send(error.message || 'Internal Server Error');
    }
  }
}
