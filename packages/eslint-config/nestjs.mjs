import { baseConfig } from './base.mjs';

/** @type {import("eslint").Linter.Config[]} */
export const nestjsConfig = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];

export default nestjsConfig;
