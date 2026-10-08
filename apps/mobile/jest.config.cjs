module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts', '<rootDir>/__tests__/**/*.test.tsx'],
  watchman: false,
  cacheDirectory: '<rootDir>/.cache/jest',
};
