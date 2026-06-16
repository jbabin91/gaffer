import { expect, FIRST_MANAGER, test } from './fixtures';
import { latestResetToken } from './support/db';

const GATED_URL = /localhost:\d+\/$/;
const NEW_PASSWORD = 'e2e-password-2';

test('signs up, signs out, and signs back in through the forms', async ({
  authPage,
  context,
  page,
  squadPage,
}) => {
  await authPage.signUp(FIRST_MANAGER);
  await expect(page).toHaveURL(GATED_URL);
  await expect(squadPage.createButton).toBeVisible();

  // No logout UI yet (gf-kdr); dropping the cookie simulates signing out.
  await context.clearCookies();
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);

  await authPage.login(FIRST_MANAGER.email, FIRST_MANAGER.password);
  await expect(page).toHaveURL(GATED_URL);
  await expect(squadPage.createButton).toBeVisible();
});

test('resets the password through the forms and signs in with the new one', async ({
  authPage,
  page,
  squadPage,
}) => {
  await authPage.signUp(FIRST_MANAGER);
  await expect(page).toHaveURL(GATED_URL);

  await authPage.requestReset(FIRST_MANAGER.email);
  await expect(page.getByText('Check your email')).toBeVisible();

  await authPage.resetPassword(await latestResetToken(), NEW_PASSWORD);
  await expect(page).toHaveURL(/\/login/);

  // revokeSessionsOnPasswordReset evicts the pre-reset session; with cookieCache
  // off the gate sees that immediately and bounces the still-held cookie.
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);

  await authPage.login(FIRST_MANAGER.email, NEW_PASSWORD);
  await expect(page).toHaveURL(GATED_URL);
  await expect(squadPage.createButton).toBeVisible();
});

test('keeps the user on login and shows an error for a wrong password', async ({
  authPage,
  page,
  signUpFirstManager,
}) => {
  await signUpFirstManager();
  await authPage.login(FIRST_MANAGER.email, 'wrong-password-9');

  await expect(page.getByText('Invalid email or password.')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('shows an invalid-link card when the reset token is missing', async ({
  page,
}) => {
  await page.goto('/reset-password');
  await expect(page.getByText('Link not valid')).toBeVisible();
});
