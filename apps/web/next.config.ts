import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  // output: 'standalone' — Vercel deployment-д шаардлагагүй, Docker-д л хэрэглэнэ
  transpilePackages: [
    '@ocp/ui-components',
    '@ocp/shared-types',
    '@ocp/validation',
    '@ocp/api-client',
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

export default withNextIntl(config);
