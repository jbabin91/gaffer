import { describe, expect, it } from 'vitest';

import { loginSchema } from '#/modules/auth/schemas/login';

describe('loginSchema', () => {
  it('accepts a valid login payload', () => {
    expect(
      loginSchema.safeParse({ email: 'boss@example.com', password: 'x' })
        .success,
    ).toBe(true);
  });

  it('requires a non-empty password', () => {
    expect(
      loginSchema.safeParse({ email: 'boss@example.com', password: '' })
        .success,
    ).toBe(false);
  });

  it('rejects an over-long email', () => {
    const longEmail = `${'a'.repeat(250)}@example.com`;
    expect(
      loginSchema.safeParse({ email: longEmail, password: 'x' }).success,
    ).toBe(false);
  });
});
