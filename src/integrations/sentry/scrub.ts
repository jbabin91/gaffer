import { SECRET_KEYS } from '#/configs/secret-keys';

// pino's browser build can't redact, so Sentry events/logs are scrubbed here to
// keep parity with the server logger's redact list — secrets must never leave
// the process. Keys are matched case-insensitively across every object,
// including Errors and class instances (a secret can hide on err.config.headers).
const REDACT_KEYS = new Set(SECRET_KEYS.map((key) => key.toLowerCase()));

const PLACEHOLDER = '[redacted]';
const TRUNCATED = '[truncated]';

// Bounds traversal of deeply nested / cyclic payloads. A container past the
// bound is dropped to TRUNCATED rather than returned verbatim, so a secret can
// never slip through below the cap.
const MAX_DEPTH = 8;

function redactByKey(key: string, value: unknown, depth: number): unknown {
  return REDACT_KEYS.has(key.toLowerCase())
    ? PLACEHOLDER
    : redact(value, depth + 1);
}

function redact(value: unknown, depth: number): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date || value instanceof RegExp) return value;
  if (depth >= MAX_DEPTH) return TRUNCATED;
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }
  // Key/value containers carry secrets by key like a plain object but expose no
  // enumerable own-keys, so Object.keys below would collapse them to {} and
  // silently drop the entry (e.g. a fetch error's Headers on err.config.headers).
  // Their values are already materialized, so the read can't throw here.
  if (
    value instanceof Map ||
    value instanceof Headers ||
    value instanceof URLSearchParams
  ) {
    const out: Record<string, unknown> = {};
    for (const [key, val] of value as Iterable<[unknown, unknown]>) {
      const name = String(key);
      try {
        out[name] = redactByKey(name, val, depth);
      } catch {
        out[name] = TRUNCATED;
      }
    }
    return out;
  }
  if (value instanceof Set) {
    return [...value].map((item) => redact(item, depth + 1));
  }
  // Errors and class instances included — a secret on an enumerable prop is
  // caught, not only on plain objects. The value read stays inside the try so a
  // throwing getter truncates only its own key, not the rest of the payload.
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    try {
      out[key] = redactByKey(
        key,
        (value as Record<string, unknown>)[key],
        depth,
      );
    } catch {
      out[key] = TRUNCATED;
    }
  }
  return out;
}

/**
 * Scrubs secret-bearing values from a Sentry event or log to a bounded depth,
 * returning a structurally-rebuilt copy — class identity is not preserved, since
 * Sentry reads the result by enumerable shape. Pass it straight back to Sentry.
 *
 * Never throws: on a scrub bug it marks the original payload in-band and ships it
 * rather than letting Sentry silently drop the event. Callers are still told not
 * to hand secrets to logError, so failing open trades a rare leak risk for not
 * losing visibility.
 */
export function scrubSentryPayload<T>(payload: T): T {
  try {
    return redact(payload, 0) as T;
  } catch {
    // Surface a broken scrubber in Sentry instead of swallowing it; logError
    // here would re-enter beforeSend, so mark the payload in-band.
    if (payload && typeof payload === 'object') {
      (payload as Record<string, unknown>).scrub_failed = true;
    }
    return payload;
  }
}
