import { redirect } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';

import { handleRequestError } from './handle-request-error';

const context = {
  fn: 'listCareers',
  handlerType: 'serverFn' as const,
  method: 'GET',
  pathname: '/',
};

describe('handleRequestError', () => {
  it('logs a genuine error and rethrows the original', () => {
    const error = vi.fn();
    const boom = new Error('boom');
    expect(() => handleRequestError({ error }, boom, context)).toThrow(boom);
    expect(error).toHaveBeenCalledOnce();
    expect(error.mock.calls[0]?.[0]).toMatchObject({
      err: boom,
      fn: 'listCareers',
    });
  });

  it('rethrows router control flow without logging', () => {
    const error = vi.fn();
    expect(() =>
      handleRequestError({ error }, redirect({ href: '/login' }), context),
    ).toThrow();
    expect(error).not.toHaveBeenCalled();
  });
});
