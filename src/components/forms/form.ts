import { createFormHook } from '@tanstack/react-form';

import { fieldContext, formContext } from './context';
import { SubmitButton } from './submit-button';
import { FormTextField } from './text-field';

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { TextField: FormTextField },
  fieldContext,
  formComponents: { SubmitButton },
  formContext,
});
