import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./.jest/set-environment.ts'],
  testRegex: '.*.test.ts',
  testTimeout: 10000,
};

export default config;
