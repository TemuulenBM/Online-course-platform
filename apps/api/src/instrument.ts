/**
 * Sentry инициализаци — NestJS app эхлэхээс ӨМНӨ ачаалагдах ёстой.
 * main.ts-ийн хамгийн эхэнд import хийгдэнэ.
 */
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Production-д 10% transaction sample, development-д 100%
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Profiling — гүйцэтгэлийн bottleneck олоход тусална
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  integrations: [nodeProfilingIntegration()],

  environment: process.env.NODE_ENV || 'development',

  // Health check, metrics зэрэг дуу чимээгүй endpoint-үүдийг алгасах
  ignoreTransactions: ['/api/v1', '/api/v1/health'],

  // SENTRY_DSN тохируулаагүй бол идэвхгүй
  enabled: !!process.env.SENTRY_DSN,
});
