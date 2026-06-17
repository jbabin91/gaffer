import { describe, expect, it } from 'vitest';

import { SECRET_KEYS } from '#/configs/secret-keys';

import { scrubSentryPayload } from './scrub';

describe('scrubSentryPayload', () => {
  it.each(SECRET_KEYS)('redacts the %s key', (key) => {
    expect(scrubSentryPayload({ [key]: 'x' })).toEqual({ [key]: '[redacted]' });
  });

  it('redacts secret-bearing keys case-insensitively at depth', () => {
    const scrubbed = scrubSentryPayload({
      request: {
        headers: { Authorization: 'Bearer abc', cookie: 'session=xyz' },
      },
    });

    expect(scrubbed.request.headers.Authorization).toBe('[redacted]');
    expect(scrubbed.request.headers.cookie).toBe('[redacted]');
  });

  it('redacts secrets inside arrays', () => {
    const scrubbed = scrubSentryPayload({
      breadcrumbs: [{ data: { token: 't' } }, { data: { ok: 1 } }],
    });

    expect(scrubbed.breadcrumbs[0].data.token).toBe('[redacted]');
    expect(scrubbed.breadcrumbs[1].data.ok).toBe(1);
  });

  it('truncates plain containers past the depth bound so deep secrets cannot leak', () => {
    // Bury a secret deeper than MAX_DEPTH (8); the subtree is dropped wholesale.
    let deep: Record<string, unknown> = { password: 'leak' };
    for (let i = 0; i < 12; i++) deep = { nested: deep };

    const json = JSON.stringify(scrubSentryPayload(deep));

    expect(json).toContain('[truncated]');
    expect(json).not.toContain('leak');
  });

  it('redacts secrets inside nested arrays past the depth bound', () => {
    let deep: unknown = { token: 'leak' };
    for (let i = 0; i < 12; i++) deep = [deep];

    const json = JSON.stringify(scrubSentryPayload({ trail: deep }));

    expect(json).toContain('[truncated]');
    expect(json).not.toContain('leak');
  });

  it.each([
    { container: new Map([['authorization', 'Bearer leak']]), label: 'Map' },
    { container: new Headers({ Cookie: 'session=leak' }), label: 'Headers' },
    {
      container: new URLSearchParams({ token: 'leak' }),
      label: 'URLSearchParams',
    },
  ])('redacts a secret key carried on a $label', ({ container }) => {
    const json = JSON.stringify(scrubSentryPayload({ extra: { container } }));

    expect(json).not.toContain('leak');
    expect(json).toContain('[redacted]');
  });

  it('recurses into Set members so a nested secret is still caught', () => {
    const scrubbed = scrubSentryPayload({
      tags: new Set([{ password: 'leak' }, { ok: 1 }]),
    });

    expect(JSON.stringify(scrubbed)).not.toContain('leak');
  });

  it('does not parse string leaves — a secret embedded in message text survives', () => {
    // Sentry serializes an exception's message into an enumerable string before
    // beforeSend; scrubbing redacts by key, not by content, so the string passes
    // through. Pins the fail-open boundary: callers must not embed secrets in text.
    const event = {
      exception: { values: [{ value: 'auth failed: token=abc123' }] },
    };

    expect(scrubSentryPayload(event)).toEqual(event);
  });

  it('leaves Date and RegExp leaves intact instead of flattening to {}', () => {
    const date = new Date('2026-01-01');
    const pattern = /secret/gi;

    expect(scrubSentryPayload({ when: date }).when).toBe(date);
    expect(scrubSentryPayload({ match: pattern }).match).toBe(pattern);
  });

  it('redacts secrets riding on an Error or class instance', () => {
    // A fetch/axios-style error carries auth on a non-plain object property.
    const err = Object.assign(new Error('request failed'), {
      config: { headers: { authorization: 'Bearer leak' } },
    });

    const json = JSON.stringify(scrubSentryPayload({ extra: { err } }));

    expect(json).not.toContain('Bearer leak');
    expect(json).toContain('[redacted]');
  });

  it('never throws — a payload with a throwing getter is returned, not dropped', () => {
    const payload = {
      get boom(): string {
        throw new Error('getter blew up');
      },
    };

    expect(() => scrubSentryPayload(payload)).not.toThrow();
  });

  it('isolates a throwing getter to its own key, still scrubbing siblings', () => {
    // The getter read must stay inside the per-key try: a sibling secret must
    // still be redacted, not shipped raw because one property threw.
    const payload = {
      get boom(): string {
        throw new Error('getter blew up');
      },
      password: 'leak',
      safe: 'keep',
    };

    const result = scrubSentryPayload(payload) as Record<string, unknown>;

    expect(result.password).toBe('[redacted]');
    expect(result.boom).toBe('[truncated]');
    expect(result.safe).toBe('keep');
    expect(result.scrub_failed).toBeUndefined();
  });

  it('flags and returns the payload when scrubbing itself throws', () => {
    // A throwing ownKeys trap blows up Object.keys, escaping the per-key catch.
    const payload = new Proxy({} as Record<string, unknown>, {
      ownKeys() {
        throw new Error('ownKeys blew up');
      },
    });

    const result = scrubSentryPayload(payload);

    expect(result).toBe(payload);
    expect(result.scrub_failed).toBe(true);
  });

  it('leaves payloads without secrets untouched', () => {
    const event = { level: 'error', message: 'boom' };

    expect(scrubSentryPayload(event)).toEqual(event);
  });

  it('tolerates null and primitive values without throwing', () => {
    expect(() => scrubSentryPayload({ a: null, b: 1, c: 'x' })).not.toThrow();
  });
});
