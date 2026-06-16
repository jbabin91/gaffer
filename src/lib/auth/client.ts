import { inviteOnlyClient } from 'better-auth-invitation-only/client';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Same-origin: handler at /api/auth, so baseURL defaults to app origin.
export const authClient = createAuthClient({
  plugins: [adminClient(), inviteOnlyClient()],
});
