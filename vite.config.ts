import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    sentryTanstackStart({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // No token = no upload; disable source maps so they don't ship in the
      // public bundle, while the plugin's route-pattern transforms still run.
      sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
    }),
    nitro(),
    viteReact(),
  ],
  resolve: { tsconfigPaths: true },
  server: { port: Number(process.env.PORT ?? 3000) },
});

export default config;
