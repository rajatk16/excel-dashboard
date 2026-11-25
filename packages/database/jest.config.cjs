/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',

  testEnvironment: 'node',

  testMatch: ['<rootDir>/test/**/*.spec.ts'],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },

  moduleFileExtensions: ['ts', 'js', 'json'],

  clearMocks: true,

  restoreMocks: true,

  collectCoverageFrom: ['src/**/*.ts', '!src/generated/**', '!src/**/*.types.ts', '!src/index.ts'],

  coverageDirectory: '<rootDir>/coverage',

  coverageReporters: ['text', 'lcov', 'json-summary'],
};
