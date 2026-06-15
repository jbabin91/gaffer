import { describe, expect, it } from 'vitest';

import {
  addPlayerInput,
  recordSnapshotInput,
} from '#/modules/player/schemas/players';

// The columns are plain integer/text, so these zod bounds are the only guard against bad ratings and empty names.
describe('addPlayerInput', () => {
  it('requires a non-empty name; other fields are optional', () => {
    expect(addPlayerInput.safeParse({}).success).toBe(false);
    expect(addPlayerInput.safeParse({ name: '' }).success).toBe(false);
    expect(addPlayerInput.safeParse({ name: 'Striker' }).success).toBe(true);
  });

  it('bounds ratings to integers 0-99', () => {
    expect(addPlayerInput.safeParse({ name: 'X', overall: 0 }).success).toBe(
      true,
    );
    expect(addPlayerInput.safeParse({ name: 'X', overall: 99 }).success).toBe(
      true,
    );
    expect(addPlayerInput.safeParse({ name: 'X', overall: -1 }).success).toBe(
      false,
    );
    expect(addPlayerInput.safeParse({ name: 'X', overall: 100 }).success).toBe(
      false,
    );
    expect(addPlayerInput.safeParse({ name: 'X', overall: 80.5 }).success).toBe(
      false,
    );
  });
});

describe('recordSnapshotInput', () => {
  it('requires inGameWeek and overall', () => {
    expect(recordSnapshotInput.safeParse({ overall: 80 }).success).toBe(false);
    expect(recordSnapshotInput.safeParse({ inGameWeek: 0 }).success).toBe(
      false,
    );
    expect(
      recordSnapshotInput.safeParse({ inGameWeek: 0, overall: 80 }).success,
    ).toBe(true);
  });

  it('bounds overall and potential to 0-99', () => {
    expect(
      recordSnapshotInput.safeParse({ inGameWeek: 1, overall: 100 }).success,
    ).toBe(false);
    expect(
      recordSnapshotInput.safeParse({
        inGameWeek: 1,
        overall: 80,
        potential: 120,
      }).success,
    ).toBe(false);
  });
});
