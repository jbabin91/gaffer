import type { TextProps } from 'react-aria-components/Text';

import { XMarkIcon } from '@heroicons/react/24/solid';
import { Button as PrimitiveButton } from 'react-aria-components/Button';
import { Dialog as PrimitiveDialog } from 'react-aria-components/Dialog';
import { Heading, type HeadingProps } from 'react-aria-components/Heading';
import { twMerge } from 'tailwind-merge';

import { cx } from '#/lib/primitive';

import { Button, type ButtonProps } from './button';

const Dialog = ({
  className,
  role = 'dialog',
  ...props
}: React.ComponentProps<typeof PrimitiveDialog>) => {
  return (
    <PrimitiveDialog
      className={twMerge(
        'peer/dialog group/dialog relative flex max-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding))] flex-col overflow-hidden outline-hidden [--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]',
        className,
      )}
      data-slot="dialog"
      role={role}
      {...props}
    />
  );
};

const DialogTrigger = ({ className, ...props }: ButtonProps) => (
  <PrimitiveButton className={cx('cursor-pointer', className)} {...props} />
);

type DialogHeaderProps = { description?: string; title?: string } & Omit<
  React.ComponentProps<'div'>,
  'title'
>;

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => {
  return (
    <div
      className={twMerge(
        'relative space-y-1 p-(--gutter) pb-[calc(var(--gutter)-(--spacing(3)))]',
        className,
      )}
      data-slot="dialog-header"
    >
      {props.title && <DialogTitle>{props.title}</DialogTitle>}
      {props.description && (
        <DialogDescription>{props.description}</DialogDescription>
      )}
      {!props.title && typeof props.children === 'string' ? (
        <DialogTitle>{props.children}</DialogTitle>
      ) : (
        props.children
      )}
    </div>
  );
};

type DialogTitleProps = { ref?: React.Ref<HTMLHeadingElement> } & HeadingProps;
const DialogTitle = ({ className, ref, ...props }: DialogTitleProps) => (
  <Heading
    ref={ref}
    className={twMerge(
      'text-balance font-semibold text-fg text-lg/6 sm:text-base/6',
      className,
    )}
    slot="title"
    {...props}
  />
);

type DialogDescriptionProps = { ref?: React.Ref<HTMLDivElement> } & TextProps;
const DialogDescription = ({
  className,
  ref,
  ...props
}: DialogDescriptionProps) => (
  <p
    ref={ref}
    className={twMerge(
      'text-pretty text-base/6 text-muted-fg group-disabled:opacity-50 sm:text-sm/6',
      className,
    )}
    data-slot="description"
    {...props}
  />
);

type DialogBodyProps = {} & React.ComponentProps<'div'>;
const DialogBody = ({ className, ...props }: DialogBodyProps) => (
  <div
    className={twMerge(
      'isolate flex min-h-0 flex-1 flex-col overflow-auto px-(--gutter) py-1',
      '**:data-[slot=dialog-footer]:px-0 **:data-[slot=dialog-footer]:pt-0',
      className,
    )}
    data-slot="dialog-body"
    {...props}
  />
);

type DialogFooterProps = {} & React.ComponentProps<'div'>;
const DialogFooter = ({ className, ...props }: DialogFooterProps) => {
  return (
    <div
      className={twMerge(
        'isolate mt-auto flex flex-col-reverse justify-end gap-3 p-(--gutter) pt-[calc(var(--gutter)-(--spacing(2)))] group-not-has-data-[slot=dialog-body]/dialog:pt-0 group-not-has-data-[slot=dialog-body]/popover:pt-0 sm:flex-row',
        className,
      )}
      data-slot="dialog-footer"
      {...props}
    />
  );
};

const DialogClose = ({ intent = 'plain', ref, ...props }: ButtonProps) => {
  return <Button ref={ref} intent={intent} slot="close" {...props} />;
};

type CloseButtonIndicatorProps = {
  className?: string;
  isDismissable?: boolean | undefined;
} & Omit<ButtonProps, 'children'>;

const DialogCloseIcon = ({
  className,
  ...props
}: CloseButtonIndicatorProps) => {
  return props.isDismissable ? (
    <PrimitiveButton
      aria-label="Close"
      className={cx(
        'close absolute inset-e-1 top-1 z-50 grid size-8 place-content-center rounded-xl hover:bg-secondary focus:bg-secondary focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary sm:inset-e-2 sm:top-2 sm:size-7 sm:rounded-md',
        className,
      )}
      slot="close"
    >
      <XMarkIcon className="size-4" />
    </PrimitiveButton>
  ) : null;
};

export type {
  CloseButtonIndicatorProps,
  DialogBodyProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogTitleProps,
};
export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogCloseIcon,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
