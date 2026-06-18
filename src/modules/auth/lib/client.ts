import { inviteOnlyClient } from 'better-auth-invitation-only/client';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Handler mounts at /api/auth; baseURL defaults to the app origin.
export const authClient = createAuthClient({
  plugins: [adminClient(), inviteOnlyClient()],
});

type SignUpEmailBody = Parameters<typeof authClient.signUp.email>[0];

/**
 * Sign up with an optional invite code. The invite plugin reads inviteCode from the
 * body but doesn't type it, so the one cast lives here — keeping email/name/password
 * type-checked at call sites.
 */
export function signUpWithInvite(
  body: SignUpEmailBody & { inviteCode?: string },
) {
  return authClient.signUp.email(body as SignUpEmailBody);
}
