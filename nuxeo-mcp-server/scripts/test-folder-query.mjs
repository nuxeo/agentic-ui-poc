/**
 * One-off: same NXQL as MCP search_documents for Folder docs, pageSize 5.
 */
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: join(root, '.env') });

const base = (process.env.NUXEO_URL ?? '').replace(/\/+$/, '');
const token = process.env.NUXEO_TOKEN?.trim();
const auth =
  token != null && token !== ''
    ? `Bearer ${token}`
    : `Basic ${Buffer.from(`${process.env.NUXEO_USER}:${process.env.NUXEO_PASSWORD ?? ''}`, 'utf8').toString('base64')}`;

const query =
  "SELECT * FROM Document WHERE ecm:primaryType = 'Folder' AND ecm:isProxy = 0";
const url = new URL(`${base}/api/v1/search/lang/NXQL/execute`);
url.searchParams.set('query', query);
url.searchParams.set('pageSize', '5');

const res = await fetch(url, {
  headers: { Accept: 'application/json', Authorization: auth, properties: '*' },
});
const text = await res.text();
if (!res.ok) {
  console.error(res.status, text.slice(0, 2000));
  process.exit(1);
}
const data = JSON.parse(text);
const entries = data.entries ?? [];
const lines = entries.map((e) => e.title ?? e.path ?? e.uid);
console.log(`Found ${entries.length} folder(s) (max 5):\n`);
lines.forEach((t, i) => console.log(`${i + 1}. ${t}`));
