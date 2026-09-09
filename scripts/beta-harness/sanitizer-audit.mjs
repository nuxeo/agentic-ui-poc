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
 * gate that gets switched off, so it walks the TypeScript **AST** via `ts.createSourceFile`
 * instead — `typescript` is already a dependency, so this costs no install.
 *
 * Check 4 is the one that most needed it. Angular's DOM security schema puts `source[src]`,
 * `audio[src]` and `video[poster]` in `SecurityContext.NONE`, where **no sanitiser runs** and so
 * a `Safe*` value is never unwrapped — it is assigned to the DOM property and coerced by
 * `toString()`, writing the literal string `"SafeValue must use [property]=binding: …"` into
 * `src`. Deciding whether a binding is affected therefore means following the *type* the
 * expression carries, hopping through interfaces (`src.url` → `VideoSource.url`) and `@for` loop
 * variables. Pattern-matching the expression text cannot do that.
 *
 * ## What this is NOT, and what makes that safe
 *
 * There is **no `ts.Program` and no `TypeChecker` here.** Type resolution is syntactic: annotation
 * text, plus declarations gathered from every parsed file, plus alias expansion. An earlier version
 * of this comment claimed it "resolves types", and the claim was believed — including in review —
 * while `type MediaUrl = SafeResourceUrl; posterUrl = input<MediaUrl>()` sailed through, because the
 * text `MediaUrl` does not match `/Safe…/`.
 *
 * A syntactic resolver has a knowable failure mode: it either resolves a type or it does not. So the
 * honesty of check 4 does not rest on the resolver being complete — it rests on **failing closed**.
 * An unresolvable NONE-context binding is reported, not skipped. That converts every gap in this
 * resolver, present and future, from a silent pass into a visible finding. Adding a real
 * `TypeChecker` would shrink the set of things it must report; it would not change what makes it
 * trustworthy.
 *
 * Section 5.1 of the plan is explicit that a template check which cannot see through an alias is
 * worse than none, because it will be trusted wrongly. It was. Hence both the alias expansion and
 * the fail-closed default.
 *
 * Usage:
 *   node scripts/beta-harness/sanitizer-audit.mjs
 *   node scripts/beta-harness/sanitizer-audit.mjs --print          # dump every bypass as JSON
 *   node scripts/beta-harness/sanitizer-audit.mjs --only 4         # run one check (for evidence)
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

const ROOT = resolve(import.meta.dirname, '..', '..');
const ALLOWLIST_PATH = '.ai/state/sanitizer-allowlist.json';

/**
 * The helpers permitted to hold a bypass — **empty until they exist.**
 *
 * This used to name `libs/shared/security/src/lib/trust-object-url.ts` and
 * `libs/shared/ui/src/lib/render-trusted-html.ts`, neither of which is in the tree; they arrive with
 * the plan's PRs 3 and 4. Two things were wrong with pre-registering them. The exemptions could
 * never fire, so checks 3 and 5 carried dead branches whose only exercise was a selftest control
 * that patched this map inside the script. And it silently pre-approved whatever later appears at
 * those paths, matched by exact member name — so a helper landing under a different export name gets
 * no exemption while one landing with a *matching* name gets an unreviewed one.
 *
 * `assertApprovedHelpersExist` keeps this honest in the other direction: once an entry is added, the
 * file must exist, so the map cannot rot back into naming nothing.
 */
const APPROVED_HELPERS = new Map([]);

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
  // Derived from the same `registerContext(SecurityContext.URL, …)` list: it registers only
  // `*|formAction`, `area|href`, `a|href`, `a|xlink:href`, `form|action`, `img|src` and `video|src`.
  // Everything else that takes a URL is therefore NONE, including these. Nothing in the repository
  // binds them today, so they are a guard against a future binding rather than a live defect — but
  // the previous list of three read as exhaustive, which is how a checked set becomes a stale one.
  { element: 'track', attr: 'src' },
  { element: 'input', attr: 'src' },
  { element: 'img', attr: 'srcset' },
  { element: 'source', attr: 'srcset' },
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

/**
 * Every place a `bypassSecurityTrust*` member is reached, whether it is *called* there or merely
 * referenced.
 *
 * Matching only `CallExpression`s with a `PropertyAccessExpression` callee — which is what this did
 * — does not survive one line of indirection. Both of these reported zero bypasses and PASS:
 *
 *     const trust = this.sanitizer.bypassSecurityTrustResourceUrl.bind(this.sanitizer);
 *     trust(u);
 *
 *     const { bypassSecurityTrustHtml } = this.sanitizer;
 *     bypassSecurityTrustHtml.call(this.sanitizer, raw);
 *
 * That matters beyond the count: checks 1, 3 and 5 and the ratchet are all driven from this list, so
 * an invisible bypass is unregistered, unbudgeted and unchecked for sanitisation, while the
 * allowlist's own header promises that *every* `bypassSecurityTrust*` call appears in it.
 *
 * A reference is recorded rather than only a call because that is where the escape happens — once
 * the function is in a variable, its call site is an ordinary identifier this cannot recognise. A
 * direct call and a reference to the same member in the same enclosing member collapse to one
 * allowlist entry, which is why `calls` is deduplicated by line.
 * @returns {{member: string, kind: string, line: number, indirect: boolean}[]}
 */
