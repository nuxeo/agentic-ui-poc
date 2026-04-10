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

  // ── update_document ─────────────────────────────────────

  server.registerTool(
    'update_document',
    {
      title: 'Update document properties',
      description:
        'Update (PATCH) properties on an existing document by UID. Properties use schema-prefixed keys like dc:title, dc:description.',
      inputSchema: {
        uid: z.string().describe('Document UID'),
        properties: z
          .record(z.unknown())
          .describe(
            'Properties to update, e.g. { "dc:title": "New Title", "dc:description": "..." }',
          ),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'update_document');
      const data = await nuxeo.updateDocument(args.uid, args.properties as Record<string, unknown>);
      return jsonResult(data);
    },
  );

  // ── delete_document ─────────────────────────────────────

  server.registerTool(
    'delete_document',
    {
      title: 'Delete or trash a document',
      description:
        'Soft-delete (trash) a document by default. Set permanent=true for hard delete (irreversible).',
      inputSchema: {
        uid: z.string().describe('Document UID'),
        permanent: z
          .boolean()
          .optional()
          .describe('If true, permanently delete instead of trashing (default false)'),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'delete_document');
      if (args.permanent) {
        await nuxeo.deleteDocument(args.uid);
        return jsonResult({ status: 'permanently deleted', uid: args.uid });
      }
      const data = await nuxeo.trashDocument(args.uid);
      return jsonResult(data);
    },
  );

  // ── list_children ───────────────────────────────────────

  server.registerTool(
    'list_children',
    {
      title: 'List children of a folder',
      description:
        'Browse the repository tree by listing child documents under a folder (by uid or path).',
      inputSchema: {
        uid: z.string().optional().describe('Parent document UID'),
        path: z
          .string()
          .optional()
          .describe('Parent repository path, e.g. /default-domain/workspaces'),
        pageSize: z.number().min(1).max(200).optional().describe('Max entries (default 20)'),
        currentPageIndex: z.number().min(0).optional().describe('0-based page index'),
      },
    },
    async (args) => {
      if (!args.uid && !args.path) {
        throw new Error('Provide either uid or path.');
      }
      const data = await nuxeo.listChildren(
        args.uid,
        args.path,
        args.pageSize ?? 20,
        args.currentPageIndex ?? 0,
      );
      return jsonResult(data);
    },
  );

  // ── get_permissions ─────────────────────────────────────

  server.registerTool(
    'get_permissions',
    {
      title: 'Get document permissions (ACLs)',
      description: 'Retrieve the access control lists (ACLs) for a document.',
      inputSchema: {
        uid: z.string().describe('Document UID'),
      },
    },
    async (args) => {
      const data = await nuxeo.getAcl(args.uid);
      return jsonResult(data);
    },
  );

  // ── set_permissions ─────────────────────────────────────

  server.registerTool(
    'set_permissions',
    {
      title: 'Add permission to a document',
      description:
        'Grant a permission (e.g. Read, ReadWrite, Everything) to a user or group on a document.',
      inputSchema: {
        uid: z.string().describe('Document UID'),
        username: z.string().describe('User or group name to grant permission to'),
        permission: z.string().describe('Permission string: Read, ReadWrite, Everything, etc.'),
        begin: z.string().optional().describe('Optional start date (ISO 8601)'),
        end: z.string().optional().describe('Optional end date (ISO 8601)'),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'set_permissions');
      const params: Record<string, unknown> = {
        permission: args.permission,
        username: args.username,
      };
      if (args.begin) params.begin = args.begin;
      if (args.end) params.end = args.end;
      const data = await nuxeo.addPermission(args.uid, params);
      return jsonResult(data);
    },
  );

  // ── list_workflows ──────────────────────────────────────

  server.registerTool(
    'list_workflows',
    {
      title: 'List workflow tasks',
      description:
        'List pending workflow tasks, optionally filtered by user, workflow model, or document.',
      inputSchema: {
        userId: z.string().optional().describe('Filter by user id'),
        workflowModelName: z.string().optional().describe('Filter by workflow model name'),
        documentId: z.string().optional().describe('Filter by document UID'),
      },
    },
    async (args) => {
      const data = await nuxeo.listTasks(args.userId, args.workflowModelName, args.documentId);
      return jsonResult(data);
    },
  );

  // ── complete_task ───────────────────────────────────────

  server.registerTool(
    'complete_task',
    {
      title: 'Complete a workflow task',
      description: 'Complete (approve, reject, etc.) a workflow task by task ID and action name.',
      inputSchema: {
        taskId: z.string().describe('Task UID'),
        action: z.string().describe('Action to take, e.g. approve, reject, validate'),
        variables: z.record(z.unknown()).optional().describe('Task variables to submit'),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'complete_task');
      const data = await nuxeo.completeTask(
        args.taskId,
        args.action,
        (args.variables as Record<string, unknown>) ?? {},
      );
      return jsonResult(data);
    },
  );

  // ── upload_file ─────────────────────────────────────────

  server.registerTool(
    'upload_file',
    {
      title: 'Upload a file and attach to a document',
      description:
        'Upload a file (base64-encoded content) to Nuxeo via batch upload and attach it to an existing document.',
      inputSchema: {
        documentUid: z.string().describe('UID of the document to attach the file to'),
        filename: z.string().describe('File name including extension, e.g. report.pdf'),
        mimeType: z.string().optional().describe('MIME type (default application/octet-stream)'),
        contentBase64: z.string().describe('File content encoded as base64 string'),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'upload_file');
      const buf = Buffer.from(args.contentBase64, 'base64');
      const mime = args.mimeType ?? 'application/octet-stream';
      const batchId = await nuxeo.createBatch();
      await nuxeo.uploadBlob(batchId, 0, args.filename, mime, buf);
      const data = await nuxeo.attachBlob(args.documentUid, batchId, 0);
      return jsonResult(data);
    },
  );

  // ── list_users ──────────────────────────────────────────

  server.registerTool(
    'list_users',
    {
      title: 'Search users and groups',
      description:
        'Search the Nuxeo user/group directory. Set scope to "users", "groups", or "both" (default).',
      inputSchema: {
        query: z.string().describe('Search term (partial name or id)'),
        scope: z
          .enum(['users', 'groups', 'both'])
          .optional()
          .describe('Search scope (default both)'),
        pageSize: z.number().min(1).max(200).optional().describe('Max results (default 20)'),
      },
    },
    async (args) => {
      const scope = args.scope ?? 'both';
      const pageSize = args.pageSize ?? 20;
      const results: Record<string, unknown> = {};
      if (scope === 'users' || scope === 'both') {
        results.users = await nuxeo.searchUsers(args.query, pageSize);
      }
      if (scope === 'groups' || scope === 'both') {
        results.groups = await nuxeo.searchGroups(args.query, pageSize);
      }
      return jsonResult(results);
    },
  );

  // ── manage_collection ───────────────────────────────────

  server.registerTool(
    'manage_collection',
    {
      title: 'Add or remove document from a collection',
      description: 'Add or remove a document to/from a Nuxeo collection.',
      inputSchema: {
        documentUid: z.string().describe('Document UID to add/remove'),
        collectionUid: z.string().describe('Collection UID'),
        action: z.enum(['add', 'remove']).describe('"add" or "remove"'),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'manage_collection');
      const data =
        args.action === 'add'
          ? await nuxeo.addToCollection(args.documentUid, args.collectionUid)
          : await nuxeo.removeFromCollection(args.documentUid, args.collectionUid);
      return jsonResult(data);
    },
  );

  // ── manage_tags ─────────────────────────────────────────

  server.registerTool(
    'manage_tags',
    {
      title: 'Tag or untag a document',
      description: 'Add or remove tags on a document.',
      inputSchema: {
        uid: z.string().describe('Document UID'),
        tags: z.array(z.string()).describe('List of tag labels'),
        action: z.enum(['add', 'remove']).describe('"add" or "remove"'),
      },
    },
    async (args) => {
      assertNotReadOnly(config, 'manage_tags');
      const data =
        args.action === 'add'
          ? await nuxeo.tagDocument(args.uid, args.tags)
          : await nuxeo.untagDocument(args.uid, args.tags);
      return jsonResult(data);
    },
  );

  // ── get_rendition ───────────────────────────────────────

  server.registerTool(
    'get_rendition',
    {
      title: 'Get document renditions',
      description:
        'List available renditions (PDF, thumbnail, xmlExport, etc.) for a document. Returns rendition metadata and download URLs.',
      inputSchema: {
        uid: z.string().describe('Document UID'),
      },
    },
    async (args) => {
      const data = await nuxeo.listRenditions(args.uid);
      return jsonResult(data);
    },
  );
}
