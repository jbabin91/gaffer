import { describe, expect, it } from 'vitest';

import type { PlayerSnapshot } from '#/db/schema';

import { ratingDomain, toChartData } from './development-chart';

function snap(
  overrides: Partial<PlayerSnapshot> &
    Pick<PlayerSnapshot, 'inGameWeek' | 'overall'>,
): PlayerSnapshot {
  return {
    form: null,
    id: `snap-${overrides.inGameWeek}`,
    marketValueEur: null,
    playerId: 'p1',
    potential: null,
    recordedAt: new Date(0),
    seasonId: null,
    ...overrides,
  };
}

describe('toChartData', () => {
  it('sorts snapshots by in-game week', () => {
    const data = toChartData([
      snap({ inGameWeek: 5, overall: 70 }),
      snap({ inGameWeek: 1, overall: 66 }),
    ]);
    expect(data).toEqual([
      { overall: 66, potential: null, week: 1 },
      { overall: 70, potential: null, week: 5 },
    ]);
  });

  it('keeps potential and leaves missing values as null', () => {
    const data = toChartData([
      snap({ inGameWeek: 1, overall: 66, potential: 80 }),
      snap({ inGameWeek: 2, overall: 67 }),
    ]);
    expect(data.map((d) => d.potential)).toEqual([80, null]);
  });

  it('orders three or more out-of-order weeks', () => {
    const data = toChartData([
      snap({ inGameWeek: 3, overall: 70 }),
      snap({ inGameWeek: 1, overall: 66 }),
      snap({ inGameWeek: 2, overall: 68 }),
    ]);
    expect(data.map((d) => d.week)).toEqual([1, 2, 3]);
  });
});

describe('ratingDomain', () => {
  it('pads the rating range by two on each side', () => {
    expect(
      ratingDomain([
        snap({ inGameWeek: 1, overall: 66 }),
        snap({ inGameWeek: 2, overall: 72 }),
      ]),
    ).toEqual([64, 74]);
  });

  it('includes potential in the range', () => {
    expect(
      ratingDomain([snap({ inGameWeek: 1, overall: 66, potential: 88 })]),
    ).toEqual([64, 90]);
  });

  it('falls back to overall when potential is null', () => {
    expect(
      ratingDomain([
        snap({ inGameWeek: 1, overall: 60 }),
        snap({ inGameWeek: 2, overall: 80, potential: null }),
      ]),
    ).toEqual([58, 82]);
  });

  it('still yields a non-zero-width domain when all ratings are equal', () => {
    expect(ratingDomain([snap({ inGameWeek: 1, overall: 70 })])).toEqual([
      68, 72,
    ]);
  });

  it('clamps to the 0–99 scale', () => {
    expect(
      ratingDomain([snap({ inGameWeek: 1, overall: 1, potential: 98 })]),
    ).toEqual([0, 99]);
  });
});
