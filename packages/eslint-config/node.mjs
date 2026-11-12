import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

import { createBaseConfig, SOURCE_FILES, TYPESCRIPT_FILES } from './base.mjs';
import { createBoundaryConfig } from './boundaries.mjs';

/**
 * Creates the Node.js ESLint configuration.
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir
 * @param {boolean} [options.typeAware]
 * @param {'server' | 'library'} [options.workspaceType]
 */
export function createNodeConfig({ tsconfigRootDir, typeAware = true, workspaceType = 'server' }) {
  return [
    ...createBaseConfig({
      tsconfigRootDir,
      typeAware,
    }),

    {
      name: 'excel-dashboard/node',

      files: SOURCE_FILES,

      languageOptions: {
        globals: {
          ...globals.node,
        },
      },

      rules: {
        'no-console': 'error',

        'no-process-exit': 'error',

        'no-restricted-globals': [
          'error',
          {
            name: 'event',
            message: 'Do not rely on implicit global events.',
          },
        ],
      },
    },

    {
      name: 'excel-dashboard/node-typescript',

      files: TYPESCRIPT_FILES,

      rules: {
        '@typescript-eslint/no-require-imports': 'error',
      },
    },

    {
      name: 'excel-dashboard/node-scripts',

      files: ['**/*.config.{js,mjs,cjs,ts,mts,cts}', '**/scripts/**/*.{js,mjs,cjs,ts,mts,cts}'],

      rules: {
        'no-console': 'off',
        'no-process-exit': 'off',
      },
    },

    createBoundaryConfig({
      workspaceType,
    }),

    prettier,
  ];
}
