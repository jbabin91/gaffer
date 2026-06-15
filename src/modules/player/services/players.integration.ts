import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';

import type { DB, Transaction } from '#/db/client';

import { players, playerSnapshots, seasons } from '#/db/schema';
import {
  createCareer,
  getCurrentSeason,
} from '#/modules/career/services/careers';
import { getTestDb, resetDb } from '#test/db';

import {
  addPlayer,
  getPlayer,
  getPlayerSnapshots,
  listSquad,
  recordSnapshot,
  removePlayer,
} from './players';

let db: DB;
let careerId: string;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
  const career = await createCareer(db, { name: 'Test Career' });
  careerId = career.id;
});

describe('addPlayer', () => {
  it('adds a squad player and seeds a week-0 snapshot from the overall', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Test Striker',
      overall: 78,
      potential: 88,
      primaryPosition: 'ST',
    });

    expect(player.careerId).toBe(careerId);
    expect(player.overall).toBe(78);

    const snapshots = await getPlayerSnapshots(db, player.id);
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({ inGameWeek: 0, overall: 78 });
  });

  it('does not seed a snapshot when no overall is given', async () => {
    const player = await addPlayer(db, careerId, { name: 'Unrated' });
    expect(await getPlayerSnapshots(db, player.id)).toHaveLength(0);
  });

  it('does not persist ratings without a backing snapshot', async () => {
    // No overall means no snapshot, so the denormalized rating must stay null rather than born out of sync.
    const player = await addPlayer(db, careerId, {
      name: 'Potential Only',
      potential: 88,
    });
    expect(player.potential).toBeNull();
    expect(await getPlayerSnapshots(db, player.id)).toHaveLength(0);
  });

  it('rolls back the player insert when seeding its snapshot fails', async () => {
    // Force the in-transaction snapshot insert to throw; the earlier player insert must roll back with it.
    const failOnSnapshot = new Proxy(db, {
      get(target, prop, receiver) {
        if (prop !== 'transaction') return Reflect.get(target, prop, receiver);
        return (run: (tx: Transaction) => Promise<unknown>) =>
          target.transaction((tx) =>
            run(
              new Proxy(tx, {
                get(txTarget, txProp, txReceiver) {
                  if (txProp !== 'insert') {
                    return Reflect.get(txTarget, txProp, txReceiver);
                  }
                  return (table: Parameters<Transaction['insert']>[0]) => {
                    if (table === playerSnapshots) {
                      throw new Error('boom: snapshot insert failed');
                    }
                    return txTarget.insert(table);
                  };
                },
              }),
            ),
          );
      },
    });

    await expect(
      addPlayer(failOnSnapshot, careerId, { name: 'Rollback', overall: 80 }),
    ).rejects.toThrow('boom');

    expect(await listSquad(db, careerId)).toHaveLength(0);
  });
});

describe('recordSnapshot', () => {
  it('appends snapshots across weeks and tracks development over time', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Wonderkid',
      overall: 70,
      potential: 90,
    });

    await recordSnapshot(db, player.id, { inGameWeek: 10, overall: 73 });
    await recordSnapshot(db, player.id, { inGameWeek: 20, overall: 76 });

    const snapshots = await getPlayerSnapshots(db, player.id);
    expect(snapshots.map((s) => s.overall)).toEqual([70, 73, 76]);
    expect(snapshots.map((s) => s.inGameWeek)).toEqual([0, 10, 20]);
  });

  it('overwrites an existing week instead of duplicating it', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Fixer',
      overall: 80,
    });

    await recordSnapshot(db, player.id, { inGameWeek: 5, overall: 81 });
    await recordSnapshot(db, player.id, { inGameWeek: 5, overall: 82 });

    const snapshots = await getPlayerSnapshots(db, player.id);
    const weekFive = snapshots.filter((s) => s.inGameWeek === 5);
    expect(weekFive).toHaveLength(1);
    expect(weekFive[0].overall).toBe(82);
  });

  it('clears optional fields when an existing week is re-recorded without them', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Clearer',
      overall: 80,
    });

    await recordSnapshot(db, player.id, {
      inGameWeek: 5,
      overall: 81,
      potential: 90,
    });
    await recordSnapshot(db, player.id, { inGameWeek: 5, overall: 82 });

    const snapshots = await getPlayerSnapshots(db, player.id);
    const weekFive = snapshots.find((s) => s.inGameWeek === 5);
    expect(weekFive?.potential).toBeNull();
  });

  it("syncs the player's current overall to the latest week", async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Riser',
      overall: 75,
    });

    await recordSnapshot(db, player.id, { inGameWeek: 30, overall: 79 });

    const refreshed = await getPlayer(db, player.id);
    expect(refreshed?.overall).toBe(79);
  });

  it('keeps current overall pinned to the highest week, not the last write', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Backfill',
      overall: 60,
    });

    await recordSnapshot(db, player.id, { inGameWeek: 40, overall: 84 });
    // Backfilling an earlier week must not regress the current rating.
    await recordSnapshot(db, player.id, { inGameWeek: 12, overall: 70 });

    const refreshed = await getPlayer(db, player.id);
    expect(refreshed?.overall).toBe(84);
  });

  it('updates the season when an existing week is re-recorded', async () => {
    const season1 = await getCurrentSeason(db, careerId);
    const [season2] = await db
      .insert(seasons)
      .values({ careerId, isCurrent: false, label: 'Season 2' })
      .returning();
    const player = await addPlayer(db, careerId, {
      name: 'Mover',
      overall: 80,
    });

    await recordSnapshot(db, player.id, {
      inGameWeek: 5,
      overall: 81,
      seasonId: season1?.id,
    });
    await recordSnapshot(db, player.id, {
      inGameWeek: 5,
      overall: 82,
      seasonId: season2.id,
    });

    const snapshots = await getPlayerSnapshots(db, player.id);
    const week5 = snapshots.find((s) => s.inGameWeek === 5);
    expect(week5?.seasonId).toBe(season2.id);
  });
});

describe('removePlayer', () => {
  it('deletes the player and cascades to its snapshots', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Doomed',
      overall: 80,
    });
    await recordSnapshot(db, player.id, { inGameWeek: 5, overall: 81 });

    await removePlayer(db, player.id);

    expect(await getPlayer(db, player.id)).toBeUndefined();
    expect(await getPlayerSnapshots(db, player.id)).toHaveLength(0);
  });
});

describe('listSquad', () => {
  it('returns only on-squad players, ordered by squad number then name', async () => {
    await addPlayer(db, careerId, { name: 'Zito', squadNumber: 10 });
    await addPlayer(db, careerId, { name: 'Abel', squadNumber: 7 });
    await addPlayer(db, careerId, { name: 'Ana', squadNumber: 7 });
    const benched = await addPlayer(db, careerId, { name: 'Benched' });
    await db
      .update(players)
      .set({ onSquad: false })
      .where(eq(players.id, benched.id));

    const squad = await listSquad(db, careerId);
    expect(squad.map((p) => p.name)).toEqual(['Abel', 'Ana', 'Zito']);
  });
});
