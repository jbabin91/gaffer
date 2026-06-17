import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { useAppForm } from '#/components/forms/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card';
import { authClient } from '#/lib/auth/client';
import { NETWORK_ERROR_MESSAGE, RATE_LIMITED_MESSAGE } from '#/lib/auth/errors';
import { forgotPasswordSchema } from '#/lib/auth/schemas';
import { logError } from '#/lib/logger';

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const form = useAppForm({
    defaultValues: { email: '' },
    onSubmit: () => setSent(true),
    validators: {
      onChange: forgotPasswordSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          const { error } = await authClient.requestPasswordReset({
            email: value.email,
          });
          // 429 is volume-based — identical for existing and missing emails — so
          // surfacing it leaks nothing; any other response stays "sent" to keep
          // account existence unobservable.
          if (error?.status === 429) return { form: RATE_LIMITED_MESSAGE };
          return null;
        } catch (error) {
          logError(error, 'password reset request failed');
          return { form: NETWORK_ERROR_MESSAGE };
        }
      },
    },
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
    <Card>
      <CardHeader
        description="Enter your email and we'll send a reset link."
        title="Reset your password"
      />
      <form
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <CardContent className="space-y-4">
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoComplete="email"
                label="Email"
                type="email"
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.FormError />
          </form.AppForm>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <form.AppForm>
            <form.SubmitButton>Send reset link</form.SubmitButton>
          </form.AppForm>
          <p className="text-center text-sm text-muted-fg">
            Remembered it?{' '}
            <Link className="text-primary hover:underline" to="/login">
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
