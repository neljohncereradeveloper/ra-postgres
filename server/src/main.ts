import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from '@infrastructure/logger/winston.logger';
import { DomainExceptionFilter } from '@infrastructure/filters/domain-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: WinstonModule.createLogger(winstonConfig), // Use Winston logger
  });

  // Enable trust proxy
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Apply the DomainExceptionFilter globally
  app.useGlobalFilters(new DomainExceptionFilter());

  // Apply ValidationPipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that are not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error for undefined properties
      transform: true, // Automatically transform payloads to match DTO types
    }),
  );

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const CORS_ORIGINS = configService.get<string>('CORS_ORIGINS');

  // parse CORS origins to an array
  const originArray = CORS_ORIGINS.split(',').map((origin) => origin.trim());

  // enable CORS with the specified origins and credentials support
  app.enableCors({
    origin: originArray,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  // set a global prefix for all routes
  app.setGlobalPrefix('api');

  // start listening for incoming requests
  await app.listen(PORT, '0.0.0.0');

  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
