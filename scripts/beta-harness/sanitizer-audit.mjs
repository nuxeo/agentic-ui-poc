#!/usr/bin/env node
/**
 * Sanitizer bypass audit — the durable half of the SonarCloud security remediation.
 *
 * `docs/sonarcloud-security-remediation-plan.md` section 5 asks for a gate whose job is *not*
 * to find the 34 issues (Sonar already did) but to make the reasoning in section 4 survive the
 * next agent who has not read it. Five checks:
 *
 *   1  Unregistered bypass          every `bypassSecurityTrust*` needs an allowlist entry
 *   2  Stale allowlist entry        an entry whose file or member no longer has a bypass
 *   3  Redundant bypass             a bypass on a locally-minted object URL, unrecorded
 *   4  `Safe*` in a NONE context    `source[src]` / `audio[src]` / `video[poster]`
 *   5  Unpaired trusted HTML        `bypassSecurityTrustHtml` with no sanitiser beside it
 *
 * Plus a **ratchet**: `budgets` in the allowlist caps how many category A and B entries may
 * exist. The counts may shrink and never grow, which is what makes PRs 3–5 of the plan
 * verifiable rather than self-reported.
 *
 * ## Why this parses TypeScript instead of grepping it
 *
 * The first cut of this script used regexes for "enclosing member" and emitted 100+ findings
 * naming things like `of`, `pipe`, `subscribe` and `if` as members. A gate nobody can read is a
 * gate that gets switched off, so it resolves types through the compiler API instead —
 * `typescript` is already a dependency, so this costs no install.
 *
 * Check 4 is the one that most needed it. Angular's DOM security schema puts `source[src]`,
 * `audio[src]` and `video[poster]` in `SecurityContext.NONE`, where **no sanitiser runs** and so
 * a `Safe*` value is never unwrapped — it is assigned to the DOM property and coerced by
 * `toString()`, writing the literal string `"SafeValue must use [property]=binding: …"` into
 * `src`. Deciding whether a binding is affected therefore means resolving the *type* the
 * expression carries, hopping through interfaces (`src.url` → `VideoSource.url`) and `@for` loop
 * variables. Pattern-matching the expression text cannot do that, and section 5.1 of the plan is
 * explicit that a template check which cannot see through an alias is worse than none because it
 * will be trusted wrongly.
 *
 * Usage:
 *   node scripts/beta-harness/sanitizer-audit.mjs
 *   node scripts/beta-harness/sanitizer-audit.mjs --print          # dump every bypass as JSON
 *   node scripts/beta-harness/sanitizer-audit.mjs --only 4         # run one check (for evidence)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

const ROOT = resolve(import.meta.dirname, '..', '..');
const ALLOWLIST_PATH = '.ai/state/sanitizer-allowlist.json';

/** The two helpers permitted to hold a bypass, once the plan's PRs 3 and 4 land. */
const APPROVED_HELPERS = new Map([
  ['libs/shared/security/src/lib/trust-object-url.ts', 'trustObjectUrl'],
  ['libs/shared/ui/src/lib/render-trusted-html.ts', 'renderTrustedHtml'],
]);

const BYPASS_RE = /^bypassSecurityTrust(Url|ResourceUrl|Html|Style|Script)$/;

/**
 * Angular's `SecurityContext.NONE` members, verified against
 * `@angular/compiler/fesm2022/compiler.mjs` (the DOM security schema). No sanitiser runs on
 * these, so a `Safe*` value bound here stringifies and silently breaks playback.
 */
const NONE_CONTEXT_BINDINGS = [
  { element: 'source', attr: 'src' },
  { element: 'audio', attr: 'src' },
  { element: 'video', attr: 'poster' },
];

const argv = process.argv.slice(2);
const printOnly = argv.includes('--print');
const only = argv.includes('--only') ? Number(argv[argv.indexOf('--only') + 1]) : null;

// ---------------------------------------------------------------------------------------------
// file discovery
// ---------------------------------------------------------------------------------------------

const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.nx', '.git', 'tmp', '.tmp']);

/** @returns {string[]} repo-relative paths */
function findFiles(dir, extensions) {
  const out = [];
  const abs = join(ROOT, dir);
  let entries;
  try {
    entries = readdirSync(abs);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const rel = join(dir, entry);
    let st;
    try {
      st = statSync(join(ROOT, rel));
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...findFiles(rel, extensions));
    } else if (extensions.some((e) => entry.endsWith(e)) && !entry.endsWith('.spec.ts')) {
      out.push(rel);
    }
  }
  return out;
}

