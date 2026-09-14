#!/usr/bin/env node
/**
 * Plan a batch of bug fixes: check the preconditions once, then say how many can run at once.
 *
 *   node .cursor/skills/batch-bug-fixes/scripts/plan-batch.mjs NXSAT-1 NXSAT-2 …
 *   node .cursor/skills/batch-bug-fixes/scripts/plan-batch.mjs --file tickets.txt [--json]
 *   node .cursor/skills/batch-bug-fixes/scripts/plan-batch.mjs … --concurrency 6
 *
 * Exists to fail before the work starts rather than during it. A batch of a dozen tickets
 * spends ten minutes per workspace on setup, so a missing prerequisite discovered by the
 * eleventh agent has already cost most of an hour and left eleven worktrees to unpick. Every
 * check here is one that has actually broken a run.
 *
 * Exit codes: 0 plan is safe · 1 a blocking precondition failed · 2 bad usage.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { cpus, totalmem, freemem, homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const WORKTREE_ROOT =
  process.env.AGENTIC_UI_WORKTREE_ROOT ??
  resolve(homedir(), 'Desktop/Projects/agentic-ui-worktrees');
const SHARED_NUXEO = process.env.AGENTIC_UI_SHARED_NUXEO ?? 'nuxeo';
const GB = 1024 ** 3;

/**
 * Memory budget for one ticket in flight.
 *
 * This is an **assumption, not a measurement**, and it is labelled as one in the output. A
 * ticket in flight holds an Angular dev server, a Chromium for the evidence capture and a Node
 * process, and `nx serve` on this workspace is the large one. Four gigabytes is deliberately
 * conservative: being wrong low costs a slower batch, being wrong high costs a machine that
 * swaps, and a swapping machine fails the runs that are already mid-fix.
 *
 * Override with --per-ticket-gb once you have measured it on your own hardware.
 */
const DEFAULT_PER_TICKET_GB = 4;

/** Leave the OS, Docker, Nuxeo and the editor room to work. */
const RESERVED_GB = 12;

/** More than this in parallel stops being throughput and starts being a queue with overhead. */
const HARD_CAP = 8;

const argv = process.argv.slice(2);
const flag = (name, dflt = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? dflt : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

const fileArg = flag('file');
const TICKET_RE = /^[A-Z][A-Z0-9]+-\d+$/;

/** Flags that consume the token after them, so it is never mistaken for a ticket. */
const VALUE_FLAGS = new Set(['--file', '--concurrency', '--per-ticket-gb']);

/**
 * Reject a malformed ticket; never skip it.
 *
 * This used to `filter` on the pattern, so `plan-batch.mjs NXSAT-1 NXSAT-typo` printed a
 * successful one-ticket plan. The typo'd ticket was never planned, never assigned to a wave and
 * never mentioned — for a tool whose whole purpose is "fix these twelve", silently planning
 * eleven is the worst available behaviour, because the operator's next question is answered
 * ("the batch ran clean") and the missing ticket surfaces days later.
 */
const rejected = [];
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  const token = argv[i];
  if (token.startsWith('--')) {
    if (VALUE_FLAGS.has(token)) i += 1;
    continue;
  }
  if (TICKET_RE.test(token)) positional.push(token);
  else rejected.push(`argument: ${token}`);
}

const fromFile = [];
if (fileArg) {
  readFileSync(fileArg, 'utf8')
    .split('\n')
    .forEach((raw, n) => {
      const line = raw.trim();
      if (!line || line.startsWith('#')) return; // blank and commented lines are intentional
      if (TICKET_RE.test(line)) fromFile.push(line);
      else rejected.push(`${fileArg}:${n + 1}: ${line}`);
    });
}

if (rejected.length) {
  console.error(`\nNot a ticket id (expected e.g. NXSAT-1234) — nothing was planned:\n`);
  for (const r of rejected) console.error(`  ${r}`);
  console.error('');
  process.exit(2);
}

const tickets = [...positional, ...fromFile];

if (!tickets.length) {
  console.error(
    'Usage: plan-batch.mjs <TICKET-1> <TICKET-2> … | --file <list.txt> [--concurrency N] [--per-ticket-gb N] [--json]',
  );
  process.exit(2);
}

