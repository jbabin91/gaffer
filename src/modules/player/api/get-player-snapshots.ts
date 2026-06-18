import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getDb } from '#/db/client';
import { getPlayerSnapshots } from '#/modules/player/services/players';

export const getPlayerSnapshotsFn = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(({ data }) => getPlayerSnapshots(getDb(), data));
