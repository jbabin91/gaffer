// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as dbClient from '#/db/client';
import { createCareer } from '#/modules/career/api/careers';
import { renderHookWithClient } from '#test/harness';

import { useActiveCareer } from './use-active-career';

const STORAGE_KEY = 'fc:activeCareerId';
const dbRef = vi.hoisted(() => ({ current: null as dbClient.DB | null }));

vi.mock('#/db/client', async (importOriginal) => {
  const actual = await importOriginal<typeof dbClient>();
  return {
    ...actual,
    getDb: () => {
      if (!dbRef.current) throw new Error('test db not initialised');
      return Promise.resolve(dbRef.current);
    },
  };
});

let db: dbClient.DB;

beforeEach(async () => {
  localStorage.clear();
  db = await dbClient.createMemoryDb();
  dbRef.current = db;
});

describe('useActiveCareer', () => {
  it('resolves to the stored career when it still exists', async () => {
    const first = await createCareer(db, { name: 'First' });
    await createCareer(db, { name: 'Second' });
    // First is the older career, so it is not the most-recent default; getting
    // it back proves the stored id wins over the fallback.
    localStorage.setItem(STORAGE_KEY, first.id);

    const { result } = renderHookWithClient(() => useActiveCareer());

    await waitFor(() => expect(result.current.activeCareerId).toBe(first.id));
  });

  it('falls back to a career when the stored id was deleted', async () => {
    const only = await createCareer(db, { name: 'Only' });
    localStorage.setItem(STORAGE_KEY, 'does-not-exist');

    const { result } = renderHookWithClient(() => useActiveCareer());

    await waitFor(() => expect(result.current.activeCareerId).toBe(only.id));
  });

  it('degrades to a career when localStorage reads throw', async () => {
    const only = await createCareer(db, { name: 'Only' });
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage blocked');
      });

    const { result } = renderHookWithClient(() => useActiveCareer());

    await waitFor(() => expect(result.current.activeCareerId).toBe(only.id));
    getItem.mockRestore();
  });

  it('persists the selected career to localStorage', async () => {
    await createCareer(db, { name: 'First' });
    const second = await createCareer(db, { name: 'Second' });

    const { result } = renderHookWithClient(() => useActiveCareer());
    await waitFor(() => expect(result.current.careers).toHaveLength(2));

    act(() => result.current.selectCareer(second.id));

    await waitFor(() => expect(result.current.activeCareerId).toBe(second.id));
    expect(localStorage.getItem(STORAGE_KEY)).toBe(second.id);
  });
});
