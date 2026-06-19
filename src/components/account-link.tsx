'use client';

import { Link } from '@tanstack/react-router';

import { authClient } from '#/modules/auth/lib/client';

export function AccountLink() {
  const { data: session } = authClient.useSession();

  if (!session) return null;

  return (
    <Link
      className="text-sm font-medium text-muted-fg hover:text-fg"
      to="/account"
    >
      Account
    </Link>
  );
}
