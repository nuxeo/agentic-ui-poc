import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [join(__dirname, 'src/main.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: join(__dirname, 'dist/nuxeo-mcp.js'),
  banner: {
    js: '#!/usr/bin/env node',
  },
  logLevel: 'info',
});
