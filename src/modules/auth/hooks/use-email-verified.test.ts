import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useEmailVerified } from './use-email-verified';

const useSession = vi.hoisted(() => vi.fn());
vi.mock('#/modules/auth/lib/client', () => ({ authClient: { useSession } }));

describe('useEmailVerified', () => {
  it('fails closed while the session is loading', () => {
    useSession.mockReturnValue({ data: null, isPending: true });

    const { result } = renderHook(() => useEmailVerified());

    expect(result.current.verified).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
  });

  it('reports verified for a confirmed session', () => {
    useSession.mockReturnValue({
      data: { user: { email: 'a@b.com', emailVerified: true } },
      isPending: false,
    });

    const { result } = renderHook(() => useEmailVerified());

    expect(result.current.verified).toBe(true);
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.email).toBe('a@b.com');
  });

  it('reports unverified for a signed-in but unconfirmed session', () => {
    useSession.mockReturnValue({
      data: { user: { email: 'a@b.com', emailVerified: false } },
      isPending: false,
    });

    const { result } = renderHook(() => useEmailVerified());

    expect(result.current.verified).toBe(false);
    expect(result.current.isSignedIn).toBe(true);
  });
});
