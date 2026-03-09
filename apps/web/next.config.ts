import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@ocp/ui-components',
    '@ocp/shared-types',
    '@ocp/validation',
    '@ocp/api-client',
    'agora-rtc-react',
  ],
  images: {
    remotePatterns: [
      // Unsplash — seed болон курсын зурагт ашиглагдана
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // API сервер дээрх локал зурагт ашиглагдана
      { protocol: 'http', hostname: 'localhost' },
      // Cloudflare R2 public URL — production файл хадгалалт
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflarestorage.com' },
    ],
  },
};

// Sentry wrapper — source map upload, error tracking
// NEXT_PUBLIC_SENTRY_DSN тохируулаагүй бол source map upload хийхгүй
export default withSentryConfig(withNextIntl(config), {
  // Source map-г Sentry-д upload хийхгүй (CI/CD-д тусад нь тохируулна)
  sourcemaps: {
    disable: true,
  },
  // Telemetry унтраах
  telemetry: false,
  // Build log чимээгүй байлгах
  silent: true,
});
