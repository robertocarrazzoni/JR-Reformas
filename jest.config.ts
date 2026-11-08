import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts'],
  setupFiles: ['<rootDir>/tests/setup/env.ts'],
  // The specs share a single test database and truncate it between tests,
  // so they must not run in parallel.
  maxWorkers: 1,
  testTimeout: 20000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);
