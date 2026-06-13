import type { QueryClient } from '@tanstack/react-query';

import { TanStackDevtools } from '@tanstack/react-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import TanStackQueryDevtools from '#/integrations/tanstack-query/devtools';
import appCss from '#/styles/globals.css?url';

type MyRouterContext = { queryClient: QueryClient };

export const Route = createRootRouteWithContext<MyRouterContext>()({
  errorComponent: RootError,
  head: () => ({
    links: [{ href: appCss, rel: 'stylesheet' }],
    meta: [
      { charSet: 'utf8' },
      { content: 'width=device-width, initial-scale=1', name: 'viewport' },
      { title: 'FC 26 Career Hub' },
    ],
  }),
  shellComponent: RootDocument,
});

function RootError({ error }: { error: Error }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center" role="alert">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-fg">{error.message}</p>
      <Link className="mt-4 inline-block text-primary hover:underline" to="/">
        Reload
      </Link>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header className="border-b">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
            <Link className="font-display text-lg font-semibold" to="/">
              FC 26 Career Hub
            </Link>
          </div>
        </header>
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
