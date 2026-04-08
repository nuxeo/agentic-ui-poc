import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { NuxeoMcpConfig } from './config.js';
import { NuxeoClient } from './nuxeo-client.js';

function jsonResult(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function assertNotReadOnly(config: NuxeoMcpConfig, action: string): void {
  if (config.readOnly) {
    throw new Error(`Read-only mode: ${action} is disabled (unset NUXEO_READ_ONLY).`);
  }
}

function assertAutomationAllowed(config: NuxeoMcpConfig, operationId: string): void {
  if (config.automationAllowlist.size === 0) return;
  if (!config.automationAllowlist.has(operationId)) {
    throw new Error(
      `Operation "${operationId}" is not in NUXEO_AUTOMATION_ALLOWLIST. Allowed: ${[...config.automationAllowlist].join(', ')}`,
    );
  }
}

export function registerTools(server: McpServer, nuxeo: NuxeoClient, config: NuxeoMcpConfig): void {
  server.registerTool(
    'search_documents',
    {
      title: 'Search documents (NXQL)',
      description:
        'Run a NXQL query against the repository (metadata and full-text where indexed). Use pageSize to limit results.',
      inputSchema: {
        query: z
          .string()
          .describe(
            "NXQL query string, e.g. SELECT * FROM Document WHERE ecm:primaryType = 'File'",
          ),
        pageSize: z.number().min(1).max(200).optional().describe('Max entries (default 25)'),
        currentPageIndex: z.number().min(0).optional().describe('0-based page index'),
      },
    },
    async (args) => {
      const pageSize = args.pageSize ?? 25;
      const currentPageIndex = args.currentPageIndex ?? 0;
      const data = await nuxeo.nxqlSearch(args.query, pageSize, currentPageIndex);
      return jsonResult(data);
    },
  );

  server.registerTool(
    'get_document',
    {
      title: 'Get document by id or path',
      description: 'Load a document by UID or by repository path (exactly one of uid or path).',
      inputSchema: {
        uid: z.string().optional().describe('Document UID'),
        path: z.string().optional().describe('Repository path, e.g. /default-domain/workspaces'),
      },
    },
    async (args) => {
      if (!args.uid && !args.path) {
        throw new Error('Provide either uid or path.');
      }
      if (args.uid && args.path) {
        throw new Error('Provide only one of uid or path.');
      }
      const data = args.uid
        ? await nuxeo.getDocumentById(args.uid)
        : await nuxeo.getDocumentByPath(args.path!);
      return jsonResult(data);
    },
  );

  server.registerTool(
    'create_document',
    {
      title: 'Create document',
      description:
        'Create a child document under parentPath using the Nuxeo document JSON entity shape (entity-type, type, name, properties).',
      inputSchema: {
        parentPath: z.string().describe('Parent folder path, e.g. /default-domain/workspaces'),
        entity: z
          .record(z.unknown())
          .describe(
            'Nuxeo entity body, e.g. { "entity-type": "document", "type": "Folder", "name": "x", "properties": { "dc:title": "Title" } }',
          ),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'create_document');
      const entity = args.entity as Record<string, unknown>;
      const data = await nuxeo.createDocument(args.parentPath, entity);
      return jsonResult(data);
    },
  );

  server.registerTool(
    'run_automation',
    {
      title: 'Run automation operation',
      description:
        'Invoke a Nuxeo automation operation by id. Body follows the REST contract: params, context, optional input string.',
      inputSchema: {
        operationId: z.string().describe('Operation id, e.g. Document.Query'),
        params: z.record(z.unknown()).optional().describe('Operation params'),
        context: z.record(z.unknown()).optional().describe('Automation context documents/values'),
        input: z
          .string()
          .optional()
          .describe('Optional input string when required by the operation'),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'run_automation');
      assertAutomationAllowed(config, args.operationId);
      const body: Record<string, unknown> = {
        params: args.params ?? {},
        context: args.context ?? {},
      };
      if (args.input !== undefined) body.input = args.input;
      const data = await nuxeo.runAutomation(args.operationId, body);
      return jsonResult(data);
    },
  );

  server.registerTool(
    'get_schema',
    {
      title: 'Introspect document type or schema',
      description:
        'Fetch document type definition (facets, schemas) or a single schema by name. Use docType for types; if schemaName is set, returns that schema fields.',
      inputSchema: {
        docType: z.string().optional().describe('Document type name, e.g. File'),
        schemaName: z.string().optional().describe('Schema name to fetch, e.g. dublincore'),
      },
    },
    async (args) => {
      if (!args.docType && !args.schemaName) {
        throw new Error('Provide docType and/or schemaName.');
      }
      const parts: unknown[] = [];
      if (args.docType) {
        parts.push({ docType: await nuxeo.getDocType(args.docType) });
      }
      if (args.schemaName) {
        parts.push({ schema: await nuxeo.getSchema(args.schemaName) });
      }
      return jsonResult(parts.length === 1 ? parts[0] : parts);
    },
  );

  server.registerTool(
    'query_audit',
    {
      title: 'Query audit trail (NXQL)',
      description:
        'Runs a NXQL search aimed at audit entries. Default query targets AuditEntry if your configuration exposes it; override with nxql for your platform.',
      inputSchema: {
        nxql: z
          .string()
          .optional()
          .describe(
            'Custom NXQL. Default: SELECT * FROM AuditEntry ORDER BY eventDate DESC (adjust for your Nuxeo version)',
          ),
        pageSize: z.number().min(1).max(200).optional(),
      },
    },
    async (args) => {
      const q = args.nxql ?? 'SELECT * FROM AuditEntry ORDER BY eventDate DESC';
      const pageSize = args.pageSize ?? 25;
      const data = await nuxeo.nxqlSearch(q, pageSize, 0);
      return jsonResult(data);
    },
  );
}
