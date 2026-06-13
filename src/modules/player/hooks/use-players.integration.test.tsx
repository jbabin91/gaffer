// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as dbClient from '#/db/client';
import { createCareer } from '#/modules/career/api/careers';
import { addPlayer } from '#/modules/player/api/players';
import { renderHookWithClient } from '#test/harness';

import {
  useAddPlayer,
  usePlayer,
  usePlayerSnapshots,
  useRecordSnapshot,
  useRemovePlayer,
  useSquad,
} from './use-players';

const dbRef = vi.hoisted(() => ({ current: null as dbClient.DB | null }));

vi.mock('#/db/client', async (importOriginal) => {
  const actual = await importOriginal<typeof dbClient>();
  return {
    ...actual,
    getDb: () => {
      if (!dbRef.current) throw new Error('test db not initialised');
      return Promise.resolve(dbRef.current);
    },
  };
});

let db: dbClient.DB;
let careerId: string;

beforeEach(async () => {
  db = await dbClient.createMemoryDb();
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

    // detail(playerId) prefix-matches snapshots(playerId), so a single
    // invalidation refreshes both; squad invalidation updates the denormalized rating.
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
