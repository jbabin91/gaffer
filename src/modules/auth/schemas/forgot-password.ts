import { z } from 'zod';

import { emailField } from '#/modules/auth/schemas/fields';

export const forgotPasswordSchema = z.object({ email: emailField });
