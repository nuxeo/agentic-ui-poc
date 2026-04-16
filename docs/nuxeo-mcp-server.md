# Nuxeo MCP server

A Word version is generated at [`nuxeo-mcp-server.docx`](nuxeo-mcp-server.docx) by [`tools/generate-nuxeo-mcp-docx.mjs`](../tools/generate-nuxeo-mcp-docx.mjs) (not a full Markdown import—**update that script** when you add tools or change sections, then run `npm run docs:nuxeo-mcp-docx` from the repository root; requires the `docx` dev dependency).

This document describes the **Nuxeo MCP server** in this repository (`apps/nuxeo-mcp`): what it does, how it talks to Nuxeo, and how to install and wire it into an MCP-compatible client (for example Cursor or Claude Desktop).

## What it is

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) lets AI assistants use **tools** backed by a small local (or remote) process. This project implements an MCP **server** that exposes tools which call the **Nuxeo REST API** only. It does **not** proxy the Express AI backend (`/ai/*`) or OpenAI.

The server uses **stdio** transport: your IDE spawns the process and exchanges JSON-RPC messages over stdin/stdout. There is no separate HTTP port for MCP itself.

## Architecture

1. **MCP client** (Cursor, Claude Desktop, etc.) starts the `nuxeo-mcp` Node process.
2. The process reads configuration (see below) and registers tools (NXQL search, get document, tasks, browse by path, etc.).
3. Each tool performs HTTP requests to Nuxeo with **Basic authentication** (`Authorization: Basic …`).

Nuxeo base URL is the **server origin without a trailing slash**, for example `http://localhost:8080` or `https://nuxeo.example.com`. API paths are appended as `/nuxeo/api/v1/...` (see implementation in `apps/nuxeo-mcp/src/nuxeo-http.ts`).

## Prerequisites

