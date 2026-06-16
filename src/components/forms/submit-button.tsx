'use client';

import type { ComponentProps } from 'react';

import { Button } from '#/components/ui/button';

import { useFormContext } from './context';

export function SubmitButton({
  children,
  ...props
}: Omit<ComponentProps<typeof Button>, 'isDisabled' | 'isPending' | 'type'>) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => (
        <Button
          type="submit"
          {...props}
          isDisabled={!canSubmit}
          isPending={isSubmitting}
        >
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}
