// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UNEXPECTED_ERROR_MESSAGE } from '#/lib/auth/errors';

import { RootError } from './root-error';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

const logError = vi.hoisted(() => vi.fn());
vi.mock('#/lib/logger', () => ({ logError }));

describe('RootError', () => {
  it('renders curated copy and never leaks the raw error message', () => {
    const secret = 'connect ECONNREFUSED 10.0.0.5:5432';

    render(<RootError error={new Error(secret)} />);

    expect(screen.getByText(UNEXPECTED_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(secret)).not.toBeInTheDocument();
  });

  it('logs the raw cause for diagnosis', () => {
    const error = new Error('boom');

    render(<RootError error={error} />);

    expect(logError).toHaveBeenCalledWith(error, expect.any(String));
  });
});
