import pino from 'pino';

const LOG_LEVELS = new Set([
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
]);

/**
 * Falls back to a default rather than passing an unrecognized level to pino,
 * which would throw at construction.
 */
export function resolveLevel(
  envLevel: string | undefined,
  isDev: boolean,
): string {
  if (envLevel && LOG_LEVELS.has(envLevel)) return envLevel;
  return isDev ? 'debug' : 'info';
}

// import.meta.env.DEV is statically replaced at build, so pino-pretty (a
// devDependency) is tree-shaken out of the production bundle.
const isDev = import.meta.env.DEV;

// import.meta.env.SSR is statically replaced per build, so the process.env read
// and the pino-pretty transport below are dead-code-eliminated from the client
// bundle — process is undefined in the browser and would otherwise throw.
const isBrowser = !import.meta.env.SSR;

// Read the level directly off the environment: the logger is bootstrap
// infrastructure below t3-env. Server uses process.env; the browser has no
// process, so it reads the Vite-exposed VITE_LOG_LEVEL instead.
const envLevel: string | undefined = isBrowser
  ? import.meta.env.VITE_LOG_LEVEL
  : process.env.LOG_LEVEL;
const level = resolveLevel(envLevel, isDev);

export const logger = pino({
  // asObject routes browser logs through console.* as structured records.
  browser: { asObject: true },
  level,
  // pino's browser build has no fast-redact, so this list only scrubs
  // server-side logs; client callers must never hand logError a secret-bearing
  // object (form values), only the caught error.
  redact: [
    'password',
    '*.password',
    'token',
    '*.token',
    'secret',
    '*.secret',
    'apiKey',
    '*.apiKey',
    'inviteCode',
    '*.inviteCode',
    'authorization',
    '*.authorization',
    '*.headers.authorization',
    'cookie',
    '*.cookie',
    '*.headers.cookie',
  ],
  ...(isDev && !isBrowser
    ? {
        transport: {
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:HH:MM:ss',
          },
          target: 'pino-pretty',
        },
      }
    : {}),
});

// Warn once on an invalid level so a typo doesn't silently fall back.
if (envLevel && !LOG_LEVELS.has(envLevel)) {
  logger.warn(
    { invalidLevel: envLevel, usedLevel: level },
    'ignoring unknown log level; using default',
  );
}

/**
 * Records an unexpected error's cause for diagnosis. Surfacing to the user
 * (inline form error vs toast) is the caller's decision — this only logs.
 *
 * The cause is for the redacted log only; never render it. User-facing copy
 * must be a curated, code-keyed string (INFO-DISCLOSURE). Pass the caught error,
 * not form values: the browser build cannot redact, so secrets would leak.
 */
export function logError(cause: unknown, message: string): void {
  try {
    logger.error({ err: cause }, message);
  } catch {
    // A logging primitive must never throw and take down the caller it protects.
  }
}
