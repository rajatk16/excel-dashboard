import { createNodeConfig } from '@excel-dashboard/eslint-config/node';

export default [
  ...createNodeConfig({
    tsconfigRootDir: import.meta.dirname,
    typeAware: true,
    workspaceType: 'library',
  }),
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
];
