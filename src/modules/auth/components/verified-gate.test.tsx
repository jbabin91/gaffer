import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { VerifiedGate } from './verified-gate';

const useEmailVerified = vi.hoisted(() => vi.fn());
vi.mock('#/modules/auth/hooks/use-email-verified', () => ({
  useEmailVerified,
}));

function renderGate() {
  render(
    <VerifiedGate fallback={<span>gated</span>}>
      <span>real</span>
    </VerifiedGate>,
  );
}

describe('VerifiedGate', () => {
  it('renders children when verified', () => {
    useEmailVerified.mockReturnValue({ verified: true });

    renderGate();

    expect(screen.getByText('real')).toBeInTheDocument();
    expect(screen.queryByText('gated')).not.toBeInTheDocument();
  });

  it('renders the fallback when unverified (fail-closed)', () => {
    useEmailVerified.mockReturnValue({ verified: false });

    renderGate();

    expect(screen.getByText('gated')).toBeInTheDocument();
    expect(screen.queryByText('real')).not.toBeInTheDocument();
  });
});
