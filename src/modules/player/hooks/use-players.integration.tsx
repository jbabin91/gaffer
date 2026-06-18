// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as PlayerService from '#/modules/player/services/players';

import { type DB } from '#/db/client';
import { createCareer } from '#/modules/career/services/careers';
import {
  type AddPlayerArgs,
  type RecordSnapshotArgs,
} from '#/modules/player/schemas/players';
import { addPlayer } from '#/modules/player/services/players';
import { getTestDb, resetDb } from '#test/db';
import { renderHookWithClient } from '#test/harness';

import {
  useAddPlayer,
  usePlayer,
  usePlayerSnapshots,
  useRecordSnapshot,
  useRemovePlayer,
  useSquad,
} from './use-players';

const dbRef = vi.hoisted(() => ({ current: null as DB | null }));

function testDb(): DB {
  if (!dbRef.current) throw new Error('test db not initialized');
  return dbRef.current;
}

// vitest hoists vi.mock above the ESM imports, so a factory can't close over the
// top-level service import; mockApi loads it dynamically and threads the test db.
const mockApi = vi.hoisted(
  () =>
    (build: (svc: typeof PlayerService) => Record<string, unknown>) =>
    async () =>
      build(await import('#/modules/player/services/players')),
);

vi.mock(
  '#/modules/player/api/add-player',
  mockApi((svc) => ({
    addPlayerFn: ({ data }: { data: AddPlayerArgs }) =>
      svc.addPlayer(testDb(), data.careerId, data.input),
  })),
);

vi.mock(
  '#/modules/player/api/get-player',
  mockApi((svc) => ({
    getPlayerFn: ({ data }: { data: string }) => svc.getPlayer(testDb(), data),
  })),
);

vi.mock(
  '#/modules/player/api/get-player-snapshots',
  mockApi((svc) => ({
    getPlayerSnapshotsFn: ({ data }: { data: string }) =>
      svc.getPlayerSnapshots(testDb(), data),
  })),
);

vi.mock(
  '#/modules/player/api/list-squad',
  mockApi((svc) => ({
    listSquadFn: ({ data }: { data: string }) => svc.listSquad(testDb(), data),
  })),
);

vi.mock(
  '#/modules/player/api/record-snapshot',
  mockApi((svc) => ({
    recordSnapshotFn: ({ data }: { data: RecordSnapshotArgs }) =>
      svc.recordSnapshot(testDb(), data.playerId, data.input),
  })),
);

vi.mock(
  '#/modules/player/api/remove-player',
  mockApi((svc) => ({
    removePlayerFn: ({ data }: { data: string }) =>
      svc.removePlayer(testDb(), data),
  })),
);

let db: DB;
let careerId: string;

beforeEach(async () => {
  await resetDb();
  db = getTestDb();
  dbRef.current = db;
  const career = await createCareer(db, { name: 'Career' });
  careerId = career.id;
});

describe('useAddPlayer', () => {
  it('invalidates the squad so the added player appears', async () => {
    const { result } = renderHookWithClient(() => ({
      add: useAddPlayer(careerId),
      squad: useSquad(careerId),
    }));

    await waitFor(() => expect(result.current.squad.isSuccess).toBe(true));
    expect(result.current.squad.data).toHaveLength(0);

    await act(async () => {
      await result.current.add.mutateAsync({ name: 'New Player', overall: 80 });
    });

    await waitFor(() => expect(result.current.squad.data).toHaveLength(1));
    expect(result.current.squad.data?.[0]?.name).toBe('New Player');
  });
});

describe('useRemovePlayer', () => {
  it('invalidates the squad so the removed player disappears', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Doomed',
      overall: 80,
    });

    const { result } = renderHookWithClient(() => ({
      remove: useRemovePlayer(careerId),
      squad: useSquad(careerId),
    }));

    await waitFor(() => expect(result.current.squad.data).toHaveLength(1));

    await act(async () => {
      await result.current.remove.mutateAsync(player.id);
    });

    await waitFor(() => expect(result.current.squad.data).toHaveLength(0));
  });
});

describe('useRecordSnapshot', () => {
  it('refreshes the player, its snapshots, and the squad from one record', async () => {
    const player = await addPlayer(db, careerId, {
      name: 'Riser',
      overall: 80,
    });

    const { result } = renderHookWithClient(() => ({
      player: usePlayer(player.id),
      record: useRecordSnapshot(player.id, careerId),
      snapshots: usePlayerSnapshots(player.id),
      squad: useSquad(careerId),
    }));

    await waitFor(() => {
      expect(result.current.player.isSuccess).toBe(true);
      expect(result.current.snapshots.isSuccess).toBe(true);
      expect(result.current.squad.isSuccess).toBe(true);
    });

    await act(async () => {
      await result.current.record.mutateAsync({ inGameWeek: 5, overall: 90 });
    });

    // detail(playerId) prefix-matches snapshots(playerId), so one invalidation refreshes both.
    await waitFor(() => {
      expect(result.current.player.data?.overall).toBe(90);
      expect(
        result.current.snapshots.data?.some(
          (s) => s.inGameWeek === 5 && s.overall === 90,
        ),
      ).toBe(true);
      expect(result.current.squad.data?.[0]?.overall).toBe(90);
    });
  });
});

describe('useSquad', () => {
  it('stays idle without fetching when no career is selected', () => {
    const { result } = renderHookWithClient(() => useSquad(undefined));

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});
