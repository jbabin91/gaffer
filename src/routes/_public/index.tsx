import { createFileRoute, Link, redirect } from '@tanstack/react-router';

import { buttonStyles } from '#/components/ui/button';
import { Heading } from '#/components/ui/heading';
import { getSessionFn } from '#/modules/auth/api/get-session';

export const Route = createFileRoute('/_public/')({
  beforeLoad: async () => {
    if (await getSessionFn()) throw redirect({ to: '/squad' });
  },
  component: Landing,
});

function Landing() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center gap-6 px-4 py-12 text-center">
      <div className="space-y-2">
        <Heading level={1}>FC 26 Career Hub</Heading>
        <p className="text-muted-fg">
          A self-hosted, invite-only hub for tracking your FC 26 career —
          squads, player development, and season history.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link className={buttonStyles()} to="/login">
          Sign in
        </Link>
        <Link className={buttonStyles({ intent: 'outline' })} to="/sign-up">
          Create account
        </Link>
      </div>
    </main>
  );
}
