import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  // A string child once rendered through a nested CheckboxButton, emitting two
  // hidden inputs (and a label-in-label) for one logical control, with the
  // accessible name only on the inner one.
  it('renders exactly one named input for a string child', () => {
    render(<Checkbox>Sign out other devices</Checkbox>);

    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(
      screen.getByRole('checkbox', { name: 'Sign out other devices' }),
    ).toBeInTheDocument();
  });

  it('renders exactly one input for a non-string child', () => {
    render(
      <Checkbox>
        <span>Notify me</span>
      </Checkbox>,
    );

    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });

  // react-aria's usePress needs the real pointer sequence user-event drives
  // (fireEvent doesn't), so the single input toggles on a user click.
  it('toggles on click', async () => {
    const user = userEvent.setup();
    render(<Checkbox>Sign out other devices</Checkbox>);
    const checkbox = screen.getByRole('checkbox', {
      name: 'Sign out other devices',
    });

    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });
});
