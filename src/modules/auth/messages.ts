// Only failure text users ever see — raw error.message is never surfaced.

export const NETWORK_ERROR_MESSAGE =
  'Could not reach the server. Check your connection and try again.';

export const SIGN_OUT_FAILED_MESSAGE =
  'Could not sign you out. Try again in a moment.';

export const RESET_LINK_INVALID_MESSAGE =
  'This reset link is invalid or has expired. Request a new one.';

export const RATE_LIMITED_MESSAGE =
  'Too many attempts. Wait a moment and try again.';

type SignUpFormError =
  | { fields: { email: string } }
  | { fields: { inviteCode: string } }
  | { form: string };

/**
 * Maps a sign-up error code to TanStack Form's `{ fields }` / `{ form }` shape,
 * routing invite-identity failures to the field a user can fix.
 */
export function signUpFormError(code: string | undefined): SignUpFormError {
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
