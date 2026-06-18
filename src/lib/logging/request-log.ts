import '@tanstack/react-start/server-only';

import { isLoggableError } from './is-loggable-error';

type RequestLogger = {
  error: (fields: Record<string, unknown>, message: string) => void;
  info: (fields: Record<string, unknown>, message: string) => void;
};

export type RequestLogBase = {
  fn: string | undefined;
  handlerType: 'router' | 'serverFn';
  method: string;
  pathname: string;
};

type RequestOutcome = { durationMs: number; error?: unknown; status?: number };

/**
 * A loggable thrown error or a 5xx response is a fault (error level, err attached);
 * everything else — success, redirects, notFound control flow — logs at info.
 * Logging failures fall back to a minimal line so they never change the request outcome.
 */
export function emitRequestLog(
  logger: RequestLogger,
  base: RequestLogBase,
  fields: Record<string, unknown>,
  outcome: RequestOutcome,
): void {
  try {
    const loggableError =
      outcome.error !== undefined && isLoggableError(outcome.error);
    const isFault =
      loggableError || (outcome.status !== undefined && outcome.status >= 500);
    // base and outcome win over accumulated fields so a stray addRequestFields
    // can't clobber the canonical dimensions.
    const line = {
      ...fields,
      ...base,
      durationMs: outcome.durationMs,
      status: outcome.status,
    };
    if (isFault) {
      logger.error(
        loggableError ? { ...line, err: outcome.error } : line,
        'request',
      );
    } else {
      logger.info(line, 'request');
    }
  } catch (error) {
    try {
      logger.error({ err: error }, 'request-log emit failed');
    } catch {
      // Logger is broken — drop the line rather than change the request outcome.
    }
  }
}

/** Emits a request log for both success and failure, then re-throws on failure. */
export async function runInstrumented<
  TResult extends { response: { status: number } },
>(
  logger: RequestLogger,
  base: RequestLogBase,
  fields: Record<string, unknown>,
  next: () => TResult | Promise<TResult>,
): Promise<TResult> {
  const start = performance.now();
  try {
    // await inside the try so a rejected async next() and a sync throw both
    // reach the catch.
    const result = await next();
    emitRequestLog(logger, base, fields, {
      durationMs: Math.round(performance.now() - start),
      status: result.response.status,
    });
    return result;
  } catch (error) {
    emitRequestLog(logger, base, fields, {
      durationMs: Math.round(performance.now() - start),
      error,
    });
    throw error;
  }
}
