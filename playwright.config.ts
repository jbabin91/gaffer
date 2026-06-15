import { defineConfig, devices } from '@playwright/test';

import { E2E_BASE_URL, E2E_DATABASE_URL, E2E_PORT } from './e2e/support/env';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // `open: never` keeps the html report from launching a server that blocks CI.
  reporter: [['list'], ['html', { open: 'never' }]],
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e',
  use: { baseURL: E2E_BASE_URL, trace: 'on-first-retry' },
  // Always start our own server so webServer.env's DATABASE_URL is applied —
  // reusing a stray server could silently point the app at the dev database.
  webServer: {
    command: 'pnpm dev',
    env: { DATABASE_URL: E2E_DATABASE_URL, PORT: String(E2E_PORT) },
    reuseExistingServer: false,
    timeout: 120_000,
    url: E2E_BASE_URL,
  },
  // One shared database reset between tests: run serially so workers can't
  // truncate each other's rows (matches the integration suite's choice).
  workers: 1,
});
