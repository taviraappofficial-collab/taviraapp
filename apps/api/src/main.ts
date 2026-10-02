import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin:
      configuredOrigins && configuredOrigins.length > 0
        ? configuredOrigins
        : ['http://localhost:8081'],
  });
  app.setGlobalPrefix('');
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
