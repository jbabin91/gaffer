import '@tanstack/react-start/server-only';

import { inviteOnly } from 'better-auth-invitation-only';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
// `/minimal` drops Kysely; we use the drizzle adapter, so this trims the bundle.
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { eq } from 'drizzle-orm';

import { env } from '#/configs/env/server';
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
 * bind the test container. `initialAdminEmail` likewise defaults to the env value
 * but is overridable so tests can designate a bootstrap admin deterministically.
 */
export function createAuth(
  db: Database,
  options: { initialAdminEmail?: string } = {},
) {
  // Fail on boot if prod lacks a mail transport — Better Auth swallows the
  // per-send throw, so this is the only place a misconfig surfaces.
  assertEmailTransportConfigured();

  const designatedAdminEmail = (
    options.initialAdminEmail ?? env.INITIAL_ADMIN_EMAIL
  )
    ?.trim()
    .toLowerCase();

  const adminExists = async () => {
    // Gate the bootstrap on an admin existing (not on any user): the invite gate
    // stays open and admin can be claimed only until the first admin lands.
    // Existence probe (not count) keeps this O(1) on the signup hot path; a query
    // error propagates and fails closed rather than reading as no admin.
    const rows = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, 'admin'))
      .limit(1);
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
            if (await adminExists()) return;
            // Bootstrap window: only the env-designated email may register, and it
            // becomes admin. The unique email column is the single-winner guard —
            // concurrent signups with that email can't both insert, so there's no
            // admin-grant race. Everyone else gets the same invite-required
            // response as the closed gate, so a visitor can't probe bootstrap state.
            if (
              !designatedAdminEmail ||
              newUser.email.toLowerCase() !== designatedAdminEmail
            ) {
              throw new APIError('FORBIDDEN', { code: 'INVITE_REQUIRED' });
            }
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
      // `enabled: adminExists` keeps the gate open only until the first admin
      // bootstraps, then requires an invite for every subsequent signup.
      inviteOnly({ enabled: adminExists, inviteStore: createInviteStore(db) }),
      // Must be last — forwards other plugins' Set-Cookie headers on the response.
      tanstackStartCookies(),
    ],
    secret: env.BETTER_AUTH_SECRET,
    // cookieCache off: a revoked session (revokeSessionsOnPasswordReset) must
    // miss immediately; a warm signed cookie would linger until its maxAge.
  });
}

export const auth = createAuth(getDb());
