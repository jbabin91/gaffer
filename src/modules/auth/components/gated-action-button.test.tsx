import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GatedActionButton } from './gated-action-button';

const toastInfo = vi.hoisted(() => vi.fn());
vi.mock('sonner', () => ({ toast: { info: toastInfo } }));

describe('GatedActionButton', () => {
  it('stays focusable via aria-disabled and explains the gate on press', () => {
    render(
      <GatedActionButton gateMessage="Verify your email to add players.">
        Add player
      </GatedActionButton>,
    );

    const button = screen.getByRole('button', { name: 'Add player' });
    // aria-disabled (not the native disabled attr) keeps it keyboard-reachable.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('disabled');

    fireEvent.click(button);
    expect(toastInfo).toHaveBeenCalledWith('Verify your email to add players.');
  });
});
