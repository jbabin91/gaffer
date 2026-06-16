import { z } from 'zod';

const emailField = z.email('Enter a valid email').max(255, 'Email is too long');
// Bound the length so an oversized payload is rejected before it reaches Better Auth.
const passwordField = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Password is too long');

export const loginSchema = z.object({
  email: emailField,
  // min(1), not passwordField's min(8): login must accept any existing password,
  // including ones created before the current length rule.
  password: z
    .string()
    .min(1, 'Enter your password')
    .max(128, 'Password is too long'),
});

export const signUpSchema = z.object({
  email: emailField,
  // Always a string (empty == no code); the form treats blank as "first user".
  inviteCode: z.string().max(128, 'Invite code is too long'),
  name: z.string().min(1, 'Enter your name').max(100, 'Name is too long'),
  password: passwordField,
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z.object({ password: passwordField });

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
