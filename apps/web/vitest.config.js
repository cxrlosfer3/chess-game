import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(viteConfig, defineConfig({
  root: import.meta.dirname,
  test: {
    name: 'web',
    environment: 'jsdom',
    include: ['tests/presentation/**/*.test.jsx'],
  },
}));
