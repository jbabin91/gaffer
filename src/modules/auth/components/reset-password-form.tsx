'use client';

import { Link } from '@tanstack/react-router';

import { useAppForm } from '#/components/forms/form';
import { Card, CardFooter, CardHeader } from '#/components/ui/card';
import { AuthCard } from '#/modules/auth/components/auth-card';
import { useAuthSubmit } from '#/modules/auth/hooks/use-auth-submit';
import { authClient } from '#/modules/auth/lib/client';
import { RESET_LINK_INVALID_MESSAGE } from '#/modules/auth/messages';
import { resetPasswordSchema } from '#/modules/auth/schemas/reset-password';

export function ResetPasswordForm({
  onSuccess,
  token,
}: {
  onSuccess: () => void | Promise<void>;
  token: string | undefined;
}) {
  const submit = useAuthSubmit({
    call: (value: { password: string }) =>
      authClient.resetPassword({
        newPassword: value.password,
        token: token ?? '',
      }),
    logLabel: 'password reset failed',
    mapError: () => ({ form: RESET_LINK_INVALID_MESSAGE }),
  });

  const form = useAppForm({
    defaultValues: { password: '' },
    onSubmit: () => onSuccess(),
    validators: { onChange: resetPasswordSchema, onSubmitAsync: submit },
  });

  if (!token) {
    return (
      <Card>
        <CardHeader
          description="This reset link is invalid or has expired."
          title="Link not valid"
        />
        <CardFooter>
          <Link
            className="text-sm text-primary hover:underline"
            to="/forgot-password"
          >
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AuthCard
      description="Choose a new password for your account."
      footer={
        <form.AppForm>
          <form.SubmitButton>Update password</form.SubmitButton>
        </form.AppForm>
      }
      title="Set a new password"
      onSubmit={() => void form.handleSubmit()}
    >
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            autoComplete="new-password"
            label="New password"
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
