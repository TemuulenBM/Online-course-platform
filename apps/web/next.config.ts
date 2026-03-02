import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  // Docker standalone build-д шаардлагатай — хамгийн бага хэмжээний output үүсгэнэ
  output: 'standalone',
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
    ],
  },
};

export default withNextIntl(config);
