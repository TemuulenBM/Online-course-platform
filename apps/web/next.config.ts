import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: [
    '@ocp/ui-components',
    '@ocp/shared-types',
    '@ocp/validation',
    '@ocp/api-client',
  ],
};

export default config;
