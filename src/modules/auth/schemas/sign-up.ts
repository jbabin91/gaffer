import { z } from 'zod';

import { emailField, passwordField } from '#/modules/auth/schemas/fields';

export const signUpSchema = z.object({
  email: emailField,
  // Always a string; empty means no invite code (rejected once an admin exists —
  // only the designated bootstrap email may sign up without one).
  inviteCode: z.string().max(128, 'Invite code is too long'),
  name: z.string().min(1, 'Enter your name').max(100, 'Name is too long'),
  password: passwordField,
});
