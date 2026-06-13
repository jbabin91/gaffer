import {
  TextField as TextFieldPrimitive,
  type TextFieldProps as TextFieldPrimitiveProps,
} from 'react-aria-components/TextField';

import { cx } from '#/lib/primitive';

import { fieldStyles } from './field';

type TextFieldProps = {
  ref?: React.RefObject<HTMLInputElement | null>;
} & TextFieldPrimitiveProps;

export function TextField({ className, ref, ...props }: TextFieldProps) {
  return (
    <TextFieldPrimitive
      ref={ref}
      className={cx(fieldStyles(), className)}
      data-slot="control"
      {...props}
    />
  );
}
