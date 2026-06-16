import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z.object({
  email: z.email('Enter a valid email'),
  // Always a string (empty == no code); the form treats blank as "first user".
  inviteCode: z.string(),
  name: z.string().min(1, 'Enter your name'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

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
