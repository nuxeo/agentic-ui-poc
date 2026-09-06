/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/shared/ai-client',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'ai-client',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    // Matches the other libraries: the Vitest default pool has crashed under Nx/CI here.
    pool: 'threads',
    coverage: {
      reportsDirectory: '../../../coverage/libs/shared/ai-client',
      provider: 'v8' as const,
    },
  },
}));
