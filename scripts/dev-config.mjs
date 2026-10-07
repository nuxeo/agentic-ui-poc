#!/usr/bin/env node
/**
 * Write the configuration `nx serve nuxeo-ui` answers at `/agentic-ui-config/`.
 *
 * On a server those URLs are the configuration servlet in `nuxeo-agentic-core`, which answers with
 * an envelope of ordered fragments, one per Marketplace package. The dev server has no servlet, so
 * this writes the same envelope into the gitignored `apps/nuxeo-ui/public/agentic-ui-config/`:
 * our defaults, then each fragment file given, in order — as if each were a package depending on
 * the one before.
 *
 *   npm run config:dev                                   # our defaults only
 *   npm run config:dev -- --bootstrap acme.json --manifest acme-manifest.json
 *
 * The dev server serves only files that existed when it started, so run this before `nx serve`;
 * edits to a file it already serves are picked up on reload. A bare configuration object is not
 * accepted by the application, which is why copying a defaults file there no longer works.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULTS = join(ROOT, 'nuxeo-agentic-core/src/main/resources/agentic-ui-config');
const TARGET = join(ROOT, 'apps/nuxeo-ui/public/agentic-ui-config');

const extra = { bootstrap: [], manifest: [] };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const layer = args[i]?.replace(/^--/, '');
  if (!Object.hasOwn(extra, layer ?? '') || !args[i + 1]) {
    console.error(
      'usage: dev-config.mjs [--bootstrap <fragment.json>]... [--manifest <fragment.json>]...',
    );
    process.exit(2);
  }
  extra[layer].push(resolve(args[i + 1]));
}

// The servlet leaves out a fragment over this size or with a repeated key (ConfigSnapshot.java), so
// one that only works here would vanish on a server.
const MAX_JSON_BYTES = 1024 * 1024;

/** The first key repeated within one object of already-valid JSON, or null. */
const duplicateKey = (text) => {
  const objects = [];
  const colon = /\s*:/y;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '{') objects.push(new Set());
    else if (char === '[') objects.push(null);
    else if (char === '}' || char === ']') objects.pop();
    else if (char === '"') {
      let end = i + 1;
      while (text[end] !== '"') end += text[end] === '\\' ? 2 : 1;
      const keys = objects.at(-1);
      colon.lastIndex = end + 1;
      if (keys && colon.test(text)) {
        const key = JSON.parse(text.slice(i, end + 1));
        if (keys.has(key)) return key;
        keys.add(key);
      }
      i = end;
    }
  }
  return null;
};

const read = (path) => {
  const bytes = readFileSync(path);
  if (bytes.length > MAX_JSON_BYTES) {
    throw new Error(
      `${path} is ${bytes.length} bytes; the server refuses more than ${MAX_JSON_BYTES}`,
    );
  }
  const text = bytes.toString('utf8');
  const content = JSON.parse(text);
  if (content === null || typeof content !== 'object' || Array.isArray(content)) {
    throw new Error(`${path} is not a JSON object, so it cannot be a fragment`);
  }
  const duplicate = duplicateKey(text);
  if (duplicate !== null) {
    throw new Error(
      `${path} repeats the key "${duplicate}" in one object, which the server refuses`,
    );
  }
  return content;
};

const envelopes = ['bootstrap', 'manifest'].map((layer) => {
  const defaults = join(DEFAULTS, `${layer}.defaults.json`);
  const fragments = [
    { name: 'defaults', component: 'org.nuxeo.agentic.ui.config.defaults', path: defaults },
    ...extra[layer].map((path) => ({
      name: basename(path, '.json'),
      component: 'local.dev',
      path,
    })),
  ].map(({ name, component, path }) => ({
    name,
    component,
    bundle: component,
    source: path.startsWith(ROOT) ? path.slice(ROOT.length + 1) : path,
    content: read(path),
  }));
  // On the server a fragment with a name already contributed replaces that one, so two files
  // with the same name would merge here and not there. Refuse rather than diverge.
  const names = fragments.map((f) => f.name);
  const duplicate = names.find((name, index) => names.indexOf(name) !== index);
  if (duplicate) {
    console.error(
      `two ${layer} fragments would be named "${duplicate}"; rename one of the files, since the ` +
        'server keeps only the later of two fragments with the same name',
    );
    process.exit(2);
  }
  return { layer, fragments };
});

mkdirSync(TARGET, { recursive: true });
for (const { layer, fragments } of envelopes) {
  const file = join(TARGET, `${layer}.json`);
  writeFileSync(
    file,
    `${JSON.stringify({ format: 'nuxeo-agentic-ui-config/1', layer, fragments, diagnostics: [] }, null, 2)}\n`,
  );
  console.log(`wrote ${file.slice(ROOT.length + 1)}: ${fragments.map((f) => f.name).join(' -> ')}`);
}
