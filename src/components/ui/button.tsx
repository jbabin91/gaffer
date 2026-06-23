'use client';

import {
  Button as ButtonPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
} from 'react-aria-components/Button';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx } from '#/lib/utils/primitive';

export const buttonStyles = tv({
  base: [
    '[--btn-border:var(--fg)]/15 [--btn-icon-active:var(--btn-fg)] [--btn-outline:var(--btn-bg)] [--btn-radius:calc(var(--radius-lg)-1px)] [--btn-ring:var(--btn-bg)]/20',
    'bg-(--btn-bg) text-(--btn-fg) outline-(--btn-outline) ring-(--btn-ring) hover:bg-(--btn-overlay)',
    'relative isolate inline-flex items-center justify-center border border-(--btn-border) font-medium hover:no-underline',
    'focus:outline-0 focus-visible:outline focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-3 focus-visible:ring-offset-bg',
    'forced-colors:[--btn-icon:ButtonText] forced-colors:hover:[--btn-icon:ButtonText] *:[svg]:-mx-0.5 *:[svg]:shrink-0 *:[svg]:self-center *:[svg]:text-(--btn-icon) hover:*:[svg]:text-(--btn-icon-active)/90 focus-visible:*:[svg]:text-(--btn-icon-active)/80',
    '*:data-[slot=loader]:-mx-0.5 *:data-[slot=loader]:shrink-0 *:data-[slot=loader]:self-center *:data-[slot=loader]:text-(--btn-icon)',
    'pending:opacity-50 disabled:opacity-50 disabled:forced-colors:text-[GrayText]',
    '*:data-[slot=color-swatch]:-mx-0.5 *:data-[slot=color-swatch]:shrink-0 *:data-[slot=color-swatch]:self-center *:data-[slot=color-swatch]:[--size:--spacing(5)]',
  ],
  defaultVariants: { intent: 'primary', isCircle: false, size: 'md' },
  variants: {
    intent: {
      danger:
        '[--btn-bg:var(--danger)] [--btn-fg:var(--danger-fg)] [--btn-icon:color-mix(in_oklab,var(--danger-fg)_60%,var(--danger)_40%)] [--btn-overlay:color-mix(in_oklab,var(--color-white)_10%,var(--danger)_90%)]',
      outline:
        'border-border [--btn-bg:transparent] [--btn-icon:var(--muted-fg)] [--btn-outline:var(--ring)] [--btn-overlay:var(--secondary)] [--btn-ring:var(--ring)]/20',
      plain:
        'border-transparent [--btn-bg:transparent] [--btn-icon:var(--muted-fg)] [--btn-outline:var(--ring)] [--btn-overlay:var(--secondary)] [--btn-ring:var(--ring)]/20',
      primary:
        '[--btn-bg:var(--primary)] [--btn-fg:var(--primary-fg)] [--btn-icon-active:var(--primary-fg)]/80 [--btn-icon:var(--primary-fg)]/60 [--btn-overlay:color-mix(in_oklab,var(--primary-fg)_10%,var(--primary)_90%)]',
      secondary:
        '[--btn-bg:var(--secondary)] [--btn-fg:var(--secondary-fg)] [--btn-icon:var(--muted-fg)] [--btn-outline:var(--secondary-fg)] [--btn-overlay:color-mix(in_oklab,var(--secondary-fg)_10%,var(--secondary)_90%)] [--btn-ring:var(--muted-fg)]/20',
      success:
        '[--btn-bg:var(--success)] [--btn-fg:var(--success-fg)] [--btn-icon:color-mix(in_oklab,var(--success-fg)_60%,var(--success)_40%)] [--btn-overlay:color-mix(in_oklab,var(--color-white)_10%,var(--success)_90%)]',
      warning:
        '[--btn-bg:var(--warning)] [--btn-fg:var(--warning-fg)] [--btn-icon:var(--warning-fg)]/60 [--btn-overlay:color-mix(in_oklab,var(--color-white)_10%,var(--warning)_90%)]',
    },
    isCircle: { false: 'rounded-lg', true: 'rounded-full' },

    size: {
      lg: [
        'min-h-10 gap-x-2 px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(3)-1px)] sm:min-h-9 sm:px-3 sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/7',
        '*:[svg]:size-5 sm:*:[svg]:size-4.5',
        '*:data-[slot=loader]:size-5 sm:*:data-[slot=loader]:size-4.5',
      ],
      md: [
        'min-h-10 gap-x-2 px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:min-h-9 sm:px-3 sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',
        '*:[svg]:size-5 sm:*:[svg]:size-4',
        '*:data-[slot=loader]:size-5 sm:*:data-[slot=loader]:size-4',
      ],
      sm: [
        'min-h-9 gap-x-1.5 px-3 py-[calc(--spacing(2)-1px)] sm:min-h-8 sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/5',
        '*:[svg]:size-4.5 sm:*:[svg]:size-4',
        '*:data-[slot=loader]:size-4.5 sm:*:data-[slot=loader]:size-4',
      ],
      'sq-lg': [
        'touch-target size-12 shrink-0 sm:size-10',
        '*:[svg]:size-6 sm:*:[svg]:size-5',
        '*:data-[slot=loader]:size-6 sm:*:data-[slot=loader]:size-5',
      ],
      'sq-md': [
        'touch-target size-11 shrink-0 sm:size-9',
        '*:[svg]:size-5 sm:*:[svg]:size-4.5',
        '*:data-[slot=loader]:size-5 sm:*:data-[slot=loader]:size-4.5',
      ],
      'sq-sm': [
        'touch-target size-10 shrink-0 sm:size-8',
        '*:[svg]:size-4.5 sm:*:[svg]:size-4',
        '*:data-[slot=loader]:size-4.5 sm:*:data-[slot=loader]:size-4',
      ],
      'sq-xs': [
        'touch-target size-8 shrink-0 sm:size-7',
        '*:[svg]:size-3.5 sm:*:[svg]:size-3',
        '*:data-[slot=loader]:size-3.5 sm:*:data-[slot=loader]:size-3',
      ],
      xs: [
        'min-h-8 gap-x-1.5 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] text-sm sm:min-h-7 sm:px-2 sm:py-[calc(--spacing(1.5)-1px)] sm:text-xs/4',
        '*:[svg]:-mx-px *:[svg]:size-3.5 sm:*:[svg]:size-3',
        '*:data-[slot=loader]:-mx-px *:data-[slot=loader]:size-3.5 sm:*:data-[slot=loader]:size-3',
      ],
    },
  },
});

export type ButtonProps = {
  ref?: React.Ref<HTMLButtonElement>;
} & ButtonPrimitiveProps &
  VariantProps<typeof buttonStyles>;

export function Button({
  className,
  intent,
  isCircle,
  ref,
  size,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      ref={ref}
      {...props}
      className={cx(buttonStyles({ intent, isCircle, size }), className)}
    />
  );
}
