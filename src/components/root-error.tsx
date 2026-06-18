import { Link } from '@tanstack/react-router';
import { useEffect } from 'react';

import { logError } from '#/lib/logging/logger';
import { UNEXPECTED_ERROR_MESSAGE } from '#/lib/messages';

const LOG_MESSAGE = 'root error boundary caught an error';

export function RootError({ error }: { error: Error }) {
  // useEffect never runs during SSR, so log inline on the server (a one-shot
  // render — no retry-spam) and in the effect on the client. import.meta.env.SSR
  // is statically replaced, so each path is the only one compiled per build.
  if (import.meta.env.SSR) {
    logError(error, LOG_MESSAGE);
  }
  useEffect(() => {
    logError(error, LOG_MESSAGE);
  }, [error]);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center" role="alert">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-fg">{UNEXPECTED_ERROR_MESSAGE}</p>
      <Link className="mt-4 inline-block text-primary hover:underline" to="/">
        Reload
      </Link>
    </main>
  );
}
