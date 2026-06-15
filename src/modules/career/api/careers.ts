import { createServerFn } from '@tanstack/react-start';

import { createCareerInput } from '#/modules/career/schemas/careers';

// Dynamic imports keep the server-only query layer out of the client bundle.
export const listCareersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getDb } = await import('#/db/client');
    const { listCareers } = await import('#/modules/career/services/careers');
    return listCareers(getDb());
  },
);

export const createCareerFn = createServerFn({ method: 'POST' })
  .validator(createCareerInput)
  .handler(async ({ data }) => {
    const { getDb } = await import('#/db/client');
    const { createCareer } = await import('#/modules/career/services/careers');
    return createCareer(getDb(), data);
  });
