// @vitest-environment jsdom
import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type DB } from '#/db/client';
import { type CreateCareerInput } from '#/modules/career/schemas/careers';
import { getTestDb, resetDb } from '#test/db';
import { renderHookWithClient } from '#test/harness';

import { useCareers, useCreateCareer } from './use-careers';

const dbRef = vi.hoisted(() => ({ current: null as DB | null }));

// Route the server-function api module to the services against the test db.
vi.mock('#/modules/career/api/careers', async () => {
  const svc = await import('#/modules/career/services/careers');
  return {
    createCareerFn: ({ data }: { data: CreateCareerInput }) =>
      svc.createCareer(dbRef.current!, data),
    listCareersFn: () => svc.listCareers(dbRef.current!),
  };
});

beforeEach(async () => {
  await resetDb();
  dbRef.current = getTestDb();
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
