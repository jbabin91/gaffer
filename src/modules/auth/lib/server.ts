import '@tanstack/react-start/server-only';

import { inviteOnly } from 'better-auth-invitation-only';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from 'better-auth/api';
// `/minimal` drops Kysely; we use the drizzle adapter, so this trims the bundle.
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { eq } from 'drizzle-orm';

import { env } from '#/configs/env/server';
import { type Database, getDb } from '#/db/client';
import {
  account,
  ADMIN_ROLE,
  invitation,
  session,
  user,
  verification,
} from '#/db/schema';
import {
  sendChangeEmailConfirmation,
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
  options: {
    initialAdminEmail?: string;
    // Force-enable rate limiting in tests; prod relies on Better Auth's default
    // (on in production, off in dev/test).
    rateLimit?: { enabled?: boolean };
  } = {},
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
    // Existence probe (not count) keeps this O(1) on the signup hot path; a
    // query error propagates and fails closed rather than reading as no admin.
    const rows = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, ADMIN_ROLE))
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
            // Bootstrap window: only the env-designated email may register and
            // become admin. Unique email column prevents an admin-grant race.
            // Non-designated addresses get the same INVITE_REQUIRED response so
            // a visitor can't probe whether bootstrap is open.
            if (
              !designatedAdminEmail ||
              newUser.email.toLowerCase() !== designatedAdminEmail
            ) {
              throw new APIError('FORBIDDEN', { code: 'INVITE_REQUIRED' });
            }
            // Auto-verify the bootstrap admin: they own the env, and the
            // verification gate must not lock out the person setting it up.
            return {
              data: { ...newUser, emailVerified: true, role: ADMIN_ROLE },
            };
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
        // Use a custom URL rather than Better Auth's `url`: that callback 400s
        // without a client-supplied callbackURL. The reset page reads ?token
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
      sendVerificationEmail: async ({ token, user: recipient }) => {
        // Use a custom URL rather than Better Auth's `url`: the default
        // callbackURL is '/' on signup. Both signup and resend point to
        // /squad?verified=1 so the layout fires the toast; the JWT signs only
        // the email, not the callback, so the param is safe to set here.
        const verifyUrl = new URL(
          '/api/auth/verify-email',
          env.BETTER_AUTH_URL,
        );
        verifyUrl.searchParams.set('token', token);
        verifyUrl.searchParams.set('callbackURL', '/squad?verified=1');
        await sendVerificationEmail({
          name: recipient.name,
          to: recipient.email,
          url: verifyUrl.href,
        });
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // /send-verification-email accepts an arbitrary email, so without this
        // hook a caller could request links for any account (inbox bombing).
        // Require a session and overwrite the email with the session user's own,
        // ignoring the client-supplied value. sendOnSignUp routes through the
        // sendVerificationEmail callback, not this endpoint, so signup is unaffected.
        if (ctx.path === '/send-verification-email') {
          // getSessionFromCtx returns null for both missing and failed lookups.
          const session = await getSessionFromCtx(ctx);
          if (!session) {
            throw new APIError('UNAUTHORIZED', { code: 'SESSION_REQUIRED' });
          }
          return {
            context: { body: { ...ctx.body, email: session.user.email } },
          };
        }
        // Only verified accounts may change email (confirmed via the old
        // address). An unverified, invite-bound user changing to an arbitrary
        // address would escape the email-bound invite, so reject them.
        if (ctx.path === '/change-email') {
          const session = await getSessionFromCtx(ctx);
          if (!session) {
            throw new APIError('UNAUTHORIZED', { code: 'SESSION_REQUIRED' });
          }
          if (!session.user.emailVerified) {
            throw new APIError('FORBIDDEN', { code: 'EMAIL_NOT_VERIFIED' });
          }
        }
      }),
    },
    plugins: [
      admin(),
      // `enabled: adminExists` keeps the gate open only until the first admin
      // bootstraps, then requires an invite for every subsequent signup.
      inviteOnly({ enabled: adminExists, inviteStore: createInviteStore(db) }),
      // Must be last — forwards other plugins' Set-Cookie headers on the response.
      tanstackStartCookies(),
    ],
    // Secondary cap behind the session-binding hook: the global default (100/60s)
    // is far too loose; rate-limiting is prod-only by default in Better Auth.
    rateLimit: {
      customRules: { '/send-verification-email': { max: 2, window: 60 } },
      ...options.rateLimit,
    },
    secret: env.BETTER_AUTH_SECRET,
    user: {
      changeEmail: {
        enabled: true,
        // No updateEmailWithoutVerification: the change is confirmed via a link
        // to the CURRENT (old) address before it takes effect, so a hijacked
        // session can't silently move the account to an attacker's inbox.
        sendChangeEmailConfirmation: async ({
          newEmail,
          token,
          user: recipient,
        }) => {
          const confirmUrl = new URL(
            '/api/auth/verify-email',
            env.BETTER_AUTH_URL,
          );
          confirmUrl.searchParams.set('token', token);
          confirmUrl.searchParams.set('callbackURL', '/account');
          await sendChangeEmailConfirmation({
            name: recipient.name,
            newEmail,
            to: recipient.email,
            url: confirmUrl.href,
          });
        },
      },
    },
    // cookieCache off: a revoked session (revokeSessionsOnPasswordReset) must
    // miss immediately; a warm signed cookie would linger until its maxAge.
  });
}

export const auth = createAuth(getDb());
