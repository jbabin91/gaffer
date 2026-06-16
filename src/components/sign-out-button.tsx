'use client';

import { useNavigate, useRouter, useRouterState } from '@tanstack/react-router';

import { Button } from '#/components/ui/button';
import { authClient } from '#/lib/auth/client';

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
      if (error) return;
      // Invalidate before navigating so the _app guard re-runs against the cleared session.
      await router.invalidate();
      await navigate({ to: '/login' });
    } catch {
      // Surfacing a failed sign-out is gf-vy9; until then stay put rather than
      // navigate and pretend the still-live session is gone.
    }
  };

  return (
    <Button intent="outline" size="sm" onPress={() => void signOut()}>
      Sign out
    </Button>
  );
}
