import { count, desc, eq, like } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { session, user, verification } from '#/db/schema';
import { createAuth } from '#/lib/auth/server';
import { getTestDb, resetDb } from '#test/db';

vi.mock('#/lib/email/transport', () => ({
  assertEmailTransportConfigured: vi.fn(),
  sendEmail: vi.fn(),
}));

const ORIGIN = 'http://localhost:3000';
const EMAIL = 'manager@example.com';
const PASSWORD = 'original-pass-1';
const NEW_PASSWORD = 'brand-new-pass-2';

let auth: ReturnType<typeof createAuth>;
let db: DB;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
  auth = createAuth(db);
  // First user needs no invite.
  await post('/api/auth/sign-up/email', {
    email: EMAIL,
    name: 'Reset Manager',
    password: PASSWORD,
  });
});

async function post(path: string, body: Record<string, unknown>) {
  const res = await auth.handler(
    new Request(`${ORIGIN}${path}`, {
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      method: 'POST',
    }),
  );
  return { body: await res.json().catch(() => null), status: res.status };
}

// Better Auth stores the token as `reset-password:<token>` in verification.identifier.
async function resetToken(): Promise<string> {
  const prefix = 'reset-password:';
  const [row] = await db
    .select({ identifier: verification.identifier })
    .from(verification)
    .where(like(verification.identifier, `${prefix}%`))
    .orderBy(desc(verification.createdAt))
    .limit(1);
  if (!row) throw new Error('no reset token in the test database');
  return row.identifier.slice(prefix.length);
}

describe('password reset flow', () => {
  it('accepts the new password and rejects the old one after reset', async () => {
    const requested = await post('/api/auth/request-password-reset', {
      email: EMAIL,
    });
    expect(requested.status).toBe(200);

    const reset = await post('/api/auth/reset-password', {
      newPassword: NEW_PASSWORD,
      token: await resetToken(),
    });
    expect(reset.status).toBe(200);

    const withNew = await post('/api/auth/sign-in/email', {
      email: EMAIL,
      password: NEW_PASSWORD,
    });
    expect(withNew.status).toBe(200);

    const withOld = await post('/api/auth/sign-in/email', {
      email: EMAIL,
      password: PASSWORD,
    });
    expect(withOld.status).toBe(401);
  });

  it('rejects an invalid reset token', async () => {
    const reset = await post('/api/auth/reset-password', {
      newPassword: NEW_PASSWORD,
      token: 'garbage',
    });
    expect(reset.status).not.toBe(200);
  });

  it('returns an identical response for unknown and known emails, leaking no account existence', async () => {
    const unknown = await post('/api/auth/request-password-reset', {
      email: 'nobody@example.com',
    });
    const known = await post('/api/auth/request-password-reset', {
      email: EMAIL,
    });
    expect(unknown.status).toBe(200);
    expect(unknown.status).toBe(known.status);
    expect(unknown.body).toEqual(known.body);
  });

  it('revokes existing sessions on reset', async () => {
    const [manager] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, EMAIL));
    if (!manager) throw new Error('manager was not created in beforeEach');

    const sessionCount = async () => {
      const [row] = await db
        .select({ value: count() })
        .from(session)
        .where(eq(session.userId, manager.id));
      return row?.value ?? 0;
    };

    expect(await sessionCount()).toBeGreaterThan(0);

    await post('/api/auth/request-password-reset', { email: EMAIL });
    const reset = await post('/api/auth/reset-password', {
      newPassword: NEW_PASSWORD,
      token: await resetToken(),
    });
    expect(reset.status).toBe(200);

    expect(await sessionCount()).toBe(0);
  });
});
