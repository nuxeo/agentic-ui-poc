#!/usr/bin/env node
/**
 * Attach translator context to the strings Crowdin already holds.
 *
 * INFO-144 requires every string to reach a translator with enough context to translate it
 * without asking. Ours lives in `en.context.json`, keyed identically to the catalogue, and
 * Crowdin's JSON source format has nowhere to carry it — JSON has no comments, and the
 * `crowdin-conf.yml` mapping only describes files. So the catalogue goes up through the
 * action and the context goes up through the API, here, after the sources exist.
 *
 * `nuxeo-web-ui` and `nuxeo-elements` have no equivalent step because they have no context
 * file. This is the one place our pipeline is deliberately wider than theirs.
 *
 * ## Read this before trusting it
 *
 * **This has never run against a real Crowdin project**, because the project does not exist
 * yet — it is created manually through the INTERN board, and NXSAT-227 records slice S6 as
 * blocked on that. Its shape is gated by `checkTranslatorContextPush` and its pure parts are
 * unit-tested, which is not the same as having worked.
 *
 * ## Why it is idempotent rather than incremental
 *
 * It sets context on every string every run instead of tracking what changed. A daily job
 * that skips unchanged strings has to be right about what "unchanged" means across a tool
 * that renumbers string IDs when a file is re-uploaded; being wrong there loses context
 * silently, and nobody notices until a translator asks a question the file was supposed to
 * answer. Re-sending everything costs one API call per string per day and cannot drift.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const API = 'https://api.crowdin.com/api/v2';
const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CONTEXT_FILE = join(REPO, 'apps/nuxeo-ui/public/i18n/en.context.json');

/** Keys Crowdin must not be told about: `$schema-note` and friends describe the file. */
export const isMetadataKey = (key) => key.startsWith('$');

/**
 * Flatten `en.json`-shaped nesting to the dotted keys Crowdin stores as string identifiers.
 *
 * Mirrors `flattenCatalogue` in `app-translate-loader.ts`. Kept as a separate implementation
 * rather than imported because this script runs under plain Node in CI with no TypeScript
 * toolchain; `checkTranslatorContextPush` asserts the two stay in step.
 */
export function flattenKeys(node, prefix = '') {
  const out = [];
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.push(path);
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...flattenKeys(value, path));
    }
  }
  return out;
}

/** Context entries worth sending: a non-metadata key with a non-blank string value. */
export function usableContext(context) {
  return Object.entries(context).filter(
    ([key, value]) => !isMetadataKey(key) && typeof value === 'string' && value.trim(),
  );
}

async function crowdin(path, token, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(
      `${init.method ?? 'GET'} ${path} → ${response.status} ${await response.text()}`,
    );
  }
  return response.json();
}

/** Every string in the project, keyed by its identifier, across as many pages as there are. */
async function fetchStrings(projectId, token) {
  const byIdentifier = new Map();
  const LIMIT = 500;
  for (let offset = 0; ; offset += LIMIT) {
    const page = await crowdin(
      `/projects/${projectId}/strings?limit=${LIMIT}&offset=${offset}`,
      token,
    );
    for (const { data } of page.data) byIdentifier.set(data.identifier, data);
    // A short page is the last page. Paging until an empty one costs an extra round trip and
    // loops forever if the API ever returns a full page of duplicates.
    if (page.data.length < LIMIT) break;
  }
  return byIdentifier;
}

async function main() {
  const projectId = process.env['CROWDIN_PROJECT_ID'];
  const token = process.env['CROWDIN_PERSONAL_TOKEN'];
  if (!projectId || !token) {
    console.error('CROWDIN_PROJECT_ID and CROWDIN_PERSONAL_TOKEN are required.');
    process.exit(1);
  }

  const context = JSON.parse(readFileSync(CONTEXT_FILE, 'utf8'));
  const entries = usableContext(context);
  const strings = await fetchStrings(projectId, token);

  let updated = 0;
  const missing = [];
  for (const [identifier, text] of entries) {
    const string = strings.get(identifier);
    if (!string) {
      missing.push(identifier);
      continue;
    }
    if (string.context === text) continue;
    await crowdin(`/projects/${projectId}/strings/${string.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify([{ op: 'replace', path: '/context', value: text }]),
    });
    updated += 1;
  }

  console.log(`${entries.length} context entr(ies), ${updated} updated in Crowdin.`);

  // A key with context that Crowdin has never heard of means the context file and the
  // catalogue have diverged, or the source upload did not happen. `checkTranslationContext`
  // makes the first impossible in the repository, so reaching here points at the upload.
  if (missing.length) {
    console.error(
      `${missing.length} context entr(ies) match no string in the project, which should be ` +
        `impossible after a source upload: ${missing.slice(0, 10).join(', ')}` +
        `${missing.length > 10 ? ', …' : ''}`,
    );
    process.exit(1);
  }
}

// Importable for tests without performing any network call.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
