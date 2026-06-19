'use client';

import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useEmailVerified } from '#/modules/auth/hooks/use-email-verified';

/**
 * ?verified=1 is user-spoofable, so gate on the real session before confirming,
 * then strip the param so refresh/back can't re-toast.
 */
export function useVerifiedToast() {
  const navigate = useNavigate();
  const { verified: verifiedParam } = useSearch({ from: '/_app' });
  const { verified } = useEmailVerified();
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (celebratedRef.current || verifiedParam !== '1' || !verified) return;
    celebratedRef.current = true;
    toast.success("Email verified — you're all set.");
    void navigate({
      replace: true,
      search: (prev) => ({ ...prev, verified: undefined }),
      to: '.',
    });
  }, [verified, verifiedParam, navigate]);
}
