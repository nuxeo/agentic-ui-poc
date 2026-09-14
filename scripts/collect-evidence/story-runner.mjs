#!/usr/bin/env node
/**
 * Bug-fix evidence capture, as a story rather than a pile of screenshots.
 *
 * Usage:
 *   node scripts/collect-evidence/story-runner.mjs <TICKET-ID> <scenes-file>
 *   EVIDENCE_PHASE=before|after  which half of the story this run captures
 *
 * Output: ~/Desktop/agentic-ui-evidence/<TICKET>/fix/<phase>/
 *   manifest.json   scenes, checks, per-scene console/HTTP errors, environment, verdict
 *   STORY.md        the narrative, images inlined
 *   chapters.vtt    video chapter markers
 *   <TICKET>-<phase>.webm
 *
 * ## Why this is not `runner.mjs`
 *
 * `runner.mjs` took screenshots and a video and stopped: no assertions, no report, no
 * console capture, and a `login()` that authenticates the route guard but not XHRs — which
 * surfaces as intermittent 403s and screenshots of empty states that read as component
 * defects. The Beta phase harness had already solved all of that, so this runner reuses its
 * helpers (`scripts/beta-harness/helpers.mjs`) instead of growing a third dialect.
 *
 * ## Two authoring modes
 *
 * A scenes file may export either:
 *
 *   export default async function (page, helpers, outDir) { ... }   // legacy, still supported
 *   export const scenes = [ { act, title, intent, criterion, run } ] // declarative
 *
 * The declarative form is stricter on purpose: it requires three acts and an acceptance
 * criterion per scene, so the artifact argues something instead of merely recording that the
 * app rendered. The legacy form keeps the twenty-odd existing ticket files working.
 */

import { mkdir, readdir, rename, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

import { evidenceDirForTicket } from './evidence-path.mjs';
import { createHelpers, PreconditionError } from '../beta-harness/helpers.mjs';

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  console.error(
    '\nPlaywright is required to capture evidence but is not installed.\n' +
      'It is intentionally not a tracked dependency. Install it locally:\n\n' +
      '  npm install --no-save @playwright/test\n' +
      '  npx playwright install chromium\n',
  );
  process.exit(1);
}

const [, , ticketId, scenesFile] = process.argv;
if (!ticketId || !scenesFile) {
  console.error('Usage: node story-runner.mjs <TICKET-ID> <scenes-file.mjs>');
  process.exit(2);
}

const phase = process.env['EVIDENCE_PHASE'] ?? '';
const outDir = resolve(evidenceDirForTicket(ticketId), 'fix', phase);
await mkdir(outDir, { recursive: true });

const baseUrl = process.env['APP_URL'] ?? 'http://localhost:4200';

const ACT_NAMES = {
  1: 'Setup — where we are and what the user is trying to do',
  2: phase === 'after' ? 'The fix — the behaviour as it now is' : 'The bug — the behaviour as reported',
  3: 'The proof — the criterion asserted, and what still works',
};

console.log(`\nEvidence story: ${ticketId}${phase ? ` (${phase})` : ''}`);
console.log(`  scenes  ${scenesFile}`);
console.log(`  app     ${baseUrl}`);
console.log(`  out     ${outDir}`);

/** @type {{ steps: import('../beta-harness/helpers.mjs').StepRecord[], consoleErrors: string[] }} */
const recorder = { steps: [], consoleErrors: [] };

const browser = await chromium.launch({
  headless: process.env['EVIDENCE_HEADLESS'] === '1',
  // Per-scene pacing replaces a blunt global slowMo. A uniform 400ms made every
  // interaction equally slow and still left the key states flashing past.
  slowMo: Number(process.env['EVIDENCE_SLOWMO'] ?? 120),
});

