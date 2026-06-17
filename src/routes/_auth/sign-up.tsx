import { createFileRoute, Link } from '@tanstack/react-router';

import { useAppForm } from '#/components/forms/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card';
import { signUpWithInvite } from '#/lib/auth/client';
import { NETWORK_ERROR_MESSAGE, signUpFormError } from '#/lib/auth/errors';
import { signUpSchema } from '#/lib/auth/schemas';
import { logError } from '#/lib/logger';

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: { email: '', inviteCode: '', name: '', password: '' },
    onSubmit: () => navigate({ to: '/' }),
    validators: {
      onChange: signUpSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          const { error } = await signUpWithInvite({
            email: value.email,
            inviteCode: value.inviteCode.trim() || undefined,
            name: value.name,
            password: value.password,
          });
          return error ? signUpFormError(error.code) : null;
        } catch (error) {
          logError(error, 'sign-up request failed');
          return { form: NETWORK_ERROR_MESSAGE };
        }
      },
    },
  });

  return (
    <Card>
      <CardHeader
        description="The first account becomes the admin. Otherwise an invite code is required."
        title="Create your account"
      />
      <form
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <CardContent className="space-y-4">
          <form.AppField name="name">
            {(field) => (
              <field.TextField autoComplete="name" label="Name" type="text" />
            )}
          </form.AppField>
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
                placeholder="Leave blank if you're the first user"
                type="text"
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.FormError />
          </form.AppForm>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <form.AppForm>
            <form.SubmitButton>Create account</form.SubmitButton>
          </form.AppForm>
          <p className="text-center text-sm text-muted-fg">
            Already have an account?{' '}
            <Link className="text-primary hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
