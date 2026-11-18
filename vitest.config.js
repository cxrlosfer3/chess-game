import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'logic',
          environment: 'node',
          include: ['apps/*/tests/**/*.test.js', 'packages/*/tests/**/*.test.js'],
        },
      },
      'apps/web/vitest.config.js',
    ],
  },
});
