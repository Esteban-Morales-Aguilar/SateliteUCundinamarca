import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { metricsMiddleware } from './common/metrics';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'metrics'] });
  (app as any).set('trust proxy', 1);
  // CORP cross-origin: el <video>/<img> del frontend se sirven desde otro origen en desarrollo
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use((req: any, res: any, next: any) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });
  app.use(metricsMiddleware);
  app.enableCors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false, exposedHeaders: ['Content-Range', 'Accept-Ranges'] });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app,
    new DocumentBuilder().setTitle('SpaceNet Lab - Media API').setVersion('1.0').addBearerAuth().build()));
  const port = Number(process.env.PORT ?? 3005);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`media-service escuchando en :${port}`);
}
void bootstrap();
