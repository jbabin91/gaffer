import { createFileRoute, redirect } from '@tanstack/react-router';

import { getSessionFn } from '#/lib/auth/functions';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn();
    if (!session) {
      throw redirect({ search: { redirect: location.href }, to: '/login' });
    }
  },
});
