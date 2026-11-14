const baseConfig = require('./jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,

  rootDir: '.',

  testMatch: [
    '<rootDir>/test/**/*.e2e-spec.ts',
  ],

  collectCoverage: false,

  testTimeout: 15000,
};