function collectBypasses(sf) {
  const found = [];
  const seenLines = new Set();

  const record = (node, name, indirect) => {
    const line = lineOf(sf, node);
    const key = `${line}:${name}`;
    if (seenLines.has(key)) return;
    seenLines.add(key);
    found.push({
      member: enclosingMemberName(node),
      kind: name.replace('bypassSecurityTrust', ''),
      line,
      indirect,
    });
  };

  eachNode(sf, (n) => {
    // `x.bypassSecurityTrustHtml(...)` — the direct form.
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
      const name = n.expression.name.text;
      if (BYPASS_RE.test(name)) {
        record(n, name, false);
        return;
      }
    }

    // `x.bypassSecurityTrustHtml` in any position that is not the callee of its own call — `.bind`,
    // an assignment, an argument, a return.
    if (ts.isPropertyAccessExpression(n) && BYPASS_RE.test(n.name.text)) {
      const isOwnCallee = ts.isCallExpression(n.parent) && n.parent.expression === n;
      if (!isOwnCallee) record(n, n.name.text, true);
    }

    // `const { bypassSecurityTrustHtml } = this.sanitizer;`
    if (ts.isBindingElement(n) && n.name && ts.isIdentifier(n.name)) {
      const bound = n.propertyName && ts.isIdentifier(n.propertyName) ? n.propertyName.text : n.name.text;
      if (BYPASS_RE.test(bound)) record(n, bound, true);
    }
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
  if (!init || !ts.isCallExpression(init)) return null;

  // `signal<T>()`, `input<T>()`, `computed<T>()` — type args on the call itself.
  if (init.typeArguments?.length) {
    return init.typeArguments.map((t) => t.getText(sf)).join(' | ');
  }

  // `input.required<T>()` — the type args hang off the *inner* call expression. The previous
  // version re-tested `init.typeArguments?.length` here, which the branch above has already
  // returned on, so this was unreachable and `input.required<SafeResourceUrl>()` resolved to
  // `null` — i.e. "cannot tell", i.e. silently unchecked.
  const inner = init.expression;
  if (ts.isPropertyAccessExpression(inner) && ts.isCallExpression(inner.expression)) {
    const innerArgs = inner.expression.typeArguments;
    if (innerArgs?.length) return innerArgs.map((t) => t.getText(sf)).join(' | ');
  }

  // `bypassSecurityTrust*` called directly into a signal: `signal(this.sanitizer.bypass…())` has no
  // type argument at all, but its type is not in doubt. Read the initializer instead of giving up.
  const argText = init.arguments?.length ? init.arguments.map((a) => a.getText(sf)).join(' ') : '';
  const fromBypass = argText.match(/bypassSecurityTrust(Url|ResourceUrl|Html|Style|Script)\b/);
  if (fromBypass) return `Safe${fromBypass[1]}`;

  return null;
}

/**
 * Interface and type-alias property types, plus class member types, for one file.
 * @returns {{interfaces: Map<string, Map<string,string>>, members: Map<string,string>}}
 */
function collectTypeShapes(sf) {
  const interfaces = new Map();
  const members = new Map();
  /** `type X = Y` where Y is a reference rather than a literal — the alias evasion. */
  const aliases = new Map();

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
    // `type MediaUrl = SafeResourceUrl` — NOT a type literal, so the branch above skips it, and
    // before this the annotation text `MediaUrl` never matched `mentionsSafe`.
    if (ts.isTypeAliasDeclaration(n) && !ts.isTypeLiteralNode(n.type)) {
      aliases.set(n.name.getText(sf), n.type.getText(sf));
    }
    if (ts.isPropertyDeclaration(n) && n.name && !ts.isComputedPropertyName(n.name)) {
      const t = memberTypeText(n, sf);
      if (t) members.set(n.name.getText(sf), t);
    }
    if (ts.isGetAccessorDeclaration(n) && n.name && n.type) {
      members.set(n.name.getText(sf), n.type.getText(sf));
    }
  });

  return { interfaces, members, aliases };
}

