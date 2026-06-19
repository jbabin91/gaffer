import { CheckIcon, MinusIcon } from '@heroicons/react/20/solid';
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
} from 'react-aria-components/Checkbox';
import {
  CheckboxGroup as CheckboxGroupPrimitive,
  type CheckboxGroupProps,
} from 'react-aria-components/CheckboxGroup';
import { composeRenderProps } from 'react-aria-components/composeRenderProps';
import { twMerge } from 'tailwind-merge';

import { cx } from '#/lib/utils/primitive';

export function CheckboxGroup({ className, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      {...props}
      className={cx(
        'space-y-3 has-[[slot=description]]:space-y-6 has-[[slot=description]]:**:data-[slot=label]:font-medium **:[[slot=description]]:block',
        className,
      )}
      data-slot="control"
    />
  );
}

export function Checkbox({
  children,
  className,
  ...props
}: CheckboxFieldProps) {
  return (
    <CheckboxField
      data-slot="control"
      {...props}
      className={cx('group block disabled:opacity-50', className)}
    >
      <CheckboxButton>
        {composeRenderProps(
          children,
          (children, { isIndeterminate, isInvalid, isSelected }) => {
            const isStringChild = typeof children === 'string';
            const indicator = isIndeterminate ? (
              <MinusIcon data-slot="check-indicator" />
            ) : isSelected ? (
              <CheckIcon data-slot="check-indicator" />
            ) : null;

            // A string child renders as a plain span, not a second
            // CheckboxButton: each CheckboxButton emits its own hidden input, so
            // nesting one inside another yields two inputs (and a label-in-label)
            // for one logical control.
            const content = isStringChild ? (
              <span
                className="text-base/6 sm:text-sm/6"
                data-slot="control-label"
              >
                {children}
              </span>
            ) : (
              children
            );

            return (
              <div
                className={twMerge(
                  'grid grid-cols-[1.125rem_1fr] items-center gap-y-1 has-data-[slot=control-label]:gap-x-3 sm:grid-cols-[1rem_1fr]',
                  '*:data-[slot=indicator]:col-start-1 *:data-[slot=indicator]:row-start-1',
                  '*:data-[slot=control-label]:col-start-2 *:data-[slot=control-label]:row-start-1',
                  '*:[[slot=description]]:col-start-2 *:[[slot=description]]:row-start-2',
                  'has-[[slot=description]]:**:data-[slot=control-label]:font-medium',
                )}
              >
                <span
                  className={twMerge([
                    'relative inset-ring inset-ring-input isolate flex shrink-0 items-center justify-center rounded-sm bg-(--control-bg,transparent) text-bg transition group-hover:inset-ring-muted-fg/30',
                    'size-4.5 *:data-[slot=check-indicator]:size-4 sm:size-4 sm:*:data-[slot=check-indicator]:size-3.5',
                    'in-disabled:bg-muted',
                    (isSelected || isIndeterminate) && [
                      'inset-ring-(--checkbox-ring,var(--color-ring)) bg-(--checkbox-bg,var(--color-primary)) text-(--checkbox-fg,var(--color-primary-fg))',
                      'group-invalid:inset-ring/70 group-invalid:bg-danger group-invalid:text-danger-fg dark:group-invalid:inset-ring-danger-subtle-fg/70',
                    ],
                    isInvalid &&
                      'inset-ring-danger-subtle-fg/70 bg-danger-subtle/5 text-danger-fg ring-danger-subtle-fg/20 group-hover:inset-ring-danger-subtle-fg/70',
                  ])}
                  data-slot="indicator"
                >
                  {indicator}
                </span>
                {content}
              </div>
            );
          },
        )}
      </CheckboxButton>
    </CheckboxField>
  );
}
