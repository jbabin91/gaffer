import { describe, expect, it } from 'vitest';

import { createCareerInput } from '#/modules/career/schemas/careers';

describe('createCareerInput', () => {
  it('requires a non-empty name', () => {
    expect(createCareerInput.safeParse({}).success).toBe(false);
    expect(createCareerInput.safeParse({ name: '' }).success).toBe(false);
    expect(createCareerInput.safeParse({ name: 'Rebuild' }).success).toBe(true);
  });

  it('accepts the optional manager, club, and season fields', () => {
    const result = createCareerInput.safeParse({
      clubName: 'Newcastle',
      managerName: 'Eddie',
      name: 'Rebuild',
      seasonLabel: '2025/26',
    });
    expect(result.success).toBe(true);
  });
});
