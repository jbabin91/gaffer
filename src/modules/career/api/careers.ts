import { createServerFn } from '@tanstack/react-start';

import { createCareerInput } from '#/modules/career/schemas/careers';

// Service imports are dynamic so the server-only query layer stays out of the
// client bundle; only the RPC stub (and the validator) ships to the browser.
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
