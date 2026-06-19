'use client';

import { authClient } from '#/modules/auth/lib/client';

/**
 * Verification state for the signed-in user, read from the live session. Drives
 * the verification banner and the feature gates; `verified` is false while the
 * session is still loading so gated actions stay closed until confirmed open.
 */
export function useEmailVerified() {
  const { data: session } = authClient.useSession();
  return {
    email: session?.user.email,
    isSignedIn: Boolean(session?.user),
    verified: session?.user.emailVerified ?? false,
  };
}
