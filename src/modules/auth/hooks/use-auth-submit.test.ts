import { describe, expect, it, vi } from 'vitest';

import { useAuthSubmit } from '#/modules/auth/hooks/use-auth-submit';
import {
  NETWORK_ERROR_MESSAGE,
  RATE_LIMITED_MESSAGE,
} from '#/modules/auth/messages';

const logError = vi.hoisted(() => vi.fn());
vi.mock('#/lib/logging/logger', () => ({ logError }));

const value = { email: 'boss@example.com' };

describe('useAuthSubmit', () => {
  it('returns undefined (success) when the call has no error', async () => {
    const submit = useAuthSubmit({
      call: () => Promise.resolve({ error: null }),
      logLabel: 'test',
      mapError: () => ({ form: 'unused' }),
    });

    expect(await submit({ value })).toBeUndefined();
  });

  it('maps a 429 to the rate-limit message, ahead of mapError', async () => {
    const submit = useAuthSubmit({
      call: () => Promise.resolve({ error: { status: 429 } }),
      logLabel: 'test',
      mapError: () => ({ form: 'should not be used' }),
    });

    expect(await submit({ value })).toEqual({ form: RATE_LIMITED_MESSAGE });
  });

  it('routes a non-429 result error through the page mapError', async () => {
    const submit = useAuthSubmit({
      call: () =>
        Promise.resolve({ error: { code: 'INVALID_INVITE', status: 400 } }),
      logLabel: 'test',
      mapError: (error) => ({ fields: { inviteCode: error.code ?? '' } }),
    });

    expect(await submit({ value })).toEqual({
      fields: { inviteCode: 'INVALID_INVITE' },
    });
  });

  it('treats a non-429 error as success when enumerationSafe, but still surfaces 429', async () => {
    const safe = useAuthSubmit({
      call: () => Promise.resolve({ error: { status: 500 } }),
      enumerationSafe: true,
      logLabel: 'test',
    });
    expect(await safe({ value })).toBeUndefined();

    const safeRateLimited = useAuthSubmit({
      call: () => Promise.resolve({ error: { status: 429 } }),
      enumerationSafe: true,
      logLabel: 'test',
    });
    expect(await safeRateLimited({ value })).toEqual({
      form: RATE_LIMITED_MESSAGE,
    });
  });

  it('logs and returns the network message when the call throws', async () => {
    logError.mockClear();
    const submit = useAuthSubmit({
      call: () => Promise.reject(new Error('network down')),
      logLabel: 'sign-in request failed',
      mapError: () => ({ form: 'unused' }),
    });

    expect(await submit({ value })).toEqual({ form: NETWORK_ERROR_MESSAGE });
    expect(logError).toHaveBeenCalled();
  });
});
