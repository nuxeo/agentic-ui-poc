import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname =
  typeof import.meta.dirname === 'string'
    ? import.meta.dirname
    : dirname(fileURLToPath(import.meta.url));

/** Package-local `.env` (e.g. `apps/nuxeo-mcp/.env` in dev, or beside installed package). */
const packageEnvPath = resolve(__dirname, '../.env');
dotenv.config({ path: packageEnvPath });
/**
 * Cwd `.env` (often repo root when using `tsx` from the workspace). Do **not** use `override: true`:
 * the MCP client (e.g. Cursor) injects `NUXEO_*` into `process.env` before spawn — overriding would
 * replace those values with stale lines from disk and cause 401 even when `mcp.json` is correct.
 */
dotenv.config();

export function loadConfig(): { baseUrl: string; basicToken: string } {
  const baseUrl = (process.env['NUXEO_URL'] ?? 'http://localhost:8080').replace(/\/$/, '');
  const auth = process.env['NUXEO_AUTH'] ?? 'Administrator:Administrator';
  const basicToken = Buffer.from(auth).toString('base64');
  return { baseUrl, basicToken };
}
