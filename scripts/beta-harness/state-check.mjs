#!/usr/bin/env node
/**
 * Verify `.ai/state/phases.json` against the evidence actually on disk.
 *
 * This is the anti-false-completion control. Phase 1 was recorded complete — in
 * prose, in section 3 of `AGENTS/11-beta-program.md`, and used to downgrade a risk
 * — while its upgrade-safe config path was wrong by one segment and "would have
 * 404'd on every install". Nothing mechanically connected the claim to an artifact.
 *
 * Now a phase may be `complete` only if its cited manifest exists and says `pass`.
 * A missing manifest, a `fail`, a `precondition-not-met`, or a manifest with zero
 * checks all make the claim unsupported and this gate red.
 *
 * `manifest: "<phase-dir>/latest"` resolves to the newest timestamped run in that
 * directory, so the state file does not need editing after every capture. That is
 * deliberate: a stamp nobody updates becomes a lie quietly, whereas `latest`
 * degrades loudly the moment the newest run stops passing.
 *
 * Usage:
 *   node scripts/beta-harness/state-check.mjs [--json]
 *
 * Exit 1 if any phase claims more than the evidence supports.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { EVIDENCE_ROOT } from '../collect-evidence/evidence-path.mjs';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const asJson = process.argv.includes('--json');
// `--state <path>` exists so the gate's own failure modes can be exercised against
// fixtures. A gate nobody has watched go red is not evidence.
const stateArg = process.argv[process.argv.indexOf('--state') + 1];
const statePath =
  process.argv.includes('--state') && stateArg ? resolve(process.cwd(), stateArg) : resolve(repoRoot, '.ai/state/phases.json');
const betaRoot = resolve(EVIDENCE_ROOT, 'beta');

/** A phase claiming one of these must have a passing manifest behind it. */
const EVIDENCE_REQUIRED = new Set(['complete', 'complete-with-deviations']);

/**
 * How many gates the pipeline runs today. Read from the gate script rather than
 * hardcoded, so this cannot drift the next time a gate is added.
 */
const CURRENT_GATE_COUNT = await countGates();

if (!existsSync(statePath)) {
  console.error(`state-check: ${statePath} does not exist. Nothing to verify, so this is not a pass.`);
  process.exit(1);
}

/** @type {{ phase: string, severity: 'fail'|'warn', message: string }[]} */
const problems = [];
const rows = [];

const state = JSON.parse(await readFile(statePath, 'utf8'));

