#!/usr/bin/env node
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getAuthHeader, loadConfig } from './config.js';
import { NuxeoClient } from './nuxeo-client.js';
import { registerTools } from './tools.js';

const here = dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  join(here, '..', '.env'),
  join(process.cwd(), '.env'),
  join(process.cwd(), 'nuxeo-mcp-server', '.env'),
];
for (const path of envCandidates) {
  if (existsSync(path)) {
    loadEnv({ path });
    break;
  }
}

async function main(): Promise<void> {
  // Validate auth early with a clear error
  getAuthHeader();

  const config = loadConfig();
  const nuxeo = new NuxeoClient(config.nuxeoBaseUrl);

  const server = new McpServer(
    {
      name: 'nuxeo-dev-companion',
      version: '1.0.0',
    },
    {
      instructions:
        'Nuxeo repository tools: search with NXQL, read/create documents, run automation operations, inspect types/schemas, and query audit entries when available. Respect repository permissions of the configured credentials.',
    },
  );

  registerTools(server, nuxeo, config);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('[nuxeo-mcp-server]', err instanceof Error ? err.message : err);
  process.exit(1);
});
