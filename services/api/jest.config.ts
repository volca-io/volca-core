const config = {
  testEnvironment: 'node',
  testRegex: '.*.test.ts',
  testTimeout: 10000,
  silent: true,
  setupFilesAfterEnv: ['./src/test-utils/setup-env.ts'],
  globalSetup: './src/test-utils/global-setup.ts',
  globalTeardown: './src/test-utils/global-teardown.ts',
  transform: {
    '^.+\\.(ts|tsx)$': 'esbuild-jest',
  },
};

export default config;