// Credentials come from the environment, with no fallback. Defaulting to Administrator
// meant a capture silently ran with privileged credentials whenever the variables were
// unset — and produced evidence of what an administrator sees, which is rarely the claim.
const nuxeoUser = process.env['NUXEO_USER'];
const nuxeoPass = process.env['NUXEO_PASS'];
if (!nuxeoUser || !nuxeoPass) {
  console.error(
    '\nNUXEO_USER and NUXEO_PASS must be set — there is deliberately no default.\n' +
      'For a local dev instance:\n\n' +
      '  export NUXEO_USER=Administrator NUXEO_PASS=Administrator\n',
  );
  await browser.close();
  process.exit(2);
}

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
  // Both auth mechanisms are required: the injected session satisfies the route guard so
  // pages render, httpCredentials authenticates the XHRs behind them.
  httpCredentials: { username: nuxeoUser, password: nuxeoPass, origin: baseUrl },
});

// Chapter offsets are measured from here. Recording actually begins inside newContext, a few
// tens of milliseconds earlier, so offsets are approximate — stated in chapters.json rather
// than presented as exact.
const videoT0 = Date.now();
const page = await context.newPage();

page.on('console', (msg) => {
  if (msg.type() !== 'error') return;
  const text = msg.text();
  // Carries no URL, so it cannot be triaged. The response listener records the same
  // failures with their path.
  if (text.startsWith('Failed to load resource')) return;
  recorder.consoleErrors.push(text.slice(0, 300));
});
page.on('pageerror', (err) => recorder.consoleErrors.push(`uncaught: ${String(err.message).slice(0, 300)}`));
page.on('response', (res) => {
  if (res.status() < 400) return;
  let path = res.url();
  try {
    path = new URL(path).pathname;
  } catch {
    /* keep the raw url */
  }
  recorder.consoleErrors.push(`HTTP ${res.status()} ${path}`);
});

const helpers = createHelpers(page, outDir, recorder);

// ---------------------------------------------------------------- narration

const BANNER_ID = '__evidence_banner__';

/** @type {{actNo:number,title:string,intent?:string}|null} */
let currentBanner = null;

/** @type {{file:string,label:string,box:{x:number,y:number,w:number,h:number}}[]} */
const highlights = [];

// A scene almost always navigates, and navigation discards the injected banner. Re-inject on
// every load so the caption survives the whole scene rather than only its first frame.
page.on('load', () => {
  if (currentBanner) injectBanner(currentBanner).catch(() => {});
});

/**
 * Caption the video. The banner is injected into the page so the recorder captures it, and
 * hidden again for every screenshot — a burned-in caption makes a still harder to reuse and
 * obscures the UI underneath, which is the thing the still exists to show.
 */
async function showBanner(actNo, title, intent) {
  currentBanner = { actNo, title, intent };
  await injectBanner(currentBanner);
}

async function injectBanner({ actNo, title, intent }) {
  await page
    .evaluate(
      ({ id, actNo, title, intent }) => {
        document.getElementById(id)?.remove();
        const el = document.createElement('div');
        el.id = id;
        el.setAttribute('aria-hidden', 'true');
        Object.assign(el.style, {
          position: 'fixed',
          insetInlineStart: '0',
          insetBlockEnd: '0',
          zIndex: '2147483647',
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 18px',
          background: 'rgba(17,17,17,0.86)',
          color: '#fff',
          font: '500 15px/1.4 system-ui, sans-serif',
          pointerEvents: 'none',
        });
        const t = document.createElement('div');
        t.textContent = `Act ${actNo} · ${title}`;
        const i = document.createElement('div');
        i.textContent = intent ?? '';
        Object.assign(i.style, { opacity: '0.75', fontSize: '13px', fontWeight: '400' });
        el.append(t, i);
        document.body.appendChild(el);
      },
      { id: BANNER_ID, actNo, title, intent },
    )
    .catch(() => {});
}

async function setBannerVisible(visible) {
  await page
    .evaluate(
      ({ id, visible }) => {
        const el = document.getElementById(id);
        if (el) el.style.display = visible ? 'block' : 'none';
      },
      { id: BANNER_ID, visible },
    )
    .catch(() => {});
}

