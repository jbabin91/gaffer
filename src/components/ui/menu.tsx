import { CheckIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Button, type ButtonProps } from 'react-aria-components/Button';
import { Collection } from 'react-aria-components/Collection';
import { composeRenderProps } from 'react-aria-components/composeRenderProps';
import { Header } from 'react-aria-components/Header';
import {
  MenuItem as MenuItemPrimitive,
  type MenuItemProps as MenuItemPrimitiveProps,
  Menu as MenuPrimitive,
  type MenuProps as MenuPrimitiveProps,
  MenuSection as MenuSectionPrimitive,
  type MenuSectionProps as MenuSectionPrimitiveProps,
  MenuTrigger as MenuTriggerPrimitive,
  type MenuTriggerProps as MenuTriggerPrimitiveProps,
  SubmenuTrigger as SubmenuTriggerPrimitive,
} from 'react-aria-components/Menu';
import { twMerge } from 'tailwind-merge';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx } from '#/lib/primitive';

import {
  DropdownDescription,
  dropdownItemStyles,
  DropdownKeyboard,
  DropdownLabel,
  dropdownSectionStyles,
  DropdownSeparator,
} from './dropdown';
import { PopoverContent, type PopoverContentProps } from './popover';

export type { Selection } from 'react-aria-components/Menu';

const Menu = (props: MenuTriggerPrimitiveProps) => (
  <MenuTriggerPrimitive {...props} />
);

const MenuSubMenu = ({ delay = 0, ...props }) => (
  <SubmenuTriggerPrimitive {...props} delay={delay}>
    {props.children}
  </SubmenuTriggerPrimitive>
);

type MenuTriggerProps = { ref?: React.Ref<HTMLButtonElement> } & ButtonProps;

const MenuTrigger = ({ className, ref, ...props }: MenuTriggerProps) => (
  <Button
    ref={ref}
    className={cx(
      'relative inline text-start outline-hidden focus-visible:ring-1 focus-visible:ring-primary',
      '*:data-[slot=chevron]:size-5 sm:*:data-[slot=chevron]:size-4',
      className,
    )}
    data-slot="menu-trigger"
    {...props}
  />
);

type MenuContentProps<T> = {
  className?: string;
  popover?: Pick<
    PopoverContentProps,
    | 'arrow'
    | 'className'
    | 'placement'
    | 'offset'
    | 'crossOffset'
    | 'arrowBoundaryOffset'
    | 'triggerRef'
    | 'isOpen'
    | 'onOpenChange'
    | 'shouldFlip'
  >;
} & MenuPrimitiveProps<T> &
  Pick<PopoverContentProps, 'placement'>;

const menuContentStyles = tv({
  base: "grid max-h-[inherit] grid-cols-[auto_1fr] gap-y-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1 outline-hidden [clip-path:inset(0_0_0_0_round_calc(var(--radius-xl)-(--spacing(1))))] [&>[data-slot=menu-section]+[data-slot=menu-section]:not([class*='mt-']):not([class*='my-'])]:mt-3",
});

const MenuContent = <T extends object>({
  className,
  placement,
  popover,
  ...props
}: MenuContentProps<T>) => {
  return (
    <PopoverContent
      className={cx(
        'min-w-32 *:data-[slot=popover-inner]:overflow-hidden',
        popover?.className,
      )}
      placement={placement}
      {...popover}
    >
      <MenuPrimitive
        className={menuContentStyles({ className })}
        data-slot="menu-content"
        {...props}
      />
    </PopoverContent>
  );
};

type MenuItemProps = {} & MenuItemPrimitiveProps &
  VariantProps<typeof dropdownItemStyles>;

const MenuItem = ({ children, className, intent, ...props }: MenuItemProps) => {
  const textValue =
    props.textValue ?? (typeof children === 'string' ? children : undefined);
  return (
    <MenuItemPrimitive
      className={composeRenderProps(
        className,
        (className, { hasSubmenu, ...renderProps }) =>
          dropdownItemStyles({
            ...renderProps,
            className: hasSubmenu
              ? twMerge(
                  intent === 'danger' &&
                    'open:bg-danger-subtle open:text-danger-subtle-fg',
                  intent === 'warning' &&
                    'open:bg-warning-subtle open:text-warning-subtle-fg',
                  intent === undefined &&
                    'open:bg-accent open:text-accent-fg open:*:[.text-muted-fg]:text-accent-fg open:*:[svg]:text-accent-fg',
                  className,
                )
              : className,
            intent,
          }),
      )}
      data-slot="menu-item"
      textValue={textValue}
      {...props}
    >
      {(values) => (
        <>
          {values.isSelected &&
            ['single', 'multiple'].includes(values.selectionMode) && (
              <CheckIcon />
            )}

          {typeof children === 'function' ? children(values) : children}

          {values.hasSubmenu && (
            <ChevronRightIcon
              className="absolute inset-e-0 size-4 -translate-y-1/2"
              data-slot="chevron"
              style={{ top: 'calc(var(--spacing) * 3)' }}
            />
          )}
        </>
      )}
    </MenuItemPrimitive>
  );
};

export type MenuHeaderProps = { separator?: boolean } & React.ComponentProps<
  typeof Header
>;

const MenuHeader = ({
  className,
  separator = false,
  ...props
}: MenuHeaderProps) => (
  <Header
    className={twMerge(
      'col-span-full px-2.5 py-2 font-medium text-base sm:text-sm',
      separator && '-mx-1 border-b sm:px-3 sm:pb-2.5',
      className,
    )}
    {...props}
  />
);

const { header, section } = dropdownSectionStyles();

type MenuSectionProps<T> = {
  label?: string;
  ref?: React.Ref<HTMLDivElement>;
} & MenuSectionPrimitiveProps<T>;

const MenuSection = <T extends object>({
  children,
  className,
  ref,
  ...props
}: MenuSectionProps<T>) => {
  return (
    <MenuSectionPrimitive
      ref={ref}
      className={section({ className })}
      data-slot="menu-section"
      {...props}
    >
      {'label' in props && <Header className={header()}>{props.label}</Header>}
      <Collection items={props.items}>{children}</Collection>
    </MenuSectionPrimitive>
  );
};

const MenuSeparator = DropdownSeparator;
const MenuShortcut = DropdownKeyboard;
const MenuLabel = DropdownLabel;
const MenuDescription = DropdownDescription;

export type {
  MenuContentProps,
  MenuItemProps,
  MenuSectionProps,
  MenuTriggerProps,
};
export {
  Menu,
  MenuContent,
  menuContentStyles,
  MenuDescription,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  MenuShortcut,
  MenuSubMenu,
  MenuTrigger,
};
