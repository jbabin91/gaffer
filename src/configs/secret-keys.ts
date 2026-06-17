// Single source of truth for secret-bearing key names, so the server logger
// (pino redact) and the Sentry scrubber can't drift on WHICH keys are secret.
// Match depth differs by design: pino redacts key + *.key (+ explicit header
// carriers), while the scrubber walks every level.
export const SECRET_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'inviteCode',
  'authorization',
  'cookie',
] as const;
