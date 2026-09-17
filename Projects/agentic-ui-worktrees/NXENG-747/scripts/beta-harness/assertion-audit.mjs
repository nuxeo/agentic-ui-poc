#!/usr/bin/env node
/**
 * Static audit of evidence assertions.
 *
 * This is the mechanical half of independent validation. It exists because the
 * most expensive failure in this programme was not a broken gate — it was gates
 * that were green while the thing they guarded was broken:
 *
 *   - a check that compared `"main.js"` to `"main.js"` and "would have passed after
 *     a full rebuild with entirely different bytes";
 *   - a check the Phase 1 review called "tautological… It could not fail — and
 *     notably it did not catch defect 1, which is precisely the failure it appeared
 *     to guard";
 *   - `h.check('authenticated surfaces are NOT covered', true, …)`, which inflated
 *     a total while certifying nothing.
 *
 * All three are detectable without running anything. A check whose condition is a
 * constant, or whose two sides are the same expression, cannot fail — so it is not
 * evidence, and counting it as evidence is what let a dead feature reach sign-off.
 *
 * What this CANNOT do: judge whether a falsifiable assertion asserts the *right*
 * thing. `expectVisible('app shell')` can fail, so it passes this audit, and it
 * still only proves the app booted. That judgement is a reviewer's job — see
 * `AGENTS/12-review-agents.md`. This tool removes the mechanical excuses.
 *
 * Usage:
 *   node scripts/beta-harness/assertion-audit.mjs [--json] [paths...]
 *
 * Defaults to auditing `scripts/beta-harness/steps/` and
 * `scripts/collect-evidence/steps/` if they exist.
 *
 * Exit 1 if any assertion cannot fail. Warnings alone do not fail the audit.
 */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { relative, resolve, extname } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..', '..');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const explicit = argv.filter((a) => !a.startsWith('--'));

let parse;
try {
  ({ parse } = await import('acorn'));
} catch {
  console.error(
    'assertion-audit: acorn is unavailable, so assertions cannot be parsed.\n' +
      'It ships with eslint, so this normally means node_modules is incomplete. Run `npm ci`.\n' +
      'Refusing to report a pass on an audit that did not run.',
  );
  process.exit(1);
}

/** Assertion helpers whose second argument is the condition under test. */
const CONDITION_AT_1 = new Set(['check', 'requirePrecondition']);
/** Helpers that assert against the live page — always falsifiable by construction. */
const PAGE_ASSERTIONS = new Set(['expectVisible', 'expectText', 'expectNoConsoleErrors']);

const files = explicit.length ? explicit.map((p) => resolve(process.cwd(), p)) : await defaultTargets();

if (files.length === 0) {
  console.error('assertion-audit: no steps files found. An audit that inspects nothing is not a pass.');
  process.exit(1);
}

/** @type {{ file: string, line: number, kind: string, severity: 'fail'|'warn', message: string }[]} */
const findings = [];
let totalAssertions = 0;
let constantAssertions = 0;
const allowlists = [];

