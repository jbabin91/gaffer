import { test as base } from '@playwright/test';

import { SquadPage } from './pages/squad.page';
import { resetE2eDb } from './support/db';

export { expect } from '@playwright/test';

export const FIRST_MANAGER = {
  email: 'manager@example.com',
  name: 'E2E Manager',
  password: 'e2e-password-1',
};

type Fixtures = {
  // auto: true — every test gets a clean database without opting in.
  resetDb: void;
  // Signs up the first user (no invite needed) so gated routes are reachable.
  // page.request shares the browser cookie jar, so the page is authenticated
  // without driving the sign-up form (which native-submits before hydration).
  signUpFirstManager: () => Promise<void>;
  squadPage: SquadPage;
};

export const test = base.extend<Fixtures>({
  resetDb: [
    async ({}, use) => {
      await resetE2eDb();
      await use();
    },
    { auto: true },
  ],
  signUpFirstManager: async ({ page }, use) => {
    await use(async () => {
      const res = await page.request.post('/api/auth/sign-up/email', {
        data: FIRST_MANAGER,
      });
      if (!res.ok()) {
        throw new Error(
          `e2e first-manager sign-up failed: ${res.status()} ${await res.text()}`,
        );
      }
    });
  },
  squadPage: async ({ page }, use) => {
    await use(new SquadPage(page));
  },
});
