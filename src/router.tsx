import * as Sentry from '@sentry/tanstackstart-react';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

import { getContext } from '#/integrations/tanstack-query/root-provider';
import { routeTree } from '#/routeTree.gen';

export function getRouter() {
  const context = getContext();

  const router = createTanStackRouter({
    context,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
  });

  if (!router.isServer) {
    Sentry.addIntegration(
      Sentry.tanstackRouterBrowserTracingIntegration(router),
    );
  }

  setupRouterSsrQueryIntegration({ queryClient: context.queryClient, router });

  return router;
}

declare module '@tanstack/react-router' {
  // Module augmentation requires `interface`, not a type alias.
  // oxlint-disable-next-line typescript/consistent-type-definitions
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
