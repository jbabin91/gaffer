'use client';

import { FieldError, Label } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { TextField as TextFieldRoot } from '#/components/ui/text-field';

import { useFieldContext } from './context';

type FormTextFieldProps = {
  autoComplete?: string;
  isRequired?: boolean;
  label: string;
  placeholder?: string;
  type?: 'email' | 'password' | 'text';
};

/**
 * A TanStack Form field bound to the Intent UI `TextField`. Reads value/errors
 * from the field store and drives React Aria with `validationBehavior="aria"`, so
 * the form library owns validation while RAC owns the invalid styling + a11y.
 */
export function FormTextField({
  autoComplete,
  isRequired,
  label,
  placeholder,
  type = 'text',
}: FormTextFieldProps) {
  // Reactive inside form.AppField's subscription, so reading field.state here
  // re-renders on change (TanStack Form's documented custom-field pattern).
  const field = useFieldContext<string>();
  const { errors } = field.state.meta;

  const message = errors
    .map((error) =>
      typeof error === 'string'
        ? error
        : (error as { message?: string } | undefined)?.message,
    )
    .filter(Boolean)
    .join(', ');

  return (
    <TextFieldRoot
      isInvalid={errors.length > 0}
      isRequired={isRequired}
      name={field.name}
      type={type}
      validationBehavior="aria"
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
    >
      <Label>{label}</Label>
      <Input autoComplete={autoComplete} placeholder={placeholder} />
      <FieldError>{message}</FieldError>
    </TextFieldRoot>
  );
}
