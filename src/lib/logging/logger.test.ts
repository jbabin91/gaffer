import pino from 'pino';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SECRET_KEYS } from '#/configs/secret-keys';

import { logError, logger, REDACT_PATHS, resolveLevel } from './logger';

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(() => ''),
}));
vi.mock('@sentry/tanstackstart-react', () => ({ captureException }));

describe('resolveLevel', () => {
  it('honors a valid LOG_LEVEL regardless of environment', () => {
    expect(resolveLevel('warn', false)).toBe('warn');
    expect(resolveLevel('silent', true)).toBe('silent');
  });

  it('falls back to the environment default on an unknown LOG_LEVEL', () => {
    expect(resolveLevel('verbose', true)).toBe('debug');
    expect(resolveLevel('verbose', false)).toBe('info');
  });

  it('defaults to debug in dev and info in prod when unset', () => {
    expect(resolveLevel(undefined, true)).toBe('debug');
    expect(resolveLevel(undefined, false)).toBe('info');
  });

  it('treats an empty-string LOG_LEVEL as unset', () => {
    expect(resolveLevel('', true)).toBe('debug');
    expect(resolveLevel('', false)).toBe('info');
  });
});

describe('logError', () => {
  it('forwards the cause under err so the redact list and serializers apply', () => {
    const spy = vi.spyOn(logger, 'error').mockImplementation(() => {});
    const cause = new Error('boom');

    logError(cause, 'something failed');

    expect(spy).toHaveBeenCalledWith({ err: cause }, 'something failed');
    spy.mockRestore();
  });

  it('tolerates a non-Error cause without throwing', () => {
    const spy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    expect(() => logError('plain string', 'odd cause')).not.toThrow();
    expect(spy).toHaveBeenCalledWith({ err: 'plain string' }, 'odd cause');
    spy.mockRestore();
  });

  it('swallows a logger failure so it never throws into the caller', () => {
    const spy = vi.spyOn(logger, 'error').mockImplementation(() => {
      throw new Error('transport down');
    });

    expect(() => logError(new Error('boom'), 'something failed')).not.toThrow();
    spy.mockRestore();
  });

  describe('Sentry forwarding gated on PROD', () => {
    beforeEach(() => {
      captureException.mockClear();
      vi.spyOn(logger, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('does not forward to Sentry outside prod (dev sink is pino)', () => {
      logError(new Error('boom'), 'something failed');

      expect(captureException).not.toHaveBeenCalled();
    });

    it('forwards the cause to Sentry in prod', () => {
      vi.stubEnv('PROD', true);
      const cause = new Error('boom');

      logError(cause, 'something failed');

      expect(captureException).toHaveBeenCalledWith(cause);
    });
  });
});

function captureLog(payload: Record<string, unknown>): string {
  let line = '';
  const log = pino(
    { redact: REDACT_PATHS },
    {
      write(chunk: string) {
        line = chunk;
      },
    },
  );

  log.info(payload, 'msg');
  return line;
}

describe('server log redaction (REDACT_PATHS)', () => {
  it.each(SECRET_KEYS)(
    'redacts %s at the top level and one level deep',
    (key) => {
      const line = captureLog({
        deep: { [key]: 'topsecret' },
        [key]: 'topsecret',
      });

      expect(line).not.toContain('topsecret');
      expect(line).toContain('[Redacted]');
    },
  );

  it('redacts the two-level header carriers the wildcards miss', () => {
    const line = captureLog({
      req: {
        headers: { authorization: 'Bearer topsecret', cookie: 's=topsecret' },
      },
    });

    expect(line).not.toContain('topsecret');
    expect(line).toContain('[Redacted]');
  });

  it('leaves non-secret fields intact', () => {
    expect(captureLog({ status: 'ok-200' })).toContain('ok-200');
  });

  it('does not redact a non-header secret two levels deep (shallow by design)', () => {
    // fast-redact wildcards match one level, so a secret nested past *.key and
    // not under headers leaks server-side; depth is the Sentry scrubber's job.
    // Pins the deliberate pino-vs-scrubber asymmetry so a redact-list change can't
    // silently alter the depth contract.
    expect(captureLog({ body: { user: { token: 'topsecret' } } })).toContain(
      'topsecret',
    );
  });
});
