import { test as base } from '@playwright/test';

import { AuthPage } from './pages/auth.page';
import { SquadPage } from './pages/squad.page';
import { resetE2eDb } from './support/db';

export { expect } from '@playwright/test';

export const FIRST_MANAGER = {
  email: 'manager@example.com',
  name: 'E2E Manager',
  password: 'e2e-password-1',
};

type Fixtures = {
  authPage: AuthPage;
  resetDb: void;
  // Authenticates via page.request (shared cookie jar), not the sign-up form
  // that native-submits before hydration. The first user needs no invite.
  signUpFirstManager: () => Promise<void>;
  squadPage: SquadPage;
};

export const test = base.extend<Fixtures>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
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
