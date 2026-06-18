import {
  type DialogProps,
  DialogTrigger as DialogTriggerPrimitive,
  type DialogTriggerProps,
} from 'react-aria-components/Dialog';
import {
  ModalOverlay,
  type ModalOverlayProps,
  Modal as ModalPrimitive,
} from 'react-aria-components/Modal';

import { cx } from '#/lib/utils/primitive';

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogCloseIcon,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const Modal = (props: DialogTriggerProps) => {
  return <DialogTriggerPrimitive {...props} />;
};

const sizes = {
  '2xl': 'sm:max-w-2xl',
  '2xs': 'sm:max-w-2xs',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  fullscreen: '',
  lg: 'sm:max-w-lg',
  md: 'sm:max-w-md',
  sm: 'sm:max-w-sm',
  xl: 'sm:max-w-xl',
  xs: 'sm:max-w-xs',
};

type ModalContentProps = {
  closeButton?: boolean;
  overlay?: Pick<ModalOverlayProps, 'className'>;
  size?: keyof typeof sizes;
} & Omit<ModalOverlayProps, 'children'> &
  Pick<DialogProps, 'aria-label' | 'aria-labelledby' | 'role' | 'children'>;

const ModalContent = ({
  children,
  className,
  closeButton = true,
  isDismissable: isDismissableInternal,
  overlay,
  role = 'dialog',
  size = 'md',
  ...props
}: ModalContentProps) => {
  const isDismissable = isDismissableInternal ?? role !== 'alertdialog';
  return (
    <ModalOverlay
      className={cx(
        'fixed inset-s-0 top-0 z-50 h-(--visual-viewport-height,100vh) w-screen',
        'bg-bg/15 backdrop-blur-[1px] motion-reduce:backdrop-blur-none',
        'grid grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr]',
        'entering:animate-in entering:duration-300 entering:ease-out entering:fade-in',
        'exiting:animate-out exiting:ease-in exiting:fade-out',
        size === 'fullscreen' ? 'md:p-3' : 'md:p-4',
        overlay?.className,
      )}
      data-slot="modal-overlay"
      isDismissable={isDismissable}
      {...props}
    >
      <ModalPrimitive
        className={cx(
          'row-start-2 w-full text-start align-middle',
          '[--visual-viewport-vertical-padding:16px]',
          size === 'fullscreen'
            ? '**:data-[slot=dialog-body]:min-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding)-var(--dialog-header-height)-var(--dialog-footer-height))] sm:[--visual-viewport-vertical-padding:16px]'
            : 'sm:[--visual-viewport-vertical-padding:32px]',
          'relative overflow-hidden bg-overlay text-overlay-fg',
          'rounded-t-2xl ring inset-shadow-xs ring-muted-fg/25 drop-shadow-xl sm:rounded-2xl dark:ring-border',
          sizes[size],
          'entering:animate-in entering:duration-300 entering:ease-out entering:slide-in-from-bottom sm:entering:slide-in-from-bottom-0 sm:entering:zoom-in-95',
          'exiting:animate-out exiting:ease-in exiting:slide-out-to-bottom sm:exiting:slide-out-to-bottom-0 sm:exiting:zoom-out-95',
          className,
        )}
        data-slot="modal-content"
      >
        <Dialog role={role}>
          {(values) => (
            <>
              {typeof children === 'function' ? children(values) : children}
              {closeButton && <DialogCloseIcon isDismissable={isDismissable} />}
            </>
          )}
        </Dialog>
      </ModalPrimitive>
    </ModalOverlay>
  );
};

const ModalTrigger = DialogTrigger;
const ModalHeader = DialogHeader;
const ModalTitle = DialogTitle;
const ModalDescription = DialogDescription;
const ModalFooter = DialogFooter;
const ModalBody = DialogBody;
const ModalClose = DialogClose;

export {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
};
