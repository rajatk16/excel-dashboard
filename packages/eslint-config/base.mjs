import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export const JAVASCRIPT_FILES = ['**/*.{js,mjs,cjs,jsx}'];

export const TYPESCRIPT_FILES = ['**/*.{ts,tsx,mts,cts}'];

export const SOURCE_FILES = [...JAVASCRIPT_FILES, ...TYPESCRIPT_FILES];

export const globalIgnores = {
  name: 'excel-dashboard/global-ignores',

  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/coverage/**',
    '**/.turbo/**',
    '**/.cache/**',
    '**/.vite/**',
    '**/.firebase/**',
    '**/.local-data/**',
    '**/test-results/**',
    '**/playwright-report/**',
    '**/generated/**',
    '**/*.tsbuildinfo',
    '**/*.min.js',
    '**/dependency-graph.html',
  ],
};

/**
 * Restrict a collection of flat configurations
 * to a particular set of files.
 */
function scopeConfigs(configs, files) {
  const entries = Array.isArray(configs) ? configs : [configs];

  return entries.map((config) => ({
    ...config,
    files,
  }));
}

/**
 * Creates the common ESLint configuration.
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir
 * @param {boolean} [options.typeAware]
 */
export function createBaseConfig({ tsconfigRootDir, typeAware = true }) {
  if (!tsconfigRootDir) {
    throw new Error('createBaseConfig requires tsconfigRootDir.');
  }

  const typescriptConfigs = typeAware
    ? tseslint.configs.recommendedTypeChecked
    : tseslint.configs.recommended;

  return [
    globalIgnores,

    {
      ...js.configs.recommended,
      name: 'excel-dashboard/javascript-recommended',
      files: SOURCE_FILES,
    },

    ...scopeConfigs(typescriptConfigs, TYPESCRIPT_FILES),

    {
      name: 'excel-dashboard/common-rules',

      files: SOURCE_FILES,

      languageOptions: {
        ecmaVersion: 'latest',
      },

      linterOptions: {
        reportUnusedDisableDirectives: 'error',
        reportUnusedInlineConfigs: 'error',
      },

      plugins: {
        'simple-import-sort': simpleImportSort,
      },

      rules: {
        // Correctness
        'no-debugger': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-throw-literal': 'error',
        'no-param-reassign': 'error',
        'no-return-assign': ['error', 'always'],
        'no-useless-return': 'error',
        'no-useless-concat': 'error',
        'no-duplicate-imports': 'off',

        // Consistency
        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
        'object-shorthand': ['error', 'always'],
        'prefer-template': 'error',
        'prefer-object-spread': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-promise-reject-errors': 'error',

        // Imports
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Side-effect imports
              ['^\\u0000'],

              // Node.js built-ins
              ['^node:'],

              // External dependencies
              ['^@?\\w'],

              // Internal workspace packages
              ['^@excel-dashboard/'],

              // Application aliases
              ['^@/'],

              // Relative parent imports
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],

              // Relative sibling imports
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],

              // Style imports
              ['^.+\\.(?:css|scss|sass|less)$'],
            ],
          },
        ],

        'simple-import-sort/exports': 'error',
      },
    },

    {
      name: 'excel-dashboard/typescript-rules',

      files: TYPESCRIPT_FILES,

      languageOptions: {
        parser: tseslint.parser,

        parserOptions: {
          tsconfigRootDir,

          ...(typeAware
            ? {
                projectService: true,
              }
            : {}),
        },
      },

      rules: {
        // TypeScript handles these more accurately.
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-redeclare': 'off',
        'no-throw-literal': 'off',

        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],

        '@typescript-eslint/no-explicit-any': 'error',

        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'separate-type-imports',
          },
        ],

        '@typescript-eslint/consistent-type-exports': typeAware ? 'error' : 'off',

        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

        '@typescript-eslint/no-non-null-assertion': 'error',

        '@typescript-eslint/no-import-type-side-effects': 'error',

        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
            'ts-nocheck': true,
            'ts-check': false,
            minimumDescriptionLength: 10,
          },
        ],

        '@typescript-eslint/explicit-function-return-type': 'off',

        '@typescript-eslint/explicit-module-boundary-types': 'off',

        ...(typeAware
          ? {
              '@typescript-eslint/no-floating-promises': 'error',

              '@typescript-eslint/no-misused-promises': 'error',

              '@typescript-eslint/await-thenable': 'error',

              '@typescript-eslint/require-await': 'error',

              '@typescript-eslint/no-unnecessary-type-assertion': 'error',

              '@typescript-eslint/only-throw-error': 'error',

              '@typescript-eslint/switch-exhaustiveness-check': 'error',
            }
          : {}),
      },
    },

    {
      name: 'excel-dashboard/declaration-files',

      files: ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts'],

      rules: {
        '@typescript-eslint/consistent-type-definitions': 'off',
      },
    },

    prettier,
  ];
}
