const baseConfig = require('../../../packages/database/jest.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,

  rootDir: '..',

  testMatch: [
    '<rootDir>/test/**/*integration-spec.ts',
  ],

  collectCoverage: false,

  testTimeout: 120000,

  maxWorkers: 1,
};
