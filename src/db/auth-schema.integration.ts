import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import type { DB } from '#/db/client';

import { account, session, user } from '#/db/schema';
import { getTestDb, resetDb } from '#test/db';

let db: DB;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
});

function insertUser(id: string, email: string) {
  return db.insert(user).values({ email, id, name: 'Test' });
}

// Guards migration 0001 constraints against a future `@better-auth/cli generate` silently dropping them.
describe('auth schema', () => {
  it('defaults emailVerified and banned to false', async () => {
    await insertUser('u1', 'a@example.com');

    const [row] = await db.select().from(user);

    expect(row?.emailVerified).toBe(false);
    expect(row?.banned).toBe(false);
  });

  it('rejects a duplicate user email', async () => {
    await insertUser('u1', 'dup@example.com');

    await expect(insertUser('u2', 'dup@example.com')).rejects.toThrow();
  });

  it('rejects a duplicate session token', async () => {
    await insertUser('u1', 'a@example.com');
    await db
      .insert(session)
      .values({
        expiresAt: new Date(Date.now() + 60_000),
        id: 's1',
        token: 'tok',
        userId: 'u1',
      });

    await expect(
      db
        .insert(session)
        .values({
          expiresAt: new Date(Date.now() + 60_000),
          id: 's2',
          token: 'tok',
          userId: 'u1',
        }),
    ).rejects.toThrow();
  });

  it('cascades deletes from user to sessions and accounts', async () => {
    await insertUser('u1', 'a@example.com');
    await db
      .insert(session)
      .values({
        expiresAt: new Date(Date.now() + 60_000),
        id: 's1',
        token: 'tok',
        userId: 'u1',
      });
    await db
      .insert(account)
      .values({
        accountId: 'acc',
        id: 'a1',
        providerId: 'credential',
        userId: 'u1',
      });

    await db.delete(user).where(eq(user.id, 'u1'));

    expect(await db.select().from(session)).toHaveLength(0);
    expect(await db.select().from(account)).toHaveLength(0);
  });
});
