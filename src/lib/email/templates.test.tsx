import { render, toPlainText } from 'react-email';
import { describe, expect, it } from 'vitest';

import ResetPasswordEmail from './templates/reset-password';
import VerifyEmail from './templates/verify-email';

const ACTION_URL = 'https://app.example.com/verify-email?token=abc123';

describe('email templates', () => {
  it('renders the verification email with the action url in html and text', async () => {
    const html = await render(<VerifyEmail name="Sam" url={ACTION_URL} />);

    expect(html).toContain(ACTION_URL);
    expect(html).toContain('Verify your email');
    expect(html).toContain('Hi Sam,');
    // The Tailwind config inlines the brand color (render normalizes hex to
    // rgb), proving the className -> token mapping resolves.
    expect(html).toContain('rgb(37,99,235)');
    expect(toPlainText(html)).toContain(ACTION_URL);
  });

  it('greets generically when no name is given', async () => {
    const html = await render(<ResetPasswordEmail url={ACTION_URL} />);

    expect(html).toContain('Reset your password');
    expect(html).toContain('Hi,');
    expect(html).toContain(ACTION_URL);
    expect(toPlainText(html)).toContain(ACTION_URL);
  });
});
