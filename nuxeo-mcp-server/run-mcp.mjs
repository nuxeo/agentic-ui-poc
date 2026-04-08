/**
 * Cursor MCP launcher: resolves dist/index.js relative to this file so we do not rely on
 * ${workspaceFolder} (often unsupported) or process.cwd() (varies by client).
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const entry = join(here, 'dist', 'index.js');

if (!existsSync(entry)) {
  console.error(
    `[nuxeo-mcp-server] Missing ${entry}. Run: cd "${here}" && npm install && npm run build`,
  );
  process.exit(1);
}

const child = spawn(process.execPath, [entry], {
  cwd: here,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
