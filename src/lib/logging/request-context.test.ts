import pino from 'pino';
import { describe, expect, it } from 'vitest';

import {
  addRequestFields,
  getRequestLog,
  makeRequestId,
  runWithRequestContext,
} from './request-context';

describe('makeRequestId', () => {
  it('reuses cf-ray when present', () => {
    const request = new Request('http://x/', {
      headers: { 'cf-ray': 'ray-123' },
    });
    expect(makeRequestId(request)).toBe('ray-123');
  });

  it('falls back to x-request-id', () => {
    const request = new Request('http://x/', {
      headers: { 'x-request-id': 'req-9' },
    });
    expect(makeRequestId(request)).toBe('req-9');
  });

  it('generates a uuid when no correlation header is present', () => {
    expect(makeRequestId(new Request('http://x/'))).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('request store', () => {
  it('accumulates fields and exposes the logger inside a request', () => {
    const log = pino({ level: 'silent' });
    const fields: Record<string, unknown> = {};
    runWithRequestContext({ fields, log }, () => {
      addRequestFields({ careerId: 'c1' });
      addRequestFields({ rows: 3 });
      expect(getRequestLog()).toBe(log);
    });
    expect(fields).toEqual({ careerId: 'c1', rows: 3 });
  });

  it('is a no-op outside a request', () => {
    expect(() => addRequestFields({ a: 1 })).not.toThrow();
    expect(getRequestLog()).toBeUndefined();
  });
});
