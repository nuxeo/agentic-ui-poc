#!/usr/bin/env node
/**
 * Per-phase timing and effort metrics for agent-driven work (the `fix-bug` skill and friends).
 *
 * Usage:
 *   node scripts/agent-metrics.mjs start   <TICKET> [--kind bug|feature] [--model <name>]
 *   node scripts/agent-metrics.mjs phase   <TICKET> <phase-id>     # closes the previous phase
 *   node scripts/agent-metrics.mjs event   <TICKET> <type> [detail]
 *   node scripts/agent-metrics.mjs end     <TICKET> [--outcome pr-open|merged|blocked|abandoned]
 *   node scripts/agent-metrics.mjs report  <TICKET>
 *   node scripts/agent-metrics.mjs publish <TICKET>                # appends a row to Confluence
 *
 * Events are appended to $AGENTIC_UI_EVIDENCE_DIR/<TICKET>/metrics.jsonl — outside the repo,
 * append-only, so a crashed run still leaves everything up to the crash.
 *
 * ## On token and cost accounting — read before adding a number
 *
 * **This script does not measure tokens or spend, because the agent cannot observe them.**
 * There is no API by which a running Cursor agent can read its own token usage, and a
 * self-reported estimate would be a number with no measurement behind it — the exact failure
 * this repository keeps recording, where a plausible figure gets believed because it is
 * printed next to real ones.
 *
 * What is measured instead: wall-clock per phase, retries, gate runs, and stop conditions —
 * all of which the agent genuinely observes. What is recorded to make cost *joinable* rather
 * than guessed: the model name, the account, and the exact UTC window of the run. Cursor's
 * Teams usage export is per-user and per-day; join on account plus window to attribute spend
 * to a run. `report` prints the join key rather than inventing a total.
 */

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { evidenceDirForTicket } from './collect-evidence/evidence-path.mjs';

/**
 * Canonical phase ids. Free-text phase names make runs incomparable, and a table you cannot
 * compare across runs cannot tell you which phase to shorten — which is the only reason to
 * measure this at all. An unknown id is rejected rather than silently recorded.
 */
/**
 * Canonical phases, each in one of three buckets.
 *
 * Only `fix` is published. The first run measured 4h 13m of wall clock and published it as
 * "time taken", of which 3h 44m — 88% — was capturing evidence and waiting on CI. That number
 * says nothing about how long the fix took and everything about how slow the pipeline is, and
 * read on a page called "Skill Performance" it is actively misleading.
 *
 *   fix       understanding the problem and changing the code until it is right
 *   evidence  capturing and comparing before/after — real work, but not fixing
 *   overhead  workspace setup, CI polling, ticket admin, teardown — mostly waiting
 *
 * All three are printed locally; the shared page gets the fix total.
 */
export const PHASES = {
  ticket: { label: 'Understand the ticket + acceptance criteria', bucket: 'fix' },
  expected: { label: 'Establish expected behaviour / prior art', bucket: 'fix' },
  workspace: { label: 'Take the ticket workspace', bucket: 'overhead' },
  reproduce: { label: 'Reproduce the defect', bucket: 'fix' },
  'evidence-before': { label: 'Capture the before evidence', bucket: 'evidence' },
  baseline: { label: 'Baseline capture (feature)', bucket: 'evidence' },
  design: { label: 'Design + layer placement (feature)', bucket: 'fix' },
  decide: { label: 'Choose the approach', bucket: 'fix' },
  scaffold: { label: 'Scaffold the module (feature)', bucket: 'fix' },
  fix: { label: 'Implement', bucket: 'fix' },
  'verify-evidence': { label: 'After evidence + comparison', bucket: 'evidence' },
  'regression-test': { label: 'Tests', bucket: 'fix' },
  docs: { label: 'Docs + extension reference (feature)', bucket: 'fix' },
  'blast-radius': { label: 'Blast-radius check', bucket: 'fix' },
  gate: { label: 'Local gate to green', bucket: 'fix' },
  validate: { label: 'validate-fix (a11y, browsers)', bucket: 'evidence' },
  pr: { label: 'Commit + open the PR', bucket: 'overhead' },
  ci: { label: 'CI to green', bucket: 'overhead' },
  review: { label: 'Review comments', bucket: 'fix' },
  jira: { label: 'Update the ticket', bucket: 'overhead' },
  cleanup: { label: 'Clean up + summary', bucket: 'overhead' },
};

