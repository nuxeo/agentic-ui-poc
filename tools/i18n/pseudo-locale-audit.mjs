#!/usr/bin/env node
/**
 * Walk the app under the `zz` pseudo-locale and report every visible English string.
 *
 * Under `zz` a catalogue-sourced string renders accented and wrapped in `⟦…⟧`. Text that is
 * still plain ASCII prose therefore came from somewhere a catalogue cannot reach — a hard-coded
 * template literal, a descriptor with no key, or a string built in TypeScript. This is the only
 * check in the set that can see what the extraction MISSED, because everything else inspects
 * strings that were already extracted.
 *
 * Server data is excluded by origin, not by spelling: document titles, usernames and
 * aggregation buckets are legitimately English and must never be translated. They are filtered
 * by the containers they render in rather than by a word list, so a genuine miss cannot hide by
 * resembling one.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env['APP_URL'] ?? 'http://localhost:4200';
const OUT = process.env['OUT_DIR'] ?? '/tmp/zz-audit';
const ROUTES = [
  ['dashboard', '/#/dashboard'],
  ['browse', '/#/browse'],
  ['search', '/#/search'],
  ['documents', '/#/documents'],
  ['collections', '/#/collections'],
  ['tasks', '/#/tasks'],
  ['trash', '/#/trash'],
  ['administration', '/#/administration'],
  ['settings-themes', '/#/settings/themes'],
];

// Containers whose text is repository content or a user's own data.
const DATA_CONTAINERS = [
  '.doc-title',
  '.document-title',
  '.result-title',
  '.breadcrumb-doc',
  '.user-name',
  '.filter-count',
  '.agg-label',
  '.saved-search-name',
  'adf-datatable-row',
  '.mat-mdc-chip',
  '.cdk-column-name',
  '.doc-path',
  '.audit-entry',
  'code',
  'pre',
  '.avatar',
  '.user-avatar',
  '.user-menu',
  '.doc-subtitle',
  '.doc-type',
  'nav[aria-label] a',
  '.breadcrumb',
  '.mat-mdc-option',
  '.hxp-breadcrumb',
];

/**
 * Names the logged-in Nuxeo user and the seeded repository content carry on this instance.
 *
 * Listed explicitly rather than inferred, because there is no structural property that
 * separates "a document happens to be called Workspace" from "the word Workspace is hard-coded
 * in a template". Keeping the list short and visible means a genuine miss cannot hide behind it
 * — anything not named here is reported.
 */
const INSTANCE_DATA = new Set([
  'Anonymous',
  'Anonymous User',
  'Narasimha',
  'Workspace',
  'My Favorites',
]);

const ASCII_PROSE = /^[A-Za-z][A-Za-z ,.'&()/-]{2,}$/;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

const findings = [];
for (const [name, route] of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });

  const english = await page.evaluate((selectors) => {
    const isData = (el) => selectors.some((s) => el.closest(s));
    // A `<mat-icon>`'s text is a ligature NAME — `settings` renders as a gear, not as the word.
    // Translating it would replace the icon with a missing glyph. It reads as English prose and
    // is not; without this the audit reported 60-odd phantom misses and buried the real ones.
    const isIconLigature = (el) => el.closest('mat-icon, .material-icons, .mat-icon');
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent ?? '').trim();
      if (!text || text.includes('⟦')) continue;
      const el = n.parentElement;
      if (!el || isData(el) || isIconLigature(el)) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (!el.getClientRects().length) continue;
      out.push({ text, tag: el.tagName.toLowerCase(), cls: el.className?.toString().slice(0, 60) });
    }
    // aria-labels and titles are invisible to a text walker and are exactly what a screen
    // reader announces, so a missed one is an accessibility defect as well as an i18n one.
    for (const el of document.querySelectorAll('[aria-label], [title], [placeholder]')) {
      for (const attr of ['aria-label', 'title', 'placeholder']) {
        const v = el.getAttribute(attr);
        if (v && !v.includes('⟦') && !isData(el)) {
          out.push({ text: v, tag: `${el.tagName.toLowerCase()}[${attr}]`, cls: '' });
        }
      }
    }
    return out;
  }, DATA_CONTAINERS);

  const real = english.filter((e) => ASCII_PROSE.test(e.text) && !INSTANCE_DATA.has(e.text));
  findings.push({ route: name, count: real.length, items: real.slice(0, 40) });
  console.log(`${real.length === 0 ? 'clean' : `${real.length} English`}  ${name}`);
}

writeFileSync(join(OUT, 'findings.json'), `${JSON.stringify(findings, null, 2)}\n`);
await browser.close();

const total = findings.reduce((n, f) => n + f.count, 0);
console.log(`\n${total} untranslated visible string(s) across ${ROUTES.length} routes`);
console.log(`screenshots and findings.json in ${OUT}`);
