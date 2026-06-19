import { test as base } from '@playwright/test';

import { AuthPage } from './pages/auth.page';
import { SquadPage } from './pages/squad.page';
import { insertInvitation, resetE2eDb } from './support/db';
import { E2E_ADMIN_EMAIL, E2E_BASE_URL } from './support/env';

export { expect } from '@playwright/test';

export const FIRST_MANAGER = {
  email: E2E_ADMIN_EMAIL,
  name: 'E2E Manager',
  password: 'e2e-password-1',
};

const INVITE_CODE = 'E2EINVITE';

export const INVITEE = {
  email: 'invitee@example.com',
  name: 'E2E Invitee',
  password: 'e2e-password-3',
};

type Fixtures = {
  authPage: AuthPage;
  resetDb: void;
  // Authenticates via page.request (shared cookie jar), not the sign-up form
  // that native-submits before hydration. The first user needs no invite.
  signUpFirstManager: () => Promise<void>;
  // Signs up an invited user: signed-in but unverified — the feature-gated
  // state the auto-verified admin never reaches.
  signUpInvitee: () => Promise<void>;
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
  signUpInvitee: async ({ page, signUpFirstManager }, use) => {
    await use(async () => {
      await signUpFirstManager();
      await insertInvitation(INVITEE.email, INVITE_CODE);
      // The admin cookie carried here trips Better Auth's origin check —
      // send the Origin a browser form would to pass it.
      const res = await page.request.post('/api/auth/sign-up/email', {
        data: { ...INVITEE, inviteCode: INVITE_CODE },
        headers: { origin: E2E_BASE_URL },
      });
      if (!res.ok()) {
        throw new Error(
          `e2e invitee sign-up failed: ${res.status()} ${await res.text()}`,
        );
      }
    });
  },
  squadPage: async ({ page }, use) => {
    await use(new SquadPage(page));
  },
});
