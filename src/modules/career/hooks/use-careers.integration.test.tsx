// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as dbClient from '#/db/client';
import { renderHookWithClient } from '#test/harness';

import { useCareers, useCreateCareer } from './use-careers';

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

beforeEach(async () => {
  dbRef.current = await dbClient.createMemoryDb();
});

describe('useCreateCareer', () => {
  it('invalidates the careers list so a new career appears', async () => {
    const { result } = renderHookWithClient(() => ({
      careers: useCareers(),
      create: useCreateCareer(),
    }));

    await waitFor(() => expect(result.current.careers.isSuccess).toBe(true));
    expect(result.current.careers.data).toHaveLength(0);

    await act(async () => {
      await result.current.create.mutateAsync({ name: 'New Career' });
    });

    await waitFor(() => expect(result.current.careers.data).toHaveLength(1));
    expect(result.current.careers.data?.[0]?.name).toBe('New Career');
  });
});
