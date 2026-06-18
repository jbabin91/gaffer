'use client';

import { logError } from '#/lib/logging/logger';
import {
  type AuthSubmitErrors,
  NETWORK_ERROR_MESSAGE,
  RATE_LIMITED_MESSAGE,
} from '#/modules/auth/messages';

type AuthResultError = { code?: string; status?: number };

type UseAuthSubmitConfig<TValue> = {
  call: (value: TValue) => Promise<{ error: AuthResultError | null }>;
  /** Non-429 result errors → success, so account existence stays unobservable. */
  enumerationSafe?: boolean;
  logLabel: string;
  /** Maps a non-429 result error to user copy; omit on enumeration-safe forms. */
  mapError?: (error: AuthResultError) => AuthSubmitErrors;
};

/** Never surfaces `error.message` — all copy comes from curated message constants. */
export function useAuthSubmit<TValue>({
  call,
  enumerationSafe,
  logLabel,
  mapError,
}: UseAuthSubmitConfig<TValue>) {
  return async ({
    value,
  }: {
    value: TValue;
  }): Promise<AuthSubmitErrors | undefined> => {
    try {
      const { error } = await call(value);
      if (!error) return undefined;
      if (error.status === 429) return { form: RATE_LIMITED_MESSAGE };
      if (enumerationSafe) return undefined;
      return mapError?.(error);
    } catch (error) {
      logError(error, logLabel);
      return { form: NETWORK_ERROR_MESSAGE };
    }
  };
}