/**
 * Every interface and type alias in the repository, keyed by name.
 *
 * Per-file shapes are not enough: an interface or alias declared in one file and imported into a
 * component resolved to `null` — "cannot tell" — and check 4 treats that as "do not flag". Moving
 * `VideoSource` into a shared models file, which is ordinary refactoring, would therefore have
 * silently switched the check off for the binding it exists to guard.
 *
 * Names are global here rather than import-resolved, so two same-named types in different files
 * collide. **Collisions resolve towards Safe, not towards first-declared.**
 *
 * First-declared was the original behaviour, and the comment here claimed it "can only widen what the
 * check considers Safe-typed — it cannot hide one". That was false, and this repository can
 * demonstrate it: there are two unrelated `Fact` interfaces. An earlier `type MediaUrl = string`
 * would have won over a later imported `MediaUrl = SafeResourceUrl`, and check 4 would have resolved
 * the binding to a plain string — a silent pass, not even the fail-closed report.
 *
 * So a name already present is overwritten when the new declaration mentions `Safe*` and the kept one
 * does not. That makes the collision behaviour actually match the claim: it can only ever move a
 * binding towards being reported, never away.
 * @returns {{interfaces: Map<string, Map<string,string>>, aliases: Map<string,string>}}
 */
function collectGlobalTypes(parsed) {
  const interfaces = new Map();
  const aliases = new Map();

  /** Keep whichever declaration is more likely to make check 4 report. */
  const preferSafer = (map, name, candidate, mentions) => {
    if (!map.has(name)) {
      map.set(name, candidate);
      return;
    }
    if (mentions(candidate) && !mentions(map.get(name))) map.set(name, candidate);
  };

  for (const [, { sf }] of parsed) {
    const shapes = collectTypeShapes(sf);
    for (const [name, props] of shapes.interfaces) {
      // An interface "mentions Safe" if any of its property types does.
      preferSafer(interfaces, name, props, (p) => [...p.values()].some(mentionsSafe));
    }
    for (const [name, target] of shapes.aliases) {
      preferSafer(aliases, name, target, mentionsSafe);
    }
  }
  return { interfaces, aliases };
}

/**
 * Follow `type A = B; type B = SafeResourceUrl` to the end, so the text tested for `Safe*` is the
 * resolved target rather than whatever local name the author chose.
 *
 * Depth-capped and cycle-guarded: a self-referential alias is a compile error, not this gate's
 * problem, and it must not hang the build.
 */
function expandAliases(typeText, aliases, seen = new Set()) {
  if (!typeText) return typeText;
  let out = typeText;
  for (let depth = 0; depth < 8; depth += 1) {
    const names = out.match(/\b[A-Z][\w$]*\b/g) ?? [];
    const next = names.find((name) => aliases.has(name) && !seen.has(name));
    if (!next) break;
    seen.add(next);
    out = out.replace(new RegExp(`\\b${next}\\b`, 'g'), aliases.get(next));
  }
  return out;
}

/**
 * Callees accepted as sanitisers, by *qualified* shape rather than by final name alone.
 *
 * Matching the final name only — which this did, to reach the real `this.escapeHtml(text)` call sites
 * — accepts any function that happens to be called `sanitize`. `const sanitize = (v) => v;` beside
 * `bypassSecurityTrustHtml(sanitize(raw))` satisfied the guard while doing nothing, which is the same
 * decoy problem one level down from the one this check was rewritten to close.
 *
 * `DOMPurify.sanitize` and `renderTrustedHtml` are fixed identities. `escapeHtml` is accepted only
 * when the file declares one that demonstrably escapes — see `declaresRealEscapeHtml` — because it is
 * a local convention in this repository rather than an import from a known package.
 */
const QUALIFIED_SANITISERS = new Set(['DOMPurify.sanitize', 'renderTrustedHtml']);

/**
 * Whether `sf` declares an `escapeHtml` that actually escapes.
 *
 * Checked by looking for the markup entities in its body: an implementation that does not produce
 * `&lt;` or `&amp;` is not escaping HTML, whatever it is called. Crude, but it distinguishes the real
 * `kd-citation-dialog` and `ai-markdown.pipe` helpers from an identity function of the same name, and
 * it fails closed — an `escapeHtml` this cannot recognise simply does not count as a sanitiser.
 */
/**
 * A transform argument that cannot introduce unchecked text: a literal, a regex, or a number.
 *
 * `escaped.replace(/x/g, '&amp;')` is fine — the replacement is author-written. `escaped.replace(/x/,
 * raw)` is not, and has to be proven sanitised on its own.
 */
function isInertTransformArg(arg) {
  return (
    ts.isStringLiteral(arg) ||
    ts.isNoSubstitutionTemplateLiteral(arg) ||
    ts.isRegularExpressionLiteral(arg) ||
    ts.isNumericLiteral(arg)
  );
}

