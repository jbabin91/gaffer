import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  NETWORK_ERROR_MESSAGE,
  RATE_LIMITED_MESSAGE,
  VERIFICATION_SEND_FAILED_MESSAGE,
} from '#/modules/auth/messages';

import { VerificationBanner } from './verification-banner';

const useSession = vi.hoisted(() => vi.fn());
const sendVerificationEmail = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const toastInfo = vi.hoisted(() => vi.fn());
const logError = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({
  toast: { error: toastError, info: toastInfo, success: toastSuccess },
}));
vi.mock('#/modules/auth/lib/client', () => ({
  authClient: { sendVerificationEmail, useSession },
}));
vi.mock('#/lib/logging/logger', () => ({ logError }));

const session = (emailVerified: boolean) => ({
  data: { user: { email: 'sam@example.com', emailVerified } },
  isPending: false,
});

describe('VerificationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the reminder with the destination email when unverified', () => {
    useSession.mockReturnValue(session(false));

    render(<VerificationBanner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/sam@example\.com/)).toBeInTheDocument();
  });

  it('renders nothing when the email is verified', () => {
    useSession.mockReturnValue(session(true));

    const { container } = render(<VerificationBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when signed out', () => {
    useSession.mockReturnValue({ data: null, isPending: false });

    const { container } = render(<VerificationBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it('hides when dismissed', () => {
    useSession.mockReturnValue(session(false));

    render(<VerificationBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('requests a link, confirms, and enters cooldown', async () => {
    useSession.mockReturnValue(session(false));
    sendVerificationEmail.mockResolvedValue({ error: null });

    render(<VerificationBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }));

    await waitFor(() =>
      expect(sendVerificationEmail).toHaveBeenCalledWith({
        callbackURL: '/squad',
        email: 'sam@example.com',
      }),
    );
    expect(toastSuccess).toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Resend in/ }),
      ).toBeInTheDocument(),
    );
  });

  it('surfaces the rate-limit message on a 429 without logging', async () => {
    useSession.mockReturnValue(session(false));
    sendVerificationEmail.mockResolvedValue({ error: { status: 429 } });

    render(<VerificationBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(RATE_LIMITED_MESSAGE),
    );
    expect(logError).not.toHaveBeenCalled();
  });

  it('logs and shows generic copy on a non-429 send rejection', async () => {
    useSession.mockReturnValue(session(false));
    sendVerificationEmail.mockResolvedValue({ error: { status: 500 } });

    render(<VerificationBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(VERIFICATION_SEND_FAILED_MESSAGE),
    );
    expect(logError).toHaveBeenCalled();
  });

  it('logs and shows the network message when the send throws', async () => {
    useSession.mockReturnValue(session(false));
    sendVerificationEmail.mockRejectedValue(new Error('offline'));

    render(<VerificationBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE),
    );
    expect(logError).toHaveBeenCalled();
  });

  it('confirms once a shown-unverified user becomes verified', () => {
    useSession.mockReturnValue(session(false));
    const { rerender } = render(<VerificationBanner />);
    expect(toastSuccess).not.toHaveBeenCalled();

    useSession.mockReturnValue(session(true));
    rerender(<VerificationBanner />);

    expect(toastSuccess).toHaveBeenCalledOnce();
  });

  it('does not confirm for a user already verified on mount', () => {
    useSession.mockReturnValue(session(true));

    render(<VerificationBanner />);

    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
