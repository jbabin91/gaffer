import { describe, expect, it } from 'vitest';

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  sanitizeRedirect,
  signUpSchema,
} from './schemas';

describe('sanitizeRedirect', () => {
  it('keeps a same-site path', () => {
    expect(sanitizeRedirect('/players/abc')).toBe('/players/abc');
  });

  it.each([
    ['absolute http url', 'https://evil.example/phish'],
    ['protocol-relative host', '//evil.example'],
    ['backslash authority', String.raw`/\evil.example`],
    ['mixed slash-backslash authority', String.raw`/\/evil.example`],
    ['bare path without leading slash', 'players'],
    ['empty string', ''],
    ['non-string', 42],
    ['undefined', undefined],
  ])('falls back to / for %s', (_label, input) => {
    expect(sanitizeRedirect(input)).toBe('/');
  });
});

describe('auth schemas', () => {
  it('rejects a malformed email and a short password on sign-up', () => {
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

  it('accepts a valid login payload', () => {
    expect(
      loginSchema.safeParse({ email: 'boss@example.com', password: 'x' })
        .success,
    ).toBe(true);
  });

  it('requires a non-empty password on login', () => {
    expect(
      loginSchema.safeParse({ email: 'boss@example.com', password: '' })
        .success,
    ).toBe(false);
  });

  it('rejects an over-long email and password', () => {
    const longEmail = `${'a'.repeat(250)}@example.com`;
    expect(
      loginSchema.safeParse({ email: longEmail, password: 'x' }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        email: 'boss@example.com',
        inviteCode: '',
        name: 'Manager',
        password: 'a'.repeat(129),
      }).success,
    ).toBe(false);
  });

  it('rejects an over-long invite code and name on sign-up', () => {
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

describe('recovery schemas', () => {
  it('validates a forgot-password email', () => {
    expect(
      forgotPasswordSchema.safeParse({ email: 'boss@example.com' }).success,
    ).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(
      false,
    );
  });

  it('enforces the password length bounds on reset', () => {
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
