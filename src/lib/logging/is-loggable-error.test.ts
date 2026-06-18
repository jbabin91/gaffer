import { notFound, redirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';

import { isLoggableError } from './is-loggable-error';

describe('isLoggableError', () => {
  it('treats genuine errors as loggable', () => {
    expect(isLoggableError(new Error('boom'))).toBe(true);
    expect(isLoggableError(new TypeError('bad'))).toBe(true);
  });

  it('skips router control-flow throws', () => {
    expect(isLoggableError(redirect({ href: '/login' }))).toBe(false);
    expect(isLoggableError(notFound())).toBe(false);
  });

  it('skips sub-5xx Responses but logs 5xx server faults', () => {
    expect(isLoggableError(new Response(null, { status: 302 }))).toBe(false);
    expect(isLoggableError(new Response(null, { status: 404 }))).toBe(false);
    expect(isLoggableError(new Response(null, { status: 500 }))).toBe(true);
    expect(isLoggableError(new Response(null, { status: 503 }))).toBe(true);
  });
});
