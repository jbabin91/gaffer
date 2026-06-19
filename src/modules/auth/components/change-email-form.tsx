'use client';

import { toast } from 'sonner';

import { useAppForm } from '#/components/forms/form';
import { AuthCard } from '#/modules/auth/components/auth-card';
import { useAuthSubmit } from '#/modules/auth/hooks/use-auth-submit';
import { authClient } from '#/modules/auth/lib/client';
import { CHANGE_EMAIL_FAILED_MESSAGE } from '#/modules/auth/messages';
import { changeEmailSchema } from '#/modules/auth/schemas/change-email';

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const submit = useAuthSubmit({
    call: (value: { newEmail: string }) =>
      authClient.changeEmail({ newEmail: value.newEmail }),
    logLabel: 'change email failed',
    mapError: () => ({ form: CHANGE_EMAIL_FAILED_MESSAGE }),
  });

  const form = useAppForm({
    defaultValues: { newEmail: '' },
    onSubmit: ({ formApi }) => {
      // A change takes two confirmations (old address, then new), so point the
      // user at the first step rather than claiming it's done.
      toast.success(`Check ${currentEmail} for a link to start the change.`);
      formApi.reset();
    },
    validators: {
      onChange: changeEmailSchema(currentEmail),
      onSubmitAsync: submit,
    },
  });

  return (
    <AuthCard
      description={`We'll email a confirmation link to ${currentEmail} before the change takes effect.`}
      footer={
        <form.AppForm>
          <form.SubmitButton>Change email</form.SubmitButton>
        </form.AppForm>
      }
      footerClassName="justify-end"
      title="Email"
      onSubmit={() => void form.handleSubmit()}
    >
      <form.AppField name="newEmail">
        {(field) => (
          <field.TextField
            autoComplete="email"
            label="New email"
            type="email"
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </AuthCard>
  );
}
