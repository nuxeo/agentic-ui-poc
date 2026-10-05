#!/usr/bin/env node
/**
 * Combine a bug fix's `before` and `after` captures into the artifacts a reviewer actually
 * opens: side-by-side comparisons, one contact sheet, and a single narrative.
 *
 * Usage:
 *   node scripts/collect-evidence/story-report.mjs <TICKET-ID>
 *
 * Reads  ~/Desktop/agentic-ui-evidence/<TICKET>/fix/{before,after}/manifest.json
 * Writes ~/Desktop/agentic-ui-evidence/<TICKET>/fix/
 *   diptychs/<scene>.png    before | after, labelled
 *   annotated/<scene>.png   callouts drawn from the bounding boxes recorded at capture time
 *   contact-sheet.png       one image for the PR body
 *   STORY.md                the whole story, both halves, images inlined
 *
 * Exits non-zero when the comparison does not support the claim — see the pair audit below.
 *
 * ## Composition without an image library
 *
 * Panels are built as HTML with the PNGs inlined as data URLs and screenshotted with
 * Playwright, the same technique as `scripts/beta-harness/annotate-showcase.mjs`. Highlight
 * rectangles come from live DOM bounding boxes recorded during the capture, so they stay
 * correct when the layout changes — a hand-placed rectangle silently drifts.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, isAbsolute, resolve } from 'node:path';

import { evidenceDirForTicket } from './evidence-path.mjs';

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  console.error('\nPlaywright is required. npm install --no-save @playwright/test\n');
  process.exit(1);
}

const [, , ticketId] = process.argv;
if (!ticketId) {
  console.error('Usage: node story-report.mjs <TICKET-ID>');
  process.exit(2);
}

const fixDir = resolve(evidenceDirForTicket(ticketId), 'fix');
const beforeDir = resolve(fixDir, 'before');
const afterDir = resolve(fixDir, 'after');

const before = await loadManifest(beforeDir);
const after = await loadManifest(afterDir);
if (!before || !after) {
  console.error(
    `\nBoth halves are required and one is missing.\n` +
      `  before: ${before ? 'ok' : `no manifest.json in ${beforeDir}`}\n` +
      `  after:  ${after ? 'ok' : `no manifest.json in ${afterDir}`}\n\n` +
      `Capture both with EVIDENCE_PHASE=before|after before running this.\n`,
  );
  process.exit(1);
}

// -------------------------------------------------------------- pair the scenes

/**
 * Screenshots are named `NN-slug.png`, and the index drifts whenever a scene is inserted.
 * Pair on the slug so an added Act 1 scene does not silently compare scene 3 with scene 4.
 */
const slug = (f) => basename(f).replace(/^\d+-/, '').replace(/\.png$/, '');

/** Manifest may store absolute paths on Windows; pair and read by basename under each half dir. */
const shotPath = (dir, file) => (isAbsolute(file) ? file : resolve(dir, file));
const index = (m) => {
  const out = new Map();
  for (const s of m.steps ?? []) for (const f of s.screenshots ?? []) out.set(slug(f), { file: f, step: s });
  return out;
};

const beforeShots = index(before);
const afterShots = index(after);
const paired = [...afterShots.keys()].filter((k) => beforeShots.has(k));
const onlyBefore = [...beforeShots.keys()].filter((k) => !afterShots.has(k));
const onlyAfter = [...afterShots.keys()].filter((k) => !beforeShots.has(k));

// -------------------------------------------------------------- pair audit

/**
 * A before/after pair that is byte-identical is a failed comparison, not a passing one: either
 * the fix changed nothing visible or the scene photographs something that cannot show it.
 * Within a single run the phase harness already flags duplicate images; nothing compared the
 * two runs, which is exactly where a bug fix's central claim lives.
 */
const audit = { pairs: paired.length, identical: [], invisible: [], onlyBefore, onlyAfter };

/**
 * Did any assertion anywhere change outcome between the halves?
 *
 * Some real fixes are invisible by construction — an `aria-label`, a `role`, a header, a
 * corrected request. Their screenshots are byte-identical *and the fix is sound*; the proof
 * is in the DOM checks, exactly as the duplicate warning already says.
 *
 * Judged across the whole run rather than per scene. A well-built story has scenes that are
 * *supposed* to be identical: Act 1 establishes the starting state and Act 3 shows the
 * neighbouring behaviour still works, and both should look the same before and after.
 * Requiring a flip in every scene failed exactly those, which would have taught authors to
 * stop writing them. What actually has to be true is that *something* distinguishes the two
 * halves; if nothing does, the comparison proves nothing.
 */
