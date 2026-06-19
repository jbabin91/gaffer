import { z } from 'zod';

import { emailField } from '#/modules/auth/schemas/fields';

/** Built with the current email so re-entering it fails on the field, not as a server round-trip. */
export function changeEmailSchema(currentEmail: string) {
  return z.object({
    newEmail: emailField.refine(
      (value) => value.toLowerCase() !== currentEmail.toLowerCase(),
      { message: "That's already your email address." },
    ),
  });
}
