/**
 * Verifies Nuxeo REST + auth using the same .env as the MCP server.
 */
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: join(root, '.env') });

const base = (process.env.NUXEO_URL ?? '').replace(/\/+$/, '');
const user = process.env.NUXEO_USER;
const pass = process.env.NUXEO_PASSWORD ?? '';
const token = process.env.NUXEO_TOKEN?.trim();

if (!base) {
  console.error('Missing NUXEO_URL in .env');
  process.exit(1);
}

const auth =
  token != null && token !== ''
    ? `Bearer ${token}`
    : `Basic ${Buffer.from(`${user}:${pass}`, 'utf8').toString('base64')}`;

const query = "SELECT * FROM Document WHERE ecm:primaryType = 'Domain' AND ecm:isProxy = 0";
const url = new URL(`${base}/api/v1/search/lang/NXQL/execute`);
url.searchParams.set('query', query);
url.searchParams.set('pageSize', '3');

const res = await fetch(url, {
  headers: {
    Accept: 'application/json',
    Authorization: auth,
    properties: '*',
  },
});

const text = await res.text();
if (!res.ok) {
  console.error(`Nuxeo HTTP ${res.status}`);
  console.error(text.slice(0, 2000));
  process.exit(1);
}

let data;
try {
  data = JSON.parse(text);
} catch {
  console.error('Non-JSON response:', text.slice(0, 500));
  process.exit(1);
}

const entries = data.entries ?? [];
console.log('OK — Nuxeo reachable. NXQL smoke query returned', entries.length, 'row(s).');
if (entries[0]?.title) {
  console.log('Sample title:', entries[0].title);
}