const checksOf = (m) =>
  new Map(m.steps.flatMap((s) => (s.checks ?? []).map((c) => [`${s.index}:${c.name}`, c.passed])));
const beforeChecks = checksOf(before);
const anyFlip = [...checksOf(after)].some(
  ([k, passed]) => beforeChecks.has(k) && beforeChecks.get(k) !== passed,
);

for (const key of paired) {
  const [b, a] = await Promise.all([
    digest(resolve(beforeDir, beforeShots.get(key).file)),
    digest(resolve(afterDir, afterShots.get(key).file)),
  ]);
  if (!b || b !== a) continue;
  (anyFlip ? audit.invisible : audit.identical).push(key);
}

// -------------------------------------------------------------- compose

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });

await mkdir(resolve(fixDir, 'diptychs'), { recursive: true });
await mkdir(resolve(fixDir, 'annotated'), { recursive: true });

const diptychs = [];
for (const key of paired) {
  const b = beforeShots.get(key);
  const a = afterShots.get(key);
  const html = diptychHtml({
    title: a.step.label.replace(/^\[Act \d+\] /, ''),
    criterion: a.step.criterion,
    beforeSrc: await dataUrl(resolve(beforeDir, b.file)),
    afterSrc: await dataUrl(resolve(afterDir, a.file)),
    identical: audit.identical.includes(key),
    invisible: audit.invisible.includes(key),
  });
  const out = resolve(fixDir, 'diptychs', `${key}.png`);
  await shoot(html, out);
  diptychs.push({ key, file: `diptychs/${key}.png`, title: a.step.label.replace(/^\[Act \d+\] /, '') });
  console.log(`  diptych  ${key}.png`);
}

// Callouts, drawn on a copy. The raw screenshot is always kept: an annotated image is harder
// to reuse and hides the pixels underneath, which is the thing it exists to show.
const annotated = [];
for (const [dir, manifest, phase] of [
  [beforeDir, before, 'before'],
  [afterDir, after, 'after'],
]) {
  for (const h of manifest.highlights ?? []) {
    const html = annotatedHtml({
      title: h.label,
      src: await dataUrl(shotPath(dir, h.file)),
      box: h.box,
      tone: phase === 'before' ? 'bad' : 'good',
    });
    const name = `${phase}-${slug(h.file)}.png`;
    await shoot(html, resolve(fixDir, 'annotated', name));
    annotated.push({ phase, file: `annotated/${name}`, title: h.label });
    console.log(`  callout  ${name}`);
  }
}

// One image for the PR body. Reviewers open one, not twelve.
let contactSheet = null;
if (diptychs.length) {
  const shown = diptychs.slice(0, 6);
  const html = contactSheetHtml({
    ticket: ticketId,
    subtitle: `${after.environment?.branch ?? ''} @ ${after.environment?.commit ?? ''}`,
    panels: await Promise.all(
      shown.map(async (d) => ({ title: d.title, src: await dataUrl(resolve(fixDir, d.file)) })),
    ),
    omitted: diptychs.length - shown.length,
  });
  contactSheet = 'contact-sheet.png';
  await shoot(html, resolve(fixDir, contactSheet));
  console.log(`  sheet    ${contactSheet}`);
}

await browser.close();

// -------------------------------------------------------------- narrative + verdict

const problems = [];
// The before half must have *failed*, not merely "not passed". Accepting `error` or
// `precondition-not-met` let an aborted or invalid reproduction yield an overall PASS as
// long as it had left one paired screenshot behind.
if (before.verdict !== 'fail') {
  problems.push(
    before.verdict === 'pass'
      ? 'the BEFORE capture passed every check — it is supposed to demonstrate the bug, so either the scenes assert the fixed behaviour or the bug did not reproduce'
      : `the BEFORE capture verdict is ${before.verdict}, not fail — the reproduction did not run to completion, so there is no demonstrated bug to compare against`,
  );
}
if (after.verdict !== 'pass') problems.push(`the AFTER capture verdict is ${after.verdict}`);
if (audit.identical.length) {
  problems.push(
    `${audit.identical.length} before/after pair(s) are byte-identical with no assertion ` +
      `distinguishing them: ${audit.identical.join(', ')}`,
  );
}
if (!paired.length) problems.push('no scene appears in both captures, so nothing is actually compared');
// Unpaired scenes were listed in the report but never failed it, so a run could still pass
// after the scenes file or its actions changed between captures, as long as one slug still
// matched. That is precisely the same-actions contract the comparison depends on.
if (audit.onlyBefore.length || audit.onlyAfter.length) {
  problems.push(
    `${audit.onlyBefore.length + audit.onlyAfter.length} scene(s) appear in only one capture ` +
      `(${[...audit.onlyBefore.map((k) => `${k}: before only`), ...audit.onlyAfter.map((k) => `${k}: after only`)].join(', ')}) ` +
      '— the two runs did not perform the same actions, so the comparison is not like for like',
  );
}

