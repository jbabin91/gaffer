'use client';

import type { InputProps as PrimitiveInputProps } from 'react-aria-components/Input';

import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';
import { Button, type ButtonProps } from 'react-aria-components/Button';
import {
  NumberField as NumberFieldPrimitive,
  type NumberFieldProps,
} from 'react-aria-components/NumberField';

import { Input, InputGroup } from '#/components/ui/input';
import { cx } from '#/lib/primitive';

import { fieldStyles } from './field';

const NumberField = ({ className, ...props }: NumberFieldProps) => {
  return (
    <NumberFieldPrimitive
      {...props}
      className={cx(fieldStyles(), className)}
      data-slot="control"
    />
  );
};

type InputProps = {
  ref?: React.RefObject<HTMLInputElement>;
} & PrimitiveInputProps;

function NumberInput({ className, ...props }: InputProps) {
  return (
    <InputGroup className="[--input-gutter-end:--spacing(20)]">
      <Input className={cx('tabular-nums', className)} {...props} />
      <div
        className="pointer-events-auto inset-e-0 p-px in-disabled:pointer-events-none in-disabled:opacity-50"
        data-slot="text"
      >
        <div className="flex h-full items-center divide-x overflow-hidden rounded-e-[calc(var(--radius-lg)-1px)] border-s">
          <StepperButton slot="decrement" />
          <StepperButton slot="increment" />
        </div>
      </div>
    </InputGroup>
  );
}

type StepperButtonProps = {
  className?: string;
  slot: 'increment' | 'decrement';
} & ButtonProps;

const StepperButton = ({ className, slot, ...props }: StepperButtonProps) => {
  return (
    <Button
      className={cx(
        'inline-grid place-content-center text-muted-fg enabled:hover:text-fg pressed:text-fg',
        'size-full min-w-11 grow bg-input/20 sm:min-w-8.5 pressed:bg-input/60',
        '*:data-[slot=stepper-icon]:size-5 sm:*:data-[slot=stepper-icon]:size-4',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      slot={slot}
      {...props}
    >
      {slot === 'increment' ? (
        <PlusIcon data-slot="stepper-icon" />
      ) : (
        <MinusIcon data-slot="stepper-icon" />
      )}
    </Button>
  );
};

export { NumberField, NumberInput };

export { type NumberFieldProps } from 'react-aria-components/NumberField';
