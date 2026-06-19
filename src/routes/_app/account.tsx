import { createFileRoute } from '@tanstack/react-router';

import { Badge } from '#/components/ui/badge';
import { Card, CardContent, CardHeader } from '#/components/ui/card';
import { Heading } from '#/components/ui/heading';
import { Loader } from '#/components/ui/loader';
import { useMounted } from '#/hooks/use-mounted';
import { ChangeEmailForm } from '#/modules/auth/components/change-email-form';
import { ChangePasswordForm } from '#/modules/auth/components/change-password-form';
import { authClient } from '#/modules/auth/lib/client';

export const Route = createFileRoute('/_app/account')({
  component: AccountPage,
});

function AccountPage() {
  const mounted = useMounted();
  const { data: session, isPending } = authClient.useSession();

  if (!mounted || isPending) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (!session) return null;

  const { email, emailVerified } = session.user;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Heading level={1}>Account</Heading>

      {emailVerified ? (
        <ChangeEmailForm currentEmail={email} />
      ) : (
        <Card>
          <CardHeader
            description="Verify your email before you can change it — use the link we sent, or resend it from the banner above."
            title="Email"
          />
          <CardContent>
            <p className="flex items-center gap-2 text-sm">
              {email} <Badge intent="warning">Unverified</Badge>
            </p>
          </CardContent>
        </Card>
      )}

      <ChangePasswordForm />
    </main>
  );
}
