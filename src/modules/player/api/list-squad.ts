import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getDb } from '#/db/client';
import { listSquad } from '#/modules/player/services/players';

export const listSquadFn = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(({ data }) => listSquad(getDb(), data));
