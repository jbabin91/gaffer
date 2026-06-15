import { isLoggableError } from './is-loggable-error';

type RequestErrorLogger = {
  error: (fields: Record<string, unknown>, message: string) => void;
};

type RequestErrorContext = {
  fn: string | undefined;
  handlerType: 'router' | 'serverFn';
  method: string;
  pathname: string;
};

// Logger is injected to keep this module free of the server-only pino import.
export function handleRequestError(
  logger: RequestErrorLogger,
  error: unknown,
  context: RequestErrorContext,
): never {
  if (isLoggableError(error)) {
    logger.error({ err: error, ...context }, 'request error');
  }
  throw error;
}
