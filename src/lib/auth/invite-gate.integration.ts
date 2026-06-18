import { hashInviteCode } from 'better-auth-invitation-only';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DB } from '#/db/client';

import { invitation, invitePending, user, type UserRole } from '#/db/schema';
import { createInviteStore } from '#/lib/auth/invite-store';
import { createAuth } from '#/lib/auth/server';
import { logger } from '#/lib/logger';
import { getTestDb, resetDb } from '#test/db';

let db: DB;
let auth: ReturnType<typeof createAuth>;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
  auth = createAuth(db);
});

const ORIGIN = 'http://localhost:3000';

async function signUp(body: Record<string, unknown>) {
  const res = await auth.handler(
    new Request(`${ORIGIN}/api/auth/sign-up/email`, {
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', origin: ORIGIN },
      method: 'POST',
    }),
  );
  return { body: await res.json().catch(() => null), status: res.status };
}

function insertUser(id: string, role: UserRole | null = null) {
  return db
    .insert(user)
    .values({ email: `${id}@example.com`, id, name: id, role });
}

function insertInvitation(over: Partial<typeof invitation.$inferInsert> = {}) {
  return db
    .insert(invitation)
    .values({
      codeHash: hashInviteCode('GOODCODE'),
      email: 'invitee@example.com',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      id: 'inv1',
      invitedBy: 'admin',
      ...over,
    });
}

describe('invitation schema', () => {
  beforeEach(() => insertUser('admin', 'admin'));

  it('defaults maxUses to 1 and useCount to 0', async () => {
    await insertInvitation();

    const [row] = await db.select().from(invitation);

    expect(row?.maxUses).toBe(1);
    expect(row?.useCount).toBe(0);
  });

  it('rejects a duplicate code hash', async () => {
    await insertInvitation({ id: 'inv1' });

    await expect(insertInvitation({ id: 'inv2' })).rejects.toThrow();
  });

  it('cascades invitation deletes from the inviting user', async () => {
    await insertInvitation();

    await db.delete(user).where(eq(user.id, 'admin'));

    expect(await db.select().from(invitation)).toHaveLength(0);
  });
});

