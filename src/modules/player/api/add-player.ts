import { createServerFn } from '@tanstack/react-start';

import { getDb } from '#/db/client';
import { addPlayerArgs } from '#/modules/player/schemas/players';
import { addPlayer } from '#/modules/player/services/players';

export const addPlayerFn = createServerFn({ method: 'POST' })
  .validator(addPlayerArgs)
  .handler(({ data }) => addPlayer(getDb(), data.careerId, data.input));
