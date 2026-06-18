import { createFileRoute, redirect } from '@tanstack/react-router';

import { getSessionFn } from '#/modules/auth/api/get-session';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn();
    if (!session) {
      throw redirect({ search: { redirect: location.href }, to: '/login' });
    }
  },
});
