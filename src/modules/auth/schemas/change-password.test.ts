import { describe, expect, it } from 'vitest';

import { changePasswordSchema } from '#/modules/auth/schemas/change-password';

const valid = {
  currentPassword: 'oldpassword',
  newPassword: 'newpassword',
  revokeOtherSessions: false,
};

describe('changePasswordSchema', () => {
  it('accepts a valid payload', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a non-empty current password', () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, currentPassword: '' }).success,
    ).toBe(false);
  });

  it('enforces the new-password minimum length', () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, newPassword: 'short' })
        .success,
    ).toBe(false);
  });
});
