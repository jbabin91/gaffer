import { describe, expect, it } from 'vitest';

import {
  changePasswordFormError,
  signUpFormError,
} from '#/modules/auth/messages';

describe('signUpFormError', () => {
  it('routes an email-mismatch to the email field with curated copy', () => {
    expect(signUpFormError('EMAIL_MISMATCH')).toEqual({
      fields: { email: 'That invite is for a different email address.' },
    });
  });

  it.each(['INVALID_INVITE', 'INVITE_REQUIRED'])(
    'routes %s to the inviteCode field',
    (code) => {
      expect(signUpFormError(code)).toEqual({
        fields: { inviteCode: expect.any(String) },
      });
    },
  );

  it('collapses an unknown or missing code to a generic form error', () => {
    expect(signUpFormError('SOMETHING_ELSE')).toEqual({
      form: expect.any(String),
    });
    expect(signUpFormError(undefined)).toEqual({ form: expect.any(String) });
  });

  it('never leaks the raw error code into user-facing copy', () => {
    expect(JSON.stringify(signUpFormError('EMAIL_MISMATCH'))).not.toContain(
      'EMAIL_MISMATCH',
    );
  });
});

describe('changePasswordFormError', () => {
  it('routes a wrong current password to the currentPassword field', () => {
    expect(changePasswordFormError('INVALID_PASSWORD')).toEqual({
      fields: { currentPassword: 'That password is incorrect.' },
    });
  });

  it('collapses other codes to a generic form error', () => {
    expect(changePasswordFormError('SOMETHING_ELSE')).toEqual({
      form: expect.any(String),
    });
    expect(changePasswordFormError(undefined)).toEqual({
      form: expect.any(String),
    });
  });
});