const CONFLUENCE_PAGE_ID = process.env['AGENT_METRICS_PAGE_ID'] ?? '4301586845';
const CONFLUENCE_BASE = process.env['AGENT_METRICS_CONFLUENCE'] ?? 'https://hyland.atlassian.net/wiki';

// `PHASES` is imported by tooling that seeds the metrics page, so the CLI must not run on
// import — otherwise a bare `import { PHASES }` prints usage and exits the importing process.
const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
const [, , cmd, ticket, ...rest] = process.argv;
if (!cmd || !ticket) {
  console.error(readFileSync(new URL(import.meta.url)).toString().split('\n').slice(3, 12).join('\n').replace(/^ \* ?/gm, ''));
  process.exit(2);
}

const dir = evidenceDirForTicket(ticket);
const log = resolve(dir, 'metrics.jsonl');

const flag = (name, dflt = null) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? dflt : rest[i + 1];
};

async function append(record) {
  await mkdir(dir, { recursive: true });
  await appendFile(log, `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`, 'utf8');
}

async function read() {
  if (!existsSync(log)) return [];
  return (await readFile(log, 'utf8'))
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

switch (cmd) {
  case 'start': {
    await append({
      type: 'start',
      ticket,
      kind: flag('kind', 'bug'),
      // Self-reported: the agent knows which model it is, and nothing else can record it.
      model: flag('model', process.env['AGENT_MODEL'] ?? 'unknown'),
      account: process.env['AGENT_ACCOUNT'] ?? (existsSync(`${homedir()}/.jira_email`) ? readFileSync(`${homedir()}/.jira_email`, 'utf8').trim() : 'unknown'),
      branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
      node: process.version,
    });
    console.log(`metrics: started ${ticket}`);
    break;
  }

  case 'phase': {
    const id = rest[0];
    if (!id || !PHASES[id]) {
      console.error(`Unknown phase "${id}". Valid ids:\n  ${Object.keys(PHASES).join('\n  ')}`);
      process.exit(2);
    }
    await append({ type: 'phase', phase: id });
    console.log(`metrics: → ${id} (${PHASES[id].label})`);
    break;
  }

  case 'event': {
    const [type, ...detail] = rest;
    if (!type) {
      console.error('event needs a type, e.g. retry | gate-run | gate-fail | stop-condition | evidence-rerun');
      process.exit(2);
    }
    await append({ type: 'event', event: type, detail: detail.join(' ') || null });
    console.log(`metrics: event ${type}`);
    break;
  }

  case 'end': {
    // Only these four. `merged` used to be passed by default from a workflow that opens a PR
    // and never merges it, so every published row claimed a delivery that had not happened.
    // Required, with no default. Omitting it used to record `unknown`, which is the
    // ambiguous row the validation exists to keep out of the log.
    const outcome = flag('outcome');
    const VALID = ['pr-open', 'merged', 'blocked', 'abandoned'];
    if (!outcome || !VALID.includes(outcome)) {
      console.error(
        `--outcome is required and must be one of: ${VALID.join(', ')}` +
          (outcome ? `  (got "${outcome}")` : ''),
      );
      process.exit(2);
    }
    await append({ type: 'end', outcome });
    await report();
    break;
  }

  case 'report':
    await report();
    break;

  case 'publish':
    await publish();
    break;

  default:
    console.error(`Unknown command "${cmd}"`);
    process.exit(2);
}

// ---------------------------------------------------------------- report

async function summarise() {
  const rows = await read();
  if (!rows.length) return null;

  // Scope to the *latest* run. The log is append-only per ticket, so taking the first
  // `start` merged every subsequent run into the original one: a second run would report the
  // first run's model and window while summing both runs' phases, and `publish` would append
  // that corrupted total to the shared page.
  const lastStart = rows.map((r) => r.type).lastIndexOf('start');
  const run = lastStart === -1 ? rows : rows.slice(lastStart);

  const start = run.find((r) => r.type === 'start');
  const end = run.find((r) => r.type === 'end');
  const marks = run.filter((r) => r.type === 'phase' || r.type === 'end');

  /** @type {Map<string,{ms:number,events:string[]}>} */
  const phases = new Map();
  for (let i = 0; i < marks.length; i += 1) {
    if (marks[i].type !== 'phase') continue;
    const from = new Date(marks[i].at).getTime();
    const to = new Date((marks[i + 1] ?? { at: new Date().toISOString() }).at).getTime();
    const cur = phases.get(marks[i].phase) ?? { ms: 0, events: [] };
    cur.ms += Math.max(0, to - from);
    phases.set(marks[i].phase, cur);
  }

  // Attribute each event to the phase that was open when it happened.
  for (const e of run.filter((r) => r.type === 'event')) {
    const open = [...marks].reverse().find((m) => m.type === 'phase' && new Date(m.at) <= new Date(e.at));
    if (open) phases.get(open.phase)?.events.push(e.event);
  }

  const totalMs = phases.size ? [...phases.values()].reduce((n, p) => n + p.ms, 0) : 0;
  const buckets = { fix: 0, evidence: 0, overhead: 0 };
  for (const [id, p] of phases) buckets[PHASES[id]?.bucket ?? 'overhead'] += p.ms;
  const wallMs = start ? new Date((end ?? run[run.length - 1]).at).getTime() - new Date(start.at).getTime() : 0;

  return { start, end, phases, buckets, totalMs, wallMs, rows: run };
}

function hhmm(ms) {
  const m = Math.round(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
}

async function report() {
  const s = await summarise();
  if (!s) {
    console.error(`No metrics for ${ticket}. Run \`agent-metrics start ${ticket}\` first.`);
    process.exit(1);
  }

  const ordered = Object.keys(PHASES).filter((p) => s.phases.has(p));
  const width = Math.max(...ordered.map((p) => PHASES[p].label.length), 20);

  console.log(`\n${ticket} — phase timings (${s.start?.kind ?? '?'}, ${s.start?.model ?? '?'})\n`);
  console.log(`  ${'phase'.padEnd(width)}  ${'time'.padStart(7)}  ${'%'.padStart(4)}  ${'bucket'.padEnd(8)}  events`);
  console.log(`  ${'-'.repeat(width)}  ${'-'.repeat(7)}  ${'-'.repeat(4)}  ${'-'.repeat(8)}  ------`);
  for (const p of ordered) {
    const { ms, events } = s.phases.get(p);
    const pct = s.totalMs ? Math.round((ms / s.totalMs) * 100) : 0;
    const tally = Object.entries(
      events.reduce((acc, e) => ({ ...acc, [e]: (acc[e] ?? 0) + 1 }), {}),
    )
      .map(([k, v]) => `${k}×${v}`)
      .join(' ');
    console.log(`  ${PHASES[p].label.padEnd(width)}  ${hhmm(ms).padStart(7)}  ${String(pct).padStart(3)}%  ${PHASES[p].bucket.padEnd(8)}  ${tally}`);
  }
  console.log(`  ${'-'.repeat(width)}  ${'-'.repeat(7)}`);
  console.log(`  ${'FIX  (published)'.padEnd(width)}  ${hhmm(s.buckets.fix).padStart(7)}`);
  console.log(`  ${'evidence'.padEnd(width)}  ${hhmm(s.buckets.evidence).padStart(7)}`);
  console.log(`  ${'overhead'.padEnd(width)}  ${hhmm(s.buckets.overhead).padStart(7)}`);
  console.log(`  ${'total (phases)'.padEnd(width)}  ${hhmm(s.totalMs).padStart(7)}`);
  console.log(`  ${'wall clock'.padEnd(width)}  ${hhmm(s.wallMs).padStart(7)}`);

  const slowest = [...s.phases.entries()].sort((a, b) => b[1].ms - a[1].ms)[0];
  if (slowest) console.log(`\n  Slowest phase: ${PHASES[slowest[0]].label} (${hhmm(slowest[1].ms)})`);

  console.log(
    `\n  Cost: not measured here — an agent cannot read its own token usage, and a guess\n` +
      `  printed beside measured numbers gets believed. Join on Cursor's usage export using:\n` +
      `    account ${s.start?.account ?? '?'}\n` +
      `    model   ${s.start?.model ?? '?'}\n` +
      `    window  ${s.start?.at ?? '?'} → ${s.end?.at ?? 'still running'}\n`,
  );
  return s;
}

// ---------------------------------------------------------------- publish

async function publish() {
  const s = await summarise();
  if (!s) {
    console.error(`No metrics for ${ticket}.`);
    process.exit(1);
  }
  // The row records a finished piece of work, so both of these must hold.
  //
  // `phase jira` alone is not enough: a phase mark opens a phase, it does not close it, so
  // `phase jira` immediately followed by `publish` used to satisfy the guard before any of
  // the Jira work had happened. Requiring the `end` mark closes it — and the documented
  // workflow already runs `end` before `publish`.
  const problems = [];
  if (!s.phases.has('jira')) {
    problems.push(
      'nothing recorded for the `jira` phase — post the fix summary and attach the evidence first',
    );
  }
  if (!s.end) {
    problems.push('no `end` mark — run `agent-metrics end <TICKET> --outcome <outcome>` first');
  }
  if (problems.length) {
    console.error(`\nRefusing to publish an unfinished run:\n${problems.map((p) => `  - ${p}`).join('\n')}\n`);
    process.exit(1);
  }

  const email = readIf(`${homedir()}/.jira_email`);
  const token = readIf(`${homedir()}/.jira_token`);
  if (!email || !token) {
    console.error(
      '\n~/.jira_email and ~/.jira_token are required to publish.\n' +
        "Create the token at https://id.atlassian.com/manage-profile/security/api-tokens, then:\n" +
        "  printf '%s' '<token>' > ~/.jira_token && chmod 600 ~/.jira_token\n",
    );
    process.exit(1);
  }
  const auth = `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`;

  const get = await fetch(
    `${CONFLUENCE_BASE}/api/v2/pages/${CONFLUENCE_PAGE_ID}?body-format=storage`,
    { headers: { Authorization: auth, Accept: 'application/json' } },
  );
  if (!get.ok) {
    console.error(`Could not read the metrics page (HTTP ${get.status}). Check the id and your access.`);
    process.exit(1);
  }
  const page = await get.json();
  const storage = page.body?.storage?.value ?? '';

  const cell = (v) => `<td><p>${String(v ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</p></td>`;

  // Three columns only: who, which ticket, how long. The per-phase breakdown, retries, gate
  // failures and model stay in the local metrics.jsonl — they are for tuning the skill, and
  // publishing thirty columns produced a table nobody could read across.
  // The fix total, not wall clock. Publishing wall clock made the first row read 4h 13m for a
  // one-line change, 88% of which was evidence capture and CI polling — a number that says
  // nothing about the fix and is read as if it did.
  const row = `<tr>${cell(s.start?.account)}${cell(ticket)}${cell(hhmm(s.buckets.fix))}</tr>`;

  // Anchor on the page's structure, not on a marker comment: Confluence's storage-format
  // sanitiser strips HTML comments, so a `<!-- ... -->` marker silently does not survive the
  // first save. The runs table is the first table after the "Runs" heading, and the row goes
  // immediately before its closing tag.
  const heading = storage.indexOf('<h2>Runs</h2>');
  const close = heading === -1 ? -1 : storage.indexOf('</tbody>', heading);
  if (close === -1) {
    console.error(
      '\nCould not find the runs table: the page needs an <h2>Runs</h2> heading followed by a\n' +
        'table. Restore that structure (or re-seed the page) and retry — refusing to guess at\n' +
        'a position rather than write the row into the wrong table.\n',
    );
    process.exit(1);
  }
  const updated = `${storage.slice(0, close)}${row}\n${storage.slice(close)}`;

  const put = await fetch(`${CONFLUENCE_BASE}/api/v2/pages/${CONFLUENCE_PAGE_ID}`, {
    method: 'PUT',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: CONFLUENCE_PAGE_ID,
      status: 'current',
      title: page.title,
      body: { representation: 'storage', value: updated },
      version: { number: page.version.number + 1, message: `agent-metrics: ${ticket}` },
    }),
  });
  if (!put.ok) {
    console.error(`Publish failed (HTTP ${put.status}): ${(await put.text()).slice(0, 300)}`);
    process.exit(1);
  }
  console.log(`Published ${ticket} to ${CONFLUENCE_BASE}/pages/${CONFLUENCE_PAGE_ID}`);
}

function readIf(f) {
  try {
    return readFileSync(f, 'utf8').trim();
  } catch {
    return null;
  }
}

} // end CLI
