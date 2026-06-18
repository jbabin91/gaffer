import { isNotFound, isRedirect } from '@tanstack/react-router';

/**
 * redirect/notFound are router control flow, not errors. Start resolves thrown
 * Responses before middleware, so the Response branch is defensive.
 */
export function isLoggableError(error: unknown): boolean {
  if (isRedirect(error) || isNotFound(error)) return false;
  if (error instanceof Response) return error.status >= 500;
  return true;
}