function parse(relPath) {
  const text = readFileSync(join(ROOT, relPath), 'utf8');
  // setParentNodes = true — the enclosing-member walk depends on `.parent`.
  return { sf: ts.createSourceFile(relPath, text, ts.ScriptTarget.Latest, true), text };
}

function lineOf(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

function eachNode(node, visit) {
  visit(node);
  node.forEachChild((c) => eachNode(c, visit));
}

// ---------------------------------------------------------------------------------------------
// AST: enclosing member, bypasses, type shapes
// ---------------------------------------------------------------------------------------------

/**
 * The named declaration a node sits inside — a class member, a function, or a top-level
 * variable. This is the allowlist key, deliberately not a line number: line numbers churn on
 * every edit above them and would turn the allowlist into noise.
 */
function enclosingMemberName(node) {
  for (let n = node.parent; n; n = n.parent) {
    if (
      ts.isMethodDeclaration(n) ||
      ts.isPropertyDeclaration(n) ||
      ts.isGetAccessorDeclaration(n) ||
      ts.isSetAccessorDeclaration(n) ||
      ts.isFunctionDeclaration(n)
    ) {
      if (n.name && !ts.isComputedPropertyName(n.name)) return n.name.getText(n.getSourceFile());
    }
    if (ts.isConstructorDeclaration(n)) return 'constructor';
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
      // Only treat as the member if it is not itself nested in something named.
      const outer = enclosingMemberName(n);
      return outer === '<module>' ? n.name.text : outer;
    }
  }
  return '<module>';
}

/** @returns {{member: string, kind: string, line: number}[]} */
function collectBypasses(sf) {
  const found = [];
  eachNode(sf, (n) => {
    if (!ts.isCallExpression(n)) return;
    const callee = n.expression;
    if (!ts.isPropertyAccessExpression(callee)) return;
    const name = callee.name.text;
    if (!BYPASS_RE.test(name)) return;
    found.push({
      member: enclosingMemberName(n),
      kind: name.replace('bypassSecurityTrust', ''),
      line: lineOf(sf, n),
    });
  });
  return found;
}

/**
 * The text of the type a class member carries. Handles the three shapes this codebase uses:
 * an explicit annotation, and `signal<T>()` / `input<T>()` / `computed<T>()` type arguments.
 */
function memberTypeText(decl, sf) {
  if (decl.type) return decl.type.getText(sf);
  const init = decl.initializer;
  if (init && ts.isCallExpression(init)) {
    if (init.typeArguments?.length) return init.typeArguments.map((t) => t.getText(sf)).join(' | ');
    // `input.required<T>()` — the type args hang off the inner call.
    const inner = init.expression;
    if (ts.isPropertyAccessExpression(inner) && init.typeArguments?.length) {
      return init.typeArguments.map((t) => t.getText(sf)).join(' | ');
    }
  }
  return null;
}

/**
 * Interface and type-alias property types, plus class member types, for one file.
 * @returns {{interfaces: Map<string, Map<string,string>>, members: Map<string,string>}}
 */
function collectTypeShapes(sf) {
  const interfaces = new Map();
  const members = new Map();

  eachNode(sf, (n) => {
    if (ts.isInterfaceDeclaration(n) || (ts.isTypeAliasDeclaration(n) && ts.isTypeLiteralNode(n.type))) {
      const props = new Map();
      const holder = ts.isInterfaceDeclaration(n) ? n : n.type;
      for (const m of holder.members) {
        if (ts.isPropertySignature(m) && m.name && m.type) {
          props.set(m.name.getText(sf), m.type.getText(sf));
        }
      }
      interfaces.set(n.name.getText(sf), props);
    }
    if (ts.isPropertyDeclaration(n) && n.name && !ts.isComputedPropertyName(n.name)) {
      const t = memberTypeText(n, sf);
      if (t) members.set(n.name.getText(sf), t);
    }
    if (ts.isGetAccessorDeclaration(n) && n.name && n.type) {
      members.set(n.name.getText(sf), n.type.getText(sf));
    }
  });

  return { interfaces, members };
}

const mentionsSafe = (typeText) => /\bSafe(Url|ResourceUrl|Html|Style|Script|Value)\b/.test(typeText);
const elementTypeOf = (typeText) =>
  typeText.replace(/\s*\|\s*(null|undefined)/g, '').replace(/\[\]$/, '').replace(/^readonly\s+/, '').trim();

// ---------------------------------------------------------------------------------------------
// templates
// ---------------------------------------------------------------------------------------------

