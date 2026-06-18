import { createServerFn } from '@tanstack/react-start';

import { getDb } from '#/db/client';
import { createCareerInput } from '#/modules/career/schemas/careers';
import { createCareer } from '#/modules/career/services/careers';

export const createCareerFn = createServerFn({ method: 'POST' })
  .validator(createCareerInput)
  .handler(({ data }) => createCareer(getDb(), data));