for (const file of files) {
  const src = await readFile(file, 'utf8');
  const inRepo = relative(repoRoot, file);
  const rel = inRepo.startsWith('..') ? file : inRepo;
  let ast;
  try {
    ast = parse(src, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  } catch (err) {
    findings.push({
      file: rel,
      line: 0,
      kind: 'unparseable',
      severity: 'fail',
      message: `could not be parsed, so its assertions are unverified: ${err instanceof Error ? err.message : err}`,
    });
    continue;
  }
  auditFile(rel, src, ast);
}

report();

const failures = findings.filter((f) => f.severity === 'fail');
process.exit(failures.length ? 1 : 0);

/**
 * @param {string} rel
 * @param {string} src
 * @param {object} ast
 */
function auditFile(rel, src, ast) {
  // Identifiers bound to a literal in this file, so `const ok = true; check(n, ok)`
  // is caught as well as the direct form.
  /** @type {Map<string, unknown>} */
  const literalBindings = new Map();
  /** Array literals, so a shared `ENVIRONMENTAL_ERRORS` const resolves to its patterns. */
  const arrayBindings = new Map();
  walk(ast, (node) => {
    if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier') return;
    if (node.init?.type === 'Literal') literalBindings.set(node.id.name, node.init.value);
    if (node.init?.type === 'ArrayExpression') {
      arrayBindings.set(
        node.id.name,
        node.init.elements.map((e) => text(src, e)),
      );
    }
  });

  /** Steps, so a step that photographs without asserting can be spotted. */
  const steps = [];
  let current = null;

  walk(ast, (node) => {
    if (node.type !== 'CallExpression') return;
    const name = calleeName(node);
    if (!name) return;
    const line = node.loc?.start.line ?? 0;

    if (name === 'step') {
      current = { line, label: literalText(node.arguments[0]) ?? '(computed)', assertions: 0, shots: 0 };
      steps.push(current);
      return;
    }
    if (name === 'screenshot') {
      if (current) current.shots += 1;
      return;
    }
    if (name === 'note') return; // deliberately not an assertion

    if (PAGE_ASSERTIONS.has(name)) {
      totalAssertions += 1;
      if (current) current.assertions += 1;
      if (name === 'expectNoConsoleErrors') collectAllowlist(rel, src, node, line, arrayBindings);
      return;
    }

    if (!CONDITION_AT_1.has(name)) return;

    totalAssertions += 1;
    if (current) current.assertions += 1;

    const condition = node.arguments[1];
    const label = literalText(node.arguments[0]) ?? '(computed name)';
    if (!condition) {
      findings.push({
        file: rel,
        line,
        kind: 'no-condition',
        severity: 'fail',
        message: `\`${name}("${label}")\` has no condition, so it always passes.`,
      });
      constantAssertions += 1;
      return;
    }

    const verdict = classify(condition, src, literalBindings);
    if (verdict) {
      constantAssertions += 1;
      findings.push({
        file: rel,
        line,
        kind: verdict.kind,
        severity: 'fail',
        message: `\`${name}("${label}")\` ${verdict.why}. It cannot fail, so it is not evidence.`,
      });
    }
  });

  for (const s of steps) {
    if (s.shots > 0 && s.assertions === 0) {
      findings.push({
        file: rel,
        line: s.line,
        kind: 'screenshot-without-assertion',
        severity: 'warn',
        message: `step "${s.label}" captures ${s.shots} screenshot(s) and asserts nothing. A photograph is not a claim.`,
      });
    }
  }
}

/**
 * Decide whether a condition expression is incapable of being false.
 *
 * @param {object} node
 * @param {string} src
 * @param {Map<string, unknown>} bindings
 * @returns {{ kind: string, why: string } | null}
 */
function classify(node, src, bindings) {
  if (node.type === 'Literal') {
    return node.value
      ? { kind: 'literal-true', why: `asserts the literal \`${JSON.stringify(node.value)}\`` }
      : { kind: 'literal-false', why: 'asserts a literal falsy value, so it always fails' };
  }

  // `!0`, `!!true`, `!''`
  if (node.type === 'UnaryExpression' && node.operator === '!') {
    const inner = classify(node.argument, src, bindings);
    if (inner) return { kind: 'negated-constant', why: `negates a constant (\`${text(src, node)}\`)` };
  }

  if (node.type === 'Identifier' && bindings.has(node.name)) {
    const v = bindings.get(node.name);
    return v
      ? { kind: 'constant-binding', why: `asserts \`${node.name}\`, bound to the literal \`${JSON.stringify(v)}\`` }
      : { kind: 'constant-binding', why: `asserts \`${node.name}\`, bound to a falsy literal` };
  }

  // `Boolean(true)`, `Boolean(1)`
  if (node.type === 'CallExpression' && calleeName(node) === 'Boolean' && node.arguments.length === 1) {
    const inner = classify(node.arguments[0], src, bindings);
    if (inner) return { kind: 'boolean-of-constant', why: `wraps a constant (\`${text(src, node)}\`)` };
  }

  // The `"main.js" === "main.js"` shape: both sides are the same source text.
  if (node.type === 'BinaryExpression' && ['===', '==', '>=', '<='].includes(node.operator)) {
    const l = text(src, node.left);
    const r = text(src, node.right);
    if (normalise(l) === normalise(r)) {
      return { kind: 'self-comparison', why: `compares \`${l}\` to itself` };
    }
    // Two different literals compared — constant either way.
    if (node.left.type === 'Literal' && node.right.type === 'Literal') {
      return { kind: 'constant-comparison', why: `compares two literals (\`${l}\` ${node.operator} \`${r}\`)` };
    }
  }

  // `x.includes(x)`, `a.startsWith(a)`
  if (
    node.type === 'CallExpression' &&
    node.callee?.type === 'MemberExpression' &&
    ['includes', 'startsWith', 'endsWith'].includes(node.callee.property?.name) &&
    node.arguments.length === 1
  ) {
    const recv = text(src, node.callee.object);
    const arg = text(src, node.arguments[0]);
    if (normalise(recv) === normalise(arg)) {
      return { kind: 'self-comparison', why: `checks whether \`${recv}\` contains itself` };
    }
  }

  return null;
}

/**
 * Record every console-error suppression so they are visible in one place.
 * Not a failure — some are legitimately environmental — but a suppression that
 * nobody has to look at is how a real regression stays invisible.
 *
 * @param {string} rel
 * @param {string} src
 * @param {object} node
 * @param {number} line
 * @param {Map<string, string[]>} arrayBindings
 */
function collectAllowlist(rel, src, node, line, arrayBindings) {
  const arg = node.arguments[1];
  if (!arg) return;
  let patterns;
  if (arg.type === 'ArrayExpression') {
    patterns = arg.elements.map((e) => text(src, e));
  } else if (arg.type === 'Identifier' && arrayBindings.has(arg.name)) {
    // The real cases all hoist the list into a module-level const, and printing
    // the const's *name* would defeat the point of listing suppressions.
    patterns = arrayBindings.get(arg.name).map((p) => `${p}   (via ${arg.name})`);
  } else {
    patterns = [`${text(src, arg)}   (indirect — resolve by hand)`];
  }
  allowlists.push({ file: rel, line, patterns });
}

function report() {
  const fails = findings.filter((f) => f.severity === 'fail');
  const warns = findings.filter((f) => f.severity === 'warn');

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          ok: fails.length === 0,
          filesAudited: files.length,
          totalAssertions,
          constantAssertions,
          findings,
          consoleErrorAllowlists: allowlists,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`\nAssertion audit — ${files.length} steps file(s), ${totalAssertions} assertion(s)\n`);

  for (const f of fails) {
    console.log(`  [FAIL] ${f.file}:${f.line}  (${f.kind})`);
    console.log(`         ${f.message}`);
  }
  for (const f of warns) {
    console.log(`  [warn] ${f.file}:${f.line}  (${f.kind})`);
    console.log(`         ${f.message}`);
  }

  if (allowlists.length) {
    console.log('\n  Console-error suppressions in force — each one is a blind spot:');
    for (const a of allowlists) {
      console.log(`    ${a.file}:${a.line}`);
      for (const p of a.patterns) console.log(`      - ${p}`);
    }
  }

  console.log('');
  if (fails.length) {
    console.log(
      `assertion-audit: FAIL — ${fails.length} assertion(s) cannot fail. ` +
        `They inflate a check total while proving nothing; use h.note() for a stated limitation.`,
    );
  } else {
    console.log(
      `assertion-audit: pass — every assertion is capable of failing` +
        `${warns.length ? `, with ${warns.length} warning(s)` : ''}.`,
    );
    console.log(
      '  This says nothing about whether they assert the RIGHT thing. A falsifiable\n' +
        '  check on the app shell still only proves the app booted.',
    );
  }
}

