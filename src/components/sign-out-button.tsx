'use client';

import { Button } from '#/components/ui/button';
import { useSignOut } from '#/modules/auth/hooks/use-sign-out';
import { authClient } from '#/modules/auth/lib/client';

export function SignOutButton() {
  const { data: session } = authClient.useSession();
  const signOut = useSignOut();

  if (!session) return null;

  return (
    <Button intent="outline" size="sm" onPress={() => void signOut()}>
      Sign out
    </Button>
  );
}
