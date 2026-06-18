/**
 * Clamp a redirect target to a same-site path, guarding against open redirects:
 * rejects absolute URLs, `//host`, and backslashes (browsers normalize `\` to `/`).
 * Anything else falls back to `/`.
 */
export function sanitizeRedirect(target: unknown): string {
  if (
    typeof target !== 'string' ||
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.includes('\\')
  ) {
    return '/';
  }
  return target;
}
