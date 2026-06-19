// Only failure text users ever see — raw error.message is never surfaced.

export const NETWORK_ERROR_MESSAGE =
  'Could not reach the server. Check your connection and try again.';

export const SIGN_OUT_FAILED_MESSAGE =
  'Could not sign you out. Try again in a moment.';

export const RESET_LINK_INVALID_MESSAGE =
  'This reset link is invalid or has expired. Request a new one.';

export const RATE_LIMITED_MESSAGE =
  'Too many attempts. Wait a moment and try again.';

export const VERIFICATION_SEND_FAILED_MESSAGE =
  'Could not send the link. Try again in a moment.';

export const CHANGE_PASSWORD_FAILED_MESSAGE =
  'Could not change your password. Try again in a moment.';

export const CHANGE_EMAIL_FAILED_MESSAGE =
  'Could not change your email. Try again in a moment.';

// A discriminated union, not a both-optional product: TanStack Form treats any
// object with a `fields` key as an errored form, so `{}` / `{ fields: {} }` would
// be an errored-but-invisible state. `undefined` is the only "no error" signal.
export type AuthSubmitErrors =
  | { fields: Record<string, string> }
  | { form: string };

/** Routes invite/identity failures to the field a user can fix; other codes fall back to a form-level message. */
export function signUpFormError(code: string | undefined): AuthSubmitErrors {
  switch (code) {
    case 'EMAIL_MISMATCH': {
      return {
        fields: { email: 'That invite is for a different email address.' },
      };
    }
    case 'INVALID_INVITE': {
      return {
        fields: { inviteCode: 'That invite code is invalid or has expired.' },
      };
    }
    case 'INVITE_REQUIRED': {
      return {
        fields: { inviteCode: 'An invite code is required to sign up.' },
      };
    }
    default: {
      return { form: 'Could not create your account.' };
    }
  }
}

export function changePasswordFormError(
  code: string | undefined,
): AuthSubmitErrors {
  if (code === 'INVALID_PASSWORD') {
    return { fields: { currentPassword: 'That password is incorrect.' } };
  }
  return { form: CHANGE_PASSWORD_FAILED_MESSAGE };
}
