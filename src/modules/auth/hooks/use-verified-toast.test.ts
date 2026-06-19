import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useVerifiedToast } from './use-verified-toast';

const navigate = vi.hoisted(() => vi.fn());
const useSearch = vi.hoisted(() => vi.fn());
const useEmailVerified = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  useSearch: () => useSearch(),
}));
vi.mock('sonner', () => ({ toast: { success: toastSuccess } }));
vi.mock('#/modules/auth/hooks/use-email-verified', () => ({
  useEmailVerified: () => useEmailVerified(),
}));

const signedIn = (verified: boolean) => ({ isSignedIn: true, verified });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useVerifiedToast', () => {
  it('confirms and strips the param on a verified fresh-land (?verified=1)', () => {
    useSearch.mockReturnValue({ verified: '1' });
    useEmailVerified.mockReturnValue(signedIn(true));

    renderHook(() => useVerifiedToast());

    expect(toastSuccess).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ replace: true, to: '.' }),
    );
  });

  it('fires once after the session resolves to verified with the param', () => {
    useSearch.mockReturnValue({ verified: '1' });
    useEmailVerified.mockReturnValue(signedIn(false));
    const { rerender } = renderHook(() => useVerifiedToast());
    expect(toastSuccess).not.toHaveBeenCalled();

    useEmailVerified.mockReturnValue(signedIn(true));
    rerender();

    expect(toastSuccess).toHaveBeenCalledOnce();
  });

  it('ignores a spoofed ?verified=1 while the session is unverified', () => {
    useSearch.mockReturnValue({ verified: '1' });
    useEmailVerified.mockReturnValue(signedIn(false));

    renderHook(() => useVerifiedToast());

    expect(toastSuccess).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not toast when verified without the param (no cross-tab toast)', () => {
    useSearch.mockReturnValue({});
    useEmailVerified.mockReturnValue(signedIn(true));

    renderHook(() => useVerifiedToast());

    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('ignores a present non-"1" param against a verified session', () => {
    // The schema is permissive, so ?verified=foo reaches the hook;
    // the `=== '1'` guard (not a truthiness check) must reject it.
    useSearch.mockReturnValue({ verified: 'foo' });
    useEmailVerified.mockReturnValue(signedIn(true));

    renderHook(() => useVerifiedToast());

    expect(toastSuccess).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not fire for a signed-out visitor on a shared ?verified=1 link', () => {
    useSearch.mockReturnValue({ verified: '1' });
    useEmailVerified.mockReturnValue({ isSignedIn: false, verified: false });

    renderHook(() => useVerifiedToast());

    expect(toastSuccess).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('strips only the verified param, preserving the rest of the search', () => {
    useSearch.mockReturnValue({ verified: '1' });
    useEmailVerified.mockReturnValue(signedIn(true));

    renderHook(() => useVerifiedToast());

    expect(navigate).toHaveBeenCalledOnce();
    const reduce = navigate.mock.calls[0]?.[0]?.search as (
      prev: Record<string, unknown>,
    ) => Record<string, unknown>;
    expect(reduce({ tab: 'x', verified: '1' })).toEqual({
      tab: 'x',
      verified: undefined,
    });
  });

  it('stays at one toast across later unrelated rerenders', () => {
    useSearch.mockReturnValue({ verified: '1' });
    useEmailVerified.mockReturnValue(signedIn(true));
    const { rerender } = renderHook(() => useVerifiedToast());

    rerender();
    rerender();

    expect(toastSuccess).toHaveBeenCalledOnce();
  });
});
