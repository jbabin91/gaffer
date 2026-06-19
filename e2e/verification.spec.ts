import { expect, INVITEE, test } from './fixtures';
import { verifyEmailUrl } from './support/auth';

test('gates an unverified invitee, then unlocks once the email is verified', async ({
  page,
  signUpInvitee,
  squadPage,
}) => {
  await signUpInvitee();
  await squadPage.goto();

  const banner = page.getByRole('status');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText(INVITEE.email);

  // The gate is aria-disabled but keeps onPress live, so activating it toasts the
  // reason instead of opening the form. Drive it by keyboard: a pointer click
  // would fail Playwright's enabled check.
  await expect(squadPage.createButton).toHaveAttribute('aria-disabled', 'true');
  await squadPage.createButton.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByText('Verify your email to create your first career.'),
  ).toBeVisible();
  await expect(squadPage.careerNameField).toBeHidden();

  // Toast firing proves verified=1 survived Better Auth's verify → callbackURL
  // redirect. use-verified-toast.test.ts owns fires-exactly-once across rerenders;
  // toHaveCount(1) here catches a visible duplicate.
  await page.goto(verifyEmailUrl(INVITEE.email));
  const verifiedToast = page.getByText("Email verified — you're all set.");
  await expect(verifiedToast).toBeVisible();
  await expect(verifiedToast).toHaveCount(1);
  await expect(page).toHaveURL(/\/squad$/);

  await expect(banner).toBeHidden();
  await expect(squadPage.careerNameField).toBeVisible();
  await expect(squadPage.createButton).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('resends a verification link and enters the cooldown', async ({
  page,
  signUpInvitee,
  squadPage,
}) => {
  await signUpInvitee();
  await squadPage.goto();

  await page.getByRole('button', { name: 'Send a new link' }).click();

  // Toast naming the session email proves the server used the session (not a
  // client-supplied address). Button regex waits for cooldown, not pending state.
  await expect(
    page.getByText(`Verification link sent — check ${INVITEE.email}`),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Resend in \d+s/ }),
  ).toBeDisabled();
  // Resending must not clear the gate.
  await expect(page.getByRole('status')).toBeVisible();
});
