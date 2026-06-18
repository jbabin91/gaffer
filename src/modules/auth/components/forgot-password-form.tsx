'use client';

import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { useAppForm } from '#/components/forms/form';
import { Card, CardFooter, CardHeader } from '#/components/ui/card';
import { AuthCard } from '#/modules/auth/components/auth-card';
import { AuthLinks } from '#/modules/auth/components/auth-links';
import { useAuthSubmit } from '#/modules/auth/hooks/use-auth-submit';
import { authClient } from '#/modules/auth/lib/client';
import { forgotPasswordSchema } from '#/modules/auth/schemas/forgot-password';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  // enumerationSafe: a non-429 response stays "sent" so account existence is
  // unobservable; only a 429 (volume-based, identical for any email) surfaces.
  const submit = useAuthSubmit({
    call: (value: { email: string }) =>
      authClient.requestPasswordReset({ email: value.email }),
    enumerationSafe: true,
    logLabel: 'password reset request failed',
  });

  const form = useAppForm({
    defaultValues: { email: '' },
    onSubmit: () => setSent(true),
    validators: { onChange: forgotPasswordSchema, onSubmitAsync: submit },
  });

  if (sent) {
    return (
      <Card>
        <CardHeader
          description="If an account exists for that address, we've sent a password reset link."
          title="Check your email"
        />
        <CardFooter>
          <Link className="text-sm text-primary hover:underline" to="/login">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <AuthCard
      description="Enter your email and we'll send a reset link."
      footer={
        <>
          <form.AppForm>
            <form.SubmitButton>Send reset link</form.SubmitButton>
          </form.AppForm>
          <AuthLinks
            links={[
              {
                label: 'Back to sign in',
                prefix: 'Remembered it?',
                to: '/login',
              },
            ]}
          />
        </>
      }
      title="Reset your password"
      onSubmit={() => void form.handleSubmit()}
    >
      <form.AppField name="email">
        {(field) => (
          <field.TextField autoComplete="email" label="Email" type="email" />
        )}
      </form.AppField>
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </AuthCard>
  );
}
