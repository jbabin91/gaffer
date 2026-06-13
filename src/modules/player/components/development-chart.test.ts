import { describe, expect, it } from 'vitest';

import { ratingTicks } from './development-chart';

describe('ratingTicks', () => {
  it('uses a step of 2 for a narrow span', () => {
    expect(ratingTicks(60, 66)).toEqual([60, 62, 64, 66]);
  });

  it('uses a step of 5 for a medium span', () => {
    expect(ratingTicks(60, 78)).toEqual([60, 65, 70, 75]);
  });

  it('uses a step of 10 for a wide span', () => {
    expect(ratingTicks(40, 99)).toEqual([40, 50, 60, 70, 80, 90]);
  });

  it('aligns the first tick to the step boundary', () => {
    expect(ratingTicks(61, 70)).toEqual([65, 70]);
  });
});
