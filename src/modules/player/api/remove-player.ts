import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { getDb } from '#/db/client';
import { removePlayer } from '#/modules/player/services/players';

export const removePlayerFn = createServerFn({ method: 'POST' })
  .validator(z.string())
  .handler(({ data }) => removePlayer(getDb(), data));
