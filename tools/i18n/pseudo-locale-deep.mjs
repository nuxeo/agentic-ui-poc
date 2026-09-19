#!/usr/bin/env node
/**
 * The pseudo-locale audit, extended to surfaces a page load never reaches.
 *
 * `pseudo-locale-audit.mjs` visits nine routes and reads what is on screen. That misses every
 * dialog, menu, tooltip and empty state — which is where a large share of an application's
 * text lives, and where a missed string is least likely to be noticed by hand. This opens them.
 *
 * Each interaction is best-effort: a control that is absent on this instance is skipped rather
 * than failed, because the seeded repository decides which ones exist. The count is therefore
 * a floor, not a total, and it is reported as such.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env['APP_URL'] ?? 'http://localhost:4200';
const OUT = process.env['OUT_DIR'] ?? '/tmp/zz-deep';

/** `[route, [label, selector to click], …]` — each click opens a surface and is then dismissed. */
const SURFACES = [
  [
    '/#/browse',
    [
      ['create-import', 'button:has-text("Çŕëáţë"), button[class*="create"]'],
      [
        'row-menu',
        'button[aria-label*="ɱöŕë"], button[class*="row-menu"], td button[mat-icon-button]',
      ],
      ['column-picker', 'button[class*="column"], button[aria-label*="çöļüɱñ"]'],
    ],
  ],
  [
    '/#/search',
    [
      ['saved-search-menu', 'button[class*="saved"]'],
      ['view-toggle', 'button[class*="view-toggle"]'],
    ],
  ],
  ['/#/collections', [['create', 'button[class*="create"], button:has-text("Ñëŵ")']]],
  [
    '/#/administration/users-groups',
    [['create-user', 'button[class*="create"], button[class*="add"]']],
  ],
  ['/#/settings/profile', []],
  ['/#/settings/nuxeo-drive', []],
  ['/#/settings/authorized-applications', []],
  ['/#/settings/cloud-services', []],
  ['/#/administration/vocabularies', []],
  ['/#/administration/audit', []],
  ['/#/administration/nxql-search', []],
  ['/#/administration/analytics', []],
  ['/#/tasks', []],
];

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
  '.hxp-breadcrumb',
  '.ai-insight-body',
  '.insight-text',
  '.ai-kpi-card',
];
const INSTANCE_DATA = new Set([
  'Anonymous',
  'Anonymous User',
  'Narasimha',
  'Workspace',
  'My Favorites',
  'test 01',
  'default-domain',
  'UserWorkspaces',
  'Administrator',
  'File',
  'Folder',
]);
const FORMATTED_DATE = /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/;
const ASCII_PROSE = /^[A-Za-z][A-Za-z0-9 ,.'&()/-]{2,}$/;

function collect(dataContainers) {
  const isData = (el) => dataContainers.some((s) => el.closest(s));
  const isIcon = (el) => el.closest('mat-icon, .material-icons, .mat-icon');
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = (n.textContent ?? '').trim();
    if (!text || text.includes('\u27e6')) continue;
    const el = n.parentElement;
    if (!el || isData(el) || isIcon(el)) continue;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    if (!el.getClientRects().length) continue;
    out.push({ text, tag: el.tagName.toLowerCase() });
  }
  for (const el of document.querySelectorAll('[aria-label], [title], [placeholder]')) {
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      const v = el.getAttribute(attr);
      if (v && !v.includes('\u27e6') && !isData(el)) {
        out.push({ text: v, tag: `${el.tagName.toLowerCase()}[${attr}]` });
      }
    }
  }
  return out;
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

const findings = new Map();
const record = (where, items) => {
  for (const item of items) {
    if (!ASCII_PROSE.test(item.text)) continue;
    if (INSTANCE_DATA.has(item.text) || FORMATTED_DATE.test(item.text)) continue;
    const id = `${item.tag}\u0000${item.text}`;
    if (!findings.has(id)) findings.set(id, { ...item, where: [] });
    const entry = findings.get(id);
    if (!entry.where.includes(where)) entry.where.push(where);
  }
};

let opened = 0;
let skipped = 0;
for (const [route, interactions] of SURFACES) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const name = route.replace(/[#/]+/g, '-').replace(/^-|-$/g, '') || 'root';
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  record(route, await page.evaluate(collect, DATA_CONTAINERS));

  for (const [label, selector] of interactions) {
    const target = page.locator(selector).first();
    if ((await target.count()) === 0 || !(await target.isVisible().catch(() => false))) {
      skipped += 1;
      continue;
    }
    await target.click({ timeout: 4000 }).catch(() => null);
    await page.waitForTimeout(1800);
    const overlay = await page.locator('.cdk-overlay-container').count();
    if (overlay) {
      opened += 1;
      await page.screenshot({ path: join(OUT, `${name}--${label}.png`) });
      record(`${route} → ${label}`, await page.evaluate(collect, DATA_CONTAINERS));
    } else {
      skipped += 1;
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  }
}

const rows = [...findings.values()].sort((a, b) => b.where.length - a.where.length);
writeFileSync(join(OUT, 'findings.json'), `${JSON.stringify(rows, null, 2)}\n`);
await browser.close();

console.log(
  `${SURFACES.length} routes, ${opened} overlay(s) opened, ${skipped} interaction(s) unavailable`,
);
console.log(`${rows.length} distinct untranslated string(s) — a FLOOR, not a total\n`);
for (const r of rows.slice(0, 60)) {
  console.log(
    `  ${String(r.where.length).padStart(2)}x  ${r.tag.padEnd(20)} ${JSON.stringify(r.text.slice(0, 60))}`,
  );
}
console.log(`\nscreenshots in ${OUT}`);
