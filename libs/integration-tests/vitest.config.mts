import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/integration-tests',
  plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  test: {
    name: 'integration-tests',
    watch: false,
    globals: true,
    // `node` for the suite as a whole: most specs talk to Nuxeo with `fetch`, and jsdom's
    // `Blob` is not Node's, so the upload specs break under it with `object.stream is not
    // a function` from undici. Measured: switching the whole project to jsdom took the run
    // from 20 failures to 25.
    //
    // `search-service.integration.spec.ts` needs a DOM for Angular's `HttpClient` and opts
    // in with a `@vitest-environment jsdom` docblock. The URL below is what makes that
    // work: Angular composes a *relative* path, so jsdom's document origin decides where
    // the XHR goes, and jsdom's default `localhost:3000` is not Nuxeo. It reads `NUXEO_URL`
    // for the same reason `resolveConnection` does — a test suite pointed at one server
    // while something else checks another is the defect this branch just removed from the
    // preflight.
    environment: 'node',
    environmentOptions: {
      jsdom: { url: process.env['NUXEO_URL'] ?? 'http://localhost:8080' },
    },
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/integration-tests',
      provider: 'v8' as const,
    },
    // Setup file to initialize Angular TestBed for integration tests
    setupFiles: ['./vitest.setup.ts'],
  },
}));
