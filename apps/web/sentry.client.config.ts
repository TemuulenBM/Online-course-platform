/**
 * Sentry client-side тохиргоо — browser дээр ажиллана.
 * Next.js instrumentation hook-оор автомат ачаалагдана.
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Client-side transaction sample rate
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay — хэрэглэгчийн session бичлэг (алдаа гарахад дахин харах)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0,

  environment: process.env.NODE_ENV || 'development',

  // SENTRY_DSN тохируулаагүй бол идэвхгүй
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