await writeFile(
  resolve(fixDir, 'STORY.md'),
  renderCombined({ ticketId, before, after, diptychs, annotated, contactSheet, audit, problems }),
  'utf8',
);

console.log(`\nstory    ${resolve(fixDir, 'STORY.md')}`);
if (problems.length) {
  console.log('\nThe comparison does not support the claim:');
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log(
  `verdict  PASS — ${paired.length} scene(s) compared` +
    (audit.invisible.length
      ? `, ${audit.invisible.length} with no visual difference (proved by a changed assertion)`
      : ', all visually distinct'),
);

// -------------------------------------------------------------- utilities

async function loadManifest(dir) {
  try {
    return JSON.parse(await readFile(resolve(dir, 'manifest.json'), 'utf8'));
  } catch {
    return null;
  }
}

async function digest(file) {
  try {
    return createHash('sha256').update(await readFile(file)).digest('hex');
  } catch {
    return null;
  }
}

async function dataUrl(file) {
  return `data:image/png;base64,${(await readFile(file)).toString('base64')}`;
}

async function shoot(html, out) {
  await page.setContent(html, { waitUntil: 'load' });
  const el = await page.$('.sheet');
  await (el ?? page).screenshot({ path: out });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function css() {
  return `
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; font-family: system-ui, -apple-system, sans-serif; }
  .sheet { display: inline-block; padding: 20px; background: #fff; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { font-size: 13px; color: #666; margin-bottom: 16px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .panel { border: 1px solid #d5d5d5; border-radius: 6px; overflow: hidden; position: relative; }
  .cap { font-size: 13px; font-weight: 600; padding: 7px 10px; color: #fff; }
  .cap.before { background: #b3261e; }
  .cap.after  { background: #146c2e; }
  .cap.plain  { background: #333; }
  .panel img { display: block; width: 100%; }
  .warn { margin-top: 12px; padding: 9px 12px; border-radius: 6px; background: #fff4e5;
          border: 1px solid #e8a33d; font-size: 13px; color: #7a4b00; }
  .shotwrap { position: relative; }
  .hl { position: absolute; border-radius: 3px; }
  .hl.good { outline: 3px solid #29c05a; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5); }
  .hl.bad  { outline: 3px solid #ff5449; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid .panel img { width: 100%; }
`;
}

// A function, not a `const`: the composition below runs at module top level, and a const
// declared down here is still in its temporal dead zone when the first panel is built.
function page_(title, body, width = 1560) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css()}
    .sheet { width: ${width}px; }</style></head><body><div class="sheet">${body}</div></body></html>`;
}

function diptychHtml({ title, criterion, beforeSrc, afterSrc, identical, invisible }) {
  return page_(
    title,
    `<h1>${esc(title)}</h1>
     <div class="sub">${criterion ? `Proves <strong>${esc(criterion)}</strong>` : 'No acceptance criterion named'}</div>
     <div class="pair">
       <div class="panel"><div class="cap before">BEFORE — the reported behaviour</div><img src="${beforeSrc}" alt="before"></div>
       <div class="panel"><div class="cap after">AFTER — with the fix</div><img src="${afterSrc}" alt="after"></div>
     </div>
     ${identical ? '<div class="warn"><strong>These two images are byte-identical.</strong> This pair demonstrates nothing — either the fix changed nothing visible here, or this scene cannot show it, and no assertion in this scene distinguishes the two halves either.</div>' : ''}
     ${invisible ? '<div class="warn"><strong>These two images are byte-identical, and that is expected here.</strong> The change is not visual. A DOM assertion in this scene did change between the halves, and that is what carries the proof — read the checks, not the picture.</div>' : ''}`,
  );
}

function annotatedHtml({ title, src, box, tone }) {
  const style = `left:${box.x.toFixed(3)}%;top:${box.y.toFixed(3)}%;width:${box.w.toFixed(3)}%;height:${box.h.toFixed(3)}%`;
  return page_(
    title,
    `<h1>${esc(title)}</h1>
     <div class="panel"><div class="shotwrap"><img src="${src}" alt="${esc(title)}">
       <div class="hl ${tone}" style="${style}"></div></div></div>`,
    1480,
  );
}

function contactSheetHtml({ ticket, subtitle, panels, omitted }) {
  return page_(
    ticket,
    `<h1>${esc(ticket)} — before and after</h1>
     <div class="sub">${esc(subtitle)}</div>
     <div class="grid">
       ${panels
         .map(
           (p) =>
             `<div class="panel"><div class="cap plain">${esc(p.title)}</div><img src="${p.src}" alt="${esc(p.title)}"></div>`,
         )
         .join('')}
     </div>
     ${omitted > 0 ? `<div class="warn">${omitted} further comparison(s) are in <code>diptychs/</code> — this sheet shows the first six.</div>` : ''}`,
    1560,
  );
}

function renderCombined({ ticketId, before, after, diptychs, annotated, contactSheet, audit, problems }) {
  const L = [
    `# ${ticketId} — before and after`,
    '',
    problems.length
      ? `**Verdict: NEEDS WORK** — ${problems.length} problem(s) with the comparison itself.`
      : `**Verdict: PASS** — ${audit.pairs} scene(s) compared` +
        (audit.invisible.length
          ? `, ${audit.invisible.length} of them with no visual difference; a changed assertion carries the proof.`
          : ', every pair visually distinct.'),
    '',
  ];

  if (problems.length) {
    L.push('## Problems with this evidence', '');
    for (const p of problems) L.push(`- ${p}`);
    L.push(
      '',
      '> These are defects in the *evidence*, not necessarily in the fix. Evidence that cannot',
      '> fail cannot support a claim, so fix the capture before reading the result.',
      '',
    );
  }

  L.push(
    '| | Before | After |',
    '| --- | --- | --- |',
    `| Verdict | ${before.verdict} | ${after.verdict} |`,
    `| Checks | ${(before.totals?.checks ?? 0) - (before.totals?.failed ?? 0)} passed / ${before.totals?.checks ?? 0} | ${(after.totals?.checks ?? 0) - (after.totals?.failed ?? 0)} passed / ${after.totals?.checks ?? 0} |`,
    `| Commit | \`${before.environment?.commit ?? '?'}\` | \`${after.environment?.commit ?? '?'}\` |`,
    `| Recording | \`before/${before.video ?? '—'}\` | \`after/${after.video ?? '—'}\` |`,
    '',
    `Nuxeo image: ${after.environment?.nuxeoImage ? `\`${after.environment.nuxeoImage}\`` : '_not recorded_'}`,
    '',
  );

  if (contactSheet) L.push('## At a glance', '', `![contact sheet](./${contactSheet})`, '');

  if (diptychs.length) {
    L.push('## Scene by scene', '');
    for (const d of diptychs) L.push(`### ${d.title}`, '', `![${d.title}](./${d.file})`, '');
  }

  if (annotated.length) {
    L.push('## Callouts', '');
    for (const a of annotated) L.push(`![${a.title} (${a.phase})](./${a.file})`, '');
  }

  if (audit.invisible.length) {
    L.push(
      '## Changes with no visual difference',
      '',
      'These scenes produced byte-identical images, which is expected: the change is not',
      'visual. In each, an assertion changed outcome between the halves, and that is the',
      'proof — the picture is context, not evidence.',
      '',
      ...audit.invisible.map((k) => `- \`${k}\``),
      '',
    );
  }

  if (audit.onlyBefore.length || audit.onlyAfter.length) {
    L.push(
      '## Unpaired scenes',
      '',
      'These appear in one capture only, so they are not comparisons and prove nothing about the change.',
      '',
      ...audit.onlyBefore.map((k) => `- \`${k}\` — before only`),
      ...audit.onlyAfter.map((k) => `- \`${k}\` — after only`),
      '',
    );
  }

  L.push(
    '## Full narratives',
    '',
    '- [Before](./before/STORY.md) — the bug as reported',
    '- [After](./after/STORY.md) — the behaviour with the fix',
    '',
  );

  return `${L.join('\n')}\n`;
}