const duplicates = tickets.filter((t, i) => tickets.indexOf(t) !== i);
if (duplicates.length) {
  // Two agents on one ticket would share a worktree, a branch and a port, which is the exact
  // collision this whole design exists to avoid — and the second would inherit the first's
  // half-finished state rather than fail cleanly.
  console.error(`\nDuplicate ticket(s) in the batch: ${[...new Set(duplicates)].join(', ')}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------- preconditions

const blocking = [];
const warnings = [];

function sh(cmd, args, opts = {}) {
  try {
    return execFileSync(cmd, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      ...opts,
    }).trim();
  } catch {
    return null;
  }
}

// Node must match .nvmrc. On Node 22+ a built-in localStorage shadows jsdom's and the unit
// tests fail in a way that looks like the fix broke them.
const wanted = readFileSync(resolve(REPO, '.nvmrc'), 'utf8').trim();
const running = process.version.replace(/^v/, '').split('.')[0];
if (running !== wanted.split('.')[0]) {
  blocking.push(`Node ${running} is running but .nvmrc pins ${wanted}. Run \`nvm use\`.`);
}

// Playwright lives in the primary checkout only. Worktrees hardlink node_modules, and the one
// thing you must never do in a hardlinked tree is `npm install` — so a missing Playwright
// cannot be repaired from inside a workspace once the batch is running.
if (!existsSync(resolve(REPO, 'node_modules/@playwright/test'))) {
  blocking.push(
    'Playwright is missing from the primary checkout. Install it there first:\n' +
      '      npm install --no-save @playwright/test @axe-core/playwright && npx playwright install chromium',
  );
}

// The lockfile decides whether workspaces hardlink node_modules in seconds or run `npm ci` for
// minutes each. Twelve tickets is the difference between under a minute and most of an hour.
const lockDirty = sh('git', ['-C', REPO, 'status', '--porcelain', 'package-lock.json']);
if (lockDirty) {
  warnings.push(
    'package-lock.json is modified in the primary checkout, so worktrees cannot hardlink\n' +
      `      node_modules and will each run \`npm ci\` (~1 GB, minutes). For ${tickets.length} tickets that is the\n` +
      '      dominant cost of the batch. Commit or stash it first.',
  );
}

// Workspaces branch off origin/main. A stale remote ref silently bases the whole batch on
// yesterday's tree, and every PR then carries unrelated drift.
const fetchHead = resolve(REPO, '.git/FETCH_HEAD');
if (existsSync(fetchHead)) {
  const ageMin = (Date.now() - statSync(fetchHead).mtimeMs) / 60000;
  if (ageMin > 60)
    warnings.push(
      `origin was last fetched ${Math.round(ageMin)} min ago. Run \`git fetch origin\` so the batch branches off current main.`,
    );
} else {
  warnings.push('No FETCH_HEAD — run `git fetch origin` before branching a batch off origin/main.');
}

// Credentials are environment-only here, and the workspace script refuses without them. Better
// to say so once than twelve times.
if (!process.env.NUXEO_USER || !process.env.NUXEO_PASS) {
  blocking.push(
    'NUXEO_USER and NUXEO_PASS must be exported (no defaults) before creating workspaces.',
  );
}

// Shared Nuxeo is the default isolation model: one container, a data root per ticket. If it is
// not up, every workspace creation fails at the same point.
const nuxeoUp = sh('docker', ['ps', '-q', '-f', `name=^${SHARED_NUXEO}$`]);
if (!nuxeoUp) {
  blocking.push(
    `The shared Nuxeo container '${SHARED_NUXEO}' is not running. Start it, or plan a smaller batch with --nuxeo own per ticket.`,
  );
}

if (!sh('gh', ['auth', 'status'])) {
  blocking.push('`gh` is not authenticated — the batch cannot open pull requests.');
}

// ---------------------------------------------------------------- capacity

const perTicketGb = Number(flag('per-ticket-gb', DEFAULT_PER_TICKET_GB));
if (!Number.isFinite(perTicketGb) || perTicketGb <= 0) {
  console.error('--per-ticket-gb must be a positive number');
  process.exit(2);
}

const totalGb = totalmem() / GB;
const freeGb = freemem() / GB;
const byRam = Math.floor(Math.max(totalGb - RESERVED_GB, 0) / perTicketGb);

// Two cores per ticket: a dev server rebuilding and a browser rendering will both want CPU,
// and oversubscribing turns a gate run into a timeout that looks like a flaky test.
const byCpu = Math.floor(cpus().length / 2);

