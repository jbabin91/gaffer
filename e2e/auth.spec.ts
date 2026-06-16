import { expect, test } from './fixtures';

test(
  'redirects an unauthenticated visitor from the gated app to login',
  { tag: ['@smoke'] },
  async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  },
);

test(
  'preserves the originally requested path as a login redirect param',
  { tag: ['@smoke'] },
  async ({ page }) => {
    await page.goto('/players/some-id');
    await expect(page).toHaveURL(/\/login\?redirect=/);
    expect(new URL(page.url()).searchParams.get('redirect')).toContain(
      '/players/some-id',
    );
  },
);

test(
  'lets an authenticated manager reach the gated app',
  { tag: ['@smoke'] },
  async ({ page, signUpFirstManager, squadPage }) => {
    await signUpFirstManager();
    await page.goto('/');
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    // URL alone would pass even if the gated page failed to render.
    await expect(squadPage.createButton).toBeVisible();
  },
);
