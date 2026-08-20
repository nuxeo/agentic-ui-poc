/// <reference types='vitest' />
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/agent-gateway',
  test: {
    name: 'agent-gateway',
    watch: false,
    passWithNoTests: false,
    globals: true,
    // The gateway is a Node process: no DOM, and `node:http` must be the real one.
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    reporters: ['default'],
    pool: 'threads',
    coverage: {
      reportsDirectory: '../../coverage/apps/agent-gateway',
      provider: 'v8' as const,
    },
  },
}));