/**
 * Every template belonging to a component, whether it is an external `templateUrl` or an inline
 * `template:` string. `attachment-preview-dialog.ts` is inline and carries two of the five known
 * NONE-context defects, so scanning `.html` alone would miss them.
 * @returns {{template: string, offsetLine: number, tsFile: string, htmlFile: string|null}[]}
 */
function templatesFor(tsFile, sf, text) {
  const out = [];
  eachNode(sf, (n) => {
    if (!ts.isPropertyAssignment(n) || !n.name) return;

    // Only process template/templateUrl if it's inside a @Component decorator
    if (!isInComponentDecorator(n, sf)) return;

    const key = n.name.getText(sf);
    if (key === 'template') {
      const init = n.initializer;
      if (ts.isNoSubstitutionTemplateLiteral(init) || ts.isStringLiteral(init)) {
        out.push({
          template: init.text,
          offsetLine: lineOf(sf, init),
          tsFile,
          htmlFile: null,
        });
      }
    }
    if (key === 'templateUrl') {
      const init = n.initializer;
      if (ts.isStringLiteral(init)) {
        const dir = tsFile.split('/').slice(0, -1).join('/');
        const htmlFile = join(dir, init.text).replace(/\\/g, '/');
        try {
          out.push({
            template: readFileSync(join(ROOT, htmlFile), 'utf8'),
            offsetLine: 0,
            tsFile,
            htmlFile,
          });
        } catch {
          /* template missing is a compile error, not this gate's business */
        }
      }
    }
  });
  return out;
}

/**
 * Check if a node is inside a @Component decorator's argument object literal.
 * Walks up the parent chain to find if this property is within a decorator named "Component".
 */
function isInComponentDecorator(node, sf) {
  let current = node.parent;

  // Walk up to find the ObjectLiteralExpression that contains this property
  while (current && !ts.isObjectLiteralExpression(current)) {
    current = current.parent;
  }
  if (!current) return false;

  // Check if this object literal is the argument to a @Component decorator
  const objLiteral = current;
  if (!objLiteral.parent || !ts.isCallExpression(objLiteral.parent)) return false;

  const callExpr = objLiteral.parent;
  if (!callExpr.parent || !ts.isDecorator(callExpr.parent)) return false;

  const decorator = callExpr.parent;
  const decoratorExpr = decorator.expression;

  // Check if the decorator is named "Component"
  if (ts.isCallExpression(decoratorExpr)) {
    const decoratorName = decoratorExpr.expression.getText(sf);
    return decoratorName === 'Component';
  }

  return false;
}

/**
 * Resolve the type text a template expression carries.
 *
 * Handles the shapes that actually appear: `blobUrl()`, `data.blobUrl`, `src.url` where `src` is
 * a `@for` loop variable, and optional chaining. Returns null when it cannot tell — the caller
 * treats "cannot tell" as "do not flag", so this gate under-reports rather than crying wolf.
 */
function resolveExpressionType(expr, shapes, loopVars) {
  // Take the first operand of a `??` / `||` and drop a trailing `!`.
  const cleaned = expr.split(/\?\?|\|\|/)[0].trim().replace(/!$/, '');
  // Split `a()?.b.c` into ['a', 'b', 'c'].
  const path = cleaned
    .replace(/\(\s*\)/g, '')
    .replace(/\?\./g, '.')
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean);
  if (path.length === 0) return null;
  if (path.some((p) => /[^\w$]/.test(p))) return null; // calls with args, index access — out of scope

  let [root, ...rest] = path;

  // A `@for (src of videoSources(); …)` loop variable resolves to the element type.
  if (loopVars.has(root)) {
    const iterated = loopVars.get(root);
    const iteratedType = shapes.members.get(iterated);
    if (!iteratedType) return null;
    root = null;
    let current = elementTypeOf(iteratedType);
    for (const prop of rest) {
      const iface = shapes.interfaces.get(current);
      if (!iface || !iface.has(prop)) return null;
      current = elementTypeOf(iface.get(prop));
    }
    return current;
  }

  let current = shapes.members.get(root);
  if (!current) return null;
  for (const prop of rest) {
    const iface = shapes.interfaces.get(elementTypeOf(current));
    if (!iface || !iface.has(prop)) return null;
    current = iface.get(prop);
  }
  return current;
}

