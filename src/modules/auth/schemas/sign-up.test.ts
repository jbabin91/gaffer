import { describe, expect, it } from 'vitest';

import { signUpSchema } from '#/modules/auth/schemas/sign-up';

describe('signUpSchema', () => {
  it('rejects a malformed email and a short password', () => {
    const result = signUpSchema.safeParse({
      email: 'nope',
      inviteCode: '',
      name: 'Manager',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('accepts a blank invite code and keeps it a string (first-user case)', () => {
    const result = signUpSchema.safeParse({
      email: 'boss@example.com',
      inviteCode: '',
      name: 'Manager',
      password: 'longenough',
    });

    expect(result.success).toBe(true);
    expect(result.data?.inviteCode).toBe('');
  });

  it('rejects sign-up with inviteCode omitted (must be a present string)', () => {
    const result = signUpSchema.safeParse({
      email: 'boss@example.com',
      name: 'Manager',
      password: 'longenough',
    });

    expect(result.success).toBe(false);
  });

  it('rejects an over-long password', () => {
    expect(
      signUpSchema.safeParse({
        email: 'boss@example.com',
        inviteCode: '',
        name: 'Manager',
        password: 'a'.repeat(129),
      }).success,
    ).toBe(false);
  });

  it('rejects an over-long invite code and name', () => {
    const base = {
      email: 'boss@example.com',
      name: 'Manager',
      password: 'longenough',
    };
    expect(
      signUpSchema.safeParse({ ...base, inviteCode: 'a'.repeat(129) }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({ ...base, inviteCode: '', name: 'a'.repeat(101) })
        .success,
    ).toBe(false);
  });
});
