import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { user } from '#/db/schema';
import { createAuth } from '#/lib/auth/server';
import { sendEmail } from '#/lib/email/transport';
import { getTestDb, resetDb } from '#test/db';

vi.mock('#/lib/email/transport', () => ({
  assertEmailTransportConfigured: vi.fn(),
  sendEmail: vi.fn(),
}));

const mockedSend = vi.mocked(sendEmail);
const ORIGIN = 'http://localhost:3000';

let auth: ReturnType<typeof createAuth>;
let db: DB;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
  // The sign-up test bootstraps first@example.com, so designate it the admin.
  auth = createAuth(db, { initialAdminEmail: 'first@example.com' });
  mockedSend.mockReset();
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

describe('verification email on sign-up', () => {
  it('sends a verification email to the new user', async () => {
    const res = await post('/api/auth/sign-up/email', {
      email: 'first@example.com',
      name: 'First',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(mockedSend).toHaveBeenCalledOnce();
    const message = mockedSend.mock.calls[0]?.[0];
    expect(message).toMatchObject({
      subject: 'Verify your email address',
      to: 'first@example.com',
    });
    expect(message?.url).toContain('verify-email');
  });
});

describe('password reset request', () => {
  beforeEach(async () => {
    await db
      .insert(user)
      .values({
        email: 'member@example.com',
        emailVerified: true,
        id: 'u1',
        name: 'Member',
      });
  });

  it('sends a reset email when the account exists', async () => {
    const res = await post('/api/auth/request-password-reset', {
      email: 'member@example.com',
    });

    expect(res.status).toBe(200);
    expect(mockedSend).toHaveBeenCalledOnce();
    const message = mockedSend.mock.calls[0]?.[0];
    expect(message).toMatchObject({
      subject: 'Reset your password',
      to: 'member@example.com',
    });
    // App-facing reset link (token in query), not Better Auth's callbackURL form.
    expect(message?.url).toMatch(/\/reset-password\?token=.+/);
  });

  it('does not reveal whether an unknown email exists', async () => {
    const res = await post('/api/auth/request-password-reset', {
      email: 'nobody@example.com',
    });

    expect(res.status).toBe(200);
    expect(mockedSend).not.toHaveBeenCalled();
  });
});
