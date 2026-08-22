/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/shared/adf-hx-bridge',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  resolve: {
    alias: [
      // adf-core's fesm bundle does `import ... from 'date-fns/locale'` — a *directory*
      // import, which Node's ESM resolver rejects outright:
      //   Directory import '.../date-fns/locale' is not supported resolving ES modules
      // The Angular CLI's bundler tolerates it, so the application builds and runs; Vitest
      // does not, so any spec importing `@alfresco/adf-hx-content-services/services` fails
      // to collect. Without this alias the bridge can only be unit-tested against its own
      // code, never against the upstream services it exists to satisfy — which is where the
      // interesting failures live.
      //
      // Scoped to the exact specifier, so a real `date-fns/locale/en-GB` import is untouched.
      { find: /^date-fns\/locale$/, replacement: 'date-fns/locale/index.js' },
    ],
  },
  test: {
    name: 'adf-hx-bridge',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    server: {
      deps: {
        // Vitest externalises `node_modules` and hands them to Node's ESM resolver, which is
        // what rejects adf-core's `date-fns/locale` directory import — the `resolve.alias`
        // above never gets a chance to rewrite it. Inlining these two makes Vite process them,
        // so the alias applies. Scoped to the two packages that need it rather than inlining
        // everything, which would slow every run in this project.
        inline: [/@alfresco\//, /^date-fns/],
      },
    },
    pool: 'threads',
    forceExit: true,
    coverage: {
      reportsDirectory: '../../../coverage/libs/shared/adf-hx-bridge',
      provider: 'v8' as const,
    },
  },
}));
