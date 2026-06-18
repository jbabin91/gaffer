'use client';

import { type ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '#/components/ui/card';

type AuthCardProps = {
  children: ReactNode;
  description: string;
  footer: ReactNode;
  onSubmit: () => void;
  title: string;
};

export function AuthCard({
  children,
  description,
  footer,
  onSubmit,
  title,
}: AuthCardProps) {
  return (
    <Card>
      <CardHeader description={description} title={title} />
      <form
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <CardContent className="space-y-4">{children}</CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          {footer}
        </CardFooter>
      </form>
    </Card>
  );
}
