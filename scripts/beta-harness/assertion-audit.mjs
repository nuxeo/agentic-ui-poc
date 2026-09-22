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
const PAGE_ASSERTIONS = new Set(['expectVisible', 'expectText', 'expectNoConsoleErrors', 'expectNoA11yViolations']);

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
const guardedFailures = [];

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

  const parents = parentMap(ast);

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
    if (!verdict) return;

    // `if (!scene.criterion) check('scene names an acceptance criterion', false, …)` is the
    // deliberate report-this-as-failed idiom: the literal `false` is the verdict and the
    // enclosing `if` is the assertion. Reported as a constant, the idiom's only escape was to
    // stop making the claim, so it was recorded instead — and a gate nobody can satisfy is one
    // that gets suppressed. The guard is still listed below, because an exemption nobody has
    // to look at is how a real one hides.
    const guard = guardedBy(node, parents, src, literalBindings);
    if (verdict.kind === 'literal-false' && guard) {
      guardedFailures.push({ file: rel, line, label, guard });
      return;
    }

    constantAssertions += 1;
    findings.push({
      file: rel,
      line,
      kind: verdict.kind,
      severity: 'fail',
      message: `\`${name}("${label}")\` ${verdict.why}. It cannot fail, so it is not evidence.`,
    });
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
 * The condition a `check(_, false)` exists to report, or `null` if there is not one.
 *
 * Narrow on purpose, in two directions, because the first cut of this was not and both
 * failures showed up the moment it was tested against a deliberate violation.
 *
 * It climbs only through wrappers that add nothing — `await`, an expression statement, a
 * `return`, and a block whose *sole* statement is the one it came from — and stops at the
 * first conditional. So `if (!scene.criterion) check(n, false)` qualifies, while a
 * `check(n, false)` buried among twenty other statements inside some outer `if` does not: the
 * enclosing block is doing plenty besides reporting, so the `if` is not this call's guard.
 * Climbing the whole ancestor chain made every statement inside a top-level `if (declarative)`
 * exempt, which is the rule relaxed until it passes.
 *
 * The guard's own test must also not be a constant, or `if (true) check(n, false)` would
 * launder precisely what `literal-false` exists to catch.
 *
 * @param {object} node
 * @param {Map<object, object>} parents
 * @param {string} src
 * @param {Map<string, unknown>} bindings
 * @returns {string | null} the guard's source text, for the report
 */
function guardedBy(node, parents, src, bindings) {
  let child = node;
  let parent = parents.get(child);
  while (parent) {
    if (parent.type === 'IfStatement' || parent.type === 'ConditionalExpression') {
      if (child !== parent.consequent && child !== parent.alternate) return null;
      return classify(parent.test, src, bindings) ? null : text(src, parent.test);
    }
    if (parent.type === 'LogicalExpression') {
      if (child !== parent.right) return null;
      return classify(parent.left, src, bindings) ? null : text(src, parent.left);
    }
    if (!isTransparentWrapper(parent, child)) return null;
    child = parent;
    parent = parents.get(child);
  }
  return null;
}

/** A node that neither guards nor accompanies its child — see `guardedBy`. */
function isTransparentWrapper(parent, child) {
  if (parent.type === 'AwaitExpression') return parent.argument === child;
  if (parent.type === 'ExpressionStatement') return parent.expression === child;
  if (parent.type === 'ReturnStatement') return parent.argument === child;
  if (parent.type === 'BlockStatement') return parent.body.length === 1 && parent.body[0] === child;
  return false;
}

/**
 * Child node -> its nearest node ancestor, so a finding can be read in the context that
 * reaches it. Arrays are traversed through rather than recorded, so an element's parent is
 * the node holding the array.
 *
 * @param {object} ast
 * @returns {Map<object, object>}
 */
function parentMap(ast) {
  const parents = new Map();
  const descend = (node, parent) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const n of node) descend(n, parent);
      return;
    }
    if (typeof node.type === 'string') {
      if (parent) parents.set(node, parent);
      parent = node;
    }
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'range') continue;
      descend(node[key], parent);
    }
  };
  descend(ast, null);
  return parents;
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
          guardedFailures,
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

  if (guardedFailures.length) {
    console.log(
      '\n  Guarded failure reports — a literal `false` reached only when its guard holds,\n' +
        '  so the guard is the assertion. Listed because the exemption is real:',
    );
    for (const g of guardedFailures) {
      console.log(`    ${g.file}:${g.line}  "${g.label}"`);
      console.log(`      reached only when: ${g.guard.replace(/\s+/g, ' ').slice(0, 90)}`);
    }
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
  const dirs = [resolve(repoRoot, 'scripts/beta-harness/steps'), resolve(repoRoot, 'scripts/collect-evidence')];
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
