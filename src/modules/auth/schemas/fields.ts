import { z } from 'zod';

export const emailField = z
  .email('Enter a valid email')
  .max(255, 'Email is too long');

// Bound the length so an oversized payload is rejected before it reaches Better Auth.
export const passwordField = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Password is too long');
