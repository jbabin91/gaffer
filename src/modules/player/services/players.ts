import { and, asc, eq, sql } from 'drizzle-orm';

import type { Database, DB } from '#/db/client';
import type {
  AddPlayerInput,
  RecordSnapshotInput,
} from '#/modules/player/schemas/players';

import {
  type Player,
  players,
  type PlayerSnapshot,
  playerSnapshots,
} from '#/db/schema';

export async function listSquad(db: DB, careerId: string): Promise<Player[]> {
  return db
    .select()
    .from(players)
    .where(and(eq(players.careerId, careerId), eq(players.onSquad, true)))
    .orderBy(asc(players.squadNumber), asc(players.name));
}

export async function getPlayer(
  db: Database,
  playerId: string,
): Promise<Player | undefined> {
  const [player] = await db
    .select()
    .from(players)
    .where(eq(players.id, playerId));
  return player;
}

/**
 * Ratings are snapshot-owned: an overall seeds a week-0 snapshot, sharing the
 * insert's transaction.
 * @throws when the player insert returns no row.
 */
export async function addPlayer(
  db: DB,
  careerId: string,
  input: AddPlayerInput,
): Promise<Player> {
  return db.transaction(async (tx) => {
    const [player] = await tx
      .insert(players)
      .values({
        age: input.age,
        careerId,
        catalogId: input.catalogId,
        contractUntil: input.contractUntil,
        name: input.name,
        nationality: input.nationality,
        primaryPosition: input.primaryPosition,
        secondaryPositions: input.secondaryPositions,
        squadNumber: input.squadNumber,
        wageEur: input.wageEur,
      })
      .returning();

    if (!player) throw new Error('addPlayer: insert returned no row');
    if (input.overall === undefined) return player;

    await recordSnapshot(tx, player.id, {
      inGameWeek: 0,
      marketValueEur: input.marketValueEur,
      overall: input.overall,
      potential: input.potential,
    });
    return (await getPlayer(tx, player.id)) ?? player;
  });
}

export async function removePlayer(db: DB, playerId: string): Promise<void> {
  await db.delete(players).where(eq(players.id, playerId));
}

/**
 * Keyed by (player, in-game week): re-recording a week overwrites that point
 * instead of duplicating it. Also refreshes the player's denormalized current
 * ratings used by squad lists.
 * @throws when the upsert returns no row.
 */
export async function recordSnapshot(
  db: Database,
  playerId: string,
  input: RecordSnapshotInput,
): Promise<PlayerSnapshot> {
  const [snapshot] = await db
    .insert(playerSnapshots)
    .values({ playerId, ...input })
    .onConflictDoUpdate({
      // Drizzle omits `undefined` from an update set, so coalesce to null to
      // clear a previously-set field on re-record (insert defaults it to null).
      set: {
        form: input.form ?? null,
        marketValueEur: input.marketValueEur ?? null,
        overall: input.overall,
        potential: input.potential ?? null,
        recordedAt: sql`now()`,
        seasonId: input.seasonId ?? null,
      },
      target: [playerSnapshots.playerId, playerSnapshots.inGameWeek],
    })
    .returning();

  if (!snapshot) throw new Error('recordSnapshot: upsert returned no row');

  await syncCurrentRatings(db, playerId);
  return snapshot;
}

export async function getPlayerSnapshots(
  db: DB,
  playerId: string,
): Promise<PlayerSnapshot[]> {
  return db
    .select()
    .from(playerSnapshots)
    .where(eq(playerSnapshots.playerId, playerId))
    .orderBy(asc(playerSnapshots.inGameWeek));
}

async function syncCurrentRatings(
  db: Database,
  playerId: string,
): Promise<void> {
  const [latest] = await db
    .select()
    .from(playerSnapshots)
    .where(eq(playerSnapshots.playerId, playerId))
    .orderBy(sql`${playerSnapshots.inGameWeek} DESC`)
    .limit(1);

  if (!latest) return;

  await db
    .update(players)
    .set({
      marketValueEur: latest.marketValueEur,
      overall: latest.overall,
      potential: latest.potential,
    })
    .where(eq(players.id, playerId));
}
