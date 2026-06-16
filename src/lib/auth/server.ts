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
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '#/lib/email/auth-emails';
import { assertEmailTransportConfigured } from '#/lib/email/transport';

import { createInviteStore } from './invite-store';

/**
 * `db` is injected rather than read from `getDb()` so integration tests can
 * bind the test container.
 */
export function createAuth(db: Database) {
  // Fail on boot if prod lacks a mail transport — Better Auth swallows the
  // per-send throw, so this is the only place a misconfig surfaces.
  assertEmailTransportConfigured();

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
    emailAndPassword: {
      enabled: true,
      // Kill existing sessions when a password is reset, so a reset prompted by a
      // compromise also evicts the attacker.
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ token, user: recipient }) => {
        // Email an app reset link, not Better Auth's `url`: that callback 400s
        // without a client-supplied `callbackURL`. The reset page reads `?token`
        // and calls authClient.resetPassword.
        const resetUrl = new URL('/reset-password', env.BETTER_AUTH_URL);
        resetUrl.searchParams.set('token', token);
        await sendPasswordResetEmail({
          name: recipient.name,
          to: recipient.email,
          url: resetUrl.href,
        });
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ url, user: recipient }) => {
        await sendVerificationEmail({
          name: recipient.name,
          to: recipient.email,
          url,
        });
      },
    },
    plugins: [
      admin(),
      // `enabled: hasUsers` keeps the gate open for the first signup only.
      inviteOnly({ enabled: hasUsers, inviteStore: createInviteStore(db) }),
      // Must be last — forwards other plugins' Set-Cookie headers on the response.
      tanstackStartCookies(),
    ],
    secret: env.BETTER_AUTH_SECRET,
    // cookieCache off: a revoked session (revokeSessionsOnPasswordReset) must
    // miss immediately; a warm signed cookie would linger until its maxAge.
  });
}

export const auth = createAuth(getDb());
