import {
  queryOptions,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getDb } from '#/db/client';
import {
  addPlayer,
  type AddPlayerInput,
  getPlayer,
  getPlayerSnapshots,
  listSquad,
  recordSnapshot,
  type RecordSnapshotInput,
  removePlayer,
} from '#/modules/player/api/players';

/**
 * Query-options factory (TkDodo). Bare levels (`all`/`squads`/`details`) return
 * keys for fuzzy invalidation; leaf levels return `queryOptions` usable by
 * `useQuery`, `useSuspenseQuery`, and router `ensureQueryData`. `snapshots`
 * nests under `details` so invalidating a player's detail also refreshes it.
 */
export const playerQueries = {
  all: () => ['players'] as const,
  detail: (playerId: string) =>
    queryOptions({
      queryFn: async () => getPlayer(await getDb(), playerId),
      queryKey: [...playerQueries.details(), playerId],
    }),
  details: () => [...playerQueries.all(), 'detail'] as const,
  snapshots: (playerId: string) =>
    queryOptions({
      queryFn: async () => getPlayerSnapshots(await getDb(), playerId),
      queryKey: [...playerQueries.details(), playerId, 'snapshots'],
    }),
  squad: (careerId: string) =>
    queryOptions({
      queryFn: async () => listSquad(await getDb(), careerId),
      queryKey: [...playerQueries.squads(), careerId],
    }),
  squads: () => [...playerQueries.all(), 'squad'] as const,
};

export function useSquad(careerId: string | undefined) {
  const options = playerQueries.squad(careerId ?? '');
  return useQuery({
    ...options,
    queryFn: careerId ? options.queryFn : skipToken,
  });
}

export function usePlayer(playerId: string) {
  return useQuery(playerQueries.detail(playerId));
}

export function usePlayerSnapshots(playerId: string) {
  return useQuery(playerQueries.snapshots(playerId));
}

export function useAddPlayer(careerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddPlayerInput) =>
      addPlayer(await getDb(), careerId, input),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: playerQueries.squad(careerId).queryKey,
      }),
  });
}

export function useRemovePlayer(careerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (playerId: string) =>
      removePlayer(await getDb(), playerId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: playerQueries.squad(careerId).queryKey,
      }),
  });
}

export function useRecordSnapshot(playerId: string, careerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecordSnapshotInput) =>
      recordSnapshot(await getDb(), playerId, input),
    // detail(playerId) prefix-matches snapshots(playerId), so one invalidation
    // refreshes both the player and its history.
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({
          queryKey: playerQueries.detail(playerId).queryKey,
        }),
        qc.invalidateQueries({
          queryKey: playerQueries.squad(careerId).queryKey,
        }),
      ]),
  });
}
