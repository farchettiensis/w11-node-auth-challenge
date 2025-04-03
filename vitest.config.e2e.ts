import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    fileParallelism: false,
    include: ['tests/e2e/**/*.test.ts'],
  },
});
