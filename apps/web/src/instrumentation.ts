/**
 * Next.js instrumentation hook — server/edge runtime эхлэхэд Sentry-г ачаалах.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Server-side алдааг Sentry-д бүртгэх
export const onRequestError = Sentry.captureRequestError;
