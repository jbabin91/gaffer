import { createFileRoute, Link } from '@tanstack/react-router';
import { z } from 'zod';

import { useAppForm } from '#/components/forms/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card';
import { authClient } from '#/lib/auth/client';
import { NETWORK_ERROR_MESSAGE, RATE_LIMITED_MESSAGE } from '#/lib/auth/errors';
import { loginSchema, sanitizeRedirect } from '#/lib/auth/schemas';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
  // Sanitized at navigation time via sanitizeRedirect.
  validateSearch: z.object({ redirect: z.string().optional() }),
});

function LoginPage() {
  const navigate = Route.useNavigate();
  const { redirect } = Route.useSearch();

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    onSubmit: () => navigate({ to: sanitizeRedirect(redirect) }),
    validators: {
      onChange: loginSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          const { error } = await authClient.signIn.email({
            email: value.email,
            password: value.password,
          });
          if (!error) return null;
          if (error.status === 429) return { form: RATE_LIMITED_MESSAGE };
          return { form: 'Invalid email or password.' };
        } catch {
          return { form: NETWORK_ERROR_MESSAGE };
        }
      },
    },
  });

  return (
    <Card>
      <CardHeader
        description="Sign in to manage your career."
        title="Welcome back"
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
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <form.AppForm>
            <form.SubmitButton>Sign in</form.SubmitButton>
          </form.AppForm>
          <p className="text-center text-sm text-muted-fg">
            <Link
              className="text-primary hover:underline"
              to="/forgot-password"
            >
              Forgot your password?
            </Link>
          </p>
          <p className="text-center text-sm text-muted-fg">
            Need an account?{' '}
            <Link className="text-primary hover:underline" to="/sign-up">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
