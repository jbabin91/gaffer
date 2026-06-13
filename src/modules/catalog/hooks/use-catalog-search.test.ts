import { describe, expect, it } from 'vitest';

import { catalogQueries } from './use-catalog-search';

describe('catalogQueries.search', () => {
  it('enables only for terms of two or more non-space characters', () => {
    expect(catalogQueries.search('a').enabled).toBe(false);
    expect(catalogQueries.search(' x ').enabled).toBe(false);
    expect(catalogQueries.search('me').enabled).toBe(true);
  });

  it('opts out of the global throwOnError so a search failure degrades inline', () => {
    expect(catalogQueries.search('messi').throwOnError).toBe(false);
  });
});