function declaresRealEscapeHtml(sf) {
  let real = false;
  eachNode(sf, (n) => {
    if (real) return;
    const isEscapeDecl =
      (ts.isMethodDeclaration(n) || ts.isFunctionDeclaration(n) || ts.isPropertyDeclaration(n)) &&
      n.name &&
      !ts.isComputedPropertyName(n.name) &&
      n.name.getText(sf) === 'escapeHtml';
    if (!isEscapeDecl) return;
    const body = n.getText(sf);
    if (body.includes('&lt;') || body.includes('&amp;')) real = true;
  });
  return real;
}

/**
 * String transforms that carry sanitised-ness through from their *receiver*.
 *
 * Deliberately excludes `concat` and `join`, and every argument is still checked: `escaped.concat(raw)`
 * and `escaped.replace(/x/, raw)` append attacker-controlled text to a sanitised receiver, and marking
 * them safe purely because the receiver was sanitised is how the decoy gets back in through the side
 * door. Only transforms that cannot introduce unchecked text remain.
 */
const STRING_TRANSFORMS = new Set([
  'replace',
  'replaceAll',
  'trim',
  'slice',
  'substring',
  'toString',
  'toLowerCase',
  'toUpperCase',
]);

/**
 * Whether the value in `expr` demonstrably came from a sanitiser.
 *
 * Check 5 used to ask a weaker question: does the enclosing member's *text* contain
 * `DOMPurify.sanitize(` anywhere? That passes on
 *
 *     const heading = DOMPurify.sanitize(this.staticTitle);   // sanitised, and unused below
 *     return this.sanitizer.bypassSecurityTrustHtml(note);    // attacker-authored, untouched
 *
 * — a decoy satisfies the guard while user-authored HTML is trusted raw. That guard is what
 * `.ai/state/supply-chain-allowlist.json` cites as its reason for accepting the Quill XSS advisory,
 * so "a sanitiser is nearby" was doing load-bearing work it could not support.
 *
 * This follows the argument instead: a direct sanitiser call, a template literal or concatenation
 * whose parts are each sanitised, or a local `const`/`let` in the same member assigned from one.
 * Anything it cannot trace is reported — the same fail-closed stance as check 4, for the same
 * reason: the alternative is a guard that is silent precisely when it is being evaded.
 */
