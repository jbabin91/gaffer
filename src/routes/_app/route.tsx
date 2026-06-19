import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getSessionFn } from '#/modules/auth/api/get-session';
import { VerificationBanner } from '#/modules/auth/components/verification-banner';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn();
    if (!session) {
      throw redirect({ search: { redirect: location.href }, to: '/login' });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <VerificationBanner />
      <Outlet />
    </>
  );
}
