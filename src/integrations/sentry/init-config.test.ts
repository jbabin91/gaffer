import { afterEach, describe, expect, it, vi } from 'vitest';

import { sentryInitConfig } from './init-config';

const DSN = 'https://k@o.ingest.sentry.io/1';

describe('sentryInitConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('routes beforeSend through the scrubber', () => {
    const config = sentryInitConfig({ dsn: DSN, tracesSampleRate: undefined });

    expect(
      config.beforeSend?.({ extra: { token: 's' }, type: undefined }),
    ).toMatchObject({ extra: { token: '[redacted]' } });
  });

  it('routes beforeSendLog through the scrubber', () => {
    const config = sentryInitConfig({ dsn: DSN, tracesSampleRate: undefined });

    const scrubbed = config.beforeSendLog?.({
      attributes: { token: 's' },
      level: 'info',
      message: 'm',
    });

    expect(scrubbed?.attributes?.token).toBe('[redacted]');
  });

  it('disables Sentry when no DSN is configured', () => {
    expect(
      sentryInitConfig({ dsn: undefined, tracesSampleRate: undefined }).enabled,
    ).toBe(false);
  });

  it('stays disabled outside prod even when a DSN is present', () => {
    expect(
      sentryInitConfig({ dsn: DSN, tracesSampleRate: undefined }).enabled,
    ).toBe(false);
  });

  it('enables Sentry and defaults the trace rate to 0.1 in prod', () => {
    vi.stubEnv('PROD', true);

    const config = sentryInitConfig({ dsn: DSN, tracesSampleRate: undefined });

    expect(config.enabled).toBe(true);
    expect(config.tracesSampleRate).toBe(0.1);
  });

  it('defaults the trace rate to 1 outside prod', () => {
    expect(
      sentryInitConfig({ dsn: DSN, tracesSampleRate: undefined })
        .tracesSampleRate,
    ).toBe(1);
  });

  it('tags events with the build mode and enables log forwarding', () => {
    const config = sentryInitConfig({ dsn: DSN, tracesSampleRate: undefined });

    expect(config.environment).toBe(import.meta.env.MODE);
    expect(config.enableLogs).toBe(true);
  });

  it('passes the DSN through and honors an explicit trace rate', () => {
    const config = sentryInitConfig({ dsn: DSN, tracesSampleRate: 0.5 });

    expect(config.dsn).toBe(DSN);
    expect(config.tracesSampleRate).toBe(0.5);
  });
});
