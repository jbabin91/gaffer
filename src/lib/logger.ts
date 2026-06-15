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

// Exported so level resolution is unit-testable. Falls back rather than passing
// an unrecognized level to pino, which throws at construction.
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

// Read from process.env directly: the logger is bootstrap infrastructure below
// t3-env, and jsdom hook tests load it eagerly before t3-env is available.
const envLevel = process.env.LOG_LEVEL;
const level = resolveLevel(envLevel, isDev);

export const logger = pino({
  level,
  // fast-redact wildcards match exactly one level, so secrets must sit at a
  // declared depth; headers are the 2-level carriers, listed explicitly.
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
  ...(isDev
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

// Warn once on an invalid LOG_LEVEL so a typo doesn't silently fall back.
if (envLevel && !LOG_LEVELS.has(envLevel)) {
  logger.warn(
    { invalidLevel: envLevel, usedLevel: level },
    'ignoring unknown LOG_LEVEL; using default',
  );
}
