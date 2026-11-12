import prettier from 'eslint-config-prettier/flat';

import { createNodeConfig } from './node.mjs';

/**
 * Creates the NestJS ESLint configuration.
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir
 * @param {boolean} [options.typeAware]
 */
export function createNestConfig({ tsconfigRootDir, typeAware = true }) {
  return [
    ...createNodeConfig({
      tsconfigRootDir,
      typeAware,
      workspaceType: 'server',
    }),

    {
      name: 'excel-dashboard/nestjs',

      files: ['**/*.{ts,mts,cts}'],

      rules: {
        // NestJS frequently uses constructor
        // parameter properties for DI.
        '@typescript-eslint/parameter-properties': 'off',

        // Legacy decorators and emitted metadata
        // can require runtime imports.
        '@typescript-eslint/consistent-type-imports': 'off',
      },
    },

    {
      name: 'excel-dashboard/nestjs-dtos',

      files: ['**/*.dto.ts', '**/dto/**/*.ts'],

      rules: {
        // DTOs are runtime classes, not interfaces.
        '@typescript-eslint/consistent-type-definitions': 'off',
      },
    },

    {
      name: 'excel-dashboard/nestjs-bootstrap',

      files: ['**/main.ts'],

      rules: {
        'no-process-exit': 'off',
      },
    },

    prettier,
  ];
}
