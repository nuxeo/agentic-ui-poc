#!/usr/bin/env node
/**
 * Publish `documentation/` to Confluence.
 *
 * ## Why a script rather than hand-pasting
 *
 * The documentation is authored as Markdown **in the repository**, so it travels with the
 * code, is reviewable in a pull request, and cannot drift silently from what it describes.
 * Confluence is a rendering of that source, not the source itself. A script is what keeps
 * those two facts compatible: re-running it is how the rendering is refreshed, and nothing
 * is ever edited in two places.
 *
 * ## Idempotent by title
 *
 * Each page is looked up by title within the space before writing. Found ⇒ update (with the
 * version bump Confluence requires). Absent ⇒ create. So re-running never duplicates, which
 * is the failure mode a "just POST them all" script has on its second run.
 *
 * ## Credentials
 *
 * From the environment or a file, never from source:
 *   CONFLUENCE_EMAIL      your Atlassian account email
 *   CONFLUENCE_TOKEN      an API token from id.atlassian.com/manage-profile/security/api-tokens
 *   CONFLUENCE_TOKEN_FILE  alternatively, a path to a file containing the token
 *
 * ## Usage
 *
 *   node scripts/publish-confluence.mjs --dry-run     # convert and report, write nothing
 *   node scripts/publish-confluence.mjs --only 30-engineering/02-architecture.md
 *   node scripts/publish-confluence.mjs               # publish everything in MANIFEST.json
 *   node scripts/publish-confluence.mjs --verify      # re-read every published page
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DOCS = join(ROOT, 'documentation');
const DIAGRAMS = join(ROOT, 'dist', 'documentation-diagrams');
const BASE = 'https://hyland.atlassian.net/wiki';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const verifyOnly = argv.includes('--verify');
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;

const manifest = JSON.parse(readFileSync(join(DOCS, 'MANIFEST.json'), 'utf8'));

const email = process.env['CONFLUENCE_EMAIL'];
const token =
  process.env['CONFLUENCE_TOKEN'] ??
  (process.env['CONFLUENCE_TOKEN_FILE'] && existsSync(process.env['CONFLUENCE_TOKEN_FILE'])
    ? readFileSync(process.env['CONFLUENCE_TOKEN_FILE'], 'utf8').trim()
    : null);

if (!dryRun && (!email || !token)) {
  console.error(
    'publish-confluence: credentials missing.\n' +
      '  export CONFLUENCE_EMAIL=you@hyland.com\n' +
      '  export CONFLUENCE_TOKEN_FILE=/path/to/token   # or CONFLUENCE_TOKEN\n' +
      '  Create a token at https://id.atlassian.com/manage-profile/security/api-tokens',
  );
  process.exit(2);
}

const auth = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 400) };
  }
  if (!res.ok) {
    throw new Error(
      `${init.method ?? 'GET'} ${path} → ${res.status}\n  ${JSON.stringify(body).slice(0, 500)}`,
    );
  }
  return body;
}

/**
 * Every documentation page, keyed by its path relative to `documentation/`, mapped to its
 * Confluence title.
 *
 * This exists because the first version rewrote **every** relative link to a GitHub blob URL,
 * including links between these pages. On the index that was 50 of 70 links, and each was
 * wrong twice: it sent a Confluence reader to GitHub, and the URL 404'd because the path had
 * lost its `documentation/` prefix. A documentation set whose internal navigation is broken is
 * not a documentation set.
 *
 * A link to another page in the set now becomes an `ac:link` resolved by page **title**, which
 * is how Confluence links pages and survives a page being moved.
 */
const pageTitles = new Map();
{
  const scan = (dir, prefix) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        scan(full, prefix ? `${prefix}/${entry}` : entry);
      } else if (entry.endsWith('.md')) {
        const rel = prefix ? `${prefix}/${entry}` : entry;
        const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(full, 'utf8'));
        const title = m && /^title:\s*(.*)$/m.exec(m[1])?.[1]?.trim();
        if (title) pageTitles.set(rel, title.replace(/^["']|["']$/g, ''));
      }
    }
  };
  scan(DOCS, '');
}

/* ------------------------------------------------------------ markdown → storage ---- */

