'use client';

import { useNavigate, useRouter, useRouterState } from '@tanstack/react-router';
import { toast } from 'sonner';

import { Button } from '#/components/ui/button';
import { authClient } from '#/lib/auth/client';
import { SIGN_OUT_FAILED_MESSAGE } from '#/lib/auth/errors';
import { logError } from '#/lib/logger';

export function SignOutButton() {
  const navigate = useNavigate();
  const router = useRouter();
  // Header is global; only render inside the gated _app subtree.
  const inApp = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === '/_app'),
  });

  if (!inApp) return null;

  const signOut = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        logError(error, 'sign-out returned an error');
        toast.error(SIGN_OUT_FAILED_MESSAGE);
        return;
      }
      // Invalidate before navigating so the _app guard re-runs against the cleared session.
      await router.invalidate();
      await navigate({ to: '/login' });
    } catch (error) {
      // Stay put rather than navigate and pretend the still-live session is gone.
      logError(error, 'sign-out request threw');
      toast.error(SIGN_OUT_FAILED_MESSAGE);
    }
  };

  return (
    <Button intent="outline" size="sm" onPress={() => void signOut()}>
      Sign out
    </Button>
  );
}
