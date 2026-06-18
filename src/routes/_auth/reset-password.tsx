import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';

import { useAppForm } from '#/components/forms/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card';
import { logError } from '#/lib/logging/logger';
import { authClient } from '#/modules/auth/lib/client';
import {
  NETWORK_ERROR_MESSAGE,
  RATE_LIMITED_MESSAGE,
  RESET_LINK_INVALID_MESSAGE,
} from '#/modules/auth/messages';
import { resetPasswordSchema } from '#/modules/auth/schemas/reset-password';

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordPage,
  validateSearch: z.object({ token: z.string().optional() }),
});

function ResetPasswordPage() {
  const navigate = Route.useNavigate();
  const { token } = Route.useSearch();

  const form = useAppForm({
    defaultValues: { password: '' },
    onSubmit: () => navigate({ to: '/login' }),
    validators: {
      onChange: resetPasswordSchema,
      onSubmitAsync: async ({ value }) => {
        if (!token) return { form: RESET_LINK_INVALID_MESSAGE };
        try {
          const { error } = await authClient.resetPassword({
            newPassword: value.password,
            token,
          });
          if (!error) return null;
          if (error.status === 429) return { form: RATE_LIMITED_MESSAGE };
          return { form: RESET_LINK_INVALID_MESSAGE };
        } catch (error) {
          logError(error, 'password reset failed');
          return { form: NETWORK_ERROR_MESSAGE };
        }
      },
    },
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
    <Card>
      <CardHeader
        description="Choose a new password for your account."
        title="Set a new password"
      />
      <form
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter className="justify-stretch">
          <form.AppForm>
            <form.SubmitButton>Update password</form.SubmitButton>
          </form.AppForm>
        </CardFooter>
      </form>
    </Card>
  );
}
