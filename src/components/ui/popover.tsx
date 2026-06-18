'use client';

import {
  DialogTrigger as DialogTriggerPrimitive,
  type DialogTriggerProps,
} from 'react-aria-components/Dialog';
import {
  OverlayArrow,
  Popover as PopoverPrimitive,
  type PopoverProps,
} from 'react-aria-components/Popover';

import { cx } from '#/lib/utils/primitive';

import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const Popover = (props: DialogTriggerProps) => {
  return <DialogTriggerPrimitive {...props} />;
};

const PopoverTitle = DialogTitle;
const PopoverHeader = DialogHeader;
const PopoverBody = DialogBody;
const PopoverFooter = DialogFooter;

type PopoverContentProps = {
  arrow?: boolean;
  ref?: React.Ref<HTMLDivElement>;
} & PopoverProps;

const PopoverContent = ({
  arrow = false,
  children,
  className,
  ref,
  ...props
}: PopoverContentProps) => {
  const offset = props.offset ?? (arrow ? 12 : 8);
  return (
    <PopoverPrimitive
      ref={ref}
      className={cx(
        '[--visual-viewport-vertical-padding:16px] sm:[--visual-viewport-vertical-padding:32px]',
        'group/popover max-w-xs min-w-(--trigger-width) origin-(--trigger-anchor-point) rounded-(--popover-radius) bg-overlay text-overlay-fg shadow-xs ring ring-muted-fg/20 outline-hidden drop-shadow-xl transition-transform [--gutter:--spacing(6)] [--popover-radius:var(--radius-lg)] sm:text-sm dark:ring-border dark:backdrop-saturate-200 **:[[role=dialog]]:[--gutter:--spacing(6)]',
        'entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out',
        'placement-left:entering:slide-in-from-right-1 placement-right:entering:slide-in-from-left-1 placement-top:entering:slide-in-from-bottom-1 placement-bottom:entering:slide-in-from-top-1',
        'placement-left:exiting:slide-out-to-right-1 placement-right:exiting:slide-out-to-left-1 placement-top:exiting:slide-out-to-bottom-1 placement-bottom:exiting:slide-out-to-top-1',
        'forced-colors:bg-[Canvas]',
        className,
      )}
      offset={offset}
      {...props}
    >
      {(values) => (
        <>
          {arrow && (
            <OverlayArrow className="group">
              <svg
                className="block fill-overlay stroke-border group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180 forced-colors:fill-[Canvas] forced-colors:stroke-[ButtonBorder]"
                height={12}
                viewBox="0 0 12 12"
                width={12}
              >
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
          )}
          <div
            className="max-h-[inherit] overflow-y-auto"
            data-slot="popover-inner"
          >
            {typeof children === 'function' ? children(values) : children}
          </div>
        </>
      )}
    </PopoverPrimitive>
  );
};

const PopoverTrigger = DialogTrigger;
const PopoverClose = DialogClose;
const PopoverDescription = DialogDescription;

export type { PopoverContentProps };
export {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};

export { type PopoverProps } from 'react-aria-components/Popover';
