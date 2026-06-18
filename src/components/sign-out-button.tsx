'use client';

import { useNavigate, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { Button } from '#/components/ui/button';
import { authClient } from '#/lib/auth/client';
import { SIGN_OUT_FAILED_MESSAGE } from '#/lib/auth/errors';
import { logError } from '#/lib/logger';

export function SignOutButton() {
  const navigate = useNavigate();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) return null;

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