for (const p of state.phases ?? []) {
  const row = { id: p.id, status: p.status, manifest: null, verdict: null, checks: null };

  if (!EVIDENCE_REQUIRED.has(p.status)) {
    // Nothing to prove — but a phase that is not complete must not carry evidence
    // implying it is, and a blocked phase must say what blocks it.
    if (p.status === 'blocked' && !(p.blockedOn?.length > 0)) {
      problems.push({ phase: p.id, severity: 'fail', message: 'is `blocked` but does not say what blocks it.' });
    }
    rows.push(row);
    continue;
  }

  if (!p.evidence?.manifest) {
    problems.push({
      phase: p.id,
      severity: 'fail',
      message: `claims \`${p.status}\` with no evidence.manifest. A status without an artifact is an assertion, not a record.`,
    });
    rows.push(row);
    continue;
  }

  const resolved = await resolveManifest(p.evidence.manifest);
  if (!resolved.ok) {
    problems.push({
      phase: p.id,
      severity: 'fail',
      message: `claims \`${p.status}\` but ${resolved.detail}`,
    });
    rows.push(row);
    continue;
  }

  row.manifest = resolved.rel;
  row.verdict = resolved.manifest.verdict;
  row.checks = resolved.manifest.totals?.checks ?? 0;

  rows.push(row);

  if (resolved.manifest.verdict !== 'pass') {
    problems.push({
      phase: p.id,
      severity: 'fail',
      message: `claims \`${p.status}\` but its newest evidence (${resolved.rel}) has verdict \`${resolved.manifest.verdict}\`.`,
    });
    continue;
  }
  if (!row.checks) {
    problems.push({
      phase: p.id,
      severity: 'fail',
      message: `claims \`${p.status}\` but ${resolved.rel} recorded zero checks. A capture that asserts nothing is not evidence.`,
    });
    continue;
  }

  // The quality gate, not just the capture. `pass-partial` is rejected on purpose:
  // two reports in this corpus read `"verdict": "pass"` having run one gate of six.
  if (p.evidence.gate) {
    const gate = await resolveGate(p.evidence.gate);
    const ranCount = gate.ok ? (gate.report.results?.length ?? gate.report.gates?.ran?.length ?? 0) : 0;
    row.gate = gate.ok ? `${gate.report.verdict} (${ranCount} of ${CURRENT_GATE_COUNT} gates) — ${gate.rel}` : null;
    if (!gate.ok) {
      problems.push({ phase: p.id, severity: 'fail', message: `cites a gate report but ${gate.detail}` });
    } else if (gate.report.verdict === 'pass-partial') {
      problems.push({
        phase: p.id,
        severity: 'fail',
        message: `cites gate report ${gate.rel}, which is \`pass-partial\` — it never ran ${(gate.report.gates?.notRequested ?? []).join(', ')}. A filtered run is a fast inner loop, not a phase gate.`,
      });
    } else if (gate.report.verdict !== 'pass') {
      problems.push({
        phase: p.id,
        severity: 'fail',
        message: `cites gate report ${gate.rel}, whose verdict is \`${gate.report.verdict}\`.`,
      });
    } else {
      if (gate.imprecise) {
        problems.push({
          phase: p.id,
          severity: 'warn',
          message: `cites \`gates/latest\`, which is whatever ran last and may be unrelated. Use \`gates/latest:<label>\`.`,
        });
      }
      // The gate set has grown twice — `lockfile` and `typecheck` in Phase 2, then
      // `node` and `assertions`. A phase signed off under the old set has never been
      // through the newer ones, and that is worth knowing before trusting it.
      //
      // `evidence.regate` records a later run against the *current* set. The original
      // citation is kept rather than replaced: it is the historical fact of what was
      // actually run at sign-off, and overwriting it would erase the very gap this
      // warning exists to surface.
      const signedOff = gate.report.results?.length ?? gate.report.gates?.ran?.length ?? 0;
      if (signedOff < CURRENT_GATE_COUNT) {
        const re = p.evidence.regate ? await resolveGate(p.evidence.regate) : null;
        const reRan = re?.ok ? (re.report.results?.length ?? 0) : 0;
        if (re?.ok && re.report.verdict === 'pass' && reRan >= CURRENT_GATE_COUNT) {
          row.gate += `  [re-gated ${reRan}/${CURRENT_GATE_COUNT}: ${re.rel}]`;
        } else if (p.evidence.regate) {
          problems.push({
            phase: p.id,
            severity: 'fail',
            message: `cites a re-gate that does not hold: ${re?.ok ? `${re.rel} is \`${re.report.verdict}\` over ${reRan} gate(s)` : re?.detail}`,
          });
        } else {
          problems.push({
            phase: p.id,
            severity: 'warn',
            message: `was signed off on a ${signedOff}-gate run; the gate set is now ${CURRENT_GATE_COUNT}. It has never been through the newer gates — re-gate and record it as \`evidence.regate\`.`,
          });
        }
      }
    }
  }

  // Passing, but the claim can still be wider than the evidence.
  if (!(p.notCovered?.length > 0)) {
    problems.push({
      phase: p.id,
      severity: 'warn',
      message: 'is complete with an empty `notCovered`. Silence reads as full coverage; state the gaps.',
    });
  }
  const audit = resolved.manifest.screenshotAudit;
  if (audit && audit.total > 0 && audit.unique < audit.total) {
    problems.push({
      phase: p.id,
      severity: 'warn',
      message: `evidence has ${audit.unique} unique image(s) of ${audit.total}; do not quote the screenshot count as observations.`,
    });
  }
}

report();
process.exit(problems.some((p) => p.severity === 'fail') ? 1 : 0);

/**
 * @param {string} ref e.g. `phase-2-registry/latest` or an explicit timestamp dir
 * @returns {Promise<{ ok: true, rel: string, manifest: any } | { ok: false, detail: string }>}
 */
async function resolveManifest(ref) {
  const [phaseDir, stamp] = ref.split('/');
  const dir = resolve(betaRoot, phaseDir);
  if (!existsSync(dir)) {
    return { ok: false, detail: `no evidence directory \`${phaseDir}\` exists under ${betaRoot}.` };
  }

  let chosen = stamp;
  if (stamp === 'latest' || !stamp) {
    const entries = [];
    for (const name of await readdir(dir)) {
      const full = resolve(dir, name);
      if ((await stat(full)).isDirectory() && existsSync(resolve(full, 'manifest.json'))) entries.push(name);
    }
    // Timestamped names sort lexicographically in chronological order.
    entries.sort();
    chosen = entries.at(-1);
    if (!chosen) return { ok: false, detail: `\`${phaseDir}\` contains no run with a manifest.json.` };
  }

  const file = resolve(dir, chosen, 'manifest.json');
  if (!existsSync(file)) return { ok: false, detail: `${phaseDir}/${chosen}/manifest.json does not exist.` };

  try {
    return { ok: true, rel: `${phaseDir}/${chosen}`, manifest: JSON.parse(await readFile(file, 'utf8')) };
  } catch (err) {
    return { ok: false, detail: `${phaseDir}/${chosen}/manifest.json is not readable JSON: ${err}` };
  }
}

