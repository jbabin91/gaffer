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
  // Auth pages stack a submit button over links; settings cards want a single
  // right-aligned button. Defaults to the stacked layout.
  footerClassName?: string;
  onSubmit: () => void;
  title: string;
};

export function AuthCard({
  children,
  description,
  footer,
  footerClassName = 'flex-col items-stretch gap-3',
  onSubmit,
  title,
}: AuthCardProps) {
  return (
    <Card>
      <CardHeader description={description} title={title} />
      <form
        className="flex flex-col gap-(--gutter)"
        method="post"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <CardContent className="space-y-4">{children}</CardContent>
        <CardFooter className={footerClassName}>{footer}</CardFooter>
      </form>
    </Card>
  );
}
