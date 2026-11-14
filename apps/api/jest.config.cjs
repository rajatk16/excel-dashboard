/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',

  testEnvironment: 'node',

  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts',
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },

  moduleFileExtensions: [
    'ts',
    'js',
    'json',
  ],

  clearMocks: true,

  restoreMocks: true,

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.types.ts',
    '!src/main.ts',
  ],

  coverageDirectory: '<rootDir>/coverage',

  coverageReporters: [
    'text',
    'lcov',
    'json-summary',
  ],
  setupFiles: [
    '<rootDir>/test/setup-environment.cjs',
  ],
};
