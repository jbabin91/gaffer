import type { QueryClient } from '@tanstack/react-query';

import { TanStackDevtools } from '@tanstack/react-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useHydrated,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { ThemeSwitcher } from '#/components/theme-switcher';
import TanStackQueryDevtools from '#/integrations/tanstack-query/devtools';
import { Providers } from '#/providers';
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
  shellComponent: RootComponent,
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

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  // [data-hydrated] signals e2e that forms are safe to drive; useHydrated
  // (useSyncExternalStore) sets it after hydration without an SSR mismatch.
  const hydrated = useHydrated();

  return (
    <html
      suppressHydrationWarning
      data-hydrated={hydrated || undefined}
      lang="en"
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>
          <header className="border-b">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
              <Link className="font-display text-lg font-semibold" to="/">
                FC 26 Career Hub
              </Link>
              <ThemeSwitcher />
            </div>
          </header>
          {children}
        </Providers>
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
