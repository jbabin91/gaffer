import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SIGN_OUT_FAILED_MESSAGE } from '#/lib/auth/errors';

import { SignOutButton } from './sign-out-button';

const navigate = vi.hoisted(() => vi.fn());
const invalidate = vi.hoisted(() => vi.fn());
const signOut = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const logError = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  useRouter: () => ({ invalidate }),
}));
vi.mock('sonner', () => ({ toast: { error: toastError } }));
vi.mock('#/lib/auth/client', () => ({
  authClient: { signOut, useSession: () => ({ data: { user: { id: 'u1' } } }) },
}));
vi.mock('#/lib/logger', () => ({ logError }));

function clickSignOut() {
  render(<SignOutButton />);
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
}

describe('SignOutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs out and navigates to /login on success', async () => {
    signOut.mockResolvedValue({ error: null });

    clickSignOut();

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/login' }),
    );
    expect(invalidate).toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it('toasts and stays put when sign-out returns an error', async () => {
    signOut.mockResolvedValue({ error: { message: 'server said no' } });

    clickSignOut();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(SIGN_OUT_FAILED_MESSAGE),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
  });

  it('toasts and stays put when sign-out throws', async () => {
    signOut.mockRejectedValue(new Error('network down'));

    clickSignOut();

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(SIGN_OUT_FAILED_MESSAGE),
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
  });
});
