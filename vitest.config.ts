import { configDefaults, defineConfig } from 'vitest/config';

// Standalone config: unit tests don't need the TanStack Start Vite plugin, and
// keeping it out avoids SSR/route-tree transforms during tests.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          environment: 'jsdom',
          exclude: [...configDefaults.exclude, '**/*.integration.{ts,tsx}'],
          include: ['**/*.test.{ts,tsx}'],
          name: 'unit',
          setupFiles: ['./test/setup-dom.ts'],
        },
      },
      {
        extends: true,
        test: {
          // One container, shared schema: run sequentially and reset data per
          // test rather than racing parallel workers on the same database.
          fileParallelism: false,
          globalSetup: ['./test/global-setup.ts'],
          include: ['**/*.integration.{ts,tsx}'],
          name: 'integration',
          // Some integration tests import the auth instance, which validates env
          // at import; seed valid placeholders before modules load.
          setupFiles: ['./test/setup-env.ts'],
        },
      },
    ],
  },
});
