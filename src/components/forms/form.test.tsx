import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { useAppForm } from './form';

const emailSchema = z.object({ email: z.email('Enter a valid email') });

function EmailForm({
  mode = 'onSubmit',
  onSubmit = () => {},
}: {
  mode?: 'onChange' | 'onSubmit';
  onSubmit?: (value: { email: string }) => void;
}) {
  const form = useAppForm({
    defaultValues: { email: '' },
    onSubmit: ({ value }) => onSubmit(value),
    validators:
      mode === 'onChange'
        ? { onChange: emailSchema }
        : { onSubmit: emailSchema },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Submit</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

describe('useAppForm + field wrappers', () => {
  it('renders the field label bound to the input', () => {
    render(<EmailForm />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows the schema error and blocks submit when invalid', async () => {
    const onSubmit = vi.fn();
    render(<EmailForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the parsed value when valid', async () => {
    const onSubmit = vi.fn();
    render(<EmailForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'manager@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ email: 'manager@example.com' }),
    );
  });

  it('disables submit until the field is valid', async () => {
    render(<EmailForm mode="onChange" />);
    const button = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'not-an-email' },
    });
    await waitFor(() => expect(button).toBeDisabled());

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'manager@example.com' },
    });
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('keeps the submit button pending while submitting', async () => {
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    function AsyncForm() {
      const form = useAppForm({
        defaultValues: { email: 'manager@example.com' },
        onSubmit: () => gate,
        validators: { onChange: emailSchema },
      });

      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.AppField name="email">
            {(field) => <field.TextField label="Email" type="email" />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton>Submit</form.SubmitButton>
          </form.AppForm>
        </form>
      );
    }

    render(<AsyncForm />);
    const button = screen.getByRole('button', { name: 'Submit' });

    fireEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('data-pending'));

    release?.();
    await waitFor(() => expect(button).not.toHaveAttribute('data-pending'));
  });

  it('clears the error once the value is corrected', async () => {
    render(<EmailForm mode="onChange" />);
    const input = screen.getByLabelText('Email');

    fireEvent.change(input, { target: { value: 'bad' } });
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'ok@example.com' } });
    await waitFor(() =>
      expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument(),
    );
  });
});

function PasswordForm() {
  const form = useAppForm({
    defaultValues: { password: '' },
    onSubmit: () => {},
    validators: {
      onChange: z.object({
        password: z.string().min(8, 'Min 8 chars').regex(/\d/, 'Need a digit'),
      }),
    },
  });

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <form.AppField name="password">
        {(field) => <field.TextField label="Password" type="password" />}
      </form.AppField>
    </form>
  );
}

describe('FormTextField rendering', () => {
  it('renders a password input and joins multiple field errors', async () => {
    render(<PasswordForm />);
    const input = screen.getByLabelText('Password');

    expect(input).toHaveAttribute('type', 'password');

    fireEvent.change(input, { target: { value: 'abc' } });

    // 'abc' fails both min(8) and the digit rule — both messages, joined.
    await waitFor(() =>
      expect(screen.getByText(/Min 8 chars/)).toHaveTextContent(
        'Min 8 chars, Need a digit',
      ),
    );
  });
});

function SignInForm() {
  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    onSubmit: () => {},
    validators: {
      onChange: z.object({
        email: z.email('Bad email'),
        password: z.string().min(8, 'Min 8'),
      }),
    },
  });

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" />}
      </form.AppField>
      <form.AppField name="password">
        {(field) => <field.TextField label="Password" type="password" />}
      </form.AppField>
    </form>
  );
}

describe('multi-field binding', () => {
  it('keeps each field independent', async () => {
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'good@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'x' },
    });

    await waitFor(() => expect(screen.getByText('Min 8')).toBeInTheDocument());
    expect(screen.queryByText('Bad email')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('good@example.com');
  });
});
