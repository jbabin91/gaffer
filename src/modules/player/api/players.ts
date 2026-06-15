import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import {
  addPlayerArgs,
  recordSnapshotArgs,
} from '#/modules/player/schemas/players';

// Dynamic import keeps the server-only query layer out of the client bundle.
async function service() {
  const { getDb } = await import('#/db/client');
  return {
    db: getDb(),
    ...(await import('#/modules/player/services/players')),
  };
}

export const listSquadFn = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(async ({ data }) => {
    const { db, listSquad } = await service();
    return listSquad(db, data);
  });

export const getPlayerFn = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(async ({ data }) => {
    const { db, getPlayer } = await service();
    return getPlayer(db, data);
  });

export const getPlayerSnapshotsFn = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(async ({ data }) => {
    const { db, getPlayerSnapshots } = await service();
    return getPlayerSnapshots(db, data);
  });

export const addPlayerFn = createServerFn({ method: 'POST' })
  .validator(addPlayerArgs)
  .handler(async ({ data }) => {
    const { addPlayer, db } = await service();
    return addPlayer(db, data.careerId, data.input);
  });

export const removePlayerFn = createServerFn({ method: 'POST' })
  .validator(z.string())
  .handler(async ({ data }) => {
    const { db, removePlayer } = await service();
    return removePlayer(db, data);
  });

export const recordSnapshotFn = createServerFn({ method: 'POST' })
  .validator(recordSnapshotArgs)
  .handler(async ({ data }) => {
    const { db, recordSnapshot } = await service();
    return recordSnapshot(db, data.playerId, data.input);
  });
