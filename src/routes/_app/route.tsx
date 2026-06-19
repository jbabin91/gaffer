import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getSessionFn } from '#/modules/auth/api/get-session';
import { VerificationBanner } from '#/modules/auth/components/verification-banner';
import { useVerifiedToast } from '#/modules/auth/hooks/use-verified-toast';
import { verifiedSearchSchema } from '#/modules/auth/schemas/verified-search';

export const Route = createFileRoute('/_app')({
  validateSearch: verifiedSearchSchema,
  component: AppLayout,
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn();
    if (!session) {
      throw redirect({ search: { redirect: location.href }, to: '/login' });
    }
  },
});

function AppLayout() {
  useVerifiedToast();

  return (
    <>
      <VerificationBanner />
      <Outlet />
    </>
  );
}
