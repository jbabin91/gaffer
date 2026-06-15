// Server-only guardrail: the build rejects any client-side import of this
// module, keeping better-auth/drizzle/pg out of the client bundle.
import '@tanstack/react-start/server-only';

import { drizzleAdapter } from 'better-auth/adapters/drizzle';
// `/minimal` drops Kysely; we use the drizzle adapter, so this trims the bundle.
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import { env } from '#/configs/env';
import { getDb } from '#/db/client';
import { account, session, user, verification } from '#/db/schema';

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: { account, session, user, verification },
  }),
  emailAndPassword: { enabled: true },
  // Must be last — wraps other plugins' Set-Cookie forwarding in server fns.
  plugins: [admin(), tanstackStartCookies()],
  secret: env.BETTER_AUTH_SECRET,
  // Skips a getSession DB round-trip while the cookie is warm.
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
});
