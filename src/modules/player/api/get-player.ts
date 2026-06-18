import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getDb } from '#/db/client';
import { getPlayer } from '#/modules/player/services/players';

export const getPlayerFn = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler(({ data }) => getPlayer(getDb(), data));
