import { redirect } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';

import {
  emitRequestLog,
  type RequestLogBase,
  runInstrumented,
} from './request-log';

const base: RequestLogBase = {
  fn: 'listCareers',
  handlerType: 'serverFn',
  method: 'GET',
  pathname: '/',
};

function makeLogger() {
  return { error: vi.fn(), info: vi.fn() };
}

describe('emitRequestLog', () => {
  it('logs a successful request at info with status and duration', () => {
    const logger = makeLogger();
    emitRequestLog(logger, base, {}, { durationMs: 12, status: 200 });
    expect(logger.info).toHaveBeenCalledOnce();
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.info.mock.calls[0]?.[0]).toMatchObject({
      durationMs: 12,
      fn: 'listCareers',
      status: 200,
    });
  });

  it('logs a thrown fault at error with err attached', () => {
    const logger = makeLogger();
    const boom = new Error('boom');
    emitRequestLog(logger, base, {}, { durationMs: 5, error: boom });
    expect(logger.error).toHaveBeenCalledOnce();
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error.mock.calls[0]?.[0]).toMatchObject({ err: boom });
  });

  it('logs a 5xx response at error without an err', () => {
    const logger = makeLogger();
    emitRequestLog(logger, base, {}, { durationMs: 8, status: 503 });
    expect(logger.error).toHaveBeenCalledOnce();
    expect(logger.error.mock.calls[0]?.[0]).not.toHaveProperty('err');
  });

  it('logs control-flow throws (redirect) at info, not error', () => {
    const logger = makeLogger();
    emitRequestLog(
      logger,
      base,
      {},
      { durationMs: 3, error: redirect({ href: '/login' }) },
    );
    expect(logger.info).toHaveBeenCalledOnce();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('merges accumulated fields into the line', () => {
    const logger = makeLogger();
    emitRequestLog(
      logger,
      base,
      { careerId: 'c1' },
      { durationMs: 1, status: 200 },
    );
    expect(logger.info.mock.calls[0]?.[0]).toMatchObject({
      careerId: 'c1',
      pathname: '/',
      status: 200,
    });
  });

  it('keeps canonical dimensions when a stray field collides', () => {
    const logger = makeLogger();
    emitRequestLog(
      logger,
      base,
      { pathname: 'spoofed', status: 999 },
      { durationMs: 1, status: 200 },
    );
    expect(logger.info.mock.calls[0]?.[0]).toMatchObject({
      pathname: '/',
      status: 200,
    });
  });

  it('never throws on a logging failure; falls back to an error line', () => {
    const logger = {
      error: vi.fn(),
      info: vi.fn(() => {
        throw new Error('pino boom');
      }),
    };
    expect(() =>
      emitRequestLog(logger, base, {}, { durationMs: 1, status: 200 }),
    ).not.toThrow();
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'request-log emit failed',
    );
  });

  it('never throws even when the fallback logger also throws', () => {
    const logger = {
      error: vi.fn(() => {
        throw new Error('error boom');
      }),
      info: vi.fn(() => {
        throw new Error('info boom');
      }),
    };
    expect(() =>
      emitRequestLog(logger, base, {}, { durationMs: 1, status: 200 }),
    ).not.toThrow();
  });
});

describe('runInstrumented', () => {
  it('logs success with status and returns the original result', async () => {
    const logger = makeLogger();
    const result = { response: { status: 200 } };
    await expect(
      runInstrumented(logger, base, {}, () => Promise.resolve(result)),
    ).resolves.toBe(result);
    expect(logger.info).toHaveBeenCalledOnce();
    expect(logger.info.mock.calls[0]?.[0]).toMatchObject({ status: 200 });
  });

  it('logs the error and rethrows the original on throw', async () => {
    const logger = makeLogger();
    const boom = new Error('boom');
    await expect(
      runInstrumented(logger, base, {}, () => {
        throw boom;
      }),
    ).rejects.toBe(boom);
    expect(logger.error).toHaveBeenCalledOnce();
    expect(logger.error.mock.calls[0]?.[0]).toMatchObject({ err: boom });
  });

  it('includes fields accumulated during next() on the emitted line', async () => {
    const logger = makeLogger();
    const fields: Record<string, unknown> = {};
    await runInstrumented(logger, base, fields, () => {
      fields.careerId = 'c1';
      return { response: { status: 200 } };
    });
    expect(logger.info.mock.calls[0]?.[0]).toMatchObject({
      careerId: 'c1',
      status: 200,
    });
  });
});
