'use client';

import { fieldErrorStyles } from '#/components/ui/field';

import { useFormContext } from './context';

// A schema error arrives as a bare string; onSubmitAsync's whole-form message
// arrives under the `form` key.
function formErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'form' in error) {
    return typeof error.form === 'string' ? error.form : undefined;
  }
  return undefined;
}

export function FormError() {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
      {(error) => {
        const message = formErrorMessage(error);

        return message ? (
          <p className={fieldErrorStyles()} role="alert">
            {message}
          </p>
        ) : null;
      }}
    </form.Subscribe>
  );
}
