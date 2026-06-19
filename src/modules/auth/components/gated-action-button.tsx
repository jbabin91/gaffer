'use client';

import { toast } from 'sonner';

import { Button, type ButtonProps } from '#/components/ui/button';
import { cx } from '#/lib/utils/primitive';

// Omit onPress: the gate owns activation (it toasts the reason), so a caller's
// handler would be silently dropped.
type GatedActionButtonProps = Omit<ButtonProps, 'onPress'> & {
  gateMessage: string;
};

/**
 * Stand-in for a gated action: looks muted and stays keyboard-focusable
 * (`aria-disabled`, not `disabled`), and explains the gate on activate instead
 * of silently doing nothing. Swap it in for the real control when unverified.
 */
export function GatedActionButton({
  className,
  gateMessage,
  ...props
}: GatedActionButtonProps) {
  return (
    <Button
      {...props}
      aria-disabled
      className={cx('opacity-60', className)}
      onPress={() => toast.info(gateMessage)}
    />
  );
}
