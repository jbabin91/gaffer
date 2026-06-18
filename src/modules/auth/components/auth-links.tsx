'use client';

import { Link } from '@tanstack/react-router';
import { type ComponentProps } from 'react';

type AuthLink = {
  label: string;
  prefix?: string;
  to: ComponentProps<typeof Link>['to'];
};

export function AuthLinks({ links }: { links: AuthLink[] }) {
  return (
    <>
      {links.map(({ label, prefix, to }) => (
        <p key={String(to)} className="text-center text-sm text-muted-fg">
          {prefix ? `${prefix} ` : null}
          <Link className="text-primary hover:underline" to={to}>
            {label}
          </Link>
        </p>
      ))}
    </>
  );
}
