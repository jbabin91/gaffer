import { createServerFn } from '@tanstack/react-start';

import { getDb } from '#/db/client';
import { listCareers } from '#/modules/career/services/careers';

export const listCareersFn = createServerFn({ method: 'GET' }).handler(() =>
  listCareers(getDb()),
);
