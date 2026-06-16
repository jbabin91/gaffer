import { like } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { verification } from '#/db/schema';
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

// The token is stored raw in verification.identifier as `reset-password:<token>`,
// so a test can read the link's token without rendering or sending the email.
async function resetToken(): Promise<string> {
  const prefix = 'reset-password:';
  const [row] = await db
    .select({ identifier: verification.identifier })
    .from(verification)
    .where(like(verification.identifier, `${prefix}%`))
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

  it('returns success for an unknown email, leaking no account existence', async () => {
    const res = await post('/api/auth/request-password-reset', {
      email: 'nobody@example.com',
    });
    expect(res.status).toBe(200);
  });
});
