#!/usr/bin/env node
/**
 * Beta phase evidence runner.
 *
 * Runs the steps file for one Beta phase against a live dev server, capturing
 * a screenshot and a pass/fail record for every step, then writes a machine
 * readable manifest and a human readable index with the images embedded.
 *
 * Usage:
 *   node scripts/beta-harness/phase-runner.mjs <phase-id> [steps-file]
 *
 * Examples:
 *   node scripts/beta-harness/phase-runner.mjs phase-0-baseline
 *   node scripts/beta-harness/phase-runner.mjs phase-3-document-list custom/steps.mjs
 *
 * Output: $EVIDENCE_ROOT/beta/<phase-id>/<timestamp>/
 *   NN-*.png      screenshots, numbered by step
 *   *.webm        video of the whole run
 *   manifest.json steps, checks, environment, verdict
 *   INDEX.md      narrative report with the images inlined
 *
 * Exit code is 1 when any check failed, so the iteration loop in the
 * `beta-phase` skill can treat a phase as incomplete and retry.
 */

import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { EVIDENCE_ROOT } from '../collect-evidence/evidence-path.mjs';
import { createHelpers } from './helpers.mjs';

let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  console.error(
    '\nPlaywright is required to capture evidence but is not installed.\n' +
      'It is intentionally not a tracked dependency, so CI installs stay unaffected.\n\n' +
      '  npm install --no-save @playwright/test\n' +
      '  npx playwright install chromium\n',
  );
  process.exit(1);
}

const [, , phaseId, stepsArg] = process.argv;

if (!phaseId) {
  console.error('Usage: node scripts/beta-harness/phase-runner.mjs <phase-id> [steps-file]');
  process.exit(1);
}

const stepsFile = stepsArg
  ? isAbsolute(stepsArg)
    ? stepsArg
    : resolve(process.cwd(), stepsArg)
  : resolve(import.meta.dirname, 'steps', `${phaseId}.mjs`);

const startedAt = new Date();
const stamp = startedAt.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = resolve(EVIDENCE_ROOT, 'beta', phaseId, stamp);
await mkdir(outDir, { recursive: true });

const baseUrl = process.env['APP_URL'] ?? 'http://localhost:4200';
console.log(`\nBeta phase evidence: ${phaseId}`);
console.log(`  steps  ${stepsFile}`);
console.log(`  app    ${baseUrl}`);
console.log(`  out    ${outDir}`);

/** @type {{ steps: import('./helpers.mjs').StepRecord[], consoleErrors: string[] }} */
const recorder = { steps: [], consoleErrors: [] };

const browser = await chromium.launch({
  headless: process.env['EVIDENCE_HEADLESS'] === '1',
  slowMo: Number(process.env['EVIDENCE_SLOWMO'] ?? 300),
});

// `httpCredentials` guarantees Basic auth on every request to the app origin.
// Injecting a session into sessionStorage (see helpers.login) satisfies the route
// guard so pages render, but does not reliably authenticate XHRs — that surfaces as
// intermittent 403s on /nuxeo/api paths and screenshots of empty or error states.
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
  httpCredentials: {
    username: process.env['NUXEO_USER'] ?? 'Administrator',
    password: process.env['NUXEO_PASS'] ?? 'Administrator',
    origin: baseUrl,
  },
});

const page = await context.newPage();

page.on('console', (msg) => {
  if (msg.type() !== 'error') return;
  const text = msg.text();
  // The browser's own "Failed to load resource" message carries no URL, so it is
  // useless for deciding whether a failure matters. The response listener below
  // records the same failures with their path, so drop the duplicate.
  if (text.startsWith('Failed to load resource')) return;
  recorder.consoleErrors.push(text.slice(0, 300));
});
page.on('pageerror', (err) => {
  recorder.consoleErrors.push(`uncaught: ${String(err.message).slice(0, 300)}`);
});
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

let runError = null;
try {
  const { default: runSteps } = await import(pathToFileURL(stepsFile).href);
  if (typeof runSteps !== 'function') {
    throw new Error(`${stepsFile} must export a default async function(page, helpers, outDir)`);
  }
  await runSteps(page, helpers, outDir);
} catch (err) {
  runError = err instanceof Error ? err.message : String(err);
  console.error(`\n[error] steps aborted: ${runError}`);
} finally {
  await page.waitForTimeout(600);
  await context.close(); // flushes the video
  await browser.close();
}

