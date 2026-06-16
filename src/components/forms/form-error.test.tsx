import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAppForm } from './form';

function ServerErrorForm() {
  const form = useAppForm({
    defaultValues: { email: 'manager@example.com' },
    onSubmit: () => {},
    validators: {
      onSubmitAsync: () => ({ form: 'Invalid email or password.' }),
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppForm>
        <form.FormError />
        <form.SubmitButton>Submit</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

describe('FormError', () => {
  it('renders the form-level error returned from onSubmitAsync', async () => {
    render(<ServerErrorForm />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid email or password.',
      ),
    );
  });
});

function FieldErrorForm() {
  const form = useAppForm({
    defaultValues: { inviteCode: '' },
    onSubmit: () => {},
    validators: {
      onSubmitAsync: () => ({
        fields: { inviteCode: 'This invite code is not valid.' },
      }),
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppField name="inviteCode">
        {(field) => <field.TextField label="Invite code" type="text" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Submit</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

describe('onSubmitAsync field errors', () => {
  it('maps a server field error onto the matching FormTextField', async () => {
    render(<FieldErrorForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(
        screen.getByText('This invite code is not valid.'),
      ).toBeInTheDocument(),
    );
  });
});
