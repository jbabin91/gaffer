import { createFileRoute, useRouter } from '@tanstack/react-router';
import { z } from 'zod';

import { LoginForm } from '#/modules/auth/components/login-form';
import { sanitizeRedirect } from '#/modules/auth/lib/sanitize-redirect';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
  validateSearch: z.object({ redirect: z.string().optional() }),
});

function LoginPage() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { redirect } = Route.useSearch();

  return (
    <LoginForm
      onSuccess={async () => {
        // Re-run the _app guard against the now-authenticated session before landing.
        await router.invalidate();
        await navigate({ to: sanitizeRedirect(redirect) });
      }}
    />
  );
}
