/**
 * Generates docs/nuxeo-mcp-server.docx (subset aligned with docs/nuxeo-mcp-server.md).
 * When adding MCP tools or changing docs, update this script and the markdown, then run:
 *   npm run docs:nuxeo-mcp-docx
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'docs', 'nuxeo-mcp-server.docx');

function h(text, level) {
  const map = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  };
  return new Paragraph({ text, heading: map[level] ?? HeadingLevel.HEADING_1 });
}

function codeBlock(lines) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({
        text: lines.join('\n'),
        font: 'Consolas',
        size: 20,
      }),
    ],
  });
}

function table(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(
      (cell) =>
        new TableCell({
          width: { size: Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: cell, bold: true })] })],
        }),
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph(String(cell))],
            }),
        ),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

const children = [
  h('Nuxeo MCP server', 1),
  new Paragraph(
    'This document describes the Nuxeo MCP server in this repository (apps/nuxeo-mcp): what it does, how it talks to Nuxeo, and how to install and wire it into an MCP-compatible client (for example Cursor or Claude Desktop).',
  ),
  h('What it is', 2),
  new Paragraph(
    'The Model Context Protocol (MCP) lets AI assistants use tools backed by a small local (or remote) process. This project implements an MCP server that exposes tools which call the Nuxeo REST API only. It does not proxy the Express AI backend (/ai/*) or OpenAI.',
  ),
  new Paragraph(
    'The server uses stdio transport: your IDE spawns the process and exchanges JSON-RPC messages over stdin/stdout. There is no separate HTTP port for MCP itself.',
  ),
  h('Architecture', 2),
  new Paragraph('1. MCP client (Cursor, Claude Desktop, etc.) starts the nuxeo-mcp Node process.'),
  new Paragraph(
    '2. The process reads configuration (see below) and registers tools (NXQL search, get document, tasks, browse by path, etc.).',
  ),
  new Paragraph(
    '3. Each tool performs HTTP requests to Nuxeo with Basic authentication (Authorization: Basic …).',
  ),
  new Paragraph(
    'Nuxeo base URL is the server origin without a trailing slash, for example http://localhost:8080 or https://nuxeo.example.com. API paths are appended as /nuxeo/api/v1/... (see implementation in apps/nuxeo-mcp/src/nuxeo-http.ts).',
  ),
  h('Prerequisites', 2),
  new Paragraph('• Node.js 18 or newer (required by @modelcontextprotocol/sdk).'),
  new Paragraph('• A reachable Nuxeo instance and a user account that is allowed to use the REST API.'),
  new Paragraph(
    '• This repository cloned (or a copy of apps/nuxeo-mcp plus root package.json dependencies installed in that workspace layout).',
  ),
  h('Configuration (environment variables)', 2),
  table(
    ['Variable', 'Required', 'Description'],
    [
      [
        'NUXEO_URL',
        'No',
        'Nuxeo server origin, no trailing slash. Default: http://localhost:8080.',
      ],
      [
        'NUXEO_AUTH',
        'No',
        'Basic auth as username:password. Default: Administrator:Administrator (development only).',
      ],
    ],
  ),
  new Paragraph({ text: '' }),
  new Paragraph(
    'Optional file: apps/nuxeo-mcp/.env (same variables). The server loads it from that path relative to the compiled/runtime layout; when using tsx from the repo root, apps/nuxeo-mcp/.env is used. Do not commit real passwords; apps/nuxeo-mcp/.env is gitignored.',
  ),
  new Paragraph(
    'For production or shared machines, prefer setting env vars in the MCP client configuration or the system environment instead of a file on disk.',
  ),
  h('Security', 3),
  new Paragraph('• Treat NUXEO_AUTH like a password.'),
  new Paragraph('• Use HTTPS when Nuxeo is not on localhost.'),
  new Paragraph('• Each user should use their own Nuxeo user; access follows Nuxeo ACLs.'),
  h('Installation', 2),
  h('1. Install dependencies', 3),
  new Paragraph('From the repository root:'),
  codeBlock(['npm ci']),
  h('2. Configure Nuxeo (optional)', 3),
  new Paragraph('Copy the example env file and edit values:'),
  codeBlock(['copy apps\\nuxeo-mcp\\.env.example apps\\nuxeo-mcp\\.env']),
  new Paragraph('On Linux or macOS, use cp instead of copy.'),
  h('3. Verify the server can reach Nuxeo (optional)', 3),
  new Paragraph('With Nuxeo running, from the repo root:'),
  codeBlock(['npm run mcp:nuxeo']),
  new Paragraph(
    'This starts the MCP server on stdio; it will appear to hang until an MCP client connects—that is expected. Press Ctrl+C to stop. To smoke-test Nuxeo without MCP, use curl or the UI against /nuxeo/api/v1/me with Basic auth.',
  ),
  h('4. Build (optional, for running compiled JS)', 3),
  codeBlock(['npx nx run nuxeo-mcp:build']),
  new Paragraph(
    'Output is under dist/nuxeo-mcp/. You can run the entry with Node if your deployment prefers compiled output instead of tsx.',
  ),
  h('Registering the MCP server in Cursor', 2),
  new Paragraph(
    'Cursor reads MCP settings from its configuration (for example Cursor Settings → MCP or the mcp.json file, depending on version). Add a server entry that:',
  ),
  new Paragraph('• Sets command and args (or a single script) to start the process.'),
  new Paragraph('• Sets cwd to this repository root if you use relative paths to apps/nuxeo-mcp.'),
  new Paragraph(
    '• Passes environment variables for NUXEO_URL and NUXEO_AUTH if you do not rely solely on apps/nuxeo-mcp/.env.',
  ),
  new Paragraph('Example (adjust paths for your machine):'),
  codeBlock([
    '{',
    '  "mcpServers": {',
    '    "nuxeo": {',
    '      "command": "npx",',
    '      "args": ["tsx", "apps/nuxeo-mcp/src/main.ts"],',
    '      "cwd": "C:\\\\Users\\\\you\\\\Documents\\\\GitHub\\\\agentic-ui-poc",',
    '      "env": {',
    '        "NUXEO_URL": "http://localhost:8080",',
    '        "NUXEO_AUTH": "yourUser:yourPassword"',
    '      }',
    '    }',
    '  }',
    '}',
  ]),
  new Paragraph('Using the npm script instead of tsx directly:'),
  new Paragraph('• command: npm'),
  new Paragraph('• args: ["run", "mcp:nuxeo"]'),
  new Paragraph('• cwd: repository root'),
  new Paragraph('After saving, restart the MCP connection or Cursor so the new server is picked up.'),
  new Paragraph(
    'Other clients (Claude Desktop, etc.) follow the same idea: spawn the same command with the same cwd and env.',
  ),
  h('Tools exposed to the model', 2),
  table(
    ['Tool', 'Purpose'],
    [
      ['nuxeo_me', 'GET /nuxeo/api/v1/me — current user (validate credentials).'],
      [
        'nuxeo_nxql_search',
        'GET .../search/lang/NXQL/execute — run an NXQL query with pageSize and optional properties header.',
      ],
      ['nuxeo_get_document', 'GET /nuxeo/api/v1/id/{uid} — document by id.'],
      ['nuxeo_list_tasks', 'GET /nuxeo/api/v1/task — tasks for a userId.'],
      ['nuxeo_get_document_by_path', 'GET /nuxeo/api/v1/path{path} — document by repository path.'],
      ['nuxeo_list_children', 'GET .../path{path}/@children — children with pagination.'],
      [
        'nuxeo_search_users',
        'GET /nuxeo/api/v1/user/search — user search; use q=* (default) for a broad list.',
      ],
      [
        'nuxeo_search_groups',
        'GET /nuxeo/api/v1/group/search — group search; use q=* (default) for a broad list.',
      ],
    ],
  ),
  new Paragraph({ text: '' }),
  new Paragraph(
    'Tool definitions and limits (for example pageSize maxima) live in apps/nuxeo-mcp/src/main.ts.',
  ),
  new Paragraph(
    'Writes and workflow actions: this MCP server is read-oriented (GET-style APIs). It does not expose tools to update documents, upload blobs, or complete workflow tasks (PUT .../task/{taskId}/{action}). Use the Angular app (TaskService.completeTask) or the Nuxeo REST API for those.',
  ),
  h('Troubleshooting', 2),
  table(
    ['Issue', 'What to check'],
    [
      ['Connection refused / fetch failed', 'Nuxeo URL, firewall, and that Nuxeo is running.'],
      ['401 / 403', 'NUXEO_AUTH username and password; user must exist in Nuxeo.'],
      [
        'MCP client does not list tools',
        'Correct cwd, command, and args; restart client; ensure nothing else writes to stdout (MCP uses stdout for protocol).',
      ],
      [
        'Wrong repository path',
        'Paths like /default-domain/... must match Nuxeo; use nuxeo_list_children from a known parent if unsure.',
      ],
    ],
  ),
  new Paragraph({ text: '' }),
  h('Related documentation', 2),
  new Paragraph(
    '• API integrations (docs/api-integrations.md) — Nuxeo endpoints used by the Angular app (same REST surface the MCP tools target).',
  ),
  new Paragraph('• Source: apps/nuxeo-mcp/'),
];

const doc = new Document({
  sections: [
    {
      properties: {},
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.error('Wrote', outPath);