const video = (await readdir(outDir)).find((f) => f.endsWith('.webm')) ?? null;

const totalChecks = recorder.steps.reduce((n, s) => n + s.checks.length, 0);
const failedChecks = recorder.steps.flatMap((s) =>
  s.checks.filter((c) => !c.passed).map((c) => ({ step: s.index, label: s.label, ...c })),
);
const verdict = runError ? 'error' : failedChecks.length === 0 && totalChecks > 0 ? 'pass' : 'fail';

const manifest = {
  phase: phaseId,
  verdict,
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  environment: {
    appUrl: baseUrl,
    nuxeoUser: process.env['NUXEO_USER'] ?? 'Administrator',
    node: process.version,
    stepsFile,
  },
  totals: { steps: recorder.steps.length, checks: totalChecks, failed: failedChecks.length },
  ...(runError ? { error: runError } : {}),
  video,
  steps: recorder.steps,
  consoleErrors: recorder.consoleErrors,
};

await writeFile(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(resolve(outDir, 'INDEX.md'), renderIndex(manifest), 'utf8');

console.log(`\nverdict  ${verdict.toUpperCase()}  (${totalChecks - failedChecks.length}/${totalChecks} checks passed)`);
if (failedChecks.length) {
  console.log('failed checks:');
  for (const c of failedChecks) {
    console.log(`  step ${c.step} "${c.label}" -> ${c.name}${c.detail ? `: ${c.detail}` : ''}`);
  }
}
if (totalChecks === 0 && !runError) {
  console.log('No checks were recorded. A capture that asserts nothing does not count as evidence.');
}
console.log(`\nreport   ${resolve(outDir, 'INDEX.md')}`);

process.exit(verdict === 'pass' ? 0 : 1);

/**
 * Render the human readable report, with screenshots inlined so it can be
 * pasted into a PR description or attached to a Confluence page.
 * @param {typeof manifest} m
 */
function renderIndex(m) {
  const lines = [
    `# Evidence: ${m.phase}`,
    '',
    `**Verdict:** ${m.verdict.toUpperCase()} — ${m.totals.checks - m.totals.failed}/${m.totals.checks} checks passed across ${m.totals.steps} steps`,
    '',
    `- Started: ${m.startedAt}`,
    `- App: ${m.environment.appUrl}`,
    `- Steps file: \`${m.environment.stepsFile}\``,
    ...(m.video ? [`- Video: \`${m.video}\``] : []),
    '',
  ];

  if (m.error) {
    // Prefix every line so a multi-line stack stays inside the blockquote.
    const quoted = m.error.split('\n').map((l) => `> ${l}`);
    lines.push('> **The run aborted before completing all steps.**', '>', ...quoted, '');
  }

  if (m.totals.failed > 0) {
    lines.push('## Failed checks', '');
    for (const s of m.steps) {
      for (const c of s.checks.filter((x) => !x.passed)) {
        lines.push(`- Step ${s.index} (${s.label}) — **${c.name}**${c.detail ? `: ${c.detail}` : ''}`);
      }
    }
    lines.push('');
  }

  lines.push('## Steps', '');
  for (const s of m.steps) {
    const failed = s.checks.filter((c) => !c.passed).length;
    const status = s.checks.length === 0 ? 'no checks' : failed === 0 ? 'pass' : `${failed} failed`;
    lines.push(`### ${s.index}. ${s.label}  _(${status})_`, '');
    for (const c of s.checks) {
      lines.push(`- ${c.passed ? '[pass]' : '[FAIL]'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
    }
    if (s.checks.length) lines.push('');
    for (const shot of s.screenshots) {
      lines.push(`![${s.label} — ${shot}](./${shot})`, '');
    }
  }

  if (m.consoleErrors.length) {
    lines.push('## Browser console errors', '');
    for (const e of m.consoleErrors.slice(0, 20)) lines.push(`- \`${e}\``);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
