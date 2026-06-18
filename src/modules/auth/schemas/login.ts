import { z } from 'zod';

import { emailField } from '#/modules/auth/schemas/fields';

export const loginSchema = z.object({
  email: emailField,
  // min(1), not the shared passwordField's min(8): login must accept any existing
  // password, including ones created before the current length rule.
  password: z
    .string()
    .min(1, 'Enter your password')
    .max(128, 'Password is too long'),
});
