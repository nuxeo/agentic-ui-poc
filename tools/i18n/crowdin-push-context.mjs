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
 * blocked on that. Its pure parts are covered by `crowdin-push-context.selftest.mjs`, which is
 * not the same as having worked: nothing here has made a real HTTP call.
 *
 * An earlier version of this paragraph said the file's shape was "gated by
 * `checkTranslatorContextPush`". No such guardrail existed, in this repository or anywhere
 * else. The claim is now true instead of removed — `checkTranslatorContextPush` in
 * `scripts/review-guardrails.mjs` asserts the two flatteners agree and that every discovered
 * context file is reachable through a `crowdin-conf.yml` source.
 *
 * ## Why it is idempotent rather than incremental
 *
 * It sets context on every string every run instead of tracking what changed. A daily job
 * that skips unchanged strings has to be right about what "unchanged" means across a tool
 * that renumbers string IDs when a file is re-uploaded; being wrong there loses context
 * silently, and nobody notices until a translator asks a question the file was supposed to
 * answer. Re-sending everything costs one API call per string per day and cannot drift.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

/**
 * Hyland Crowdin **Enterprise**, not public crowdin.com.
 *
 * Read from the environment with the enterprise host as the default, so it matches
 * `base_url` in `crowdin-conf.yml` and can still be pointed elsewhere for a dry run. The
 * first version of this file called the public API: a token issued on the Hyland tenant
 * fails there with a 401, which reads like a bad secret rather than a wrong host — and the
 * project would simply not be found.
 */
const API = `${process.env['CROWDIN_BASE_URL'] ?? 'https://hyland.api.crowdin.com'}/api/v2`;
const REPO = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Where `crowdin-conf.yml` says sources live. Kept as roots rather than as the globs themselves
 * because the globs exist to keep `node_modules` out, and `node_modules` sits beside these two.
 */
const SOURCE_ROOTS = ['apps', 'libs'];

/** Keys Crowdin must not be told about: `$schema-note` and friends describe the file. */
export const isMetadataKey = (key) => key.startsWith('$');

/**
 * Every `i18n/en.context.json` in the repository, as repo-relative POSIX paths.
 *
 * Discovered rather than named. The first version hard-coded
 * `apps/nuxeo-ui/public/i18n/en.context.json` as the only source while `crowdin-conf.yml`
 * already declared a second mapping, `/libs/**​/i18n/en.json`, for the per-library catalogues
 * NXSAT-284 AC4 will add — and `checkTranslationContext` requires each of those to carry a
 * sibling context file. The day the first library catalogue landed, its context would have been
 * uploaded by nothing, silently, while this script reported success for the app's.
 *
 * Scoped to `apps/` and `libs/` for the same reason the Crowdin globs are: a wider walk reaches
 * `node_modules`, where 48 upstream catalogues sit at the same relative shape.
 *
 * @param {string} repo absolute path to the repository root
 * @returns {string[]}
 */
export function discoverContextFiles(repo) {
  const found = [];
  const walk = (directory) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name === 'en.context.json' && dirname(path).endsWith(`${sep}i18n`)) {
        found.push(relative(repo, path).split(sep).join('/'));
      }
    }
  };
  for (const root of SOURCE_ROOTS) {
    try {
      if (statSync(join(repo, root)).isDirectory()) walk(join(repo, root));
    } catch {
      // A root that does not exist is not an error: `libs/` carries no catalogue yet.
    }
  }
  return found.sort();
}

/**
 * The Crowdin file path of the catalogue a context file documents.
 *
 * `crowdin-conf.yml` sets `base_path: '.'` and `preserve_hierarchy: true`, so Crowdin stores a
 * source at its repo-relative path with a leading slash. `en.context.json` is never uploaded —
 * it travels through the API, here — so the path wanted is its sibling `en.json`.
 *
 * @param {string} contextPath repo-relative POSIX path of an `en.context.json`
 * @returns {string}
 */
