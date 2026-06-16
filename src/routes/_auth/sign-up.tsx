import { createFileRoute, Link } from '@tanstack/react-router';

import { useAppForm } from '#/components/forms/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card';
import { signUpWithInvite } from '#/lib/auth/client';
import { signUpSchema } from '#/lib/auth/schemas';

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

          if (!error) return null;

          switch (error.code) {
            case 'EMAIL_MISMATCH': {
              return {
                fields: {
                  email: error.message ?? 'Email does not match the invite.',
                },
              };
            }
            case 'INVALID_INVITE':
            case 'INVITE_REQUIRED': {
              return {
                fields: {
                  inviteCode: error.message ?? 'This invite code is not valid.',
                },
              };
            }
            default: {
              return {
                form: error.message ?? 'Could not create your account.',
              };
            }
          }
        } catch {
          return {
            form: 'Could not reach the server. Check your connection and try again.',
          };
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
