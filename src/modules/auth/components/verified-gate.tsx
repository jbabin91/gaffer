'use client';

import { type ReactNode } from 'react';

import { useEmailVerified } from '#/modules/auth/hooks/use-email-verified';

/**
 * Renders `children` once the user's email is verified, otherwise `fallback`.
 * Fail-closed: `verified` is false while the session loads, so the gated
 * fallback shows until verification is confirmed.
 */
export function VerifiedGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const { verified } = useEmailVerified();
  return verified ? children : fallback;
}
