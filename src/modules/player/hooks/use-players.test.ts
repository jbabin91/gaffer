import { describe, expect, it } from 'vitest';

import { playerQueries } from './use-players';

describe('playerQueries keys', () => {
  it('nests snapshots under detail so one invalidation refreshes both', () => {
    const detail = playerQueries.detail('p1').queryKey;
    const snapshots = playerQueries.snapshots('p1').queryKey;
    expect(snapshots.slice(0, detail.length)).toEqual(detail);
  });

  it('nests squad under squads', () => {
    const squads = playerQueries.squads();
    const squad = playerQueries.squad('c1').queryKey;
    expect(squad.slice(0, squads.length)).toEqual(squads);
  });
});