/* ---------- helpers ---------- */

/** @returns {Promise<string[]>} */
async function defaultTargets() {
  const dirs = [resolve(repoRoot, 'scripts/beta-harness/steps'), resolve(repoRoot, 'scripts/collect-evidence/steps')];
  const out = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of await readdir(dir)) {
      if (extname(f) === '.mjs' || extname(f) === '.js') out.push(resolve(dir, f));
    }
  }
  return out.sort();
}

/**
 * Generic AST walk. Hand-rolled rather than pulling in acorn-walk, which is not a
 * dependency of anything here.
 * @param {unknown} node
 * @param {(n: any) => void} visit
 */
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const n of node) walk(n, visit);
    return;
  }
  if (typeof node.type === 'string') visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'range') continue;
    walk(node[key], visit);
  }
}

/** `h.check(...)` / `check(...)` / `this.check(...)` -> "check" */
function calleeName(call) {
  const c = call.callee;
  if (!c) return null;
  if (c.type === 'Identifier') return c.name;
  if (c.type === 'MemberExpression' && c.property?.type === 'Identifier') return c.property.name;
  return null;
}

function literalText(node) {
  if (!node) return null;
  if (node.type === 'Literal') return String(node.value);
  if (node.type === 'TemplateLiteral' && node.quasis.length === 1) return node.quasis[0].value.cooked;
  return null;
}

function text(src, node) {
  return node ? src.slice(node.start, node.end) : '';
}

function normalise(s) {
  return s.replace(/\s+/g, '').replace(/^['"`]|['"`]$/g, '');
}
