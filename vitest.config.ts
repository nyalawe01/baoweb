import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@bao/shared/storage': path.resolve(__dirname, 'packages/shared/src/storage.ts'),
      '@bao/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
    },
  },
});