/**
 * Resolve a gate reference.
 *
 *   `gates/latest:<label>`  newest report whose `phase` field is <label> — preferred,
 *                           because "newest overall" is poisoned by any unrelated run
 *                           (a deliberate-break probe made three phases go red here)
 *   `gates/<file>.json`     an exact report
 *   `gates/latest`          newest overall; accepted but flagged as imprecise
 *
 * @param {string} ref
 * @returns {Promise<{ ok: true, rel: string, report: any, imprecise?: boolean } | { ok: false, detail: string }>}
 */
async function resolveGate(ref) {
  const dir = resolve(betaRoot, 'gates');
  if (!existsSync(dir)) return { ok: false, detail: `no gates directory exists under ${betaRoot}.` };

  const name = ref.split('/').slice(1).join('/');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json')).sort();
  if (files.length === 0) return { ok: false, detail: 'the gates directory contains no reports.' };

  if (name.startsWith('latest:')) {
    const label = name.slice('latest:'.length);
    for (const f of [...files].reverse()) {
      try {
        const report = JSON.parse(await readFile(resolve(dir, f), 'utf8'));
        if (report.phase === label) return { ok: true, rel: `gates/${f}`, report };
      } catch {
        /* skip an unreadable report rather than fail the lookup on it */
      }
    }
    return { ok: false, detail: `no gate report is labelled \`${label}\`. Run: npm run beta:gate -- --phase ${label}` };
  }

  if (!name || name === 'latest') {
    const f = files.at(-1);
    return { ok: true, rel: `gates/${f}`, report: JSON.parse(await readFile(resolve(dir, f), 'utf8')), imprecise: true };
  }

  const file = resolve(dir, name.endsWith('.json') ? name : `${name}.json`);
  if (!existsSync(file)) return { ok: false, detail: `gates/${name} does not exist.` };
  try {
    return { ok: true, rel: `gates/${name}`, report: JSON.parse(await readFile(file, 'utf8')) };
  } catch (err) {
    return { ok: false, detail: `gates/${name} is not readable JSON: ${err}` };
  }
}

/**
 * Ask the gate script itself how many gates exist, so this never goes stale.
 * @returns {Promise<number>}
 */
async function countGates() {
  try {
    const src = await readFile(resolve(import.meta.dirname, 'verify-gate.mjs'), 'utf8');
    const block = src.slice(src.indexOf('const ALL_GATES'), src.indexOf('const requested'));
    return (block.match(/^\s*(?:\{\s*)?id:\s*'/gm) ?? []).length;
  } catch {
    return 0; // Unknown, so never warn about it.
  }
}

function report() {
  const fails = problems.filter((p) => p.severity === 'fail');
  const warns = problems.filter((p) => p.severity === 'warn');

  if (asJson) {
    console.log(JSON.stringify({ ok: fails.length === 0, phases: rows, problems }, null, 2));
    return;
  }

  console.log(`\nPhase state check — ${statePath.replace(`${repoRoot}/`, '')}\n`);
  for (const r of rows) {
    const ev = r.manifest ? `${r.verdict} (${r.checks} checks) — ${r.manifest}` : 'no evidence cited';
    console.log(`  ${r.id.padEnd(20)} ${String(r.status).padEnd(12)} ${ev}`);
    if (r.gate) console.log(`  ${' '.repeat(20)} ${' '.repeat(12)} gate: ${r.gate}`);
  }
  console.log('');
  for (const p of fails) console.log(`  [FAIL] ${p.phase} ${p.message}`);
  for (const p of warns) console.log(`  [warn] ${p.phase} ${p.message}`);
  if (problems.length) console.log('');

  if (fails.length) {
    console.log(`state-check: FAIL — ${fails.length} phase(s) claim more than the evidence on disk supports.`);
  } else {
    console.log(
      `state-check: pass — every completed phase cites a manifest that exists and passed` +
        `${warns.length ? `, with ${warns.length} warning(s)` : ''}.`,
    );
  }
}
