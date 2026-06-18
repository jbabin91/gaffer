import { expect, test } from './fixtures';

test(
  'shows the public landing to an unauthenticated visitor at the root',
  { tag: ['@smoke'] },
  async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Create account' }),
    ).toBeVisible();
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
  'sends an authenticated visitor from the landing into the gated app',
  { tag: ['@smoke'] },
  async ({ page, signUpFirstManager, squadPage }) => {
    await signUpFirstManager();
    await page.goto('/');
    await expect(page).toHaveURL(/\/squad$/);
    // URL alone would pass even if the gated page failed to render.
    await expect(squadPage.createButton).toBeVisible();
  },
);
