#!/usr/bin/env node
/**
 * Supply-chain gate — SCA with teeth, and a dependency-surface check.
 *
 * ## Why `npm audit` alone was not a gate
 *
 * The Beta checklist asks for SCA. What existed was a human running `npm audit` and writing the
 * number into a document — which is a measurement, not a gate. Three things were missing:
 *
 * 1. **Nothing failed.** A `high` appearing in a production dependency tomorrow would be recorded
 *    in the next document someone happened to write.
 * 2. **`npm audit` alone is the wrong denominator.** The full audit reports 9 high and 13 moderate;
 *    every one is in **dev** tooling that never reaches a customer. Gating on that total would be
 *    red permanently, and a gate that cannot pass gets bypassed and then ignored — the same
 *    reasoning behind the coverage ratchet. Gating on `--omit=dev` is the honest denominator, and
 *    the dev total is *reported* here so it cannot be quietly forgotten either.
 * 3. **Accepting a finding had no expiry.** "It's only a low" is a decision, and an undated
 *    decision becomes a permanent one. Allowlist entries need a reason and a date, and expire.
 *
 * ## The dependency-surface check
 *
 * The fourth check exists because of what it found: **four production dependencies that nothing
 * imported** — `openai`, `express`, `cors` and `dotenv`. Two were already recorded as debt; `cors`
 * and `dotenv` were not, and were found by this check.
 *
 * That is not tidiness. `openai` in `dependencies` is the single clearest reason a reader concludes
 * this application makes direct LLM calls — it does not; the AI features are Nuxeo Automation
 * operations — and every unused production dependency is audit surface, licence surface and
 * supply-chain surface for no benefit.
 *
 * The check needs an exception list because a package can be genuinely required and never appear in
 * an import: Angular's runtime needs `tslib` and `@angular/animations`, and seven packages exist
 * only to pin versions that `@alfresco/adf-core` requires as peers or dependencies. Every exception
 * carries a reason, and an exception that stops being needed fails the check as unnecessary — so
 * the list cannot rot into a place where things are hidden.
 *
 * Usage:
 *   node scripts/beta-harness/supply-chain.mjs
 *   node scripts/beta-harness/supply-chain.mjs --json
 *   node scripts/beta-harness/supply-chain.mjs --today 2027-01-01   # test allowlist expiry
 *
 * Exit 1 on a production high/critical, an unallowlisted or expired production finding, an
 * unreferenced production dependency, or an exception that is no longer needed.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const todayArg = argv[argv.indexOf('--today') + 1];
const today = argv.includes('--today') && todayArg ? todayArg : new Date().toISOString().slice(0, 10);

const allowlistPath = resolve(repoRoot, '.ai/state/supply-chain-allowlist.json');
const allowlist = existsSync(allowlistPath)
  ? JSON.parse(readFileSync(allowlistPath, 'utf8'))
  : { advisories: {}, unreferencedDependencies: {} };

/** Severities that fail outright in a production tree, allowlist or not. */
const BLOCKING = ['critical', 'high'];

const problems = [];
const notes = [];
const fail = (msg) => problems.push(msg);

/* ------------------------------------------------------------------ 1 & 2. SCA ---- */

