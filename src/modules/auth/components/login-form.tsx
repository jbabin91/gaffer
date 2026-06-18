'use client';

import { useAppForm } from '#/components/forms/form';
import { AuthCard } from '#/modules/auth/components/auth-card';
import { AuthLinks } from '#/modules/auth/components/auth-links';
import { useAuthSubmit } from '#/modules/auth/hooks/use-auth-submit';
import { authClient } from '#/modules/auth/lib/client';
import { loginSchema } from '#/modules/auth/schemas/login';

export function LoginForm({
  onSuccess,
}: {
  onSuccess: () => void | Promise<void>;
}) {
  const submit = useAuthSubmit({
    call: (value: { email: string; password: string }) =>
      authClient.signIn.email({ email: value.email, password: value.password }),
    logLabel: 'sign-in request failed',
    mapError: () => ({ form: 'Invalid email or password.' }),
  });

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    onSubmit: () => onSuccess(),
    validators: { onChange: loginSchema, onSubmitAsync: submit },
  });

  return (
    <AuthCard
      description="Sign in to manage your career."
      footer={
        <>
          <form.AppForm>
            <form.SubmitButton>Sign in</form.SubmitButton>
          </form.AppForm>
          <AuthLinks
            links={[
              { label: 'Forgot your password?', to: '/forgot-password' },
              {
                label: 'Create one',
                prefix: 'Need an account?',
                to: '/sign-up',
              },
            ]}
          />
        </>
      }
      title="Welcome back"
      onSubmit={() => void form.handleSubmit()}
    >
      <form.AppField name="email">
        {(field) => (
          <field.TextField autoComplete="email" label="Email" type="email" />
        )}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            autoComplete="current-password"
            label="Password"
            type="password"
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </AuthCard>
  );
}
