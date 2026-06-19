import { describe, expect, it } from 'vitest';

import { verifiedSearchSchema } from './verified-search';

describe('verifiedSearchSchema', () => {
  it('coerces the JSON-parsed numeric ?verified=1 to the string flag', () => {
    expect(verifiedSearchSchema.parse({ verified: 1 })).toEqual({
      verified: '1',
    });
  });

  it('accepts a malformed value without throwing', () => {
    expect(verifiedSearchSchema.parse({ verified: 'foo' })).toEqual({
      verified: 'foo',
    });
  });

  it('coerces a non-primitive (the JSON parser can emit arrays) without throwing', () => {
    // ?verified[]=1&verified[]=2 parses to [1,2]; coerce stringifies to '1,2'
    // rather than throwing, keeping the _app layout intact.
    expect(verifiedSearchSchema.parse({ verified: [1, 2] })).toEqual({
      verified: '1,2',
    });
  });

  it('leaves the param undefined when absent', () => {
    expect(verifiedSearchSchema.parse({}).verified).toBeUndefined();
  });
});
