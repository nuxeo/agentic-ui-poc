#!/usr/bin/env node
/**
 * Render the Mermaid blocks in `documentation/` to PNG.
 *
 * ## Why images rather than a macro
 *
 * The first version of the publisher emitted Mermaid as a Confluence **code block**, on the
 * reasoning that a diagram which silently fails to render is worse than readable source. That
 * reasoning was half right and the outcome was wrong: a reader of the Architecture page got
 * forty lines of `flowchart TD` where a diagram belonged, which is not readable either.
 *
 * Confluence renders Mermaid only with a marketplace app, and no page in this space uses one —
 * so relying on a macro would make the documentation's legibility depend on an app nobody has
 * installed. Rendering to an attached PNG works on any instance, with no plugin.
 *
 * The Mermaid **source stays in the Markdown**, which remains the single source of truth, and
 * the publisher also emits it inside a collapsed "Diagram source" panel under each image — so a
 * reader can see how the diagram is built and a maintainer can copy it out.
 *
 * ## Honest degradation
 *
 * Playwright is installed with `--no-save` (see CLAUDE.md), so it may be absent. When it is,
 * this script exits 2 — `precondition-not-met` — and the publisher falls back to a code block
 * **while printing a warning**. It does not silently ship a worse page.
 *
 * Usage:
 *   node scripts/render-mermaid.mjs            # render everything that has changed
 *   node scripts/render-mermaid.mjs --force    # re-render regardless of the cache
 *   node scripts/render-mermaid.mjs --check    # report what would be rendered
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DOCS = join(ROOT, 'documentation');
const OUT = join(ROOT, 'dist', 'documentation-diagrams');

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const checkOnly = argv.includes('--check');

/** Every Mermaid block in the set, with a stable identity. */
export function collectDiagrams() {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (!entry.endsWith('.md')) {
        if (!entry.includes('.')) walk(full);
        continue;
      }
      const rel = full.slice(DOCS.length + 1);
      const md = readFileSync(full, 'utf8');
      const blocks = [...md.matchAll(/^```mermaid\n([\s\S]*?)^```/gm)];
      blocks.forEach((m, i) => {
        const source = m[1].replace(/\s+$/, '');
        // Filename is derived from the page path and the block's ordinal, so re-running is
        // idempotent and a reader can tell which diagram belongs to which page.
        const slug = rel
          .replace(/\.md$/, '')
          .replace(/[^a-z0-9]+/gi, '-')
          .toLowerCase();
        found.push({
          file: rel,
          index: i + 1,
          source,
          filename: `${slug}-diagram-${i + 1}.png`,
          hash: createHash('sha256').update(source).digest('hex').slice(0, 12),
        });
      });
    }
  };
  walk(DOCS);
  return found;
}

const diagrams = collectDiagrams();

if (diagrams.length === 0) {
  console.log('render-mermaid: no mermaid blocks found.');
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
const cachePath = join(OUT, '.cache.json');
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};

const stale = diagrams.filter(
  (d) => force || cache[d.filename] !== d.hash || !existsSync(join(OUT, d.filename)),
);

console.log(
  `render-mermaid: ${diagrams.length} diagram(s) across ` +
    `${new Set(diagrams.map((d) => d.file)).size} page(s); ${stale.length} to render`,
);

if (checkOnly) {
  for (const d of stale) console.log(`  would render ${d.filename}  (${d.file} #${d.index})`);
  process.exit(0);
}

if (stale.length === 0) {
  console.log('  all current.');
  process.exit(0);
}

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  console.error(
    '\nrender-mermaid: Playwright is required but not installed.\n' +
      'It is intentionally not a tracked dependency, so CI installs stay unaffected.\n\n' +
      '  npm install --no-save @playwright/test\n' +
      '  npx playwright install chromium\n',
  );
  process.exit(2);
}

const browser = await chromium.launch();
try {
  for (const d of stale) {
    // A fresh page per diagram: Mermaid keeps module-level state keyed by element id, and
    // reusing one page made the second diagram inherit the first one's dimensions.
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 2, // crisp on a retina display and when Confluence scales it down
    });

    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"></head>
       <body style="margin:0;padding:24px;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
       <div id="d" class="mermaid">${escapeHtml(d.source)}</div>
       <script type="module">
         import m from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
         m.initialize({ startOnLoad: false, theme: 'neutral', flowchart: { useMaxWidth: false },
                        sequence: { useMaxWidth: false } });
         try { await m.run({ querySelector: '#d' }); window.__ok = true; }
         catch (e) { window.__err = String(e && e.message || e); }
       </script></body></html>`,
      { waitUntil: 'networkidle' },
    );

    await page
      .waitForFunction(() => window.__ok === true || window.__err, { timeout: 30000 })
      .catch(() => {});

    const err = await page.evaluate(() => window.__err ?? null);
    if (err) {
      // A Mermaid syntax error is a documentation defect, not something to paper over.
      console.error(`  FAILED ${d.filename}\n    ${d.file} #${d.index}: ${err}`);
      await page.close();
      process.exitCode = 1;
      continue;
    }

    const svg = page.locator('#d svg');
    if ((await svg.count()) === 0) {
      console.error(`  FAILED ${d.filename} — Mermaid produced no SVG`);
      await page.close();
      process.exitCode = 1;
      continue;
    }

    const buf = await svg.screenshot({ type: 'png' });
    writeFileSync(join(OUT, d.filename), buf);
    cache[d.filename] = d.hash;
    const box = await svg.boundingBox();
    console.log(
      `  ${d.filename}  ${Math.round(box.width)}x${Math.round(box.height)}  ${(buf.length / 1024).toFixed(1)} kB`,
    );
    await page.close();
  }
} finally {
  await browser.close();
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

if (process.exitCode === 1) {
  console.error('\nrender-mermaid: at least one diagram failed. Fix the Mermaid source.');
} else {
  console.log(`\nrender-mermaid: ${stale.length} rendered -> ${OUT.slice(ROOT.length + 1)}`);
}
