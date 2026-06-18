'use client';

import { useNavigate, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { logError } from '#/lib/logging/logger';
import { authClient } from '#/modules/auth/lib/client';
import { SIGN_OUT_FAILED_MESSAGE } from '#/modules/auth/messages';

/** Signs out, then invalidates so the `_app` guard re-runs against the cleared session. */
export function useSignOut() {
  const navigate = useNavigate();
  const router = useRouter();

  return async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        logError(error, 'sign-out returned an error');
        toast.error(SIGN_OUT_FAILED_MESSAGE);
        return;
      }
      await router.invalidate();
      await navigate({ to: '/login' });
    } catch (error) {
      // Stay put rather than navigate and pretend the still-live session is gone.
      logError(error, 'sign-out request threw');
      toast.error(SIGN_OUT_FAILED_MESSAGE);
    }
  };
}
