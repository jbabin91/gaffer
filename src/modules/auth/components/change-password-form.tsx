'use client';

import { toast } from 'sonner';

import { useAppForm } from '#/components/forms/form';
import { Checkbox } from '#/components/ui/checkbox';
import { AuthCard } from '#/modules/auth/components/auth-card';
import { useAuthSubmit } from '#/modules/auth/hooks/use-auth-submit';
import { authClient } from '#/modules/auth/lib/client';
import { changePasswordFormError } from '#/modules/auth/messages';
import { changePasswordSchema } from '#/modules/auth/schemas/change-password';

export function ChangePasswordForm() {
  const submit = useAuthSubmit({
    call: (value: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions: boolean;
    }) => authClient.changePassword(value),
    logLabel: 'password change failed',
    mapError: (error) => changePasswordFormError(error.code),
  });

  const form = useAppForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      revokeOtherSessions: false,
    },
    onSubmit: ({ formApi }) => {
      toast.success('Password changed.');
      formApi.reset();
    },
    validators: { onChange: changePasswordSchema, onSubmitAsync: submit },
  });

  return (
    <AuthCard
      description="Changing your password keeps you signed in here; choose whether to sign out everywhere else."
      footer={
        <form.AppForm>
          <form.SubmitButton>Change password</form.SubmitButton>
        </form.AppForm>
      }
      footerClassName="justify-end"
      title="Password"
      onSubmit={() => void form.handleSubmit()}
    >
      <form.AppField name="currentPassword">
        {(field) => (
          <field.TextField
            autoComplete="current-password"
            label="Current password"
            type="password"
          />
        )}
      </form.AppField>
      <form.AppField name="newPassword">
        {(field) => (
          <field.TextField
            autoComplete="new-password"
            label="New password"
            type="password"
          />
        )}
      </form.AppField>
      <form.AppField name="revokeOtherSessions">
        {(field) => (
          <Checkbox
            isSelected={field.state.value}
            onChange={field.handleChange}
          >
            Sign out other devices
          </Checkbox>
        )}
      </form.AppField>
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </AuthCard>
  );
}
