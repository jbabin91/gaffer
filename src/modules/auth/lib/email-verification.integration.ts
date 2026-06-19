import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { user } from '#/db/schema';
import { createAuth } from '#/modules/auth/lib/server';
import { getTestDb, resetDb } from '#test/db';

vi.mock('#/lib/email/transport', () => ({
  assertEmailTransportConfigured: vi.fn(),
  sendEmail: vi.fn(),
}));

const ORIGIN = 'http://localhost:3000';

let db: DB;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
});

function post(
  auth: ReturnType<typeof createAuth>,
  path: string,
  body: Record<string, unknown>,
) {
  return auth.handler(
    new Request(`${ORIGIN}${path}`, {
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        origin: ORIGIN,
        'x-forwarded-for': '203.0.113.9',
      },
      method: 'POST',
    }),
  );
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

describe('verification-send rate limit', () => {
  it('caps /send-verification-email at the custom rule (max 2/60s)', async () => {
    // A wrong customRules path would silently fall back to the loose global
    // limit (100/60s), so the third request 429ing proves the path is correct.
    const auth = createAuth(db, {
      initialAdminEmail: 'admin@example.com',
      rateLimit: { enabled: true },
    });
    const send = () =>
      post(auth, '/api/auth/send-verification-email', {
        email: 'someone@example.com',
      });

    const first = await send();
    expect(first.status).not.toBe(429);
    await send();
    const third = await send();
    expect(third.status).toBe(429);
  });
});
