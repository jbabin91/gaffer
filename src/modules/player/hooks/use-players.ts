import {
  queryOptions,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  addPlayerFn,
  getPlayerFn,
  getPlayerSnapshotsFn,
  listSquadFn,
  recordSnapshotFn,
  removePlayerFn,
} from '#/modules/player/api/players';
import {
  type AddPlayerInput,
  type RecordSnapshotInput,
} from '#/modules/player/schemas/players';

// snapshots nests under details, so invalidating a player's detail also
// refreshes its snapshots.
export const playerQueries = {
  all: () => ['players'] as const,
  detail: (playerId: string) =>
    queryOptions({
      queryFn: () => getPlayerFn({ data: playerId }),
      queryKey: [...playerQueries.details(), playerId],
    }),
  details: () => [...playerQueries.all(), 'detail'] as const,
  snapshots: (playerId: string) =>
    queryOptions({
      queryFn: () => getPlayerSnapshotsFn({ data: playerId }),
      queryKey: [...playerQueries.details(), playerId, 'snapshots'],
    }),
  squad: (careerId: string) =>
    queryOptions({
      queryFn: () => listSquadFn({ data: careerId }),
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
    mutationFn: (input: AddPlayerInput) =>
      addPlayerFn({ data: { careerId, input } }),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: playerQueries.squad(careerId).queryKey,
      }),
  });
}

export function useRemovePlayer(careerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId: string) => removePlayerFn({ data: playerId }),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: playerQueries.squad(careerId).queryKey,
      }),
  });
}

export function useRecordSnapshot(playerId: string, careerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordSnapshotInput) =>
      recordSnapshotFn({ data: { input, playerId } }),
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