/** `@for (x of expr(); track …)` → Map<'x','expr'> */
function collectLoopVars(template) {
  const vars = new Map();
  const re = /@for\s*\(\s*(\w+)\s+of\s+([\w$]+)\s*\(\s*\)/g;
  let m;
  while ((m = re.exec(template)) !== null) vars.set(m[1], m[2]);
  return vars;
}

// ---------------------------------------------------------------------------------------------
// the checks
// ---------------------------------------------------------------------------------------------

function loadAllowlist() {
  const raw = JSON.parse(readFileSync(join(ROOT, ALLOWLIST_PATH), 'utf8'));
  const entries = new Map();
  for (const [file, list] of Object.entries(raw.sites ?? {})) {
    for (const e of list) entries.set(`${file}::${e.member}`, { ...e, file });
  }
  return { raw, entries };
}

function main() {
  const tsFiles = [...findFiles('apps', ['.ts']), ...findFiles('libs', ['.ts'])];
  const findings = [];
  const notes = [];

  // Parse every file once; checks share the result.
  const parsed = new Map();
  for (const f of tsFiles) {
    try {
      parsed.set(f, parse(f));
    } catch {
      /* unreadable file is not this gate's business */
    }
  }

  // ---- collect every bypass, with its true enclosing member -----------------------------------
  /** @type {{file:string,member:string,kind:string,line:number}[]} */
  const bypasses = [];
  for (const [file, { sf }] of parsed) {
    for (const b of collectBypasses(sf)) bypasses.push({ file, ...b });
  }

  if (printOnly) {
    console.log(JSON.stringify(bypasses, null, 2));
    return 0;
  }

  let allowlist;
  try {
    allowlist = loadAllowlist();
  } catch (err) {
    console.error(`sanitizer-audit: cannot read ${ALLOWLIST_PATH} — ${err.message}`);
    return 1;
  }
  const { raw, entries } = allowlist;
  const seen = new Set();

  const run = (n) => only === null || only === n;

  // ---- check 1: unregistered bypass -----------------------------------------------------------
  for (const b of bypasses) {
    const key = `${b.file}::${b.member}`;
    if (APPROVED_HELPERS.get(b.file) === b.member) {
      seen.add(key);
      continue;
    }
    if (entries.has(key)) {
      seen.add(key);
      continue;
    }
    if (run(1)) {
      findings.push(
        `[1] unregistered bypass  ${b.file}:${b.line}\n` +
          `    member '${b.member}' calls bypassSecurityTrust${b.kind} with no entry in ${ALLOWLIST_PATH}.\n` +
          `    Add one with a justification, or route it through trustObjectUrl / renderTrustedHtml.`,
      );
    }
  }

  // ---- check 2: stale allowlist entry ---------------------------------------------------------
  if (run(2)) {
    for (const [key, e] of entries) {
      if (seen.has(key)) continue;
      const exists = parsed.has(e.file);
      findings.push(
        `[2] stale allowlist entry  ${e.file}::${e.member}\n` +
          (exists
            ? `    The file no longer has a bypass in that member. Remove the entry.`
            : `    The file no longer exists. Remove the entry.`),
      );
    }
  }

  // ---- check 3: redundant bypass on a locally-minted object URL --------------------------------
  // Known category A and B debt is recorded in the allowlist and suppressed here; the budget
  // ratchet below is what forces it down. An *unrecorded* one is a regression.
  if (run(3)) {
    for (const [file, { sf }] of parsed) {
      eachNode(sf, (n) => {
        if (!ts.isCallExpression(n)) return;
        const callee = n.expression;
        if (!ts.isPropertyAccessExpression(callee)) return;
        if (!/^bypassSecurityTrust(Url|ResourceUrl)$/.test(callee.name.text)) return;
        const member = enclosingMemberName(n);
        const key = `${file}::${member}`;
        if (entries.has(key) || APPROVED_HELPERS.get(file) === member) return;
        // Does the same member mint an object URL?
        let mints = false;
        for (let p = n.parent; p; p = p.parent) {
          if (
            ts.isMethodDeclaration(p) ||
            ts.isPropertyDeclaration(p) ||
            ts.isFunctionDeclaration(p) ||
            ts.isConstructorDeclaration(p)
          ) {
            mints = /URL\.createObjectURL/.test(p.getText(sf));
            break;
          }
        }
        if (mints) {
          findings.push(
            `[3] redundant bypass  ${file}:${lineOf(sf, n)}\n` +
              `    member '${member}' bypasses sanitization on a URL it minted with URL.createObjectURL.\n` +
              `    Angular's URL sanitizer already accepts blob:, so a value bound only to img[src] needs no bypass.\n` +
              `    If it also feeds an iframe, use trustObjectUrl.`,
          );
        }
      });
    }
  }

  // ---- check 4: Safe* value in a SecurityContext.NONE binding ---------------------------------
  if (run(4)) {
    for (const [file, { sf, text }] of parsed) {
      const shapes = collectTypeShapes(sf);
      for (const tpl of templatesFor(file, sf, text)) {
        const loopVars = collectLoopVars(tpl.template);
        const lines = tpl.template.split('\n');
        for (const { element, attr } of NONE_CONTEXT_BINDINGS) {
          const re = new RegExp(`<${element}\\b[^>]*?\\[${attr}\\]\\s*=\\s*"([^"]+)"`, 'gs');
          let m;
          while ((m = re.exec(tpl.template)) !== null) {
            const expr = m[1].trim();
            const type = resolveExpressionType(expr, shapes, loopVars);
            if (!type || !mentionsSafe(type)) continue;
            const lineInTpl = tpl.template.slice(0, m.index).split('\n').length;
            const where = tpl.htmlFile
              ? `${tpl.htmlFile}:${lineInTpl}`
              : `${tpl.tsFile}:${tpl.offsetLine + lineInTpl - 1}`;
            findings.push(
              `[4] Safe* value in a NONE context  ${where}\n` +
                `    <${element} [${attr}]="${expr}"> resolves to '${type}'.\n` +
                `    ${element}[${attr}] is SecurityContext.NONE: no sanitiser runs, the Safe* value is never\n` +
                `    unwrapped, and toString() writes "SafeValue must use [property]=binding: …" into ${attr}.\n` +
                `    Bind the raw string here and keep the Safe* value for iframe[src].`,
            );
          }
        }
      }
    }
  }

  // ---- check 5: unpaired trusted HTML ---------------------------------------------------------
  if (run(5)) {
    for (const [file, { sf }] of parsed) {
      if (APPROVED_HELPERS.has(file)) continue;
      eachNode(sf, (n) => {
        if (!ts.isCallExpression(n)) return;
        const callee = n.expression;
        if (!ts.isPropertyAccessExpression(callee)) return;
        if (callee.name.text !== 'bypassSecurityTrustHtml') return;
        let host = null;
        for (let p = n.parent; p; p = p.parent) {
          if (
            ts.isMethodDeclaration(p) ||
            ts.isPropertyDeclaration(p) ||
            ts.isGetAccessorDeclaration(p) ||
            ts.isFunctionDeclaration(p)
          ) {
            host = p;
            break;
          }
        }
        const body = (host ?? sf).getText(sf);
        const paired =
          /DOMPurify\.sanitize\s*\(/.test(body) ||
          /\bescapeHtml\s*\(/.test(body) ||
          /\brenderTrustedHtml\s*\(/.test(body);
        if (!paired) {
          findings.push(
            `[5] unpaired trusted HTML  ${file}:${lineOf(sf, n)}\n` +
              `    member '${enclosingMemberName(n)}' trusts HTML with no DOMPurify.sanitize / escapeHtml beside it.\n` +
              `    Safety here is a pairing, not a property of either half. note:note is user-authored, so an\n` +
              `    unpaired render path is stored XSS.`,
          );
        }
      });
    }
  }

  // ---- the ratchet ----------------------------------------------------------------------------
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const [, e] of entries) if (counts[e.category] !== undefined) counts[e.category] += 1;
  notes.push(
    `registered bypasses: ${entries.size}  (A ${counts.A}, B ${counts.B}, C ${counts.C}, D ${counts.D})`,
  );
  for (const [cat, budget] of Object.entries(raw.budgets ?? {})) {
    if (counts[cat] > budget) {
      findings.push(
        `[ratchet] category ${cat} has ${counts[cat]} entries, budget is ${budget}.\n` +
          `    The budget may only decrease. Lower it in ${ALLOWLIST_PATH} as entries are removed.`,
      );
    } else if (counts[cat] < budget) {
      notes.push(
        `category ${cat} is under budget (${counts[cat]} < ${budget}) — lower the budget to ${counts[cat]} to lock the gain in.`,
      );
    }
  }

  // ---- report ---------------------------------------------------------------------------------
  for (const n of notes) console.log(`  ${n}`);
  if (only !== null) console.log(`  running check ${only} only — this run cannot speak for the others`);

  if (findings.length === 0) {
    console.log(`sanitizer-audit: PASS — ${bypasses.length} bypass call(s), all accounted for`);
    return 0;
  }
  console.log(`\nsanitizer-audit: FAIL — ${findings.length} finding(s)\n`);
  for (const f of findings) console.log(`${f}\n`);
  return 1;
}

process.exit(main());
