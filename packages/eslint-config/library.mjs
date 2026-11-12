import prettier from 'eslint-config-prettier/flat';

import { createBaseConfig, SOURCE_FILES, TYPESCRIPT_FILES } from './base.mjs';
import { createBoundaryConfig } from './boundaries.mjs';

/**
 * Creates an ESLint configuration for shared
 * application-independent libraries.
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir
 * @param {boolean} [options.typeAware]
 * @param {boolean} [options.browserSafe]
 */
export function createLibraryConfig({ tsconfigRootDir, typeAware = true, browserSafe = true }) {
  return [
    ...createBaseConfig({
      tsconfigRootDir,
      typeAware,
    }),

    {
      name: 'excel-dashboard/library',

      files: SOURCE_FILES,

      rules: {
        'no-console': 'error',
        'no-process-exit': 'error',
      },
    },

    {
      name: 'excel-dashboard/library-typescript',

      files: TYPESCRIPT_FILES,

      rules: {
        '@typescript-eslint/no-require-imports': 'error',
      },
    },

    createBoundaryConfig({
      workspaceType: browserSafe ? 'browser-library' : 'library',
    }),

    prettier,
  ];
}
