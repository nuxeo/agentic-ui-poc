# Nuxeo Dev Companion (MCP server)

Standalone [Model Context Protocol](https://modelcontextprotocol.io) server that exposes your Nuxeo repository to AI clients (Cursor, Claude Desktop, VS Code, etc.) over **stdio**.

## Setup

1. `npm install`
2. `npm run build`
3. Copy `.env.example` to `.env` and set `NUXEO_URL`, `NUXEO_USER`, `NUXEO_PASSWORD` (or `NUXEO_TOKEN`).

## Run

- **Production:** `npm start` (runs `node dist/index.js`)
- **Development:** `npm run dev` (tsx watch)

The process speaks MCP on stdin/stdout; start it only from an MCP client, not interactively in a terminal.

## Tools

| Tool               | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `search_documents` | NXQL search (`/api/v1/search/lang/NXQL/execute`)             |
| `get_document`     | Document by UID or path                                      |
| `create_document`  | POST create under a parent path                              |
| `run_automation`   | POST `/api/v1/automation/{operationId}`                      |
| `get_schema`       | Document type and/or schema config                           |
| `query_audit`      | NXQL search (default query uses `AuditEntry` when available) |

**Safety:** Set `NUXEO_READ_ONLY=true` to disable create and automation. Optionally set `NUXEO_AUTOMATION_ALLOWLIST` to a comma-separated list of allowed operation IDs (when empty and not read-only, all operations are allowed).

## Cursor

The workspace uses **`mcp-launch-nuxeo.mjs`** at the **repo root** plus **`.cursor/mcp.json`**. The launcher resolves **`nuxeo-mcp-server/dist/index.js`** from its own path (works no matter what Cursor uses as `cwd`).

**Credentials:** `.cursor/mcp.json` can set **`env`** (`NUXEO_URL`, `NUXEO_USER`, `NUXEO_PASSWORD`) so the server starts even when a `.env` file is not loaded. Alternatively, use **`nuxeo-mcp-server/.env`** (copy from `.env.example`); the server loads the first existing file among `nuxeo-mcp-server/.env`, `./.env`, or `nuxeo-mcp-server/.env` relative to `cwd`.

**If the MCP server fails:** run `npm install` and `npm run build` in `nuxeo-mcp-server`. Adjust **`args`** in `.cursor/mcp.json` to the absolute path of **`mcp-launch-nuxeo.mjs`** on your machine if needed. Reload MCP after changes.

## License

MIT
