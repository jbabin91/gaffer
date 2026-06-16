import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { createAuth } from '#/lib/auth/server';
import { getTestDb, resetDb } from '#test/db';

vi.mock('#/lib/email/transport', () => ({
  assertEmailTransportConfigured: vi.fn(),
  sendEmail: vi.fn(),
}));

const ORIGIN = 'http://localhost:3000';
const MANAGER = {
  email: 'manager@example.com',
  name: 'Session Manager',
  password: 'session-pass-1',
};

let auth: ReturnType<typeof createAuth>;
let db: DB;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
  auth = createAuth(db);
});

// Exercises the session-discrimination contract the _app guard depends on.
// Header forwarding (getRequest().headers → auth.api.getSession) is covered e2e.
describe('getSession', () => {
  it('returns null without a session cookie', async () => {
    const session = await auth.api.getSession({ headers: new Headers() });
    expect(session).toBeNull();
  });

  it('returns the session when the request carries the cookie', async () => {
    const signedUp = await auth.handler(
      new Request(`${ORIGIN}/api/auth/sign-up/email`, {
        body: JSON.stringify(MANAGER),
        headers: { 'content-type': 'application/json', origin: ORIGIN },
        method: 'POST',
      }),
    );
    const cookie = signedUp.headers.getSetCookie().join('; ');

    const session = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(session?.user.email).toBe(MANAGER.email);
  });
});
