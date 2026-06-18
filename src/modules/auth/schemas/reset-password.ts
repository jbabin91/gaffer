import { z } from 'zod';

import { passwordField } from '#/modules/auth/schemas/fields';

export const resetPasswordSchema = z.object({ password: passwordField });
