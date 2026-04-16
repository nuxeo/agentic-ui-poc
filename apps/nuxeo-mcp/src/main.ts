import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { loadConfig } from './config.js';
import { nuxeoGet, safeNuxeoPath, type NuxeoConfig } from './nuxeo-http.js';

function jsonResult(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

function errResult(message: string) {
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: message }],
  };
}

async function runTool<T>(
  fn: () => Promise<T>,
): Promise<{ content: { type: 'text'; text: string }[]; isError?: boolean }> {
  try {
    const data = await fn();
    return jsonResult(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return errResult(message);
  }
}

function registerTools(server: McpServer, cfg: NuxeoConfig) {
  server.registerTool(
    'nuxeo_me',
    {
      description:
        'Returns the current authenticated Nuxeo user (GET /nuxeo/api/v1/me). Use to verify credentials and read username for tasks.',
    },
    () => runTool(() => nuxeoGet(cfg, '/nuxeo/api/v1/me')),
  );

  server.registerTool(
    'nuxeo_nxql_search',
    {
      description:
        'Runs an NXQL query via GET /nuxeo/api/v1/search/lang/NXQL/execute. Use valid NXQL SELECT syntax.',
      inputSchema: {
        query: z.string().describe('NXQL query string (SELECT …)'),
        pageSize: z.number().int().positive().max(1000).optional().default(20),
        propertiesHeader: z
          .string()
          .optional()
          .default('dublincore')
          .describe('Value for the `properties` header (document properties to fetch)'),
      },
    },
    (args) =>
      runTool(() => {
        const params = new URLSearchParams({
          query: args.query,
          pageSize: String(args.pageSize),
        });
        return nuxeoGet(cfg, `/nuxeo/api/v1/search/lang/NXQL/execute?${params}`, {
          properties: args.propertiesHeader,
        });
      }),
  );

  server.registerTool(
    'nuxeo_get_document',
    {
      description: 'Fetches a document by id (uid) via GET /nuxeo/api/v1/id/{uid}.',
      inputSchema: {
        uid: z.string().describe('Document uid'),
        propertiesHeader: z
          .string()
          .optional()
          .default('*')
          .describe('Value for the `properties` header'),
      },
    },
    (args) =>
      runTool(() =>
        nuxeoGet(cfg, `/nuxeo/api/v1/id/${encodeURIComponent(args.uid)}`, {
          properties: args.propertiesHeader,
        }),
      ),
  );

  server.registerTool(
    'nuxeo_list_tasks',
    {
      description: 'Lists workflow tasks for a user via GET /nuxeo/api/v1/task.',
      inputSchema: {
        userId: z.string().describe('Nuxeo username (e.g. from nuxeo_me)'),
        pageSize: z.number().int().positive().max(200).optional().default(50),
      },
    },
    (args) =>
      runTool(() => {
        const params = new URLSearchParams({
          userId: args.userId,
          pageSize: String(args.pageSize),
        });
        return nuxeoGet(cfg, `/nuxeo/api/v1/task?${params}`);
      }),
  );

  server.registerTool(
    'nuxeo_get_document_by_path',
    {
      description:
        'Fetches a document by repository path via GET /nuxeo/api/v1/path{path} (e.g. /default-domain/workspaces).',
      inputSchema: {
        path: z.string().describe('Absolute Nuxeo path starting with /'),
        propertiesHeader: z.string().optional().default('*'),
      },
    },
    (args) =>
      runTool(() => {
        const p = safeNuxeoPath(args.path);
        return nuxeoGet(cfg, `/nuxeo/api/v1/path${p}`, { properties: args.propertiesHeader });
      }),
  );

  server.registerTool(
    'nuxeo_list_children',
    {
      description: 'Lists children of a document path via GET /nuxeo/api/v1/path{path}/@children.',
      inputSchema: {
        path: z.string().describe('Parent path (e.g. /default-domain/workspaces)'),
        pageSize: z.number().int().positive().max(500).optional().default(50),
        currentPageIndex: z.number().int().min(0).optional().default(0),
        propertiesHeader: z.string().optional().default('*'),
      },
    },
    (args) =>
      runTool(() => {
        const p = safeNuxeoPath(args.path);
        const params = new URLSearchParams({
          pageSize: String(args.pageSize),
          currentPageIndex: String(args.currentPageIndex),
        });
        return nuxeoGet(cfg, `/nuxeo/api/v1/path${p}/@children?${params}`, {
          properties: args.propertiesHeader,
        });
      }),
  );

  server.registerTool(
    'nuxeo_search_users',
    {
      description:
        'Searches users via GET /nuxeo/api/v1/user/search. Use q="*" (default) for a broad list; partial username/name for filtering. Requires permission to list users.',
      inputSchema: {
        q: z
          .string()
          .optional()
          .describe(
            'Search term; omit or use * for broad list (same as Administration user search).',
          ),
        pageSize: z.number().int().positive().max(1000).optional().default(50),
        currentPageIndex: z.number().int().min(0).optional().default(0),
      },
    },
    (args) =>
      runTool(() => {
        const term = (args.q ?? '*').trim() || '*';
        const params = new URLSearchParams({
          q: term,
          pageSize: String(args.pageSize),
          currentPageIndex: String(args.currentPageIndex),
        });
        return nuxeoGet(cfg, `/nuxeo/api/v1/user/search?${params}`);
      }),
  );

  server.registerTool(
    'nuxeo_search_groups',
    {
      description:
        'Searches groups via GET /nuxeo/api/v1/group/search. Use q="*" (default) for a broad list; partial group name for filtering.',
      inputSchema: {
        q: z
          .string()
          .optional()
          .describe(
            'Search term; omit or use * for broad list (same as Administration group search).',
          ),
        pageSize: z.number().int().positive().max(1000).optional().default(50),
        currentPageIndex: z.number().int().min(0).optional().default(0),
      },
    },
    (args) =>
      runTool(() => {
        const term = (args.q ?? '*').trim() || '*';
        const params = new URLSearchParams({
          q: term,
          pageSize: String(args.pageSize),
          currentPageIndex: String(args.currentPageIndex),
        });
        return nuxeoGet(cfg, `/nuxeo/api/v1/group/search?${params}`);
      }),
  );
}

async function main() {
  const cfg = loadConfig();
  const server = new McpServer(
    { name: 'nuxeo-mcp', version: '1.0.0' },
    {
      instructions:
        'Nuxeo REST API tools. Set NUXEO_URL (default http://localhost:8080) and NUXEO_AUTH as user:password. Use nuxeo_me to verify the session, nuxeo_nxql_search for queries, nuxeo_get_document or path tools for documents, nuxeo_search_users / nuxeo_search_groups for directory search (q=* lists broadly).',
    },
  );

  registerTools(server, cfg);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