/**
 * Full-frame card, used to open and close the recording so a viewer knows what they are
 * watching before the app appears.
 */
async function card(title, subtitle, holdMs = 2200) {
  await page.setContent(
    `<!doctype html><meta charset="utf-8"><body style="margin:0;height:100vh;display:flex;
      flex-direction:column;align-items:center;justify-content:center;background:#111;color:#fff;
      font:600 42px/1.3 system-ui,sans-serif;text-align:center;padding:0 8vw">
      <div>${escapeHtml(title)}</div>
      <div style="font:400 22px/1.5 system-ui,sans-serif;opacity:.7;margin-top:18px">${escapeHtml(subtitle)}</div>
    </body>`,
    { waitUntil: 'load' },
  );
  await page.waitForTimeout(holdMs);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

/**
 * Screenshot wrapper that also records the highlight target's position, so the annotator can
 * draw a callout later from a real bounding box rather than a hand-placed rectangle.
 */
async function shot(name, opts = {}) {
  await setBannerVisible(false);
  const file = await helpers.screenshot(name, opts.highlight ? page.locator(opts.highlight).first() : undefined);
  const shotName = file.split('/').pop();

  if (opts.highlight) {
    const box = await page
      .locator(opts.highlight)
      .first()
      .boundingBox()
      .catch(() => null);
    const vp = page.viewportSize();
    if (box && vp) {
      highlights.push({
        file: shotName,
        label: opts.label ?? name,
        box: {
          x: (box.x / vp.width) * 100,
          y: (box.y / vp.height) * 100,
          w: (box.width / vp.width) * 100,
          h: (box.height / vp.height) * 100,
        },
      });
    }
  }
  await setBannerVisible(true);
  return file;
}

// ---------------------------------------------------------------- run

const scenesUrl = pathToFileURL(resolve(process.cwd(), scenesFile)).href;
const mod = await import(scenesUrl);
const declarative = Array.isArray(mod.scenes) ? mod.scenes : null;

/** @type {{index:number,act:number,title:string,criterion?:string,offsetMs:number}[]} */
const chapters = [];
let runError = null;
let preconditionFailure = null;

try {
  await card(`${ticketId}${phase ? ` — ${phase}` : ''}`, mod.summary ?? 'Bug fix evidence', 2000);

  if (declarative) {
    for (const [i, scene] of declarative.entries()) {
      const actNo = scene.act ?? 1;
      helpers.step(`[Act ${actNo}] ${scene.title}`);
      chapters.push({
        index: i + 1,
        act: actNo,
        title: scene.title,
        criterion: scene.criterion,
        offsetMs: Date.now() - videoT0,
      });

      const errorsBefore = recorder.consoleErrors.length;
      const current = recorder.steps[recorder.steps.length - 1];
      current.act = actNo;
      current.intent = scene.intent;
      current.criterion = scene.criterion;

      // Strict in the declarative form: an unlabelled scene proves nothing in particular,
      // and "it looked right" is the claim this whole artifact exists to replace.
      if (!scene.criterion) {
        helpers.check(
          `scene names an acceptance criterion`,
          false,
          'add `criterion: "AC-n"` from the ticket analysis, or move this to a note',
        );
      }

      await showBanner(actNo, scene.title, scene.intent);
      // A scene may call `h.step()`, which opens a *new* record. Everything it asserts
      // afterwards lands there, not on `current` — so counting only `current`'s checks
      // reported "scene asserts something" as failed on a scene that had asserted plenty,
      // and left the later records without the act or criterion. Track the whole span.
      const firstRecord = recorder.steps.length - 1;
      const checksBefore = current.checks.length;
      await scene.run(page, { ...helpers, shot, step: helpers.step.bind(helpers) });

      const spanned = recorder.steps.slice(firstRecord);
      for (const rec of spanned) {
        rec.act = actNo;
        rec.intent ??= scene.intent;
        rec.criterion ??= scene.criterion;
      }
      const assertedInScene =
        spanned.reduce((n, rec) => n + rec.checks.length, 0) - checksBefore > 0;

      // Per scene, not just per run. The act-structure assertions below always contribute
      // three checks, so a whole-run count can never reach zero and would certify a story
      // whose every scene only took pictures.
      if (!assertedInScene) {
        helpers.check(
          'scene asserts something',
          false,
          'this scene only took screenshots. Add an expect*/check for the behaviour it claims to show',
        );
      }

      // Hold on the finished state so the video is followable rather than a flicker.
      await page.waitForTimeout(scene.hold ?? 2500);

      const sceneErrors = recorder.consoleErrors.slice(errorsBefore);
      recorder.steps[recorder.steps.length - 1].consoleErrors = sceneErrors;
      if (sceneErrors.length) {
        console.log(`  [note] ${sceneErrors.length} console/HTTP error(s) during this scene`);
      }
    }

    // Three-act structure, asserted rather than assumed.
    const acts = new Set(declarative.map((s) => s.act ?? 1));
    helpers.step('Story structure');
    for (const n of [1, 2, 3]) {
      helpers.check(`act ${n} present — ${ACT_NAMES[n]}`, acts.has(n), `no scene declared act: ${n}`);
    }
  } else if (typeof mod.default === 'function') {
    console.log('  [note] legacy steps file — no acts or criteria. Convert to `export const scenes`.');
    await mod.default(page, { ...helpers, shot }, outDir);
  } else {
    throw new Error(`${scenesFile} must export \`scenes\` (array) or a default async function`);
  }

  await card('End of capture', `${ticketId}${phase ? ` — ${phase}` : ''}`, 1600);
} catch (err) {
  if (err instanceof PreconditionError) {
    preconditionFailure = err.message;
    console.error(`\n[precondition] ${preconditionFailure}`);
  } else {
    runError = err instanceof Error ? err.message : String(err);
    console.error(`\n[error] capture aborted: ${runError}`);
  }
} finally {
  await page.waitForTimeout(600);
  const video = page.video();
  await context.close(); // flushes the video
  await browser.close();
  if (video) {
    try {
      await rename(await video.path(), resolve(outDir, `${ticketId}${phase ? `-${phase}` : ''}.webm`));
    } catch (err) {
      console.warn(`  could not rename the recording: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------- report

const videoFile = (await readdir(outDir)).find((f) => f.endsWith('.webm')) ?? null;

const totalChecks = recorder.steps.reduce((n, s) => n + s.checks.length, 0);
const failed = recorder.steps.flatMap((s) =>
  s.checks.filter((c) => !c.passed).map((c) => ({ step: s.index, label: s.label, ...c })),
);

// A capture that asserts nothing cannot pass. This is the rule the old runner had no way to
// express, and the reason a green capture used to mean only that the browser opened.
//
// Legacy steps files pre-date that contract: none of them calls an assertion, so treating
// zero checks as `fail` would have made every one of them exit 1 while the documentation
// claimed they still worked. They get their own verdict instead — not `pass`, so it can
// never be cited as evidence, but not a failure of the capture either.
const verdict = preconditionFailure
  ? 'precondition-not-met'
  : runError
    ? 'error'
    : totalChecks === 0
      ? declarative
        ? 'fail'
        : 'legacy-no-assertions'
      : failed.length === 0
        ? 'pass'
        : 'fail';

const manifest = {
  ticket: ticketId,
  phase: phase || null,
  mode: declarative ? 'scenes' : 'legacy',
  verdict,
  finishedAt: new Date().toISOString(),
  environment: {
    appUrl: baseUrl,
    node: process.version,
    scenesFile,
    commit: safeExec('git', ['rev-parse', '--short', 'HEAD']),
    branch: safeExec('git', ['rev-parse', '--abbrev-ref', 'HEAD']),
    // Written by new-ticket-workspace.sh. A story that cannot say which server produced it
    // cannot be reproduced from.
    nuxeoImage: safeRead(resolve(outDir, '..', 'nuxeo-image.txt')),
  },
  totals: { scenes: recorder.steps.length, checks: totalChecks, failed: failed.length },
  ...(runError ? { error: runError } : {}),
  ...(preconditionFailure ? { preconditionFailure } : {}),
  video: videoFile,
  chapters,
  highlights,
  steps: recorder.steps,
  consoleErrors: recorder.consoleErrors,
};

await writeFile(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(resolve(outDir, 'STORY.md'), renderStory(manifest), 'utf8');
if (chapters.length) await writeFile(resolve(outDir, 'chapters.vtt'), renderVtt(manifest), 'utf8');

console.log(`\nverdict  ${verdict.toUpperCase()} — ${totalChecks - failed.length}/${totalChecks} checks across ${recorder.steps.length} scene(s)`);
console.log(`story    ${resolve(outDir, 'STORY.md')}`);

// Two different questions, and they were conflated. "Did the capture run correctly?" decides
// the exit code; "did the claims hold?" is the verdict. The BEFORE half of a bug fix is
// *supposed* to fail its assertions — that is the bug reproducing — so exiting 1 there made
// the documented sequence look like a broken command, indistinguishable from malformed
// evidence. Assertion failures are a result; structural defects are a failure.
const STRUCTURAL = new Set(['scene asserts something', 'scene names an acceptance criterion']);
const structural = failed.filter((f) => STRUCTURAL.has(f.name) || f.name.startsWith('act '));
const captureBroken = Boolean(runError) || Boolean(preconditionFailure) || structural.length > 0;

if (verdict === 'legacy-no-assertions') {
  console.log(
    '\n  This is a legacy steps file: it produced screenshots but asserted nothing, so the\n' +
      '  capture cannot be cited as evidence of anything. Convert it to `export const scenes`\n' +
      '  with a criterion and an assertion per scene when you next touch this ticket.',
  );
} else if (verdict !== 'pass') {
  for (const f of failed) console.log(`  [FAIL] scene ${f.step} (${f.label}) — ${f.name}${f.detail ? `: ${f.detail}` : ''}`);
  if (totalChecks === 0) console.log('  No checks were recorded. A capture that asserts nothing is not evidence.');
  if (!captureBroken) {
    console.log(
      '\n  The capture itself is sound — these are failed claims, not a broken run. For a BEFORE\n' +
        '  capture that is the expected result: it is the bug reproducing. `evidence:story`\n' +
        '  decides whether the before/after pair supports the fix.',
    );
  }
}

if (captureBroken) process.exit(1);

// ---------------------------------------------------------------- helpers

function safeExec(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function safeRead(file) {
  try {
    return readFileSync(file, 'utf8').trim();
  } catch {
    return null;
  }
}

/** WebVTT timestamp. Milliseconds are significant: truncating to whole seconds produced
 *  cues whose start equalled their end, which players reject as zero-length. */
function ms(t) {
  const total = Math.max(0, Math.round(t));
  const h = String(Math.floor(total / 3_600_000)).padStart(2, '0');
  const m = String(Math.floor((total % 3_600_000) / 60_000)).padStart(2, '0');
  const s = String(Math.floor((total % 60_000) / 1000)).padStart(2, '0');
  return `${h}:${m}:${s}.${String(total % 1000).padStart(3, '0')}`;
}

function renderVtt(m) {
  const lines = [
    'WEBVTT',
    '',
    `NOTE Offsets are measured from browser-context creation and are accurate to roughly`,
    `NOTE 100ms — recording starts inside newContext, marginally before the first timestamp.`,
    '',
  ];
  for (const [i, c] of m.chapters.entries()) {
    // A cue must be strictly shorter than the next one's start, and never zero-length.
    const next = m.chapters[i + 1]?.offsetMs;
    const end = Math.max(c.offsetMs + 500, next ?? c.offsetMs + 8000);
    lines.push(`${c.index}`, `${ms(c.offsetMs)} --> ${ms(end)}`, `Act ${c.act} — ${c.title}`, '');
  }
  return lines.join('\n');
}

/** The narrative. Images inlined so it can be pasted into a PR, Jira or Confluence. */
function renderStory(m) {
  const title = `# ${m.ticket}${m.phase ? ` — ${m.phase}` : ''}`;
  const lines = [
    title,
    '',
    `**Verdict:** ${m.verdict.toUpperCase()} — ${m.totals.checks - m.totals.failed}/${m.totals.checks} checks across ${m.totals.scenes} scene(s)`,
    '',
    '| | |',
    '| --- | --- |',
    `| App | ${m.environment.appUrl} |`,
    `| Branch / commit | \`${m.environment.branch ?? '?'}\` @ \`${m.environment.commit ?? '?'}\` |`,
    `| Nuxeo image | ${m.environment.nuxeoImage ? `\`${m.environment.nuxeoImage}\`` : '_not recorded_'} |`,
    `| Scenes file | \`${m.environment.scenesFile}\` |`,
    ...(m.video ? [`| Recording | \`${m.video}\`${m.chapters.length ? ' (chapters in `chapters.vtt`)' : ''} |`] : []),
    '',
  ];

  if (m.preconditionFailure) {
    lines.push(
      '> **Precondition not met — this is not a defect.**',
      '>',
      `> ${m.preconditionFailure}`,
      '>',
      '> Fix the environment or run the scenes file that matches it. Do not change application',
      '> code to make this go green.',
      '',
    );
  }
  if (m.error) {
    lines.push('> **The capture aborted before completing every scene.**', '>', `> ${m.error}`, '');
  }
  if (m.verdict === 'legacy-no-assertions') {
    lines.push(
      '> **Legacy capture — screenshots only, nothing asserted.**',
      '>',
      '> This steps file pre-dates the assertion contract. The images below show that pages',
      '> rendered; they do not show that they rendered the right thing, so this cannot be',
      '> cited as evidence. Convert it to `export const scenes`.',
      '',
    );
  } else if (m.totals.checks === 0) {
    lines.push(
      '> **No checks were recorded, so this capture proves nothing.**',
      '>',
      '> Screenshots show that the app rendered something. They do not show that it rendered',
      '> the right thing. Add an assertion per scene.',
      '',
    );
  }

  if (m.totals.failed > 0) {
    lines.push('## Failed checks', '');
    for (const f of m.steps.flatMap((s) => s.checks.filter((c) => !c.passed).map((c) => ({ s, c })))) {
      lines.push(`- Scene ${f.s.index} (${f.s.label}) — **${f.c.name}**${f.c.detail ? `: ${f.c.detail}` : ''}`);
    }
    lines.push('');
  }

  let lastAct = null;
  for (const s of m.steps) {
    if (s.act && s.act !== lastAct) {
      lines.push(`## Act ${s.act} — ${ACT_NAMES[s.act] ?? ''}`, '');
      lastAct = s.act;
    }
    const bad = s.checks.filter((c) => !c.passed).length;
    const status = s.checks.length === 0 ? 'no checks' : bad === 0 ? 'pass' : `${bad} failed`;
    lines.push(`### ${s.index}. ${s.label.replace(/^\[Act \d+\] /, '')}  _(${status})_`, '');
    if (s.intent) lines.push(`_${s.intent}_`, '');
    if (s.criterion) lines.push(`Proves: **${s.criterion}**`, '');
    for (const c of s.checks) {
      lines.push(`- ${c.passed ? '[pass]' : '[FAIL]'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
    }
    for (const n of s.notes ?? []) lines.push(`- _not covered:_ ${n}`);
    for (const e of s.consoleErrors ?? []) lines.push(`- _observed in the browser:_ \`${e}\``);
    if (s.checks.length || (s.notes ?? []).length || (s.consoleErrors ?? []).length) lines.push('');
    for (const shotFile of s.screenshots) {
      lines.push(`![${s.label} — ${shotFile}](./${shotFile})`, '');
    }
  }

  return `${lines.join('\n')}\n`;
}
