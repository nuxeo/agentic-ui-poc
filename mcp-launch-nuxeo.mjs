/**
 * Workspace-root MCP launcher for Cursor.
 * Resolves nuxeo-mcp-server/dist/index.js from this file's location (no reliance on cwd
 * or ${workspaceFolder}).
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = join(root, 'nuxeo-mcp-server');
const entry = join(pkg, 'dist', 'index.js');

if (!existsSync(entry)) {
  console.error(
    `[mcp-launch-nuxeo] Missing:\n  ${entry}\nRun:\n  cd "${pkg}"\n  npm install\n  npm run build`,
  );
  process.exit(1);
}

const child = spawn(process.execPath, [entry], {
  cwd: pkg,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
