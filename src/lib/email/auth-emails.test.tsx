import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendPasswordResetEmail, sendVerificationEmail } from './auth-emails';
import { sendEmail } from './transport';

vi.mock('./transport', () => ({ sendEmail: vi.fn() }));

const mockedSend = vi.mocked(sendEmail);

beforeEach(() => {
  mockedSend.mockReset();
});

describe('auth emails', () => {
  it('sends a verification email with subject, recipient, url, and rendered body', async () => {
    const url = 'https://app.example.com/verify-email?token=t';
    await sendVerificationEmail({ name: 'Sam', to: 'sam@example.com', url });

    expect(mockedSend).toHaveBeenCalledOnce();
    const message = mockedSend.mock.calls[0]?.[0];
    expect(message).toMatchObject({
      subject: 'Verify your email address',
      to: 'sam@example.com',
      url,
    });
    expect(message?.html).toContain(url);
    expect(message?.text).toContain(url);
  });

  it('sends a password-reset email with the url in subject, html, and text', async () => {
    const url = 'https://app.example.com/reset-password/t';
    await sendPasswordResetEmail({ to: 'sam@example.com', url });

    expect(mockedSend).toHaveBeenCalledOnce();
    const message = mockedSend.mock.calls[0]?.[0];
    expect(message).toMatchObject({
      subject: 'Reset your password',
      to: 'sam@example.com',
      url,
    });
    expect(message?.html).toContain(url);
    expect(message?.text).toContain(url);
  });

  it('propagates a transport failure to the caller', async () => {
    mockedSend.mockRejectedValueOnce(new Error('smtp down'));

    await expect(
      sendPasswordResetEmail({
        to: 'x@example.com',
        url: 'https://app.example.com/reset-password/t',
      }),
    ).rejects.toThrow('smtp down');
  });
});
