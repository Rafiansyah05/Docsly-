import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CitationService } from './citation.service';

@Controller('api/citation')
export class CitationController {
  constructor(private readonly citationService: CitationService) {}

  @Post('extract-file')
  @UseInterceptors(FileInterceptor('file'))
  async extractFromFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.citationService.extractFromFile(file);
  }

  @Post('extract-url')
  async extractFromUrl(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }
    return this.citationService.extractFromUrl(url);
  }
}
