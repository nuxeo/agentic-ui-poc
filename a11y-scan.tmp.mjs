import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';
const BASE = process.env['BASE'] ?? 'http://localhost:4301';
const user = process.env['NUXEO_USER'] ?? 'Administrator';
const pass = process.env['NUXEO_PASS'] ?? 'Administrator';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, httpCredentials: { username: user, password: pass, origin: BASE } });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
await page.evaluate((v) => { sessionStorage.setItem('agentic_ui_nuxeo_session', v); sessionStorage.removeItem('agentic_ui_signed_out'); },
  JSON.stringify({ kind: 'basic', username: user, basic: Buffer.from(`${user}:${pass}`).toString('base64'), isAdministrator: true, groups: [] }));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const SURFACES = [['landing','/'],['browse','/#/browse'],['browse-adf-hx','/#/browse-adf-hx'],['search','/#/search'],['knowledge-discovery','/#/knowledge-discovery'],['collections','/#/collections'],['administration','/#/administration'],['trash','/#/trash']];
const out = {};
for (const [name, path] of SURFACES) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    const res = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    out[name] = res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help,
      nodes: v.nodes.map((n) => ({ target: n.target.join(' '), html: (n.html ?? '').slice(0, 240), summary: (n.failureSummary ?? '').replace(/\s+/g,' ').slice(0, 320) })) }));
    console.log(`### ${name}  —  ${out[name].map((v) => `${v.id}(${v.impact}):${v.nodes.length}`).join(' ') || 'clean'}`);
  } catch (e) { out[name] = { error: String(e.message ?? e) }; console.log(`### ${name} — ERROR ${e.message}`); }
}
writeFileSync('/tmp/a11y-scan.json', JSON.stringify(out, null, 2));
await browser.close();
