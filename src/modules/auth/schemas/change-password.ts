import { z } from 'zod';

import { passwordField } from '#/modules/auth/schemas/fields';

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: passwordField,
  revokeOtherSessions: z.boolean(),
});
