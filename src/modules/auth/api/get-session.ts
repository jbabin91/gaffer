import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { auth } from '#/modules/auth/lib/server';

export const getSessionFn = createServerFn({ method: 'GET' }).handler(() =>
  auth.api.getSession({ headers: getRequest().headers }),
);
