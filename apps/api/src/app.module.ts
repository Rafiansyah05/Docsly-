import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiAgentModule } from './ai/ai.module';
import { CitationModule } from './citation/citation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    AiAgentModule,
    CitationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
