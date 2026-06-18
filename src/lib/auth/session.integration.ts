import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { session } from '#/db/schema';
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
  // Designate the signup email as the bootstrap admin so the first signup
  // succeeds through the otherwise-closed gate.
  auth = createAuth(db, { initialAdminEmail: MANAGER.email });
});

// Exercises the session-discrimination contract the _app guard depends on.
// Header forwarding (getRequest().headers → auth.api.getSession) is covered e2e.
describe('getSession', () => {
  it('returns null without a session cookie', async () => {
    const result = await auth.api.getSession({ headers: new Headers() });
    expect(result).toBeNull();
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

    const active = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(active?.user.email).toBe(MANAGER.email);
  });

  // Pins the cookieCache-off invariant: re-enabling it would serve the warm
  // cookie after deletion and break this.
  it('returns null once the session row is deleted', async () => {
    const signedUp = await auth.handler(
      new Request(`${ORIGIN}/api/auth/sign-up/email`, {
        body: JSON.stringify(MANAGER),
        headers: { 'content-type': 'application/json', origin: ORIGIN },
        method: 'POST',
      }),
    );
    const cookie = signedUp.headers.getSetCookie().join('; ');

    await db.delete(session);

    const evicted = await auth.api.getSession({
      headers: new Headers({ cookie }),
    });
    expect(evicted).toBeNull();
  });
});
