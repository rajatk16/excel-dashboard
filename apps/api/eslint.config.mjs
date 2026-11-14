import { createNestConfig } from '@excel-dashboard/eslint-config/nestjs';

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
    typeAware: true,
  }),
  {
    files: ["test/**/*.ts","src/**/*.spec.ts"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    }
  }
];
