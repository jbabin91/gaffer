import { describe, expect, it } from 'vitest';

import { forgotPasswordSchema } from '#/modules/auth/schemas/forgot-password';

describe('forgotPasswordSchema', () => {
  it('validates a forgot-password email', () => {
    expect(
      forgotPasswordSchema.safeParse({ email: 'boss@example.com' }).success,
    ).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(
      false,
    );
  });
});
