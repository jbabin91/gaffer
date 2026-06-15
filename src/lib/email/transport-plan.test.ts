import { describe, expect, it } from 'vitest';

import { planEmailTransport } from './transport-plan';

describe('planEmailTransport', () => {
  it('logs in dev when no transport is configured', () => {
    expect(planEmailTransport({ isProd: false })).toEqual({ kind: 'log' });
  });

  it('throws in prod when no transport is configured', () => {
    expect(() => planEmailTransport({ isProd: true })).toThrow(
      /no email transport configured/i,
    );
  });

  it('routes through Cloudflare SMTP when CF_EMAIL_TOKEN is set', () => {
    const plan = planEmailTransport({
      cfEmailToken: 'cf-token',
      emailFrom: 'noreply@example.com',
      isProd: true,
    });

    expect(plan).toEqual({
      connection: {
        auth: { pass: 'cf-token', user: 'api_token' },
        host: 'smtp.mx.cloudflare.net',
        port: 465,
        secure: true,
      },
      from: 'noreply@example.com',
      kind: 'smtp',
    });
  });

  it('prefers a configured transport over the dev log path', () => {
    const plan = planEmailTransport({
      cfEmailToken: 'cf-token',
      emailFrom: 'noreply@example.com',
      isProd: false,
    });

    expect(plan).toMatchObject({ kind: 'smtp' });
  });

  it('prefers SMTP_URL over CF_EMAIL_TOKEN', () => {
    const plan = planEmailTransport({
      cfEmailToken: 'cf-token',
      emailFrom: 'noreply@example.com',
      isProd: false,
      smtpUrl: 'smtp://user:pass@smtp2go.example:587',
    });

    expect(plan).toEqual({
      connection: 'smtp://user:pass@smtp2go.example:587',
      from: 'noreply@example.com',
      kind: 'smtp',
    });
  });

  it('throws when an SMTP transport is set without EMAIL_FROM', () => {
    expect(() =>
      planEmailTransport({ cfEmailToken: 'cf-token', isProd: false }),
    ).toThrow(/EMAIL_FROM is required/i);
  });

  it('throws when SMTP_URL is set without EMAIL_FROM', () => {
    expect(() =>
      planEmailTransport({ isProd: false, smtpUrl: 'smtp://mail.example:587' }),
    ).toThrow(/EMAIL_FROM is required/i);
  });
});
