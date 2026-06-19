import { describe, expect, it } from 'vitest';

import { changeEmailSchema } from '#/modules/auth/schemas/change-email';

const schema = changeEmailSchema('current@example.com');

describe('changeEmailSchema', () => {
  it('accepts a different valid email', () => {
    expect(schema.safeParse({ newEmail: 'new@example.com' }).success).toBe(
      true,
    );
  });

  it('rejects a malformed email', () => {
    expect(schema.safeParse({ newEmail: 'not-an-email' }).success).toBe(false);
  });

  it('rejects the current email, case-insensitively', () => {
    expect(schema.safeParse({ newEmail: 'Current@example.com' }).success).toBe(
      false,
    );
  });
});