/** @param {string[]} args */
function audit(args) {
  const res = spawnSync('npm', ['audit', '--json', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  // `npm audit` exits non-zero when it finds anything, so the exit code says nothing about
  // whether it worked. Parse failure is the real error, and it must not be read as "clean".
  try {
    return JSON.parse(res.stdout);
  } catch {
    return null;
  }
}

const prod = audit(['--omit=dev']);
const full = audit([]);

if (!prod) {
  fail(
    'npm audit --omit=dev produced no parseable JSON, so no scan happened. Refusing to report a ' +
      'pass on a measurement that did not run.',
  );
}

const prodCounts = prod?.metadata?.vulnerabilities ?? {};
const fullCounts = full?.metadata?.vulnerabilities ?? {};

/**
 * The GHSA identifiers an audit finding actually cites, read out of its advisory URLs, deduplicated.
 *
 * This exists because keying an acceptance by package name alone let a wrong one pass unnoticed. The
 * `quill` entry cited `GHSA-4943-9vgg-gr5r`, a 2021 advisory affecting `quill <= 1.3.7`, while the
 * installed version was 2.0.3 — so the advisory that actually applied had never been reviewed, and
 * this gate reported the acceptance as satisfied every run because the package name matched. Reading
 * the identifier is what turns "something about quill was once accepted" into "this advisory was".
 */
function ghsaIdsOf(v) {
  return [
    ...new Set(
      (v.via ?? [])
        .filter((x) => typeof x !== 'string' && typeof x?.url === 'string')
        .map((x) => /(GHSA-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4})/i.exec(x.url)?.[1])
        .filter(Boolean)
        .map((id) => id.toUpperCase()),
    ),
  ].sort();
}

/**
 * @type {{name: string, severity: string, title: string, url: string|null,
 *         ghsas: string[], range: string|null}[]}
 */
const prodFindings = [];
for (const [name, v] of Object.entries(prod?.vulnerabilities ?? {})) {
  const titles = (v.via ?? [])
    .map((x) => (typeof x === 'string' ? x : x.title))
    .filter(Boolean);
  prodFindings.push({
    name,
    severity: v.severity,
    title: titles[0] ?? 'no advisory title',
    url: (v.via ?? []).find((x) => typeof x !== 'string')?.url ?? null,
    ghsas: ghsaIdsOf(v),
    range: typeof v.range === 'string' ? v.range : null,
  });
}

// Check 1 — nothing high or critical ships.
const blocking = prodFindings.filter((f) => BLOCKING.includes(f.severity));
for (const f of blocking) {
  fail(
    `production dependency ${f.name} has a ${f.severity} advisory: ${f.title}. ` +
      'high and critical are not allowlistable — fix, upgrade, or remove the dependency.',
  );
}

// Check 2 — everything else needs a dated, unexpired justification.
const nonBlocking = prodFindings.filter((f) => !BLOCKING.includes(f.severity));
for (const f of nonBlocking) {
  const entry = allowlist.advisories?.[f.name];
  if (!entry) {
    fail(
      `production dependency ${f.name} has a ${f.severity} advisory (${f.title}) with no entry in ` +
        `${relative(allowlistPath)}. Add one with a reason and an expiry, or remove the dependency.`,
    );
    continue;
  }
  if (!entry.reason || !entry.expires) {
    fail(`allowlist entry for ${f.name} needs both "reason" and "expires" (YYYY-MM-DD).`);
    continue;
  }
  // The acceptance must name the advisory it accepts, and that identifier must be one the audit
  // reports. Without this the entry accepts a package rather than a finding, so a later, different
  // advisory against the same package inherits an approval nobody gave it.
  if (!entry.advisory) {
    fail(
      `allowlist entry for ${f.name} needs an "advisory" field naming the GHSA it accepts. ` +
        `The audit reports ${f.ghsas.length ? f.ghsas.join(', ') : 'no identifiable GHSA'}. ` +
        'Accepting a package name rather than an advisory is how a stale acceptance survives.',
    );
    continue;
  }
  if (!f.ghsas.length) {
    // Fail closed. If the identifier cannot be read there is nothing to compare, and treating that
    // as a pass would restore exactly the hole this check exists to close.
    fail(
      `the allowlist accepts ${entry.advisory} for ${f.name}, but no GHSA id could be read from the ` +
        'audit output, so the acceptance cannot be verified against the reported advisory.',
    );
    continue;
  }
  // Set EQUALITY, not membership. `includes` would pass while a second advisory sat unreviewed
  // beside the accepted one, which is the same package-level approval this check exists to remove —
  // just one advisory later. `advisory` therefore takes a list when a package genuinely has more
  // than one accepted finding, and every reported id must be named.
  const accepted = [
    ...new Set((Array.isArray(entry.advisory) ? entry.advisory : [entry.advisory]).map(String)),
  ]
    .map((id) => id.toUpperCase())
    .sort();
  const unaccepted = f.ghsas.filter((id) => !accepted.includes(id));
  const unreported = accepted.filter((id) => !f.ghsas.includes(id));
  if (unaccepted.length || unreported.length) {
    fail(
      `the allowlist accepts ${accepted.join(', ')} for ${f.name}, but the audit reports ` +
        `${f.ghsas.join(', ')}.` +
        (unaccepted.length ? ` Not accepted: ${unaccepted.join(', ')} — needs its own review.` : '') +
        (unreported.length ? ` Accepted but not reported: ${unreported.join(', ')}.` : '') +
        ' Every reported advisory must be named, or a new one inherits an approval nobody gave it.',
    );
    continue;
  }
  // Recording the affected range makes the acceptance specific to the version actually installed, so
  // an upgrade into a newly-affected range cannot pass under a review of the old one. Supplying
  // `affects` and finding no range to compare is a failure, not a pass: the audit shape changing is
  // exactly when an unverified acceptance is most dangerous.
  if (entry.affects && f.range === null) {
    fail(
      `the allowlist accepts ${f.name} for versions "${entry.affects}", but the audit reported no ` +
        'range to compare against, so the acceptance cannot be verified against what is installed.',
    );
    continue;
  }
  if (entry.affects && entry.affects !== f.range) {
    fail(
      `the allowlist accepts ${f.name} for versions "${entry.affects}", but the audit reports ` +
        `"${f.range}". Re-review against the installed version.`,
    );
    continue;
  }
  if (entry.expires < today) {
    fail(
      `the allowlist entry for ${f.name} expired on ${entry.expires} (today is ${today}). ` +
        'Re-review it: is the advisory still unreachable, and is the dependency still needed?',
    );
    continue;
  }
  notes.push(
    `${f.name} (${f.severity}) accepted until ${entry.expires}: ${entry.reason.slice(0, 120)}`,
  );
}

// Allowlist entries for advisories that no longer exist are stale reassurance — the same defect
// the coverage gate's orphan check exists for.
for (const name of Object.keys(allowlist.advisories ?? {})) {
  if (!prodFindings.some((f) => f.name === name)) {
    fail(
      `the allowlist accepts an advisory for ${name}, but the production audit no longer reports ` +
        'one. Remove the entry — a standing acceptance of a fixed problem reads as coverage it ' +
        'does not provide.',
    );
  }
}

// Check 3 — the dev total, reported and explicitly not gated.
notes.push(
  `dev-inclusive audit: ${fullCounts.critical ?? 0} critical, ${fullCounts.high ?? 0} high, ` +
    `${fullCounts.moderate ?? 0} moderate, ${fullCounts.low ?? 0} low — REPORTED, NOT GATED. ` +
    'These are build-time only and do not reach a customer. They are still worth reducing.',
);

/* ------------------------------------------------- 4. production dependency surface ---- */

const pkg = JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8'));
const prodDeps = Object.keys(pkg.dependencies ?? {});

/** Everything a bare specifier could plausibly appear in. */
function collectSource() {
  let text = '';
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (/^(node_modules|dist|coverage|\.nx|\.git)$/.test(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (/\.(ts|mjs|cjs|js|html|scss|css)$/.test(full)) text += readFileSync(full, 'utf8');
    }
  };
  for (const dir of ['apps', 'libs', 'tools', 'scripts']) {
    const abs = resolve(repoRoot, dir);
    if (existsSync(abs)) walk(abs);
  }
  // Build config can name a package without any source importing it — an asset glob or a style
  // entry point is a real reference.
  //
  // `package.json` is deliberately NOT included. The first version of this function read it, and
  // every dependency then matched its own declaration (`"tslib": "^2.8.1"` contains `"tslib"`), so
  // the check found nothing and every exception looked unnecessary. The file we are testing
  // against cannot also be evidence.
  const ngPath = resolve(repoRoot, 'angular.json');
  if (existsSync(ngPath)) text += readFileSync(ngPath, 'utf8');
  return text;
}

const source = collectSource();

/**
 * Is `dep` referenced as a real module specifier or build path?
 *
 * Matching any quoted occurrence of the name is not good enough, and the first version did exactly
 * that. It reported `tslib` as referenced because **this file's own doc comment** contains the
 * string `"tslib": "^2.8.1"` while explaining the previous bug. A check that a comment can satisfy
 * is not a check.
 *
 * So: import/export/require/@use/@import specifiers, dynamic `import()`, a bare side-effect
 * `import 'x';`, and `node_modules/x` for build config. The bare side-effect form is listed
 * explicitly because it has neither `from` nor parentheses, and omitting it is the same gap that
 * was found twice before — in the api-surface gate and in the guardrail we ship to customers.
 * @param {string} dep
 */
function referenced(dep) {
  const q = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const spec = `(?:${q})(?:/[^'"\`]*)?`;
  const patterns = [
    new RegExp(`\\bfrom\\s*['"\`]${spec}['"\`]`),
    new RegExp(`\\brequire\\s*\\(\\s*['"\`]${spec}['"\`]`),
    new RegExp(`\\bimport\\s*\\(\\s*['"\`]${spec}['"\`]`),
    // bare side-effect import, and SCSS `@use` / `@import`
    new RegExp(`\\b(?:import|@use|@import)\\s+['"\`]${spec}['"\`]`),
    // build config: asset globs and style entry points name a real path
    new RegExp(`node_modules/${spec}`),
  ];
  return patterns.some((p) => p.test(source));
}

const unreferenced = prodDeps.filter((d) => !referenced(d));
const exceptions = allowlist.unreferencedDependencies ?? {};

for (const dep of unreferenced) {
  const reason = exceptions[dep];
  if (!reason) {
    fail(
      `production dependency ${dep} is referenced nowhere in apps/, libs/, tools/, scripts/ or ` +
        'angular.json. If it is genuinely required at runtime or to pin a peer, add it to ' +
        `"unreferencedDependencies" in ${relative(allowlistPath)} with the reason. Otherwise ` +
        'remove it: unused production dependencies are audit, licence and supply-chain surface ' +
        'for no benefit.',
    );
  } else {
    notes.push(`${dep} unreferenced but required: ${reason.slice(0, 110)}`);
  }
}

// An exception for a dependency that is now referenced, or gone, is a rule protecting nothing.
for (const dep of Object.keys(exceptions)) {
  if (!prodDeps.includes(dep)) {
    fail(`"unreferencedDependencies" names ${dep}, which is not a production dependency. Remove it.`);
  } else if (referenced(dep)) {
    fail(
      `"unreferencedDependencies" excuses ${dep}, but it IS referenced in the source now. Remove ` +
        'the exception so the check applies to it again.',
    );
  }
}

/* ------------------------------------------------------------------------ report ---- */

function relative(p) {
  return p.startsWith(repoRoot) ? p.slice(repoRoot.length + 1) : p;
}

if (asJson) {
  console.log(
    JSON.stringify(
      {
        ok: problems.length === 0,
        today,
        production: prodCounts,
        devInclusive: fullCounts,
        productionFindings: prodFindings,
        productionDependencies: prodDeps.length,
        unreferenced,
        problems,
        notes,
      },
      null,
      2,
    ),
  );
  process.exit(problems.length ? 1 : 0);
}

console.log('\nSupply chain\n');
console.log(
  `  production audit    ${prodCounts.critical ?? 0} critical, ${prodCounts.high ?? 0} high, ` +
    `${prodCounts.moderate ?? 0} moderate, ${prodCounts.low ?? 0} low`,
);
console.log(
  `  dev-inclusive       ${fullCounts.critical ?? 0} critical, ${fullCounts.high ?? 0} high, ` +
    `${fullCounts.moderate ?? 0} moderate, ${fullCounts.low ?? 0} low   (reported, not gated)`,
);
console.log(`  production deps     ${prodDeps.length}, of which ${unreferenced.length} unreferenced`);
console.log(`  date                ${today}`);
for (const n of notes) console.log(`\n  - ${n}`);

if (problems.length) {
  console.error(`\nsupply-chain: FAIL — ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  - ${p}\n`);
  process.exit(1);
}
console.log('\nsupply-chain: pass — nothing high or critical ships, and every acceptance is dated.');
