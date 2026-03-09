/**
 * Sentry server-side тохиргоо — Node.js runtime дээр ажиллана.
 * Next.js server components, API routes, middleware-д алдаа бүртгэнэ.
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  environment: process.env.NODE_ENV || 'development',

  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
