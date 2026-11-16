import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { metricsMiddleware } from './common/metrics';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'metrics'] });
  (app as any).set('trust proxy', 1);
  app.use(helmet());
  app.use(metricsMiddleware);
  app.enableCors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app,
    new DocumentBuilder().setTitle('SpaceNet Lab - Content API').setVersion('1.0').addBearerAuth().build()));
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`content-service escuchando en :${port}`);
}
void bootstrap();
