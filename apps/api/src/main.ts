import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Catch хийгдээгүй async алдаанаас серверийг хамгаалах
process.on('unhandledRejection', (reason: unknown) => {
  const logger = new Logger('UnhandledRejection');
  logger.error(
    'Catch хийгдээгүй Promise rejection',
    reason instanceof Error ? reason.stack : String(reason),
  );
});

process.on('uncaughtException', (error: Error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Catch хийгдээгүй exception', error.stack);
  process.exit(1);
});

// Production болон бүх орчинд шаардлагатай env variable-уудыг эхлэлд шалгах
function validateRequiredEnvVars(): void {
  const required = [
    'DATABASE_URL',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_HOST',
  ];

  // Production орчинд нэмэлт шалгалтууд
  if (process.env.NODE_ENV === 'production') {
    // Redis нууц үг заавал — auth-гүй Redis нь нийтийн сүлжээнд аюултай
    required.push('REDIS_PASSWORD');
    // APP_URL заавал — CORS зөв ажиллахын тулд origin тодорхой байх ёстой
    required.push('APP_URL');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Шаардлагатай env variable-ууд дутуу байна: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  validateRequiredEnvVars();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Аюулгүй байдлын middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  // CORS тохиргоо — таслалаар тусгаарлагдсан олон origin дэмжинэ
  // Жишээ: APP_URL=https://myapp.vercel.app,http://localhost:3000
  const rawOrigins = configService.get<string>('app.url', '');
  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Upload хийсэн файлуудыг статик хандалтаар үзүүлэх
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes, filters, interceptors
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);
  logger.log(`Аппликейшн ажиллаж байна: http://localhost:${port}`);
}
bootstrap();
