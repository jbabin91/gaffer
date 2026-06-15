import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

const src = fileURLToPath(new URL('src', import.meta.url));
const testDir = fileURLToPath(new URL('test', import.meta.url));
const e2eDir = fileURLToPath(new URL('e2e', import.meta.url));

// Standalone config: unit tests don't need the TanStack Start Vite plugin, and
// keeping it out avoids SSR/route-tree transforms during tests.
export default defineConfig({
  // Mirror package.json `imports` / tsconfig `paths`. Match is segment-aware,
  // so `#` resolves only `#/…` and never swallows `#test/…` or `#e2e/…`.
  resolve: { alias: { '#': src, '#e2e': e2eDir, '#test': testDir } },
  test: {
    environment: 'node',
    globals: true,
    // Split by speed: `unit` is pure (no db); `integration` runs against one
    // shared Postgres container (test/global-setup), resetting data between
    // tests. Both inherit the root resolve/env; hook tests opt into jsdom with a
    // `// @vitest-environment jsdom` docblock.
    projects: [
      {
        extends: true,
        test: {
          exclude: [...configDefaults.exclude, '**/*.integration.{ts,tsx}'],
          include: ['**/*.test.{ts,tsx}'],
          name: 'unit',
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
        },
      },
    ],
  },
});