describe('createInviteStore', () => {
  beforeEach(async () => {
    await insertUser('admin', 'admin');
    await insertInvitation();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('round-trips createdAt and deletes entries', async () => {
    const store = createInviteStore(db);
    const entry = { createdAt: Date.now(), invitationId: 'inv1' };
    await store.set('invitee@example.com', entry);

    expect(await store.get('invitee@example.com')).toEqual(entry);

    await store.delete('invitee@example.com');
    expect(await store.get('invitee@example.com')).toBeNull();
  });

  it('still writes the entry when the pre-insert sweep fails', async () => {
    const store = createInviteStore(db);
    vi.spyOn(db, 'delete').mockImplementationOnce(() => {
      throw new Error('sweep boom');
    });
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    await store.set('invitee@example.com', {
      createdAt: Date.now(),
      invitationId: 'inv1',
    });

    expect(warn).toHaveBeenCalled();
    expect(await store.get('invitee@example.com')).toMatchObject({
      invitationId: 'inv1',
    });
  });

  it('cleanup evicts entries past the 5-minute TTL boundary', async () => {
    const ttl = 5 * 60 * 1000;
    // Insert directly so set()'s own sweep doesn't pre-empt the assertion.
    await db.insert(invitePending).values([
      {
        createdAt: new Date(Date.now() - ttl - 1000),
        invitationId: 'inv1',
        key: 'stale',
      },
      {
        createdAt: new Date(Date.now() - ttl + 1000),
        invitationId: 'inv1',
        key: 'fresh',
      },
    ]);
    const store = createInviteStore(db);

    await store.cleanup();

    // Assert on rows, not store.get (which hashes the key) — the direct inserts
    // above use raw keys.
    const rows = await db.select().from(invitePending);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.key).toBe('fresh');
  });

  it('overwrites an entry on a repeated key', async () => {
    await insertInvitation({ codeHash: hashInviteCode('OTHER'), id: 'inv2' });
    const store = createInviteStore(db);

    await store.set('invitee@example.com', {
      createdAt: Date.now(),
      invitationId: 'inv1',
    });
    await store.set('invitee@example.com', {
      createdAt: Date.now(),
      invitationId: 'inv2',
    });

    expect(await store.get('invitee@example.com')).toMatchObject({
      invitationId: 'inv2',
    });
    expect(await db.select().from(invitePending)).toHaveLength(1);
  });

  it('cascades pending deletes from the invitation', async () => {
    const store = createInviteStore(db);
    await store.set('invitee@example.com', {
      createdAt: Date.now(),
      invitationId: 'inv1',
    });

    await db.delete(invitation).where(eq(invitation.id, 'inv1'));

    expect(await db.select().from(invitePending)).toHaveLength(0);
  });
});

describe('invite gate', () => {
  describe('first-admin bootstrap', () => {
    const ADMIN_EMAIL = 'admin@example.com';

    beforeEach(() => {
      auth = createAuth(db, { initialAdminEmail: ADMIN_EMAIL });
    });

    it('bootstraps the designated admin with the gate open', async () => {
      const res = await signUp({
        email: ADMIN_EMAIL,
        name: 'Admin',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      const [row] = await db.select().from(user);
      expect(row?.role).toBe('admin');
    });

    it('matches the designated email case-insensitively', async () => {
      const res = await signUp({
        email: 'ADMIN@example.com',
        name: 'Admin',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      const [row] = await db.select().from(user);
      expect(row?.role).toBe('admin');
    });

    it('rejects a non-designated signup during bootstrap, creating no user', async () => {
      const res = await signUp({
        email: 'intruder@example.com',
        name: 'Intruder',
        password: 'password123',
      });

      expect(res.status).toBe(403);
      expect(res.body?.code).toBe('INVITE_REQUIRED');
      expect(await db.select().from(user)).toHaveLength(0);
    });

    it('closes the gate once the admin bootstraps', async () => {
      const first = await signUp({
        email: ADMIN_EMAIL,
        name: 'Admin',
        password: 'password123',
      });
      expect(first.status).toBe(200);

      const second = await signUp({
        email: 'second@example.com',
        name: 'Second',
        password: 'password123',
      });

      expect(second.status).toBe(403);
      expect(second.body?.code).toBe('INVITE_REQUIRED');
    });

    it('matches a designated email configured in a different case', async () => {
      auth = createAuth(db, { initialAdminEmail: 'ADMIN@example.com' });

      const res = await signUp({
        email: 'admin@example.com',
        name: 'Admin',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      const [row] = await db.select().from(user);
      expect(row?.role).toBe('admin');
    });

    it('lets only one of two concurrent designated signups become admin', async () => {
      // The unique email column is the single-winner guard: both signups grant
      // admin in their before-hook, but only one insert survives.
      const results = await Promise.all([
        signUp({ email: ADMIN_EMAIL, name: 'Admin', password: 'password123' }),
        signUp({ email: ADMIN_EMAIL, name: 'Admin', password: 'password123' }),
      ]);

      expect(results.filter((r) => r.status === 200)).toHaveLength(1);
      const admins = await db.select().from(user).where(eq(user.role, 'admin'));
      expect(admins).toHaveLength(1);
      expect(await db.select().from(user)).toHaveLength(1);
    });

    it('reopens the bootstrap window when the admin is removed', async () => {
      const bootstrap = await signUp({
        email: ADMIN_EMAIL,
        name: 'Admin',
        password: 'password123',
      });
      expect(bootstrap.status).toBe(200);
      await db.delete(user).where(eq(user.role, 'admin'));

      const res = await signUp({
        email: ADMIN_EMAIL,
        name: 'Admin',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      const [row] = await db.select().from(user).where(eq(user.role, 'admin'));
      expect(row?.role).toBe('admin');
    });
  });

  it('rejects every signup when no admin email is designated', async () => {
    // Top-level auth has no designated admin, so a fresh DB is fully closed:
    // bootstrapping requires INITIAL_ADMIN_EMAIL.
    const res = await signUp({
      email: 'anyone@example.com',
      name: 'Anyone',
      password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.body?.code).toBe('INVITE_REQUIRED');
    expect(await db.select().from(user)).toHaveLength(0);
  });

  it('rejects a code-less signup once a user exists', async () => {
    await insertUser('admin', 'admin');

    const res = await signUp({
      email: 'second@example.com',
      name: 'Second',
      password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.body?.code).toBe('INVITE_REQUIRED');
  });

  it('rejects an unknown invite code', async () => {
    await insertUser('admin', 'admin');

    const res = await signUp({
      email: 'second@example.com',
      inviteCode: 'NOPE',
      name: 'Second',
      password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.body?.code).toBe('INVALID_INVITE');
  });

  it('rejects a valid code used with a mismatched email', async () => {
    await insertUser('admin', 'admin');
    await insertInvitation();

    const res = await signUp({
      email: 'wrong@example.com',
      inviteCode: 'GOODCODE',
      name: 'Wrong',
      password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.body?.code).toBe('EMAIL_MISMATCH');
  });

  it.each([
    ['expired', { expiresAt: new Date(Date.now() - 1000) }],
    ['revoked', { revokedAt: new Date() }],
    ['exhausted', { maxUses: 2, useCount: 2 }],
  ] as const)('rejects an %s invite', async (_label, over) => {
    await insertUser('admin', 'admin');
    await insertInvitation(over);

    const res = await signUp({
      email: 'invitee@example.com',
      inviteCode: 'GOODCODE',
      name: 'Invitee',
      password: 'password123',
    });

    expect(res.status).toBe(403);
    expect(res.body?.code).toBe('INVALID_INVITE');
  });

  it('admits a matching signup and marks the invite consumed', async () => {
    await insertUser('admin', 'admin');
    await insertInvitation();

    const res = await signUp({
      email: 'invitee@example.com',
      inviteCode: 'GOODCODE',
      name: 'Invitee',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    const [invitee] = await db
      .select()
      .from(user)
      .where(eq(user.email, 'invitee@example.com'));
    const [inv] = await db.select().from(invitation);
    expect(inv?.useCount).toBe(1);
    expect(inv?.usedAt).not.toBeNull();
    expect(inv?.usedBy).toBe(invitee?.id);
    expect(await db.select().from(invitePending)).toHaveLength(0);
  });
});
