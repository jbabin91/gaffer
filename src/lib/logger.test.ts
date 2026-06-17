import { describe, expect, it, vi } from 'vitest';

import { logError, logger, resolveLevel } from './logger';

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
});
