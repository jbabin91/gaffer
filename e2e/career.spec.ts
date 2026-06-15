import { expect, test } from './fixtures';
import { countCareers } from './support/db';

const CAREER_NAME = 'E2E Rebuild';

test(
  'creates a career and persists it across a reload',
  { tag: ['@smoke'] },
  async ({ page, squadPage }) => {
    await squadPage.goto();
    await squadPage.createCareer(CAREER_NAME);

    await expect(squadPage.heading(CAREER_NAME)).toBeVisible();
    await expect(squadPage.createButton).toBeHidden();

    // The row is in the e2e database, proving the app wrote there (not the dev
    // database) and that the server function reached Postgres.
    expect(await countCareers()).toBe(1);

    // Surviving a reload proves persistence rather than client/query state.
    await page.reload();
    await expect(squadPage.heading(CAREER_NAME)).toBeVisible();
  },
);