export function crowdinSourcePath(contextPath) {
  return `/${contextPath.replace(/en\.context\.json$/, 'en.json')}`;
}

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

/** Every page of a paginated collection endpoint, as the bare `data` objects. */
async function fetchAll(path, token) {
  const all = [];
  const LIMIT = 500;
  const separator = path.includes('?') ? '&' : '?';
  for (let offset = 0; ; offset += LIMIT) {
    const page = await crowdin(`${path}${separator}limit=${LIMIT}&offset=${offset}`, token);
    for (const { data } of page.data) all.push(data);
    // A short page is the last page. Paging until an empty one costs an extra round trip and
    // loops forever if the API ever returns a full page of duplicates.
    if (page.data.length < LIMIT) break;
  }
  return all;
}

/** The project's source files, keyed by the path Crowdin stores them under. */
async function fetchFileIdsByPath(projectId, token) {
  const byPath = new Map();
  for (const file of await fetchAll(`/projects/${projectId}/files`, token)) {
    byPath.set(file.path, file.id);
  }
  return byPath;
}

/**
 * The strings of ONE source file, keyed by identifier.
 *
 * Scoped by `fileId` rather than fetched project-wide. A Crowdin string identifier is unique
 * within a file, not within a project, so once `libs/*` catalogues exist two files can both hold
 * `browse.title` — and a project-wide `Map` keyed on identifier alone silently keeps whichever
 * page happened to arrive last, then writes the app's context onto a library's string. Context
 * attached to the wrong string is worse for a translator than no context, because it is
 * believed.
 */
async function fetchStringsForFile(projectId, fileId, token) {
  const byIdentifier = new Map();
  for (const string of await fetchAll(`/projects/${projectId}/strings?fileId=${fileId}`, token)) {
    byIdentifier.set(string.identifier, string);
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

  const contextFiles = discoverContextFiles(REPO);
  if (contextFiles.length === 0) {
    console.error(
      `No i18n/en.context.json was found under ${SOURCE_ROOTS.join('/, ')}/, so this run would ` +
        'upload nothing and report success — the one failure mode nobody investigates.',
    );
    process.exit(1);
  }

  const fileIds = await fetchFileIdsByPath(projectId, token);

  let entryCount = 0;
  let updated = 0;
  const problems = [];

  for (const contextFile of contextFiles) {
    const sourcePath = crowdinSourcePath(contextFile);
    const fileId = fileIds.get(sourcePath);
    if (fileId === undefined) {
      // The catalogue this context documents is not in the project. Either the source upload
      // did not run, or `crowdin-conf.yml` does not match this path — which is what
      // `checkTranslatorContextPush` exists to catch before it gets here.
      problems.push(
        `${contextFile}: Crowdin holds no source file at \`${sourcePath}\`. Known paths: ` +
          `${[...fileIds.keys()].slice(0, 10).join(', ') || '(none)'}`,
      );
      continue;
    }

    const entries = usableContext(JSON.parse(readFileSync(join(REPO, contextFile), 'utf8')));
    entryCount += entries.length;
    const strings = await fetchStringsForFile(projectId, fileId, token);

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

    console.log(
      `${contextFile} → ${sourcePath} (file ${fileId}): ${entries.length} context entr(ies).`,
    );

    // A key with context that Crowdin has never heard of means the context file and the
    // catalogue have diverged, or the source upload did not happen. `checkTranslationContext`
    // makes the first impossible in the repository, so reaching here points at the upload.
    if (missing.length) {
      problems.push(
        `${contextFile}: ${missing.length} context entr(ies) match no string in ` +
          `\`${sourcePath}\`, which should be impossible after a source upload: ` +
          `${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ', …' : ''}`,
      );
    }
  }

  console.log(
    `${contextFiles.length} context file(s), ${entryCount} entr(ies), ${updated} updated in Crowdin.`,
  );

  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.error(`- ${problem}`);
    process.exit(1);
  }
}

// Importable for tests without performing any network call.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