function sanitizerReaches(expr, host, sf) {
  const seen = new Set();
  /** Names already proven sanitised, so a self-referential transform can reference them. */
  const safeNames = new Set();

  const escapeHtmlIsReal = declaresRealEscapeHtml(sf);

  const calleeName = (node) => {
    const callee = node.expression;
    if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
    if (ts.isIdentifier(callee)) return callee.text;
    return null;
  };

  /** Accepts only known sanitiser identities, not anything sharing a method name. */
  const isSanitiser = (node) => {
    const callee = node.expression;
    // `DOMPurify.sanitize(...)`, `renderTrustedHtml(...)` — including through a receiver such as
    // `this.` — matched on the qualified tail so a bare `sanitize()` does not count.
    const text = callee.getText(sf).replace(/^this\./, '');
    if (QUALIFIED_SANITISERS.has(text)) return true;
    // `escapeHtml` / `this.escapeHtml`, only where this file declares a real one.
    return escapeHtmlIsReal && calleeName(node) === 'escapeHtml';
  };

  const walk = (node, depth) => {
    if (!node || depth > 8) return false;

    if (ts.isCallExpression(node)) {
      if (isSanitiser(node)) return true;
      // `sanitised.replace(...)` stays sanitised — but only if every argument is too.
      // `escaped.replace(/x/, raw)` splices attacker text into an escaped string, so the receiver
      // being clean says nothing about the result.
      const name = calleeName(node);
      if (
        name &&
        STRING_TRANSFORMS.has(name) &&
        ts.isPropertyAccessExpression(node.expression) &&
        walk(node.expression.expression, depth + 1) &&
        (node.arguments ?? []).every((a) => isInertTransformArg(a) || walk(a, depth + 1))
      ) {
        return true;
      }
      return false;
    }
    // `cond ? a : b`, `a ?? b`, `(a)` — safe only if every branch that can reach the bypass is.
    if (ts.isParenthesizedExpression(node)) return walk(node.expression, depth + 1);
    if (ts.isConditionalExpression(node)) {
      return walk(node.whenTrue, depth + 1) && walk(node.whenFalse, depth + 1);
    }
    if (ts.isBinaryExpression(node)) {
      return walk(node.left, depth + 1) && walk(node.right, depth + 1);
    }
    // A template literal is safe if every interpolation is. Its literal chunks are author-written.
    if (ts.isTemplateExpression(node)) {
      return node.templateSpans.every((span) => walk(span.expression, depth + 1));
    }
    if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node)) return true;

    // An identifier: every value it can hold must be sanitised, not merely its declaration.
    //
    // Following only the initialiser would accept
    //     let html = escapeHtml(x);
    //     html = req.body;            // <- reassigned to something untrusted
    // so the declaration *and* every assignment inside this member are collected, and all of them
    // must trace back to a sanitiser. `html = html.replace(...)` self-references, which the `seen`
    // guard would otherwise reject, so a self-reference is skipped rather than failed — the other
    // sources of the same variable still have to pass.
    if (ts.isIdentifier(node)) {
      const name = node.text;
      if (safeNames.has(name)) return true;
      if (seen.has(name)) return false;
      seen.add(name);

      const sources = [];
      eachNode(host, (d) => {
        if (ts.isVariableDeclaration(d) && ts.isIdentifier(d.name) && d.name.text === name) {
          if (d.initializer) sources.push(d.initializer);
        }
        if (
          ts.isBinaryExpression(d) &&
          d.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isIdentifier(d.left) &&
          d.left.text === name
        ) {
          sources.push(d.right);
        }
      });
      if (sources.length === 0) return false;

      const selfReferential = (source) =>
        (source.getText(sf).match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length > 0;
      const independent = sources.filter((source) => !selfReferential(source));
      if (independent.length === 0) return false;
      if (!independent.every((source) => walk(source, depth + 1))) return false;

      // Every independent source is sanitised, so the variable is — provisionally. Now the
      // self-referential assignments have to preserve that, which is where `html = html + untrusted`
      // is caught: `+` requires both operands to pass, and `untrusted` does not.
      safeNames.add(name);
      const carried = sources
        .filter(selfReferential)
        .every((source) => walk(source, depth + 1));
      if (!carried) safeNames.delete(name);
      return carried;
    }

    return false;
  };

  return walk(expr, 0);
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
function templatesFor(tsFile, sf, _text) {
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

  const [firstSegment, ...rest] = path;
  let root = firstSegment;

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

/** A justification of fewer than this many characters is a placeholder, not a rationale. */
const MIN_JUSTIFICATION = 40;

/**
 * Load the allowlist, rejecting entries that do not carry what the gate claims to require.
 *
 * The whole premise is "a bypass is registered *with a written justification*". Accepting an entry
 * on `file::member` alone made `{ "member": "loadPreview" }` sufficient — check 1 passed and the
 * bypass was reported as accounted for, so the gate enforced bookkeeping rather than review. A
 * blank or one-word justification is the same hole with extra steps, hence the length floor.
 * @returns {{raw: object, entries: Map<string, object>, malformed: string[]}}
 */
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const fileExists = (relPath) => {
  try {
    return statSync(join(ROOT, relPath)).isFile();
  } catch {
    return false;
  }
};

/**
 * The `budgets` object as of the merge base with `origin/main`, or `null` if it cannot be read.
 *
 * Read through `git show` rather than the working tree, because the working tree's copy is the thing
 * being ratcheted. Returns `null` — reported as a note, not a pass — when there is no git, no
 * `origin/main`, or no allowlist at the base (its first commit). Silence would be worse: an
 * unreadable base must not look like an enforced one.
 */
/** The whole allowlist at the merge base, or `null` if it cannot be read. */
function allowlistAtBase() {
  const base = (() => {
    for (const ref of ['origin/main', 'main']) {
      const r = spawnSync('git', ['merge-base', 'HEAD', ref], { cwd: ROOT, encoding: 'utf8' });
      if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
    }
    return null;
  })();
  if (!base) return null;

  const shown = spawnSync('git', ['show', `${base}:${ALLOWLIST_PATH}`], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  if (shown.status !== 0) return null;
  try {
    return JSON.parse(shown.stdout);
  } catch {
    return null;
  }
}

/** `file::member` -> declared `calls` at the merge base. */
function declaredCallsAtBase(baseAllowlist) {
  const out = new Map();
  if (!baseAllowlist || !isRecord(baseAllowlist.sites)) return out;
  for (const [file, list] of Object.entries(baseAllowlist.sites)) {
    if (!Array.isArray(list)) continue;
    for (const e of list) {
      if (e && typeof e.member === 'string') out.set(`${file}::${e.member}`, e.calls ?? 1);
    }
  }
  return out;
}

function loadAllowlist() {
  const raw = JSON.parse(readFileSync(join(ROOT, ALLOWLIST_PATH), 'utf8'));
  const entries = new Map();
  const malformed = [];

  for (const [file, list] of Object.entries(raw.sites ?? {})) {
    for (const e of list) {
      const where = `${file}::${e.member ?? '<no member>'}`;
      if (typeof e.member !== 'string' || e.member.trim() === '') {
        malformed.push(`${file}: an entry has no "member", so it can never match a bypass.`);
        continue;
      }
      const j = typeof e.justification === 'string' ? e.justification.trim() : '';
      if (j === '') {
        malformed.push(
          `${where}: no "justification". A bypass is registered with a written rationale or not at all.`,
        );
      } else if (j.length < MIN_JUSTIFICATION) {
        malformed.push(
          `${where}: "justification" is ${j.length} characters, under the ${MIN_JUSTIFICATION} minimum — ` +
            `state what makes the bypass safe, not that it is.`,
        );
      }
      if (!['A', 'B', 'C', 'D'].includes(e.category)) {
        malformed.push(
          `${where}: category ${JSON.stringify(e.category)} is not one of A, B, C, D, so the ratchet cannot count it.`,
        );
      }
      if (e.calls !== undefined && (!Number.isInteger(e.calls) || e.calls < 1)) {
        malformed.push(`${where}: "calls" must be a positive integer, got ${JSON.stringify(e.calls)}.`);
      }
      entries.set(`${file}::${e.member}`, { ...e, file });
    }
  }
  return { raw, entries, malformed };
}

function main() {
  const tsFiles = [...findFiles('apps', ['.ts']), ...findFiles('libs', ['.ts'])];
  const findings = [];
  const notes = [];

  // An exemption naming a file that does not exist is an exemption for whatever later appears at
  // that path, granted before anyone reviewed it.
  for (const [file, member] of APPROVED_HELPERS) {
    if (!fileExists(file)) {
      findings.push(
        `[helpers] APPROVED_HELPERS exempts '${member}' in ${file}, which does not exist.\n` +
          `    Add the entry in the change that lands the helper, not before it — otherwise the\n` +
          `    exemption pre-approves an unreviewed file at that path.`,
      );
    }
  }

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
  const { raw, entries, malformed } = allowlist;
  const seen = new Set();

  const run = (n) => only === null || only === n;

  // Reported under check 1: an entry that does not carry a justification is not a registration, so
  // treating it as one is the same failure as having no entry at all.
  if (run(1)) {
    for (const m of malformed) {
      findings.push(`[1] unusable allowlist entry  ${m}`);
    }
  }

  // ---- check 1: unregistered bypass, and undeclared extra calls in a registered member ---------
  //
  // Keying by `file::member` alone cannot enforce "every bypass call is accounted for": a member
  // may legitimately hold several calls (kd-citation-dialog's `highlightExcerpt` holds three), and
  // a bare `entries.has(key)` would then wave through a fourth. So each entry declares `calls`
  // (default 1) and the actual count is compared against it. More than declared is new debt;
  // fewer is a stale declaration. Both are red, so the count in the allowlist stays true.
  const callsByKey = new Map();
  for (const b of bypasses) {
    const key = `${b.file}::${b.member}`;
    if (!callsByKey.has(key)) callsByKey.set(key, []);
    callsByKey.get(key).push(b);
  }

  for (const [key, calls] of callsByKey) {
    const { file, member } = calls[0];
    // NOTE: an approved helper is deliberately NOT exempt from check 1. Being the one sanctioned
    // place to hold a bypass is a reason to register it with a justification, not a reason to skip
    // registration — and skipping it also skipped declared-call counting and the category budget,
    // so a second bypass inside a helper would have passed silently. The plan's own sample entry in
    // section 5.1 is a helper entry, which is the shape this now requires. Checks 3 and 5 keep their
    // exemptions, because those two ask "is this bypass redundant / unpaired", and the helper is
    // where the non-redundant, paired one is supposed to live.
    const entry = entries.get(key);
    if (!entry) {
      if (run(1)) {
        const isHelper = APPROVED_HELPERS.get(file) === member;
        for (const b of calls) {
          findings.push(
            `[1] unregistered bypass  ${b.file}:${b.line}\n` +
              `    member '${b.member}' calls bypassSecurityTrust${b.kind} with no entry in ${ALLOWLIST_PATH}.\n` +
              (isHelper
                ? `    This is an approved helper, which is exactly why it needs an entry: the audited\n` +
                  `    bypass is the one a reviewer must be able to find. Register it with a justification.`
                : `    Add one with a justification, or route it through trustObjectUrl / renderTrustedHtml.`),
          );
        }
      }
      continue;
    }
    seen.add(key);
    const declared = entry.calls ?? 1;
    if (calls.length !== declared && run(1)) {
      findings.push(
        `[1] bypass count mismatch  ${file}::${member}\n` +
          `    ${calls.length} bypass call(s) at line(s) ${calls.map((c) => c.line).join(', ')}, ` +
          `but the allowlist declares ${declared}.\n` +
          (calls.length > declared
            ? `    A registered member is not a blanket exemption. Justify the extra call(s) and\n` +
              `    raise "calls" — the budget below counts calls, so this is new debt.`
            : `    The declaration is stale. Lower "calls" to ${calls.length} to lock the gain in.`),
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
  //
  // Fails CLOSED. A binding whose type this cannot resolve is reported, not skipped.
  //
  // "Cannot tell, so do not flag" is the right default for a broad check, and it is what checks 1-3
  // do. It is the wrong default here, for two reasons. The population is tiny — six NONE-context
  // bindings in the whole repository — so a false positive costs one allowlist line, while a false
  // negative is a shipped defect of exactly the kind this check was written after. And every
  // documented evasion (a type alias, an imported interface, `computed()` with no type argument, an
  // `as` cast) surfaced as *unresolvable*, not as resolving to something benign. Under-reporting was
  // therefore indistinguishable from passing, which is how the check could be green while the thing
  // it guards was broken.
  if (run(4)) {
    const globalTypes = collectGlobalTypes(parsed);
    for (const [file, { sf, text }] of parsed) {
      const shapes = collectTypeShapes(sf);
      // Local declarations win; imported and cross-file ones fall back to the repository-wide map.
      const merged = {
        interfaces: new Map([...globalTypes.interfaces, ...shapes.interfaces]),
        members: shapes.members,
        aliases: new Map([...globalTypes.aliases, ...shapes.aliases]),
      };
      for (const tpl of templatesFor(file, sf, text)) {
        const loopVars = collectLoopVars(tpl.template);
        for (const { element, attr } of NONE_CONTEXT_BINDINGS) {
          // Accept both double and single quotes: [src]="..." or [src]='...'
          const re = new RegExp(`<${element}\\b[^>]*?\\[${attr}\\]\\s*=\\s*["']([^"']+)["']`, 'gs');
          let m;
          while ((m = re.exec(tpl.template)) !== null) {
            const expr = m[1].trim();
            const raw = resolveExpressionType(expr, merged, loopVars);
            const type = expandAliases(raw, merged.aliases);

            if (!type) {
              const lineInTpl = tpl.template.slice(0, m.index).split('\n').length;
              const where = tpl.htmlFile
                ? `${tpl.htmlFile}:${lineInTpl}`
                : `${tpl.tsFile}:${tpl.offsetLine + lineInTpl - 1}`;
              findings.push(
                `[4] unresolvable type in a NONE context  ${where}\n` +
                  `    <${element} [${attr}]="${expr}"> — this check could not determine the bound type.\n` +
                  `    ${element}[${attr}] is SecurityContext.NONE: no sanitiser runs, so a Safe* value here is\n` +
                  `    never unwrapped and stringifies into the attribute. Because it cannot rule that out, it\n` +
                  `    reports. Give the member an explicit type annotation the audit can read, or bind a\n` +
                  `    plainly-typed string.`,
              );
              continue;
            }
            if (!mentionsSafe(type)) continue;
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
    // An indirect HTML bypass has no argument at the reference site, so the provenance walk below
    // cannot see what it will be called with. `collectBypasses` records these now, so they are
    // registered and budgeted — but being *counted* is not being *checked*, and
    // `const trust = sanitizer.bypassSecurityTrustHtml.bind(sanitizer); trust(raw)` would otherwise
    // skip the pairing check entirely. Reported rather than traced: indirection through a variable is
    // exactly what this check cannot follow, and it has no legitimate use here.
    for (const b of bypasses) {
      if (b.kind !== 'Html' || !b.indirect) continue;
      findings.push(
        `[5] indirect trusted HTML  ${b.file}:${b.line}\n` +
          `    member '${b.member}' takes a reference to bypassSecurityTrustHtml instead of calling it.\n` +
          `    Once it is in a variable this check cannot see what it is called with, so the sanitiser\n` +
          `    pairing cannot be established. Call it directly, or route the HTML through\n` +
          `    renderTrustedHtml.`,
      );
    }
    for (const [file, { sf }] of parsed) {
      const approvedHelper = APPROVED_HELPERS.get(file);
      eachNode(sf, (n) => {
        if (!ts.isCallExpression(n)) return;
        const callee = n.expression;
        if (!ts.isPropertyAccessExpression(callee)) return;
        if (callee.name.text !== 'bypassSecurityTrustHtml') return;

        // Skip only if this bypass is inside the approved helper function
        if (approvedHelper) {
          const member = enclosingMemberName(n);
          if (member === approvedHelper) return;
        }
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
        const arg = n.arguments?.[0];
        if (!arg) return; // no argument is a compile error, not this gate's business
        const sanitized = sanitizerReaches(arg, host ?? sf, sf);
        if (!sanitized) {
          findings.push(
            `[5] unsanitised trusted HTML  ${file}:${lineOf(sf, n)}\n` +
              `    member '${enclosingMemberName(n)}' passes '${arg.getText(sf).slice(0, 60)}' to\n` +
              `    bypassSecurityTrustHtml, and this check could not trace that value back to\n` +
              `    DOMPurify.sanitize / escapeHtml / renderTrustedHtml.\n` +
              `    Safety here is a pairing, not a property of either half. note:note is user-authored, so an\n` +
              `    unpaired render path is stored XSS.`,
          );
        }
      });
    }
  }

  // ---- the ratchet ----------------------------------------------------------------------------
  // Counts declared *calls*, not entries. Counting entries would let a member that already holds
  // one bypass absorb more without moving any number the ratchet watches.
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const [, e] of entries) {
    if (counts[e.category] !== undefined) counts[e.category] += e.calls ?? 1;
  }
  notes.push(
    `registered bypass calls: ${counts.A + counts.B + counts.C + counts.D} in ${entries.size} member(s)` +
      `  (A ${counts.A}, B ${counts.B}, C ${counts.C}, D ${counts.D})`,
  );
  // A budget read only from the working tree is not a ratchet. Both halves of the comparison were
  // in the same editable file, so a contributor could raise a number, reclassify an entry into a
  // roomier category, or delete `budgets` entirely — `?? {}` then iterated nothing and the gate went
  // green. The claim "the counts may shrink and never grow" was unenforced.
  //
  // So the ceiling comes from the merge base, which the contributor cannot edit in their own commit.
  const CATEGORIES = ['A', 'B', 'C', 'D'];
  const baseAllowlist = allowlistAtBase();
  const baseBudgets = isRecord(baseAllowlist?.budgets) ? baseAllowlist.budgets : null;

  // A category total is not a fine enough ceiling on its own. `highlightExcerpt` declares 3 calls
  // under D; if a later change removes a different D entry, freeing one, and grows that member to 4,
  // the total is unchanged and the audit passes — one member quietly absorbing more bypasses is
  // exactly the shape the per-call counting was introduced to stop.
  const baseCalls = declaredCallsAtBase(baseAllowlist);
  for (const [key, e] of entries) {
    const before = baseCalls.get(key);
    const now = e.calls ?? 1;
    if (typeof before === 'number' && now > before) {
      findings.push(
        `[ratchet] ${key} declared ${before} bypass call(s) at the merge base and now declares ${now}.\n` +
          `    An individual member may not absorb more bypasses, even where the category total is\n` +
          `    unchanged because another entry shrank.`,
      );
    }
  }

  if (!isRecord(raw.budgets)) {
    findings.push(
      `[ratchet] ${ALLOWLIST_PATH} has no 'budgets' object.\n` +
        `    Without it the ratchet iterates nothing and this gate passes by omission, which is how a\n` +
        `    ceiling gets removed rather than lowered.`,
    );
  } else {
    for (const cat of CATEGORIES) {
      const budget = raw.budgets[cat];
      if (typeof budget !== 'number') {
        findings.push(
          `[ratchet] category ${cat} has no numeric budget in ${ALLOWLIST_PATH}.\n` +
            `    Every category needs one; a missing key is indistinguishable from an unlimited one.`,
        );
        continue;
      }
      if (counts[cat] > budget) {
        findings.push(
          `[ratchet] category ${cat} has ${counts[cat]} bypass call(s), budget is ${budget}.\n` +
            `    Remove the bypass, or justify a new entry — the budget is a ceiling, not a target.`,
        );
      }
      if (baseBudgets && typeof baseBudgets[cat] === 'number' && budget > baseBudgets[cat]) {
        findings.push(
          `[ratchet] category ${cat}'s budget rose from ${baseBudgets[cat]} to ${budget}.\n` +
            `    A budget may only decrease. Raising it in the same change that needs the headroom is\n` +
            `    exactly what the ratchet exists to prevent.`,
        );
      }
      // Stale headroom is a finding, not a note.
      //
      // As a note it left the ratchet unenforced in the direction that actually matters: one change
      // removes a bypass without lowering the budget, and a later change drops a *different* bypass
      // into the slack. Neither the current nor the merge-base budget rises, so both pass, and the
      // debt is back where it started while the ceiling never moved. Requiring the removal and the
      // lowering to land together is what makes "counts may shrink and never grow" true.
      if (counts[cat] < budget) {
        findings.push(
          `[ratchet] category ${cat} has ${counts[cat]} bypass call(s) but its budget is still ${budget}.\n` +
            `    Lower the budget to ${counts[cat]} in this change. Leaving the headroom lets a later\n` +
            `    change reintroduce a bypass into the slack without raising any budget, which is the\n` +
            `    ratchet slipping rather than holding.`,
        );
      }
    }
  }
  if (!baseBudgets) {
    notes.push(
      'could not read budgets at the merge base, so only the current ceiling was enforced — a raised budget would not be caught in this run',
    );
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
