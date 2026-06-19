import '@tanstack/react-start/server-only';

import type { ReactElement } from 'react';

import { render, toPlainText } from 'react-email';

import ChangeEmailConfirmation from './templates/change-email';
import ResetPasswordEmail from './templates/reset-password';
import VerifyEmail from './templates/verify-email';
import { sendEmail } from './transport';

type AuthEmail = { name?: string; to: string; url: string };

async function deliver(
  node: ReactElement,
  subject: string,
  to: string,
  url: string,
): Promise<void> {
  const html = await render(node);
  await sendEmail({ html, subject, text: toPlainText(html), to, url });
}

/**
 * The Better Auth callback awaits this so the send completes (and a failure is
 * logged) before the request resolves. Better Auth swallows callback rejections,
 * so a missing prod transport is caught up front by the startup check in
 * createAuth, not here.
 */
export function sendVerificationEmail({
  name,
  to,
  url,
}: AuthEmail): Promise<void> {
  return deliver(
    <VerifyEmail name={name} url={url} />,
    'Verify your email address',
    to,
    url,
  );
}

/** @see {@link sendVerificationEmail} — same delivery contract for resets. */
export function sendPasswordResetEmail({
  name,
  to,
  url,
}: AuthEmail): Promise<void> {
  return deliver(
    <ResetPasswordEmail name={name} url={url} />,
    'Reset your password',
    to,
    url,
  );
}

/**
 * Sent to the user's CURRENT address to authorize an email change.
 * @see {@link sendVerificationEmail} — same delivery contract.
 */
export function sendChangeEmailConfirmation({
  name,
  newEmail,
  to,
  url,
}: AuthEmail & { newEmail: string }): Promise<void> {
  return deliver(
    <ChangeEmailConfirmation name={name} newEmail={newEmail} url={url} />,
    'Confirm your new email address',
    to,
    url,
  );
}