// `"` and `'` are escaped because almost every call site puts the result inside a
// double-quoted XML attribute — `ac:alt="…"`, `href="…"`, `ri:content-title="…"`. Without them a
// title containing a quote closes the attribute early and injects the rest as markup. CodeQL's
// `js/incomplete-html-attribute-sanitization` flagged fourteen call sites of this one function.
const esc = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * The inverse of `esc`, for text that must reach the page raw — i.e. inside CDATA.
 *
 * `&amp;` must be undone LAST or `&amp;quot;` would decode to `"` in two steps rather than to
 * `&quot;` — the double-unescaping mirror of the double-escaping bug that put `Cost &amp;amp; TCO`
 * on a published page.
 */
const unesc = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/**
 * Inline formatting. Order matters: code spans are extracted first and restored last, so
 * `**` or `_` inside backticks is not treated as emphasis — the mistake that turns a code
 * sample into mangled bold text.
 */
function inline(text, relPath = '') {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `@@CODE${codes.length - 1}@@`;
  });

  s = esc(s);
  // Markdown links → Confluence external links. Repo-relative links are rewritten to the
  // GitHub blob URL so they resolve for a reader who is not looking at a clone.
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    if (/^https?:/.test(href)) return `<a href="${esc(href)}">${label}</a>`;

    // Resolve the link against the page it appears on, so `../20-product/x.md` from
    // `30-engineering/y.md` lands on `20-product/x.md`.
    const [pathPart, anchorPart] = href.split('#');
    const from = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
    const segments = (from ? `${from}/${pathPart}` : pathPart).split('/');
    const stack = [];
    for (const seg of segments) {
      if (seg === '..') stack.pop();
      else if (seg && seg !== '.') stack.push(seg);
    }
    const target = stack.join('/');

    // Another page in this set → a real Confluence page link, resolved by title.
    const title = pageTitles.get(target);
    if (title) {
      // The label is UNESCAPED here. `esc()` has already run over the whole string, so a
      // label like "Cost & TCO" arrives as "Cost &amp; TCO" — and CDATA preserves text
      // verbatim, so it would render to the reader as a literal "Cost &amp; TCO". Caught by
      // reading the rendered view rather than the storage format.
      const raw = unesc(label).replace(/]]>/g, ']]]]><![CDATA[>');
      return (
        `<ac:link${anchorPart ? ` ac:anchor="${esc(anchorPart)}"` : ''}>` +
        `<ri:page ri:content-title="${esc(title)}" />` +
        `<ac:plain-text-link-body><![CDATA[${raw}]]></ac:plain-text-link-body>` +
        `</ac:link>`
      );
    }

    // Anything else is a file in the repository. Relative to the repo root, which is one level
    // above `documentation/`.
    const repoPath = target.replace(/^documentation\//, '');
    const url = `https://github.com/nuxeo/agentic-ui-poc/blob/${manifest.branch}/${repoPath}`;
    return `<a href="${esc(url)}">${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])_([^_]+)_/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<span style="text-decoration: line-through;">$1</span>');

  return s.replace(/@@CODE(\d+)@@/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
}

/** A Confluence code-block macro. */
function codeMacro(lang, body) {
  const language =
    { ts: 'typescript', js: 'javascript', jsonc: 'json', sh: 'bash', text: 'text' }[lang] ??
    lang ??
    'text';
  return (
    `<ac:structured-macro ac:name="code" ac:schema-version="1">` +
    `<ac:parameter ac:name="language">${esc(language)}</ac:parameter>` +
    `<ac:plain-text-body><![CDATA[${body.replace(/]]>/g, ']]]]><![CDATA[>')}]]></ac:plain-text-body>` +
    `</ac:structured-macro>`
  );
}

/** An info/note panel, used for blockquotes. */
function panel(kind, body) {
  return (
    `<ac:structured-macro ac:name="${kind}" ac:schema-version="1">` +
    `<ac:rich-text-body>${body}</ac:rich-text-body></ac:structured-macro>`
  );
}

/**
 * Convert a Markdown document to Confluence storage format.
 *
 * Deliberately a small, explicit converter rather than a dependency: the input is our own
 * Markdown, written by us, using a known subset. A general-purpose converter would add a
 * package to the lockfile — which in this repository is a gated artifact — to handle syntax
 * we do not use.
 *
 * Mermaid blocks become code blocks. Confluence renders Mermaid only with a plugin, and a
 * diagram that silently fails to render is worse than a readable source block. The ASCII
 * diagrams in these documents are there for the same reason.
 */
function toStorage(md, relPath = '', attachments = []) {
  let mermaidSeen = 0;
  // Strip YAML frontmatter — it is publishing metadata, not content.
  const body = md.replace(/^---\n[\s\S]*?\n---\n/, '');
  const lines = body.split('\n');
  const out = [];
  let i = 0;

  const flushTable = () => {
    const rows = [];
    while (i < lines.length && /^\s*\|/.test(lines[i])) {
      const cells = lines[i]
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim());
      if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
      i += 1;
    }
    if (!rows.length) return;
    const [head, ...rest] = rows;
    out.push('<table><tbody>');
    out.push('<tr>' + head.map((c) => `<th>${inline(c, relPath)}</th>`).join('') + '</tr>');
    for (const r of rest)
      out.push('<tr>' + r.map((c) => `<td>${inline(c, relPath)}</td>`).join('') + '</tr>');
    out.push('</tbody></table>');
  };

  const flushList = (ordered) => {
    const tag = ordered ? 'ol' : 'ul';
    out.push(`<${tag}>`);
    let depth = 0;
    while (i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i])) {
      const indent = (lines[i].match(/^\s*/) ?? [''])[0].length;
      const content = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '');
      if (indent >= 2 && depth === 0) {
        out.push(`<${tag}>`);
        depth += 1;
      } else if (indent < 2 && depth > 0) {
        out.push(`</${tag}>`);
        depth -= 1;
      }
      out.push(`<li>${inline(content, relPath)}</li>`);
      i += 1;
    }
    while (depth-- > 0) out.push(`</${tag}>`);
    out.push(`</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim();
      i += 1;
      const buf = [];
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i += 1;
      if (lang === 'mermaid') {
        mermaidSeen += 1;
        out.push(mermaidBlock(relPath, mermaidSeen, buf.join('\n'), attachments));
      } else {
        out.push(codeMacro(lang, buf.join('\n')));
      }
      continue;
    }

    if (/^\s*\|/.test(line)) {
      flushTable();
      continue;
    }

    if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      flushList(/^\s*\d+\./.test(line));
      continue;
    }

    if (/^>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(panel('info', `<p>${inline(buf.join(' '), relPath)}</p>`));
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      // The document's own H1 is dropped: Confluence renders the page title above the body,
      // so keeping it produces the title twice.
      if (h[1].length === 1 && out.length === 0) {
        i += 1;
        continue;
      }
      out.push(`<h${h[1].length}>${inline(h[2], relPath)}</h${h[1].length}>`);
      i += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      out.push('<hr />');
      i += 1;
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const buf = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|```|\s*\||\s*([-*]|\d+\.)\s|>|---+$)/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    out.push(`<p>${inline(buf.join(' '), relPath)}</p>`);
  }

  return out.join('\n');
}

/**
 * A Mermaid diagram as a rendered image, with its source in a collapsed panel beneath.
 *
 * Confluence renders Mermaid only with a marketplace app, and no page in this space uses one.
 * The first version of this publisher emitted the Mermaid as a code block instead, reasoning
 * that a diagram which silently fails to render is worse than readable source. The outcome
 * proved that wrong: the Architecture page showed forty lines of `flowchart TD` where a diagram
 * belonged. Neither option was readable.
 *
 * So the image is attached to the page by `scripts/render-mermaid.mjs` and referenced here.
 * The source travels with it in an `expand` macro, so a reader can see how it is built and a
 * maintainer can copy it out — but the Markdown in this repository remains the single source of
 * truth, and re-running the renderer is what refreshes the picture.
 *
 * If the PNG is missing, this falls back to a code block **and records the miss** so the
 * publisher can warn. It never silently ships the worse rendering.
 *
 * `ac:width` is set and `ac:original-*` is NOT. The first version declared
 * `ac:original-height="0" ac:original-width="0"`, which Confluence passed through as
 * `data-height="0" data-width="0"` on the rendered image — a zero-sized picture. Confluence
 * infers the intrinsic size from the attachment; all it needs from us is the display width,
 * and 900px fits a page while remaining clickable to full size.
 */
function mermaidBlock(relPath, index, source, attachments) {
  const slug = relPath
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase();
  const filename = `${slug}-diagram-${index}.png`;
  const abs = join(DIAGRAMS, filename);

  if (!existsSync(abs)) {
    attachments.push({ filename, missing: true });
    return codeMacro('text', source);
  }
  attachments.push({ filename, path: abs, bytes: statSync(abs).size });

  return (
    `<p><ac:image ac:align="center" ac:layout="center" ac:width="900" ` +
    `ac:alt="Diagram: ${esc(relPath)} #${index}">` +
    `<ri:attachment ri:filename="${esc(filename)}" /></ac:image></p>` +
    `<ac:structured-macro ac:name="expand" ac:schema-version="1">` +
    `<ac:parameter ac:name="title">Diagram source (Mermaid)</ac:parameter>` +
    `<ac:rich-text-body>${codeMacro('text', source)}</ac:rich-text-body>` +
    `</ac:structured-macro>`
  );
}

/**
 * Upload a file as a page attachment.
 *
 * `POST .../child/attachment` creates; it rejects a duplicate filename, so on conflict the
 * existing attachment's id is looked up and its data replaced. Without that second path,
 * re-running the publisher would fail on every page that already has diagrams — which would
 * make the whole thing single-use.
 */
async function upload(pageId, filename, absPath) {
  const body = new FormData();
  body.append('file', new Blob([readFileSync(absPath)], { type: 'image/png' }), filename);
  body.append('minorEdit', 'true');

  const post = await fetch(`${BASE}/rest/api/content/${pageId}/child/attachment`, {
    method: 'POST',
    headers: { Authorization: auth, 'X-Atlassian-Token': 'no-check' },
    body,
  });
  if (post.ok) return 'created';

  const list = await api(
    `/rest/api/content/${pageId}/child/attachment?filename=${encodeURIComponent(filename)}`,
  );
  const existing = list.results?.[0];
  if (!existing) throw new Error(`upload ${filename}: ${post.status} and no existing attachment`);

  const again = new FormData();
  again.append('file', new Blob([readFileSync(absPath)], { type: 'image/png' }), filename);
  again.append('minorEdit', 'true');
  const put = await fetch(
    `${BASE}/rest/api/content/${pageId}/child/attachment/${existing.id}/data`,
    {
      method: 'POST',
      headers: { Authorization: auth, 'X-Atlassian-Token': 'no-check' },
      body: again,
    },
  );
  if (!put.ok)
    throw new Error(`replace ${filename}: ${put.status} ${(await put.text()).slice(0, 200)}`);
  return 'replaced';
}

/* ----------------------------------------------------------------------- publishing ---- */

function frontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  const fm = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = /^([a-z_]+):\s*(.*)$/.exec(line.trim());
      if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

/** Every page to publish, in tree order: index, then each section's pages. */
function collect() {
  const pages = [];
  pages.push({ file: 'README.md', section: null });
  for (const s of manifest.sections) {
    const dir = join(DOCS, s.dir);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .sort()) {
      pages.push({ file: `${s.dir}/${f}`, section: s.title });
    }
  }
  return only ? pages.filter((p) => p.file === only) : pages;
}

async function findByTitle(title) {
  const q = new URLSearchParams({
    // Backslash FIRST, then quote: escaping the quote first would leave `\` unescaped, so a
    // title ending in a backslash escapes the closing quote and the rest of the title becomes CQL.
    cql:
      `space="${manifest.space}" and type=page and ` +
      `title="${title.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
    limit: '5',
  });
  const r = await api(`/rest/api/content/search?${q}`);
  return (r.results ?? []).find((p) => p.title === title) ?? null;
}

