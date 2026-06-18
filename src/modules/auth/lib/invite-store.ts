import '@tanstack/react-start/server-only';

import type { InviteStore } from 'better-auth-invitation-only';

import { eq, lt } from 'drizzle-orm';
import { createHash } from 'node:crypto';

import type { Database } from '#/db/client';

import { invitePending } from '#/db/schema';
import { logger } from '#/lib/logger';

// Matches the plugin's MemoryInviteStore: entries are evicted 5 minutes after
// they're written (the validate→signup window).
const PENDING_TTL_MS = 5 * 60 * 1000;

// The plugin keys entries by the signup email, or by the raw invite code
// (`__code:<code>`) on OAuth callbacks. Hash the key so neither a bearer code
// nor an email is persisted in plaintext.
const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');

/**
 * Drizzle-backed {@link InviteStore} so pending validate→signup entries survive a
 * restart instead of living in process memory (the plugin's default).
 */
export function createInviteStore(db: Database): InviteStore {
  const sweep = () =>
    db
      .delete(invitePending)
      .where(
        lt(invitePending.createdAt, new Date(Date.now() - PENDING_TTL_MS)),
      );

  return {
    async cleanup() {
      await sweep();
    },
    async delete(key) {
      await db.delete(invitePending).where(eq(invitePending.key, hashKey(key)));
    },
    async get(key) {
      const [row] = await db
        .select()
        .from(invitePending)
        .where(eq(invitePending.key, hashKey(key)))
        .limit(1);
      if (!row) return null;
      return {
        createdAt: row.createdAt.getTime(),
        invitationId: row.invitationId,
      };
    },
    async set(key, value) {
      // The plugin only schedules cleanup() on its in-memory store, so sweep
      // here (best-effort — a sweep failure must not block the signup) to keep
      // abandoned entries from accumulating.
      try {
        await sweep();
      } catch (error) {
        logger.warn({ err: error }, 'invite_pending sweep failed');
      }
      const row = {
        createdAt: new Date(value.createdAt),
        invitationId: value.invitationId,
        key: hashKey(key),
      };
      await db
        .insert(invitePending)
        .values(row)
        .onConflictDoUpdate({
          set: { createdAt: row.createdAt, invitationId: row.invitationId },
          target: invitePending.key,
        });
    },
  };
}
