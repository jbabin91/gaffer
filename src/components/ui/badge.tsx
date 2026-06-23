import { tv } from 'tailwind-variants';

export const badgeStyles = tv({
  base: [
    'inline-flex items-center gap-x-1.5 py-px font-medium text-xs/5 forced-colors:outline',
    'border border-(--badge-border,transparent) bg-(--badge-bg) text-(--badge-fg)',
    'group-hover:bg-(--badge-overlay) group-focus:bg-(--badge-overlay)',
    '*:data-[slot=icon]:size-3 *:data-[slot=icon]:shrink-0',
    'duration-200',
  ],
  defaultVariants: { intent: 'primary', isCircle: true },
  variants: {
    intent: {
      danger:
        '[--badge-bg:var(--danger-subtle)] [--badge-fg:var(--danger-subtle-fg)] [--badge-overlay:var(--danger)]/20',
      info: '[--badge-bg:var(--info-subtle)] [--badge-fg:var(--info-subtle-fg)] [--badge-overlay:var(--color-sky-500)]/20',
      outline:
        '[--badge-border:var(--border)] [--badge-overlay:var(--secondary)]/20',
      primary:
        '[--badge-bg:var(--primary-subtle)] [--badge-fg:var(--primary-subtle-fg)] [--badge-overlay:var(--primary)]/20',
      secondary:
        '[--badge-bg:var(--secondary)] [--badge-fg:var(--secondary-fg)] [--badge-overlay:var(--muted-fg)]/25',
      success:
        '[--badge-bg:var(--success-subtle)] [--badge-fg:var(--success-subtle-fg)] [--badge-overlay:var(--success)]/20',
      warning:
        '[--badge-bg:var(--warning-subtle)] [--badge-fg:var(--warning-subtle-fg)] [--badge-overlay:var(--warning)]/20',
    },
    isCircle: {
      false: 'rounded-sm px-[calc(--spacing(1.5)-1px)]',
      true: 'rounded-full px-[calc(--spacing(2)-1px)]',
    },
  },
});

export type BadgeProps = {
  intent?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'outline';
  isCircle?: boolean;
} & React.ComponentProps<'span'>;

export function Badge({ className, intent, isCircle, ...props }: BadgeProps) {
  return (
    <span {...props} className={badgeStyles({ className, intent, isCircle })} />
  );
}
