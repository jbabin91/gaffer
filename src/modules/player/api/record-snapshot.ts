import { createServerFn } from '@tanstack/react-start';

import { getDb } from '#/db/client';
import { recordSnapshotArgs } from '#/modules/player/schemas/players';
import { recordSnapshot } from '#/modules/player/services/players';

export const recordSnapshotFn = createServerFn({ method: 'POST' })
  .validator(recordSnapshotArgs)
  .handler(({ data }) => recordSnapshot(getDb(), data.playerId, data.input));