const spaceId = manifest.spaceId ?? null;

async function resolveSpaceId() {
  if (spaceId) return spaceId;
  const r = await api(`/api/v2/spaces?keys=${encodeURIComponent(manifest.space)}`);
  const id = r.results?.[0]?.id;
  if (!id) throw new Error(`Space ${manifest.space} not found`);
  return id;
}

async function upsert(title, storage, parentId, sid) {
  const existing = await findByTitle(title);
  if (existing) {
    const cur = await api(`/api/v2/pages/${existing.id}`);
    await api(`/api/v2/pages/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: existing.id,
        status: 'current',
        title,
        spaceId: sid,
        parentId,
        body: { representation: 'storage', value: storage },
        version: {
          number: (cur.version?.number ?? 1) + 1,
          message: `docs sync @ ${manifest.repoCommit}`,
        },
      }),
    });
    return { id: existing.id, action: 'updated' };
  }
  const created = await api('/api/v2/pages', {
    method: 'POST',
    body: JSON.stringify({
      spaceId: sid,
      status: 'current',
      title,
      parentId,
      body: { representation: 'storage', value: storage },
    }),
  });
  return { id: created.id, action: 'created' };
}

const pages = collect();
console.log(
  `publish-confluence: ${pages.length} page(s)${dryRun ? ' (dry run)' : ''}\n` +
    `  space ${manifest.space} · folder ${manifest.rootFolderId} (${manifest.rootFolderTitle}) · commit ${manifest.repoCommit}\n`,
);

if (dryRun) {
  let total = 0;
  for (const p of pages) {
    const md = readFileSync(join(DOCS, p.file), 'utf8');
    const fm = frontmatter(md);
    const atts = [];
    const storage = toStorage(md, p.file, atts);
    total += storage.length;
    const missing = atts.filter((a) => a.missing).length;
    console.log(
      `  ${String(storage.length).padStart(7)} chars  ${(fm.title ?? '(NO TITLE)').padEnd(46)} ${p.file}` +
        (atts.length
          ? `  [${atts.length} diagram(s)${missing ? `, ${missing} NOT RENDERED` : ''}]`
          : ''),
    );
    if (!fm.title) console.log(`           ^ MISSING frontmatter title — would be skipped`);
  }
  console.log(`\n  total storage: ${total} chars across ${pages.length} page(s)`);
  process.exit(0);
}

const sid = await resolveSpaceId();
const sectionParents = new Map();
const results = [];
const warnings = [];
let uploaded = 0;

for (const p of pages) {
  const md = readFileSync(join(DOCS, p.file), 'utf8');
  const fm = frontmatter(md);
  if (!fm.title) {
    console.error(`  SKIP ${p.file} — no frontmatter title`);
    continue;
  }

  let parentId = manifest.rootFolderId;
  if (p.section) {
    if (!sectionParents.has(p.section)) {
      const r = await upsert(
        p.section,
        `<p>Section index. Child pages are listed below.</p>` +
          `<ac:structured-macro ac:name="children" ac:schema-version="2" />`,
        manifest.rootFolderId,
        sid,
      );
      sectionParents.set(p.section, r.id);
      console.log(`  ${r.action.padEnd(7)} [section] ${p.section} → ${r.id}`);
    }
    parentId = sectionParents.get(p.section);
  }

  try {
    const atts = [];
    const storage = toStorage(md, p.file, atts);
    const r = await upsert(fm.title, storage, parentId, sid);
    results.push({ ...p, ...r, title: fm.title });

    let note = '';
    const renderable = atts.filter((a) => !a.missing);
    for (const a of renderable) {
      const how = await upload(r.id, a.filename, a.path);
      uploaded += 1;
      void how;
    }
    const missing = atts.filter((a) => a.missing);
    if (renderable.length) note += `  [${renderable.length} diagram(s) attached]`;
    if (missing.length) {
      note += `  [${missing.length} DIAGRAM(S) NOT RENDERED - shown as source]`;
      warnings.push(
        `${p.file}: ${missing.length} diagram(s) fell back to a code block. ` +
          `Run \`node scripts/render-mermaid.mjs\` and publish again.`,
      );
    }
    console.log(`  ${r.action.padEnd(7)} ${fm.title.padEnd(46)} ${r.id}${note}`);
  } catch (error) {
    console.error(`  FAILED  ${fm.title}\n    ${error.message}`);
    process.exitCode = 1;
  }
}

console.log(
  `\npublish-confluence: ${results.filter((r) => r.action === 'created').length} created, ` +
    `${results.filter((r) => r.action === 'updated').length} updated, ` +
    `${uploaded} diagram(s) attached`,
);
for (const w of warnings) console.warn(`  WARNING ${w}`);
console.log(`  ${BASE}/spaces/${manifest.space}/folder/${manifest.rootFolderId}`);
