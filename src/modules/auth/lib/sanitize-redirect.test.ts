import { describe, expect, it } from 'vitest';

import { sanitizeRedirect } from '#/modules/auth/lib/sanitize-redirect';

describe('sanitizeRedirect', () => {
  it('keeps a same-site path', () => {
    expect(sanitizeRedirect('/players/abc')).toBe('/players/abc');
  });

  it.each([
    ['absolute http url', 'https://evil.example/phish'],
    ['protocol-relative host', '//evil.example'],
    ['backslash authority', String.raw`/\evil.example`],
    ['mixed slash-backslash authority', String.raw`/\/evil.example`],
    ['bare path without leading slash', 'players'],
    ['empty string', ''],
    ['non-string', 42],
    ['undefined', undefined],
  ])('falls back to / for %s', (_label, input) => {
    expect(sanitizeRedirect(input)).toBe('/');
  });
});
