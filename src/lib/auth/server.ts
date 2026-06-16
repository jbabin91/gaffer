import '@tanstack/react-start/server-only';

import { inviteOnly } from 'better-auth-invitation-only';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
// `/minimal` drops Kysely; we use the drizzle adapter, so this trims the bundle.
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import { env } from '#/configs/env';
import { type Database, getDb } from '#/db/client';
import { account, invitation, session, user, verification } from '#/db/schema';

import { createInviteStore } from './invite-store';

/**
 * Builds the Better Auth instance against `db`. The db is injected (rather than
 * read from `getDb()` inside) so integration tests can bind the test container.
 */
export function createAuth(db: Database) {
  const hasUsers = async () => {
    // Existence probe (not count) keeps this O(1) on the signup hot path; a query
    // error propagates and fails the gate closed rather than reading as no users.
    const rows = await db.select({ id: user.id }).from(user).limit(1);
    return rows.length > 0;
  };

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { account, invitation, session, user, verification },
    }),
    databaseHooks: {
      user: {
        create: {
          before: async (newUser) => {
            // First signup bootstraps the admin; the gate is off only while
            // there are zero users, so the role can't be claimed once anyone
            // exists. The zero-user read isn't serialized with the insert, so
            // concurrent first signups can race — accepted for the
            // single-operator bootstrap (see gf-fwi.2.7).
            if (await hasUsers()) return;
            return { data: { ...newUser, role: 'admin' } };
          },
        },
      },
    },
    emailAndPassword: { enabled: true },
    plugins: [
      admin(),
      // `enabled: hasUsers` keeps the gate open for the first signup only.
      inviteOnly({ enabled: hasUsers, inviteStore: createInviteStore(db) }),
      // Must be last — forwards other plugins' Set-Cookie headers on the response.
      tanstackStartCookies(),
    ],
    secret: env.BETTER_AUTH_SECRET,
    // Skips a getSession DB round-trip while the cookie is warm.
    session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
  });
}

export const auth = createAuth(getDb());
