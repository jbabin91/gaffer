import { createHmac } from 'node:crypto';

import { E2E_AUTH_SECRET, E2E_BASE_URL } from './env';

const base64url = (input: Buffer | string) =>
  (typeof input === 'string' ? Buffer.from(input) : input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

/**
 * Mints the email-verification token Better Auth would email. Unlike the reset
 * token it's never persisted, so the harness must reproduce
 * `createEmailVerificationToken` rather than read it from the DB.
 */
function mintEmailVerificationToken(email: string): string {
  // Empty email produces a structurally-valid but unresolvable token; fail early.
  if (!email) throw new Error('mintEmailVerificationToken: email is required');
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256' }));
  // exp mirrors Better Auth's default emailVerification.expiresIn (3600s); keep
  // in sync if the app ever overrides it.
  const payload = base64url(
    JSON.stringify({
      email: email.toLowerCase(),
      exp: issuedAt + 3600,
      iat: issuedAt,
    }),
  );
  const signature = base64url(
    createHmac('sha256', E2E_AUTH_SECRET)
      .update(`${header}.${payload}`)
      .digest(),
  );
  return `${header}.${payload}.${signature}`;
}

/**
 * The exact verify-email URL the app emails on signup/resend: the real
 * `/api/auth/verify-email` GET with a valid token and the post-verify redirect
 * to `/squad?verified=1`. Navigating it exercises Better Auth's verify →
 * callbackURL redirect end-to-end.
 */
export function verifyEmailUrl(email: string): string {
  const url = new URL('/api/auth/verify-email', E2E_BASE_URL);
  url.searchParams.set('token', mintEmailVerificationToken(email));
  url.searchParams.set('callbackURL', '/squad?verified=1');
  return url.href;
}