const requested = flag('concurrency');
const auto = Math.max(1, Math.min(byRam, byCpu, HARD_CAP, tickets.length));
const concurrency = requested ? Math.max(1, Number(requested)) : auto;

if (requested && Number(requested) > auto) {
  warnings.push(
    `--concurrency ${requested} is above the ${auto} this machine plans for (${byRam} by RAM, ${byCpu} by CPU, cap ${HARD_CAP}). Expect swapping.`,
  );
}

// Capacity is derived from *total* memory, not free, because macOS counts compressed and
// cached pages as used and so under-reports what is available — gating on it would refuse
// every batch on a machine that has been up for a day. Free memory is still worth a warning
// when it is far below what the wave wants, since that means something else is already
// holding the RAM and the batch will be fighting it rather than the estimate being wrong.
if (freeGb < (concurrency * perTicketGb) / 4) {
  warnings.push(
    `Only ${Math.round(freeGb)} GB is reported free and a wave of ${concurrency} assumes ${concurrency * perTicketGb} GB.\n` +
      '      macOS under-reports this, so it is not a blocker, but close other work if the batch crawls.',
  );
}

// Enough ports for one wave, counting both live listeners and reservations held by other
// worktrees — the same two things the workspace script's allocator counts.
const reserved = new Set();
const portDir = resolve(WORKTREE_ROOT, '.ports');
if (existsSync(portDir)) {
  for (const entry of readdirSync(portDir)) {
    const owner = readFileSync(resolve(portDir, entry), 'utf8').trim();
    if (owner && existsSync(owner)) reserved.add(Number(entry));
  }
}

const listens = (port) =>
  new Promise((done) => {
    const s = createServer();
    s.once('error', () => done(true));
    s.once('listening', () => s.close(() => done(false)));
    s.listen(port, '127.0.0.1');
  });

let free = 0;
for (let p = 4210; p < 4210 + 200 && free < concurrency; p += 1) {
  if (reserved.has(p)) continue;
  if (!(await listens(p))) free += 1;
}
if (free < concurrency) {
  blocking.push(
    `Only ${free} free dev-server port(s) in 4210-4409 but a wave needs ${concurrency}. Tear down stale workspaces with \`--remove\`.`,
  );
}

const waves = [];
for (let i = 0; i < tickets.length; i += concurrency) waves.push(tickets.slice(i, i + concurrency));

// ---------------------------------------------------------------- report

const plan = {
  tickets,
  concurrency,
  waves,
  capacity: {
    totalGb: Math.round(totalGb),
    freeGb: Math.round(freeGb),
    perTicketGb,
    byRam,
    byCpu,
    hardCap: HARD_CAP,
    cpus: cpus().length,
  },
  reservedPorts: [...reserved].sort((a, b) => a - b),
  warnings,
  blocking,
};

if (has('json')) {
  console.log(JSON.stringify(plan, null, 2));
} else {
  console.log(`\nBatch plan — ${tickets.length} ticket(s)\n`);
  console.log(
    `  machine      ${cpus().length} cpu, ${Math.round(totalGb)} GB total (${Math.round(freeGb)} GB reported free; indicative only on macOS)`,
  );
  console.log(
    `  per ticket   ${perTicketGb} GB assumed (dev server + Chromium + node) — an estimate, not a measurement`,
  );
  console.log(
    `  concurrency  ${concurrency}${requested ? ' (requested)' : ` (auto: ${byRam} by RAM, ${byCpu} by CPU, cap ${HARD_CAP})`}`,
  );
  console.log(`  waves        ${waves.length}\n`);
  waves.forEach((w, i) => console.log(`    wave ${i + 1}  ${w.join('  ')}`));
  if (warnings.length) {
    console.log('\n  warnings');
    for (const w of warnings) console.log(`    - ${w}`);
  }
  if (blocking.length) {
    console.log('\n  BLOCKING');
    for (const b of blocking) console.log(`    - ${b}`);
  }
  console.log(
    blocking.length
      ? '\nplan-batch: FAIL — fix the blocking items above before launching anything.\n'
      : `\nplan-batch: pass — create the ${waves[0].length} wave-1 workspaces serially, then launch one subagent each.\n`,
  );
}

process.exit(blocking.length ? 1 : 0);
