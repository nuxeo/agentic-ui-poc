/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/features/browse',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  resolve: {
    alias: [
      // WORKAROUND(adf-hx): W10, the same pair `libs/shared/adf-hx-bridge/vite.config.mts` carries
      // and for the same reason. adf-core's fesm bundle does `import ... from 'date-fns/locale'` —
      // a *directory* import, which Node's ESM resolver rejects outright. The Angular CLI's
      // bundler tolerates it, so the POC route builds and runs; Vitest does not, so any spec in
      // this project that imports `@alfresco/adf-hx-content-services` fails to collect without it.
      //
      // Scoped to the exact specifier, so a real `date-fns/locale/en-GB` import is untouched.
      { find: /^date-fns\/locale$/, replacement: 'date-fns/locale/index.js' },
    ],
  },
  test: {
    name: 'browse',
    server: {
      deps: {
        // Vitest externalises `node_modules` and hands them to Node's ESM resolver, which is what
        // rejects the directory import — `resolve.alias` above never gets a chance to rewrite it.
        // Inlining these two makes Vite process them, so the alias applies.
        inline: [/@alfresco\//, /^date-fns/],
      },
    },
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    // Pin the worker pool explicitly: the Vitest default pool crashes under
    // Node 20 in Nx/CI for this project before any test output is emitted.
    pool: 'threads',
    // zone.js keeps the Node.js event loop alive after Angular TestBed teardown;
    // forceExit ensures Vitest can always exit cleanly in CI.
    forceExit: true,
    coverage: {
      reportsDirectory: '../../../coverage/libs/features/browse',
      provider: 'v8' as const,
    }
  },
}));
