import type { NextConfig } from 'next';

const config: NextConfig = {
  // Docker standalone build-д шаардлагатай — хамгийн бага хэмжээний output үүсгэнэ
  output: 'standalone',
  transpilePackages: [
    '@ocp/ui-components',
    '@ocp/shared-types',
    '@ocp/validation',
    '@ocp/api-client',
  ],
};

export default config;
