import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ResetPasswordForm } from '#/modules/auth/components/reset-password-form';

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordPage,
  validateSearch: z.object({ token: z.string().optional() }),
});

function ResetPasswordPage() {
  const navigate = Route.useNavigate();
  const { token } = Route.useSearch();

  return (
    <ResetPasswordForm
      token={token}
      onSuccess={() => navigate({ to: '/login' })}
    />
  );
}
