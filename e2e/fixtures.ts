import { test as base } from '@playwright/test';

import { SquadPage } from './pages/squad.page';
import { resetE2eDb } from './support/db';

export { expect } from '@playwright/test';

type Fixtures = {
  // auto: true — every test gets a clean database without opting in.
  resetDb: void;
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
  squadPage: async ({ page }, use) => {
    await use(new SquadPage(page));
  },
});
