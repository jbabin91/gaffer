import { describe, expect, it } from 'vitest';

import { resetPasswordSchema } from '#/modules/auth/schemas/reset-password';

describe('resetPasswordSchema', () => {
  it('enforces the password length bounds', () => {
    expect(resetPasswordSchema.safeParse({ password: 'short' }).success).toBe(
      false,
    );
    expect(
      resetPasswordSchema.safeParse({ password: 'longenough' }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ password: 'a'.repeat(129) }).success,
    ).toBe(false);
  });
});