- **Node.js** 20 or newer (required by this package’s `engines` field and the bundled build target).
- A reachable **Nuxeo** instance and a user account that is allowed to use the REST API.
- Either this **repository** (for development) or the **`nuxeo-mcp` npm package** installed from the public registry, a private registry, or `npm pack` (see [As an npm package](#as-an-npm-package)).

## Configuration (environment variables)

| Variable     | Required | Description                                                                                   |
| ------------ | -------- | --------------------------------------------------------------------------------------------- |
| `NUXEO_URL`  | No       | Nuxeo server origin, no trailing slash. Default: `http://localhost:8080`.                     |
| `NUXEO_AUTH` | No       | Basic auth as `username:password`. Default: `Administrator:Administrator` (development only). |

Optional **`.env` files** (same variables), loaded only for keys **not already set** in the process environment:

1. **Next to the installed package** — `../.env` relative to the entry (for example `apps/nuxeo-mcp/.env` in this repo, or `node_modules/nuxeo-mcp/.env` when installed from npm).
2. **Current working directory** — a `.env` in `process.cwd()` (often the repository root when Cursor runs the server) is loaded second.

**Precedence:** Values from your **MCP client** (e.g. `env` in [`.cursor/mcp.json`](../.cursor/mcp.json)) or the shell **always win** over `.env` files. That avoids a stale repo-root `.env` replacing credentials you set in Cursor (which would cause **401** even when the password is correct).

Do **not** commit real passwords; `apps/nuxeo-mcp/.env` is gitignored.

For production or shared machines, prefer setting env vars in the MCP client configuration or the system environment instead of a file on disk.

**Security**

- Treat `NUXEO_AUTH` like a password.
- Use **HTTPS** when Nuxeo is not on localhost.
- Each user should use **their own** Nuxeo user; access follows Nuxeo ACLs.

## Installation

### 1. Install dependencies

From the **repository root**:

```bash
npm ci
```

### 2. Configure Nuxeo (optional)

Copy the example env file and edit values:

```bash
copy apps\nuxeo-mcp\.env.example apps\nuxeo-mcp\.env
```

On Linux or macOS, use `cp` instead of `copy`.

### 3. Build the MCP bundle

From the repository root:

```bash
npx nx run nuxeo-mcp:build
```

Output is a single bundled file: **`apps/nuxeo-mcp/dist/nuxeo-mcp.js`** (gitignored). You must build after changing server source before running the compiled entry or publishing.

### 4. Verify the server can reach Nuxeo (optional)

With Nuxeo running, from the repo root (after step 3):

```bash
npm run mcp:nuxeo
```

This runs `node apps/nuxeo-mcp/dist/nuxeo-mcp.js` via the `nuxeo-mcp` workspace `start` script. It starts the MCP server on stdio; it will appear to “hang” until an MCP client connects—that is expected. Press Ctrl+C to stop. To smoke-test Nuxeo without MCP, use `curl` or the UI against `/nuxeo/api/v1/me` with Basic auth.

For quick iteration without rebuilding, you can still run **`npx tsx apps/nuxeo-mcp/src/main.ts`** from the repo root (requires dev tooling such as `tsx`).

## As an npm package

The MCP server is a **standalone npm package** at [`apps/nuxeo-mcp/package.json`](../apps/nuxeo-mcp/package.json) (workspace `nuxeo-mcp`). It publishes **only** the `dist/` bundle (`files` field).

**Build before publish**

```bash
cd apps/nuxeo-mcp
npm run build
```

**Dry run (inspect tarball contents)**

```bash
npm pack --dry-run
```

**Publish** (use a scoped name such as `@your-org/nuxeo-mcp` if you change `name` in `package.json` to avoid npm registry collisions)

```bash
npm publish
```

Use **`--access public`** for scoped packages on the public npm registry. For **private** registries, configure `publishConfig` and registry auth per your organization.

**Install and run globally** (after publish)

```bash
npm install -g nuxeo-mcp
nuxeo-mcp
```

Or **`npx`** without a global install:

```bash
npx nuxeo-mcp
```

Set `NUXEO_URL` and `NUXEO_AUTH` in the environment or a `.env` in the current working directory.

## Registering the MCP server in Cursor

This repository includes [`.cursor/mcp.json`](../.cursor/mcp.json) with a **`nuxeo`** server entry: **`cwd`** `${workspaceFolder}`, **`env`** with `NUXEO_URL` and `NUXEO_AUTH`. By default the repo uses **`npx`** + **`tsx`** on **`apps/nuxeo-mcp/src/main.ts`** so you do **not** need to run a build to use MCP during development. Reload Cursor or reconnect MCP after editing `mcp.json`.

You can also edit MCP settings manually (for example **Cursor Settings → MCP** or a user-level `mcp.json`). Ensure the server entry:

- Sets **command** and **args** (or a single script) to start the process.
- Sets **cwd** to this repository root when using relative paths such as `apps/nuxeo-mcp/...`.
- Passes **environment variables** for `NUXEO_URL` and `NUXEO_AUTH` if you do not rely solely on `.env` files.

**Example (this monorepo, TypeScript via `tsx` — no build required)**

```json
{
  "mcpServers": {
    "nuxeo": {
      "command": "npx",
      "args": ["tsx", "apps/nuxeo-mcp/src/main.ts"],
      "cwd": "C:\\Users\\you\\Documents\\GitHub\\agentic-ui-poc",
      "env": {
        "NUXEO_URL": "http://localhost:8080",
        "NUXEO_AUTH": "yourUser:yourPassword"
      }
    }
  }
}
```

**Example (this monorepo, built bundle — run `npx nx run nuxeo-mcp:build` first)**

```json
{
  "mcpServers": {
    "nuxeo": {
      "command": "node",
      "args": ["apps/nuxeo-mcp/dist/nuxeo-mcp.js"],
      "cwd": "C:\\Users\\you\\Documents\\GitHub\\agentic-ui-poc",
      "env": {
        "NUXEO_URL": "http://localhost:8080",
        "NUXEO_AUTH": "yourUser:yourPassword"
      }
    }
  }
}
```

**Example (published package on `PATH`)**

```json
{
  "mcpServers": {
    "nuxeo": {
      "command": "nuxeo-mcp",
      "env": {
        "NUXEO_URL": "http://localhost:8080",
        "NUXEO_AUTH": "yourUser:yourPassword"
      }
    }
  }
}
```

Using the root npm script from this repo:

- **command:** `npm`
- **args:** `["run", "mcp:nuxeo"]`
- **cwd:** repository root (requires prior `nx run nuxeo-mcp:build`)

After saving, restart the MCP connection or Cursor so the new server is picked up.

Other clients (Claude Desktop, etc.) follow the same idea: spawn the same command with the same `cwd` and `env`.

## Tools exposed to the model

| Tool                         | Purpose                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `nuxeo_me`                   | `GET /nuxeo/api/v1/me` — current user (validate credentials).                                            |
| `nuxeo_nxql_search`          | `GET .../search/lang/NXQL/execute` — run an NXQL query with `pageSize` and optional `properties` header. |
| `nuxeo_get_document`         | `GET /nuxeo/api/v1/id/{uid}` — document by id.                                                           |
| `nuxeo_list_tasks`           | `GET /nuxeo/api/v1/task` — tasks for a `userId`.                                                         |
| `nuxeo_get_document_by_path` | `GET /nuxeo/api/v1/path{path}` — document by repository path.                                            |
| `nuxeo_list_children`        | `GET .../path{path}/@children` — children with pagination.                                               |
| `nuxeo_search_users`         | `GET /nuxeo/api/v1/user/search` — user search; use `q=*` (default) for a broad list.                     |
| `nuxeo_search_groups`        | `GET /nuxeo/api/v1/group/search` — group search; use `q=*` (default) for a broad list.                   |

Tool definitions and limits (for example `pageSize` maxima) live in `apps/nuxeo-mcp/src/main.ts`.

**Writes and workflow actions:** This MCP server is **read-oriented** (GET-style APIs). It does **not** expose tools to update document properties, blob uploads, or **complete workflow tasks** (for example `PUT /nuxeo/api/v1/task/{taskId}/{action}`). For those operations use the Angular app (`TaskService.completeTask` in [`libs/shared/nuxeo-client/src/lib/services/task.service.ts`](../libs/shared/nuxeo-client/src/lib/services/task.service.ts)) or the Nuxeo REST API directly.

## Troubleshooting

| Issue                             | What to check                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Connection refused / fetch failed | Nuxeo URL, firewall, and that Nuxeo is running.                                                                            |
| 401 / 403                         | `NUXEO_AUTH` username and password; user must exist in Nuxeo.                                                              |
| MCP client does not list tools    | Correct `cwd`, `command`, and `args`; restart client; ensure nothing else writes to stdout (MCP uses stdout for protocol). |
| Wrong repository path             | Paths like `/default-domain/...` must match Nuxeo; use `nuxeo_list_children` from a known parent if unsure.                |

## Related documentation

- [API integrations](api-integrations.md) — Nuxeo endpoints used by the Angular app (same REST surface the MCP tools target).
- Source: `apps/nuxeo-mcp/`
