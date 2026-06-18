'use client';

import { useAppForm } from '#/components/forms/form';
import { AuthCard } from '#/modules/auth/components/auth-card';
import { AuthLinks } from '#/modules/auth/components/auth-links';
import { useAuthSubmit } from '#/modules/auth/hooks/use-auth-submit';
import { signUpWithInvite } from '#/modules/auth/lib/client';
import { signUpFormError } from '#/modules/auth/messages';
import { signUpSchema } from '#/modules/auth/schemas/sign-up';

export function SignUpForm({
  onSuccess,
}: {
  onSuccess: () => void | Promise<void>;
}) {
  const submit = useAuthSubmit({
    call: (value: {
      email: string;
      inviteCode: string;
      name: string;
      password: string;
    }) =>
      signUpWithInvite({
        email: value.email,
        inviteCode: value.inviteCode.trim() || undefined,
        name: value.name,
        password: value.password,
      }),
    logLabel: 'sign-up request failed',
    mapError: (error) => signUpFormError(error.code),
  });

  const form = useAppForm({
    defaultValues: { email: '', inviteCode: '', name: '', password: '' },
    onSubmit: () => onSuccess(),
    validators: { onChange: signUpSchema, onSubmitAsync: submit },
  });

  return (
    <AuthCard
      description="Registration is invite-only — enter the code from your invitation."
      footer={
        <>
          <form.AppForm>
            <form.SubmitButton>Create account</form.SubmitButton>
          </form.AppForm>
          <AuthLinks
            links={[
              {
                label: 'Sign in',
                prefix: 'Already have an account?',
                to: '/login',
              },
            ]}
          />
        </>
      }
      title="Create your account"
      onSubmit={() => void form.handleSubmit()}
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField autoComplete="name" label="Name" type="text" />
        )}
      </form.AppField>
      <form.AppField name="email">
        {(field) => (
          <field.TextField autoComplete="email" label="Email" type="email" />
        )}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            autoComplete="new-password"
            label="Password"
            type="password"
          />
        )}
      </form.AppField>
      <form.AppField name="inviteCode">
        {(field) => (
          <field.TextField
            label="Invite code"
            placeholder="Code from your invitation"
            type="text"
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </AuthCard>
  );
}
