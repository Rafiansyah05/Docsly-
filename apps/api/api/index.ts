import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: express.Express;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(cachedApp)
    );
    nestApp.enableCors();
    nestApp.use(express.json({ limit: '50mb' }));
    nestApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
    await nestApp.init();
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
