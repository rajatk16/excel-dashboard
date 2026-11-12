import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import { createBaseConfig } from './base.mjs';
import { createBoundaryConfig } from './boundaries.mjs';

const REACT_FILES = ['**/*.{jsx,tsx}'];

const BROWSER_SOURCE_FILES = ['src/**/*.{js,mjs,jsx,ts,tsx,mts}'];

/**
 * Creates the React ESLint configuration.
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir
 * @param {boolean} [options.typeAware]
 * @param {boolean} [options.fastRefresh]
 * @param {'web' | 'browser-library'} [options.workspaceType]
 */
export function createReactConfig({
  tsconfigRootDir,
  typeAware = true,
  fastRefresh = true,
  workspaceType = 'web',
}) {
  return [
    ...createBaseConfig({
      tsconfigRootDir,
      typeAware,
    }),

    {
      name: 'excel-dashboard/react-browser',

      files: BROWSER_SOURCE_FILES,

      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },

      rules: {
        'no-console': 'error',
      },
    },

    {
      ...react.configs.flat.recommended,

      name: 'excel-dashboard/react-recommended',

      files: REACT_FILES,

      settings: {
        react: {
          version: 'detect',
        },
      },
    },

    {
      ...react.configs.flat['jsx-runtime'],

      name: 'excel-dashboard/react-jsx-runtime',

      files: REACT_FILES,
    },

    {
      ...jsxA11y.flatConfigs.recommended,

      name: 'excel-dashboard/react-accessibility',

      files: REACT_FILES,
    },

    {
      name: 'excel-dashboard/react-hooks',

      files: BROWSER_SOURCE_FILES,

      plugins: {
        'react-hooks': reactHooks,
      },

      rules: {
        ...reactHooks.configs.recommended.rules,

        'react-hooks/rules-of-hooks': 'error',

        'react-hooks/exhaustive-deps': 'error',
      },
    },

    {
      name: 'excel-dashboard/react-rules',

      files: REACT_FILES,

      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'react/prop-types': 'off',

        'react/jsx-key': 'error',

        'react/no-array-index-key': 'error',

        'react/no-children-prop': 'error',

        'react/no-danger': 'error',

        'react/no-unstable-nested-components': 'error',

        'react/self-closing-comp': 'error',

        'react/jsx-no-useless-fragment': 'error',

        'react/jsx-boolean-value': ['error', 'never'],

        'jsx-a11y/alt-text': 'error',

        'jsx-a11y/anchor-is-valid': 'error',

        'jsx-a11y/click-events-have-key-events': 'error',

        'jsx-a11y/no-static-element-interactions': 'error',
      },
    },

    {
      name: 'excel-dashboard/react-typescript',

      files: ['**/*.tsx'],

      rules: {
        ...(typeAware
          ? {
              '@typescript-eslint/no-misused-promises': [
                'error',
                {
                  checksVoidReturn: {
                    attributes: false,
                  },
                },
              ],
            }
          : {}),
      },
    },

    ...(fastRefresh
      ? [
          {
            name: 'excel-dashboard/react-fast-refresh',

            files: ['src/**/*.{jsx,tsx}'],

            plugins: {
              'react-refresh': reactRefresh,
            },

            rules: {
              'react-refresh/only-export-components': [
                'error',
                {
                  allowConstantExport: true,
                },
              ],
            },
          },
        ]
      : []),

    {
      name: 'excel-dashboard/react-tooling',

      files: ['**/*.config.{js,mjs,cjs,ts,mts,cts}', '**/scripts/**/*.{js,mjs,cjs,ts,mts,cts}'],

      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },

    {
      ...createBoundaryConfig({
        workspaceType,
      }),

      // Browser restrictions apply to application
      // source, not Node-based Vite configuration.
      files: BROWSER_SOURCE_FILES,
    },

    prettier,
  ];
}
