import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['apps/*/tests/**/*.test.js', 'packages/*/tests/**/*.test.js'],
  },
});
