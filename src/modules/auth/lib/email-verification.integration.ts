import { hashInviteCode } from 'better-auth-invitation-only';
import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { invitation, user } from '#/db/schema';
import { sendEmail } from '#/lib/email/transport';
import { createAuth } from '#/modules/auth/lib/server';
import { getTestDb, resetDb } from '#test/db';

vi.mock('#/lib/email/transport', () => ({
  assertEmailTransportConfigured: vi.fn(),
  sendEmail: vi.fn(),
}));

const ORIGIN = 'http://localhost:3000';

let db: DB;

beforeEach(async () => {
  vi.clearAllMocks();
  await resetDb();
  db = getTestDb();
});

function post(
  auth: ReturnType<typeof createAuth>,
  path: string,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {},
) {
  return auth.handler(
    new Request(`${ORIGIN}${path}`, {
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        origin: ORIGIN,
        'x-forwarded-for': '203.0.113.9',
        ...extraHeaders,
      },
      method: 'POST',
    }),
  );
}

/** Signs up an invited (unverified) user; returns their handler + session cookie. */
async function signUpInvitee(options: Parameters<typeof createAuth>[1] = {}) {
  const auth = createAuth(db, options);
  // The invite gate only activates once an admin exists.
  await db
    .insert(user)
    .values({
      email: 'admin@example.com',
      emailVerified: true,
      id: 'admin',
      name: 'admin',
      role: 'admin',
    });
  await db
    .insert(invitation)
    .values({
      codeHash: hashInviteCode('GOODCODE'),
      email: 'invitee@example.com',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      id: 'inv1',
      invitedBy: 'admin',
    });
  const res = await post(auth, '/api/auth/sign-up/email', {
    email: 'invitee@example.com',
    inviteCode: 'GOODCODE',
    name: 'Invitee',
    password: 'password123',
  });
  const cookie = res.headers.get('set-cookie');
  if (res.status !== 200 || !cookie) {
    throw new Error(`invitee signup failed: ${res.status}`);
  }
  return { auth, cookie };
}

describe('bootstrap admin auto-verification', () => {
  it('marks the first admin emailVerified so feature gating never locks out setup', async () => {
    const auth = createAuth(db, { initialAdminEmail: 'admin@example.com' });

    const res = await post(auth, '/api/auth/sign-up/email', {
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123',
    });
    expect(res.status).toBe(200);

    const [row] = await db
      .select()
      .from(user)
      .where(eq(user.email, 'admin@example.com'));
    expect(row?.emailVerified).toBe(true);
  });
});

describe('session-bound verification resend', () => {
  it('ignores the client email param and sends to the session user', async () => {
    const { auth, cookie } = await signUpInvitee();
    // Clear the signup auto-send so only the resend is asserted.
    vi.mocked(sendEmail).mockClear();

    const res = await post(
      auth,
      '/api/auth/send-verification-email',
      { email: 'victim@example.com' },
      { cookie },
    );

    expect(res.status).not.toBe(401);
    expect(sendEmail).toHaveBeenCalledOnce();
    const sent = vi.mocked(sendEmail).mock.calls[0]?.[0];
    expect(sent).toMatchObject({ to: 'invitee@example.com' });
    expect(new URL(sent?.url ?? '').searchParams.get('callbackURL')).toBe(
      '/squad?verified=1',
    );
  });

  it('rejects an unauthenticated resend, sending nothing', async () => {
    const auth = createAuth(db, { initialAdminEmail: 'admin@example.com' });

    const res = await post(auth, '/api/auth/send-verification-email', {
      email: 'victim@example.com',
    });

    expect(res.status).toBe(401);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('caps /send-verification-email at the custom rule (max 2/60s)', async () => {
    // A wrong customRules path silently falls back to 100/60s; the third
    // request 429ing proves the custom path is matched.
    const { auth, cookie } = await signUpInvitee({
      rateLimit: { enabled: true },
    });
    const send = () =>
      post(
        auth,
        '/api/auth/send-verification-email',
        { email: 'invitee@example.com' },
        { cookie },
      );

    const first = await send();
    expect(first.status).not.toBe(429);
    await send();
    const third = await send();
    expect(third.status).toBe(429);
  });
});

describe('signup verification link', () => {
  it('points the sendOnSignUp link at /squad?verified=1', async () => {
    // Signup routes through the sendVerificationEmail callback, not the resend
    // endpoint, so the callbackURL is built independently — verify it carries
    // the flag the toast depends on.
    await signUpInvitee();

    const sent = vi.mocked(sendEmail).mock.calls[0]?.[0];
    expect(sent).toMatchObject({ to: 'invitee@example.com' });
    expect(new URL(sent?.url ?? '').searchParams.get('callbackURL')).toBe(
      '/squad?verified=1',
    );
  });
});
