import { createFormHookContexts } from '@tanstack/react-form';

// Separate module so the field/form components can read the contexts without a
// cycle through form.ts (which calls createFormHook with those same components).
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();
