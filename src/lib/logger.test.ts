import { describe, expect, it } from 'vitest';

import { resolveLevel } from './logger';

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
