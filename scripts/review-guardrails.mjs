#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
  maxBuffer: 1024 * 1024,
}).trim();

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith('--')) {
    const [key, inlineValue] = arg.slice(2).split('=', 2);
    if (inlineValue !== undefined) {
      args.set(key, inlineValue);
    } else {
      args.set(key, process.argv[i + 1]?.startsWith('--') ? true : process.argv[++i]);
    }
  }
}

const base = args.get('base') || process.env.NX_BASE || 'origin/main';
const head = args.get('head') || process.env.NX_HEAD || 'HEAD';

const GIT_MAX_BUFFER = 50 * 1024 * 1024;

function git(args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: GIT_MAX_BUFFER });
}

function fileExists(path) {
  return existsSync(join(repoRoot, path));
}

function read(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

function walk(dir, predicate, acc = []) {
  const absolute = join(repoRoot, dir);
  if (!existsSync(absolute)) return acc;
  for (const entry of readdirSync(absolute)) {
    const path = join(absolute, entry);
    const rel = relative(repoRoot, path);
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    if (statSync(path).isDirectory()) {
      walk(rel, predicate, acc);
    } else if (predicate(rel)) {
      acc.push(rel);
    }
  }
  return acc;
}

/**
 * The commit the branch diverged from, or `base` itself if that cannot be resolved.
 *
 * `git diff a...b` already means "from the merge base of a and b, to b". The dirty-tree path
 * below cannot use three-dot form — there is no committed `b` to name — so it has to compute
 * the same starting point explicitly, or the two paths mean different things.
 */
function mergeBaseOrBase() {
  try {
    return git(['merge-base', base, head]).trim() || base;
  } catch {
    // A fixture repository without the base ref, or a shallow clone. Falling back to `base` is
    // the previous behaviour, which is noisy rather than wrong.
    return base;
  }
}

/**
 * Added lines, keyed by file.
 *
 * ## The two paths have to mean the same thing, and once did not
 *
 * Clean tree: `git diff base...head` — **merge base** to head, so commits that landed on `base`
 * after this branch forked are excluded.
 *
 * Dirty tree: it used `git diff base`, which is two-dot — working tree against the **current
 * tip** of base. Those differ the moment `base` moves on, and the difference is not subtle: a
 * line that `main` changed *after* the fork shows up as this branch having added the old
 * version of it. Measured on this branch with `origin/main` a few commits ahead: four
 * guardrail failures, all of them lines nobody here had touched, all of them vanishing when
 * the tree was made clean. A gate that cries wolf whenever `main` moves is a gate people learn
 * to run with their eyes closed.
 *
 * So the dirty path now starts from the merge base too. Both paths answer the same question —
 * "what has this branch introduced" — and the only difference left is whether uncommitted work
 * counts, which is the distinction that was intended.
 */
function parseDiff() {
  const hasLocalChanges = head === 'HEAD' && git(['status', '--porcelain']).trim().length > 0;
  const diffArgs = hasLocalChanges
    ? ['diff', '--unified=0', '--diff-filter=ACMR', mergeBaseOrBase()]
    : ['diff', '--unified=0', '--diff-filter=ACMR', `${base}...${head}`];
  const diff = git(diffArgs);
  const files = new Map();
  let current = null;
  let newLine = 0;

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) {
      current = line.slice(6);
      if (!files.has(current)) files.set(current, []);
      continue;
    }
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('+') && !line.startsWith('+++')) {
      files.get(current).push({ line: newLine, text: line.slice(1) });
      newLine += 1;
    } else if (!line.startsWith('-')) {
      newLine += 1;
    }
  }
  return files;
}

const addedLinesByFile = parseDiff();
const changedFiles = [...addedLinesByFile.keys()];
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

/**
 * The line numbers of a `.ts` file that fall inside an inline `template:` or `styles:` value.
 *
 * ## Why this exists
 *
 * `checkThemeTokens` used to read `.scss` and `.html` only, so a colour written inside a
 * component's inline template was never colour-checked at all. That is how 42 hard-coded colours
 * accumulated in `contracts-page.component.ts` unnoticed, and became visible the moment the
 * template was moved to a `.html` sibling — the violations were not introduced by the move, only
 * measured by it. It is also the second, independent reason `templateUrl` is a stated convention:
 * an inline template is invisible to every tool that keys off the file extension.
 *
 * ## The scoping, and why it is the block and not the file
 *
 * Only the text between the backticks of a `template:`/`styles:` value is returned. The colour
 * pattern is `#[0-9a-fA-F]{3,8}`, and a `.ts` file legitimately carries hex-shaped literals that
 * are not colours — a commit SHA, a document uid, a fixture id, an `&#123;` entity. Scanning the
 * whole file would flag all of them. Inside a template or a styles block the same literal is CSS,
 * so there the match is real.
 *
 * The block is found by walking forward from the key: optional `[`, then each backtick literal in
 * turn, stopping at the closing `]` or at the first value that is not a literal, so
 * `template: SOME_CONST` is not scanned. `templateUrl:`, `styleUrl:` and `styleUrls:` do not match
 * the key — a component that follows the convention has nothing here to scan.
 *
 * ## What it does not claim
 *
 * A backtick inside a `${…}` interpolation ends the literal early, so coverage stops there. That
 * under-covers rather than over-flags, and no template in this repository has that shape.
 */
function inlineStyleBlockLines(source) {
  const lineStarts = [0];
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === '\n') lineStarts.push(i + 1);
  }
  const lineAt = (index) => {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (lineStarts[mid] <= index) low = mid;
      else high = mid - 1;
    }
    return low + 1;
  };

  const covered = new Set();
  for (const key of source.matchAll(/(?:^|[\s,{(])(?:template|styles)\s*:/g)) {
    let i = key.index + key[0].length;
    while (i < source.length && /\s/.test(source[i])) i += 1;
    const isArray = source[i] === '[';
    if (isArray) i += 1;

    for (;;) {
      while (i < source.length && /[\s,]/.test(source[i])) i += 1;
      if (source[i] !== '`') break;
      i += 1;
      const opened = lineAt(i);
      while (i < source.length && source[i] !== '`') {
        if (source[i] === '\\') i += 1;
        i += 1;
      }
      const closed = lineAt(Math.min(i, source.length - 1));
      for (let line = opened; line <= closed; line += 1) covered.add(line);
      i += 1;
      if (!isArray) break;
    }
  }
  return covered;
}

/**
 * A colour literal must come from a **theme token with a fallback**, not be typed
 * in at the point of use.
 *
 * Three token namespaces are recognised, and the third needs explaining.
 * `--mat-sys-*` is Angular Material's, `--kd-*` is Knowledge Discovery's, and
 * `--shell-*` is `apps/nuxeo-satori-template`'s. The template ships **no Angular
 * Material on purpose** — a fork should not have to remove our design system
 * before adding its own — so `--mat-sys-*` is undefined there and writing
 * `var(--mat-sys-surface, #fff)` would satisfy this gate while the fallback did
 * all the work. That is the tautological-gate failure this repo has already paid
 * for twice, so the namespace is recognised rather than faked. `--shell-*` is
 * genuinely themed: `TemplateThemeService` writes Layer 0 `themes[].tokens` onto
 * `<html>`, verified in a browser against the built bundle.
 *
 * A **custom property declaration** is exempt. `--shell-border: #d0d7de;` is the
 * one place a literal belongs, because defining the token is precisely how every
 * other line avoids hardcoding. The exemption is deliberately narrow: the line
 * must be a declaration of a `--*` property, so `color: #fff` is still caught
 * wherever it appears.
 */
function checkThemeTokens() {
  const colorLiteral = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
  const THEMED_NAMESPACES = ['var(--mat-sys-', 'var(--kd-', 'var(--shell-'];
  // A design-token definition, e.g. `--shell-nav-bg: #0f2b46;`.
  const tokenDefinition = /^--[a-z0-9-]+\s*:/;

  for (const [file, lines] of addedLinesByFile) {
    // A whole stylesheet or template is CSS; a `.ts` file is only CSS inside its inline
    // `template:`/`styles:` blocks, so it is narrowed to those. See `inlineStyleBlockLines`.
    let inlineBlock = null;
    if (!file.endsWith('.scss') && !file.endsWith('.html')) {
      if (!file.endsWith('.ts') || !fileExists(file)) continue;
      inlineBlock = inlineStyleBlockLines(read(file));
      if (inlineBlock.size === 0) continue;
    }
    for (const { line, text } of lines) {
      if (inlineBlock && !inlineBlock.has(line)) continue;
      const trimmed = text.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
      if (tokenDefinition.test(trimmed)) continue;
      const hasColor = colorLiteral.test(trimmed);
      const isThemed = THEMED_NAMESPACES.some((namespace) => trimmed.includes(namespace));
      if (hasColor && !isThemed) {
        fail(
          `${file}:${line} introduces a hard-coded color. Use a theme token with a fallback ` +
            `(--mat-sys-*, --kd-*, or --shell-* in the template), or declare it as a --* token.` +
            (inlineBlock
              ? '\n    It is inside an inline template/styles block. Move it to a sibling ' +
                '.html/.scss and reference it with templateUrl/styleUrl, which is the convention ' +
                'and is also what makes the rest of the tooling able to see it.'
              : ''),
        );
      }
    }
  }
}

function checkDocsNumbering() {
  const docFiles = changedFiles.filter((file) => file.endsWith('.md') && file.startsWith('docs/'));
  for (const file of docFiles) {
    if (!fileExists(file)) continue;
    const numbers = new Map();
    // Track fenced code blocks: several docs embed whole other documents (AGENTS.md,
    // rule files) inside ```` fences, and those inner headings are illustrative content,
    // not this document's structure. A closing fence must be at least as long as the
    // one that opened the block, so nested ``` inside ```` does not end it.
    let openFence = 0;
    read(file)
      .split('\n')
      .forEach((line, index) => {
        const fence = line.match(/^\s*(`{3,}|~{3,})/);
        if (fence) {
          const length = fence[1].length;
          if (openFence === 0) {
            openFence = length;
            return;
          }
          if (length >= openFence && !line.trim().slice(length).trim()) {
            openFence = 0;
          }
          return;
        }
        if (openFence > 0) return;
        const match = line.match(/^##\s+(\d+)\./);
        if (!match) return;
        const section = match[1];
        const lines = numbers.get(section) || [];
        lines.push(index + 1);
        numbers.set(section, lines);
      });
    for (const [section, lines] of numbers) {
      if (lines.length > 1) {
        fail(`${file} has duplicate section number ## ${section}. at lines ${lines.join(', ')}.`);
      }
    }
  }
}

/**
 * Review bookkeeping must not travel in a pull request.
 *
 * `pr-review-analysis.mjs publish` used to write four tracked files as well as posting to the
 * Confluence analysis page: `docs/pr-review-findings.jsonl`, and the regenerated
 * `pre-pr-review/SKILL.md` in `.cursor/` plus its `.claude/` and `.agent/` mirrors. It runs
 * inside the review loop, and the retired `review-corpus` gate then required all four to be
 * committed with the fix — so a two-line accessibility fix shipped with four files of review
 * bookkeeping, on every PR that took a review round.
 *
 * The page is the record now and `publish` writes nothing tracked. This check is what keeps it
 * that way, because the failure mode is not someone arguing for the corpus again: it is a
 * generator, a stale instruction in a skill, or a restored file quietly putting it back.
 *
 * Both halves are load-bearing and neither implies the other. The path check catches the
 * corpus file returning under its own name; the marker check catches the generated statistics
 * block returning to any file, including under a different name, which is the form the path
 * check cannot see.
 */
function checkNoReviewCorpusChurn() {
  const CORPUS = 'docs/pr-review-findings.jsonl';
  if (changedFiles.includes(CORPUS)) {
    fail(
      `${CORPUS} is back in the diff. The PR review findings live on the Confluence analysis ` +
        'page, not in the repository — `npm run review:analysis -- stats` reads them. A ' +
        'committed copy is churn on every unrelated PR, and it fell behind the page every time.',
    );
  }
  // Split so this file can describe the marker without matching itself. Checking the added
  // lines rather than the file contents is deliberate: it is the reintroduction that fails,
  // and an unrelated PR is never blamed for a marker it did not add.
  const MARKER = `pr-review-stats${':'}start`;
  for (const [file, lines] of addedLinesByFile) {
    const hit = lines.find((line) => line.text.includes(MARKER));
    if (hit) {
      fail(
        `${file}:${hit.line} adds a generated \`${MARKER}\` block. The pre-PR review skill ` +
          'quotes no counts on purpose: an embedded table is a second copy of a number that ' +
          'only grows, and keeping it in step is what put the skill and its two mirrors into ' +
          'every PR diff. Point at the page instead.',
      );
    }
  }
}

function checkVitestProjects() {
  const projectFiles = walk('.', (file) => file.endsWith('project.json'));
  for (const projectFile of projectFiles) {
    let project;
    try {
      project = JSON.parse(read(projectFile));
    } catch {
      continue;
    }
    if (project?.targets?.test?.executor !== '@nx/vitest:test') continue;

    const projectRoot = dirname(projectFile);
    const sourceRoot = project.sourceRoot || join(projectRoot, 'src');
    const hasViteConfig = [
      'vite.config.ts',
      'vite.config.mts',
      'vite.config.js',
      'vitest.config.ts',
      'vitest.config.mts',
    ].some((config) => fileExists(join(projectRoot, config)));
    if (!hasViteConfig) {
      fail(`${projectFile} has an @nx/vitest:test target but no Vite/Vitest config file.`);
      continue;
    }

    const specs = walk(sourceRoot, (file) => /\.(spec|test)\.(ts|tsx|js|jsx|mts|mjs)$/.test(file));
    if (specs.length === 0) {
      const viteConfig = [
        'vite.config.ts',
        'vite.config.mts',
        'vite.config.js',
        'vitest.config.ts',
        'vitest.config.mts',
      ]
        .map((config) => join(projectRoot, config))
        .find(fileExists);
      const configText = viteConfig ? read(viteConfig) : '';
      if (!/passWithNoTests:\s*true/.test(configText)) {
        fail(
          `${projectFile} has no specs under ${sourceRoot}; add tests or set passWithNoTests: true.`,
        );
      }
    }
  }
}

/**
 * Every file that creates an object URL must also revoke one — repo-wide, not diff-wide.
 *
 * ## Why this stopped being diff-scoped
 *
 * It used to iterate `addedLinesByFile`, so it only ever looked at files whose *added*
 * lines contained `URL.createObjectURL`. That makes every violation predating the check
 * permanently exempt: it is not a rule, it is a rule for new code. Four real leaks lived
 * behind that exemption — two in `nav-drawer.component.ts`, one in
 * `dashboard-page.component.ts`, one in `collection-detail.ts`, none of which revoked
 * anything at all — while this gate reported pass on every run. CLAUDE.md states the
 * blob-URL lifecycle as a non-negotiable; a check that cannot see existing code cannot
 * hold it.
 *
 * Repo-wide is affordable because the population is tiny (18 files today) and the check is
 * a substring test.
 *
 * ## What it deliberately does not claim
 *
 * Granularity is the **file**, not the call site. A file that revokes on destroy but leaks
 * on a mid-life reset still passes — which is a real bug shape, and
 * `collection-detail.ts` had exactly it: `thumbnailMap.set({})` dropped a batch of
 * `SafeUrl`s without revoking the blobs behind them. Proving that by regex is not
 * possible, so it is stated here rather than implied by a green tick.
 */
function checkBlobUrlLifecycle() {
  const files = git(['ls-files', '--cached', '--others', '--exclude-standard'])
    .split('\n')
    .filter((file) => /^(libs|apps)\/.+\.ts$/.test(file) && !/\.(spec|test)\.ts$/.test(file));

  if (files.length === 0) {
    fail('No TypeScript sources found, so the blob-URL lifecycle gate cannot verify anything.');
    return;
  }

  let creators = 0;
  for (const file of files) {
    if (!fileExists(file)) continue;
    const content = read(file);
    if (!content.includes('URL.createObjectURL')) continue;
    creators += 1;
    if (!content.includes('URL.revokeObjectURL')) {
      fail(
        `${file} creates Blob/Object URLs but never revokes one.\n` +
          '    Track the raw url at creation — a SafeUrl from bypassSecurityTrustUrl cannot be\n' +
          '    read back — and revoke in destroyRef.onDestroy and on any reset.',
      );
    }
  }

  if (creators === 0) {
    fail(
      'No file creates an object URL, so this gate asserted nothing. If that is genuinely ' +
        'true the check should be removed deliberately rather than left passing empty.',
    );
  }
}

/**
 * The other half of the same rule: `<img [src]>` must never be handed a Nuxeo URL.
 *
 * CLAUDE.md states it — "Never `<img [src]="nuxeoUrl">` — fetch via service, use a blob
 * URL, revoke on destroy" — and nothing checked it. `task-detail.component.html` bound
 * `[src]="docPreviewUrl()"` where the component returned
 * `nuxeoApi.apiUrl('/nuxeo/api/v1/id/…/@rendition/thumbnail')`, so the browser issued that
 * request itself: no HTTP interceptor, no `Authorization` header, working only on an
 * ambient session cookie, with an internal API URL sitting in the DOM. Its sibling
 * `tasks-page.component.ts` in the same library already did it correctly.
 *
 * Matched on the **component**, not the template, because the template only shows a getter
 * name — `[src]="thumb"` is correct when `thumb` is a blob URL and wrong when it is not,
 * and only the `.ts` says which. So: for each expression bound to `[src]`, find its
 * declaration in the sibling component and fail if that declaration builds a Nuxeo URL.
 *
 * Two limits, stated rather than implied: it looks only at the sibling `.ts` of the same
 * base name, and it reads four lines from the declaration. A getter that delegates to a
 * helper elsewhere would slip through. It catches the shape that actually occurred.
 */
function checkNoNuxeoUrlInImgSrc() {
  const templates = git(['ls-files', '--cached', '--others', '--exclude-standard'])
    .split('\n')
    .filter((file) => /^(libs|apps)\/.+\.html$/.test(file));

  let bindings = 0;
  for (const template of templates) {
    if (!fileExists(template)) continue;
    const component = template.replace(/\.html$/, '.ts');
    if (!fileExists(component)) continue;
    const body = read(component);

    for (const match of read(template).matchAll(/\[src\]="([^"]+)"/g)) {
      // `foo()` and `foo` both reduce to the member name `foo`.
      const member = match[1]
        .replace(/\(.*$/, '')
        .replace(/^this\./, '')
        .trim();
      if (!/^[A-Za-z_$][\w$]*$/.test(member)) continue;
      bindings += 1;

      const declaration = new RegExp(`^\\s*(?:readonly\\s+)?${member}\\b[^\\n]*$`, 'm').exec(body);
      if (!declaration) continue;
      const window = body.slice(declaration.index).split('\n').slice(0, 5).join('\n');
      if (/apiUrl\(|['"`]\/nuxeo\//.test(window)) {
        fail(
          `${template} binds [src]="${match[1]}", and ${component} builds that from a Nuxeo URL.\n` +
            '    The browser fetches it directly, so it bypasses the HTTP interceptor and carries\n' +
            '    no Authorization header. Fetch the blob through a service, hand the template a\n' +
            '    blob URL, and revoke it on destroy.',
        );
      }
    }
  }

  if (bindings === 0) {
    fail(
      'No [src] bindings were found in any template, so this gate asserted nothing. ' +
        'Check the template glob before trusting a pass.',
    );
  }
}

/**
 * `attr.foo="bar"` written as a plain attribute, without Angular's binding brackets.
 *
 * The `attr.` prefix is only meaningful inside `[...]`. Written bare it is not a binding at all:
 * Angular emits a DOM attribute whose literal name is `attr.aria-label`, so
 *
 *     <button attr.aria-label="Download {{ view.title }}">
 *
 * renders `attr.aria-label="Download report.pdf"` and the button has **no accessible name**. It
 * looks correct in review, the interpolation really does evaluate, and the result is invisible
 * to assistive technology. There is no case where the bare form is what was meant.
 *
 * ## Why this needs its own check
 *
 * Nothing else in the toolchain sees it, and that was verified rather than assumed:
 *
 *   - the eleven @angular-eslint/template accessibility rules report nothing, because
 *     `attr.aria-label` is not an `aria-*` attribute and `valid-aria` never looks at it
 *   - SonarCloud reports nothing (it flags `Web:S6819` and `InputWithoutLabelCheck` elsewhere,
 *     not this)
 *   - the Angular compiler is happy: a literal attribute with an interpolation is valid HTML
 *
 * The one instance in this repository shipped through code review, a full WCAG 2.1 AA phase and
 * two CI gates. It was found by an external reviewer reading the diff.
 *
 * Scoped to `aria-`, `role` and `title` — the attributes where a silent miss costs an accessible
 * name. A bare `attr.colspan` is also wrong but merely cosmetic, and keeping the pattern narrow
 * keeps it free of judgement calls.
 */
function checkNoAttrPrefixedLiteralAttributes() {
  const templates = git(['ls-files', '--cached', '--others', '--exclude-standard'])
    .split('\n')
    .filter((file) => /^(libs|apps)\/.+\.html$/.test(file));

  let scanned = 0;
  for (const template of templates) {
    if (!fileExists(template)) continue;
    scanned += 1;

    read(template)
      .split('\n')
      .forEach((line, index) => {
        // A preceding `[` means it is the correct `[attr.foo]="…"` binding form.
        for (const match of line.matchAll(/(.?)\battr\.((?:aria-[\w-]+)|role|title)\s*=/g)) {
          if (match[1] === '[') continue;
          fail(
            `${template}:${index + 1} writes attr.${match[2]}="…" without binding brackets.\n` +
              `    The attr. prefix only works inside [...]. As written, Angular renders a DOM\n` +
              `    attribute literally named "attr.${match[2]}", so the element has no ${match[2]}\n` +
              `    at all. Use ${match[2]}="…" for a static value or interpolation, or\n` +
              `    [attr.${match[2]}]="…" to bind an expression.`,
          );
        }
      });
  }

  // The repository's standing rule: a glob that finds nothing must not read as a pass. There are
  // 89 tracked templates; a zero here means the check stopped looking.
  if (scanned === 0) {
    fail(
      'checkNoAttrPrefixedLiteralAttributes scanned no templates at all, so it asserted ' +
        'nothing. Check the template glob before trusting a pass.',
    );
  }
}

function checkTypeSafetyEscapes() {
  for (const [file, lines] of addedLinesByFile) {
    if (!file.endsWith('.ts')) continue;
    for (const { line, text } of lines) {
      if (/\bas unknown as\b|\bas never\b/.test(text)) {
        warn(
          `${file}:${line} uses a broad type escape. Prefer a typed adapter or runtime narrowing.`,
        );
      }
    }
  }
}

/**
 * Credential-shaped literals.
 *
 * Full lengths are required deliberately, so the patterns in this file do not match
 * themselves and neither do prose examples in the docs.
 */
const SECRET_PATTERNS = [
  { name: 'GitHub classic PAT', re: /\bghp_[A-Za-z0-9]{36}\b/ },
  { name: 'GitHub fine-grained PAT', re: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/ },
  { name: 'GitHub OAuth/app/refresh token', re: /\bgh[ousr]_[A-Za-z0-9]{36,}\b/ },
  { name: 'npm access token', re: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
];

/**
 * Config files that carry credentials by design, and are tracked, so a literal in
 * one is a commit away from being published.
 */
const CREDENTIAL_CONFIG = /(^|\/)(\.npmrc|\.yarnrc|\.yarnrc\.yml|\.netrc)$/;

/** Anything that sets a secret to a value. */
const SECRET_ASSIGNMENT = /(_authToken|_auth|_password|NPM_TOKEN|NODE_AUTH_TOKEN)\s*[=:]\s*(.+)$/;

/**
 * A value that is a reference rather than a secret: `${VAR}`, `${{ secrets.X }}`,
 * `$VAR`, or an obvious placeholder.
 */
function isIndirect(value) {
  const v = value.trim().replace(/^["']|["'],?$/g, '');
  if (!v) return true;
  if (v.startsWith('${') || v.startsWith('$')) return true;
  if (/^<.*>$/.test(v)) return true; // <REDACTED>, <your-token>
  if (/^(x+|\*+|REDACTED|TODO|CHANGEME|placeholder)$/i.test(v)) return true;
  return false;
}

/**
 * Why this exists: a real `ghp_` token replaced `${SATORI_GH_READONLY_TOKEN}` in the
 * tracked `.npmrc` during a session and no gate noticed. It was one `git add -A` from
 * being published. The gap was simply that nothing looked for a secret — the diff
 * machinery was already adequate, since `parseDiff()` falls back to `git diff <base>`
 * when the tree is dirty and therefore does see uncommitted work.
 *
 * Two scans, because they cover different windows:
 *
 * 1. The diff — anything a change introduces, in any file type. This is the one that
 *    would have caught the incident above.
 * 2. The **working tree**, for credential-bearing config only. This covers what the
 *    diff cannot: a secret already present in `base`, or a run with an explicit
 *    `--head` where the diff is empty. Without it, a token committed to `main` would
 *    stay invisible forever, because no future diff adds it.
 *
 * Only tracked files are scanned. A gitignored `.env` is local by design and is not
 * this gate's business.
 */
function checkHardcodedSecrets() {
  const scanned = new Set();

  /**
   * Comment syntax is per-format, and getting this wrong silently disabled the whole
   * check on the one file type that matters most: in `.npmrc` a registry line *starts*
   * with `//` because the URL is protocol-relative —
   * `//npm.pkg.github.com/:_authToken=…` — so treating `//` as a comment skipped the
   * exact line the leak lives on. Its comment characters are `#` and `;`.
   */
  const isComment = (file, trimmed) => {
    if (CREDENTIAL_CONFIG.test(file) || file.endsWith('.npmrc')) {
      return trimmed.startsWith('#') || trimmed.startsWith(';');
    }
    return (
      trimmed.startsWith('#') ||
      trimmed.startsWith('//') ||
      trimmed.startsWith(';') ||
      trimmed.startsWith('*')
    );
  };

  const inspect = (file, lineNo, text, origin) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isComment(file, trimmed)) {
      // A commented-out secret is still a secret, so only skip comments that carry
      // no credential-shaped literal.
      if (!SECRET_PATTERNS.some((p) => p.re.test(text))) return;
    }
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(text)) {
        fail(
          `${file}:${lineNo} contains what looks like a ${name} (${origin}). ` +
            `Credentials come from the environment only — use \${ENV_VAR}. Rotate it: it is in your shell history and reflog.`,
        );
        return;
      }
    }
    const assignment = SECRET_ASSIGNMENT.exec(trimmed);
    if (assignment && !isIndirect(assignment[2])) {
      fail(
        `${file}:${lineNo} sets ${assignment[1]} to a literal value (${origin}). ` +
          `Use a \${ENV_VAR} reference so the value never lands in a file.`,
      );
    }
  };

  // 1. Everything added in the diff, any file type.
  for (const [file, lines] of addedLinesByFile) {
    // This file necessarily contains the patterns it looks for.
    if (file === 'scripts/review-guardrails.mjs') continue;
    for (const { line, text } of lines) inspect(file, line, text, 'added in this diff');
  }

  // 2. Credential config in the working tree, committed or not.
  let tracked = [];
  try {
    tracked = git(['ls-files']).split('\n').filter(Boolean);
  } catch {
    return;
  }
  for (const file of tracked) {
    if (!CREDENTIAL_CONFIG.test(file)) continue;
    if (!fileExists(file)) continue;
    if (scanned.has(file)) continue;
    scanned.add(file);
    const lines = read(file).split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      inspect(file, i + 1, lines[i], 'working tree, tracked credential config');
    }
  }
}

/**
 * Every asset glob in the base build options must also be in the `development` configuration.
 *
 * Angular **replaces** a configuration's `assets` array; it does not merge it with the base
 * one. That cost this programme a full debugging session: only the base array carried
 * adf-core's translation glob, so every dev server ever started on this branch 404ed the
 * catalogue while the production build shipped it correctly. The symptom — one accessibility
 * label rendering as a raw key — was diagnosed as a stale dev server needing a restart, which
 * could never have fixed it.
 *
 * The `development` config is allowed *extra* entries (it has its own bootstrap.json glob);
 * it may not be missing any.
 */
function checkAngularDevAssets() {
  const file = 'angular.json';
  if (!fileExists(file)) return;

  /** @type {any} */
  let doc;
  try {
    doc = JSON.parse(read(file));
  } catch (error) {
    fail(`${file} is not valid JSON: ${error instanceof Error ? error.message : error}`);
    return;
  }

  for (const [projectName, project] of Object.entries(doc.projects ?? {})) {
    const targets = /** @type {any} */ (project).targets ?? /** @type {any} */ (project).architect;
    for (const [targetName, target] of Object.entries(targets ?? {})) {
      const base = /** @type {any} */ (target).options?.assets;
      if (!Array.isArray(base)) continue;
      // `ignore` is part of the identity, not decoration. Compared on glob/input/output alone,
      // an entry that excludes a file in the base array and not in `development` reads as
      // identical while the two configurations serve different files — which is the same class
      // of divergence this whole check exists for, one field further in.
      const key = (entry) =>
        typeof entry === 'string'
          ? entry
          : [
              entry.glob,
              entry.input,
              entry.output ?? '',
              [...(entry.ignore ?? [])].sort().join(','),
            ].join('|');

      for (const [configName, config] of Object.entries(
        /** @type {any} */ (target).configurations ?? {},
      )) {
        const override = /** @type {any} */ (config).assets;
        if (!Array.isArray(override)) continue; // inherits the base array; nothing to diverge
        const present = new Set(override.map(key));
        for (const entry of base) {
          if (present.has(key(entry))) continue;
          fail(
            `${file}: ${projectName}:${targetName} configuration "${configName}" overrides ` +
              `assets but omits ${JSON.stringify(entry)}. Angular replaces the array rather ` +
              'than merging it, so this asset is served by the base config and 404s here.',
          );
        }
      }
    }
  }
}

/**
 * Every adf-hx marker in the codebase must have a row in `docs/adf-hx-workarounds.md`, and every
 * row naming a code site must have its marker there.
 *
 * The register exists so the cost of adopting adf-hx is countable. A markdown list with no gate
 * decays the moment someone adds a thirteenth workaround and forgets the row — the programme has
 * three gates that exist for exactly that reason, so this one does too.
 *
 * Checked in both directions, because they catch different decay:
 *
 * - **marker with no row** — a workaround was added and never registered. The common case.
 * - **row with no marker** — a workaround was removed, or the row points at the wrong file, so the
 *   register overstates what the code does. Rows whose site is a `.json` file are exempt: JSON
 *   cannot carry a comment, and `— (config)` in the row declares that.
 * - **marker kind disagreeing with its ID** — `MISSING(adf-hx): W3` is a mislabelled category, and
 *   the categories have different audiences, so the mislabel matters.
 */
function checkAdfHxWorkaroundIds() {
  const register = 'docs/adf-hx-workarounds.md';
  if (!fileExists(register)) {
    fail(`${register} does not exist, but the adf-hx marker gate depends on it.`);
    return;
  }

  const KIND_BY_LETTER = {
    W: 'WORKAROUND(adf-hx)',
    M: 'MISSING(adf-hx)',
    R: 'REFUSES',
    D: 'DEGRADED(adf-hx)',
  };
  const MARKER =
    /(WORKAROUND\(adf-hx\)|MISSING\(adf-hx\)|REFUSES|DEGRADED\(adf-hx\)):\s*([WMRD]\d+)/g;

  // ---- the register's rows ----
  /** @type {Map<string, { configOnly: boolean, line: number }>} */
  const rows = new Map();
  const registerLines = read(register).split('\n');
  registerLines.forEach((text, index) => {
    // A table row whose first cell is an id: `| W1  | … |`
    const match = /^\|\s*([WMRD]\d+)\s*\|/.exec(text);
    if (!match) return;
    const id = match[1];
    if (rows.has(id)) {
      fail(`${register}:${index + 1} declares ${id} twice. An id must identify one row.`);
      return;
    }
    // Two documented exemptions from the "must have a marker" rule:
    //   `(config)` — the site is a `.json` file, which cannot hold a comment.
    //   `(fixed`   — the workaround is gone. The register keeps the row on purpose, because the
    //                history of what adf-hx cost is the point of the file, but there is no longer
    //                a marker to find.
    rows.set(id, {
      configOnly: text.includes('(config)') || text.includes('(fixed'),
      line: index + 1,
    });
  });

  if (rows.size === 0) {
    fail(`${register} has no id rows, so the marker gate cannot verify anything.`);
    return;
  }

  // ---- the codebase's markers ----
  /** @type {Map<string, string[]>} */
  const markerSites = new Map();
  // `--others --exclude-standard` as well as tracked, because a workaround introduced in a
  // **new** file is invisible to `ls-files` alone. That gap surfaced the first time this gate ran
  // against a new pager component: the row was flagged as having no marker while the marker was
  // sitting in an untracked file. Gitignored files stay excluded — they are not the codebase.
  const sources = git(['ls-files', '--cached', '--others', '--exclude-standard'])
    .split('\n')
    .filter(Boolean)
    // The register and the findings document quote marker names as documentation, and the gate's
    // own source contains the pattern. Scanning them would make the gate assert about itself.
    .filter((file) => !file.startsWith('docs/') && file !== 'scripts/review-guardrails.mjs')
    .filter((file) => /\.(ts|mts|mjs|js|html|scss)$/.test(file));

  for (const file of sources) {
    if (!fileExists(file)) continue;
    const body = read(file);
    for (const found of body.matchAll(MARKER)) {
      const [, kind, id] = found;
      const expected = KIND_BY_LETTER[id[0]];
      if (kind !== expected) {
        fail(
          `${file} marks ${id} as \`${kind}:\` but its id belongs to category ${id[0]}, whose ` +
            `marker is \`${expected}:\`. The categories have different audiences.`,
        );
      }
      if (!markerSites.has(id)) markerSites.set(id, []);
      markerSites.get(id).push(file);
    }
  }

  // ---- forward: every marker has a row ----
  for (const [id, sites] of markerSites) {
    if (rows.has(id)) continue;
    fail(
      `${sites[0]} carries marker ${id}, which has no row in ${register}. Add the row, or use an ` +
        'existing id if this is another site for the same workaround.',
    );
  }

  // ---- reverse: every non-config row has a marker ----
  for (const [id, row] of rows) {
    if (row.configOnly || markerSites.has(id)) continue;
    fail(
      `${register}:${row.line} declares ${id} but no source file carries that marker. Either the ` +
        'workaround is gone — strike the row through rather than deleting it — or the row names ' +
        'the wrong site.',
    );
  }
}

/**
 * No `@alfresco/*` type may be reachable from a library's public barrel.
 *
 * `docs/adf-hx-beta-plan.md` sets this as a **hard rule** for Phase 3 — "adf-hx types must never
 * appear in our public API signatures, enforced by a lint or API-extractor gate" — and until now
 * only the convention existed. Nothing would have caught a leak.
 *
 * Two distinct harms, which is why the check is on *reachability from the barrel* rather than on
 * signatures alone:
 *
 * 1. **API leak.** An adf-hx type in our public surface makes every consumer depend on adf-hx's
 *    versioning, which is the opposite of what the four-layer contract promises.
 * 2. **Bundle boundary.** A barrel is one module. The moment anything it re-exports imports
 *    `@alfresco/*`, adf-core becomes reachable from the app shell and lands in the **initial**
 *    bundle — measured at 1.70 → 2.65 MB when that happened, which is why
 *    `libs/shared/adf-hx-bridge/src/providers.ts` exists as a separate entry point.
 *
 * The bridge's `providers.ts` is the sanctioned exception: it is a secondary entry point that only
 * the lazily-loaded POC route imports, and its whole purpose is to hold the adf-hx-facing code.
 */
function checkNoAdfHxInPublicApi() {
  // Scoped to the two heavy packages, deliberately. `@alfresco/adf-extensions` is also an
  // `@alfresco` scope, but it is a small library this repo took as a production dependency by a
  // Phase 2 decision, `libs/shared/extensions` imports two functions from it and re-exports
  // nothing, so it leaks no type and moves no bundle. Failing on it would make the gate noise.
  const ALFRESCO = /from\s+['"]@alfresco\/(adf-hx-content-services|adf-core)/;

  /**
   * Known, deliberate exceptions — each with the reason, because an allowlist without one becomes
   * a dumping ground.
   */
  const ALLOWED = new Map([
    [
      'libs/shared/adf-hx-bridge/src/lib/ui/hxp-browse-nav-drawer/hxp-browse-nav-drawer.component.ts',
      "The app shell's nav drawer renders adf-hx's document tree, so the shell genuinely needs " +
        'adf-hx eagerly. This is a product decision, not a barrel accident, and it means the eager ' +
        'bundle has TWO causes — this and CONTEXT_MENU_ACTIONS_PROVIDERS in app.config.ts. Removing ' +
        'it requires deferring the tree behind an outlet, which is Phase 4 work.',
    ],
  ]);
  const barrels = git(['ls-files', '--cached', '--others', '--exclude-standard'])
    .split('\n')
    .filter((file) => /^libs\/.+\/src\/index\.ts$/.test(file));

  if (barrels.length === 0) {
    fail('No library barrels found, so the adf-hx public-API gate cannot verify anything.');
    return;
  }

  for (const barrel of barrels) {
    if (!fileExists(barrel)) continue;
    const seen = new Set();
    /** @type {{ file: string, from: string[] }[]} */
    const offenders = [];

    // Walk the barrel's re-export graph. Depth matters: the leak that cost 0.95 MB of initial
    // bundle was two hops away — the barrel exported a providers file which imported adf-hx.
    const queue = [{ file: barrel, path: [barrel] }];
    while (queue.length > 0) {
      const { file, path } = queue.shift();
      if (seen.has(file)) continue;
      seen.add(file);
      if (!fileExists(file)) continue;
      const body = read(file);

      if (ALFRESCO.test(body) && file !== barrel) {
        offenders.push({ file, from: path });
        continue; // one report per reachable file is enough
      }

      for (const match of body.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
        const target = join(dirname(file), match[1]);
        const rel = relative(repoRoot, join(repoRoot, target));
        for (const candidate of [`${rel}.ts`, join(rel, 'index.ts')]) {
          if (fileExists(candidate) && !seen.has(candidate)) {
            queue.push({ file: candidate, path: [...path, candidate] });
          }
        }
      }
    }

    for (const offender of offenders) {
      if (ALLOWED.has(offender.file)) continue;
      fail(
        `${offender.file} imports from \`@alfresco/*\` and is reachable from the public barrel ` +
          `${barrel} via ${offender.from.slice(1).join(' -> ') || 'a direct export'}. That both ` +
          'leaks an adf-hx type into our public API and makes adf-core reachable from anything ' +
          'importing the barrel, which puts it in the initial bundle. Move it behind a secondary ' +
          'entry point, as `libs/shared/adf-hx-bridge/src/providers.ts` does.',
      );
    }
  }
}

/**
 * A newly added hard-coded user-facing string in a template.
 *
 * The extraction this guards is deliberately unfinished — NXSAT-284 carries roughly 750
 * hard-coded text nodes and 400 literal `aria-label`/`title` attributes across thirteen
 * projects. Without a gate, that backlog grows faster than it shrinks, which is what the ticket
 * means by "the extraction regresses within weeks".
 *
 * ## Diff-scoped, and that is a decision rather than an oversight
 *
 * `checkThemeTokens` is diff-scoped; `checkBlobUrlLifecycle` was deliberately converted to
 * repo-wide, because diff-scoping permanently exempts every pre-existing violation and four real
 * leaks hid behind exactly that. Both precedents are in this file and they point opposite ways.
 *
 * This one is diff-scoped **because repo-wide would be red on arrival in thirteen projects**, and
 * a gate that cannot be made green is a gate someone switches off. NXSAT-284/B6 flips it to
 * repo-wide over the core slice once the extraction is done. Until then the honest description is:
 * this stops the backlog growing, it does not measure it.
 *
 * ## The heuristic, and why it is narrow
 *
 * Only text that looks like a sentence a user reads — it starts with a capital letter and carries
 * at least two letters. That excludes the things that are not prose but live in the same
 * position: `<mat-icon>search</mat-icon>` ligature names, CSS values, numbers and single
 * characters are all lowercase or too short.
 *
 * There is no suppression comment, on purpose. The remedy for a false positive is to route the
 * string through the translate pipe, and doing that to a string that did not strictly need it
 * costs one catalogue entry and is never wrong. A suppression marker would be the cheaper path
 * and would become the default one.
 */
function checkNoHardcodedUiText() {
  /** Attributes whose literal value is read or announced to a user. */
  const TEXT_ATTRIBUTES = /\b(placeholder|matTooltip|alt|aria-label|title)="([^"<>{}]*)"/g;
  /** Element text on the same line as its tags: `>Some text<`. */
  const ELEMENT_TEXT = />([^<>{}]*)</g;

  /** Prose a user reads, as opposed to an icon ligature, a CSS value or a number. */
  function isDisplayText(value) {
    const text = value.trim();
    if (text.length < 2) return false;
    if (!/^[A-Z]/.test(text)) return false;
    return (text.match(/[A-Za-z]/g) ?? []).length >= 2;
  }

  for (const [file, lines] of addedLinesByFile) {
    if (!/^(libs|apps)\/.+\.html$/.test(file)) continue;

    for (const { line, text } of lines) {
      const trimmed = text.trim();
      if (!trimmed || trimmed.startsWith('<!--')) continue;
      // A line already routing through the pipe is the shape we are asking for. Checking the
      // whole line rather than the match keeps a translated attribute from tripping on its
      // neighbour's literal text.
      if (trimmed.includes('| translate')) continue;

      /** @type {{ what: string, value: string } | null} */
      let offence = null;

      for (const [, attribute, value] of trimmed.matchAll(TEXT_ATTRIBUTES)) {
        if (!isDisplayText(value)) continue;
        offence = { what: `${attribute}="${value}"`, value };
        break;
      }
      if (!offence) {
        for (const [, value] of trimmed.matchAll(ELEMENT_TEXT)) {
          if (!isDisplayText(value)) continue;
          offence = { what: `the text \`${value.trim()}\``, value };
          break;
        }
      }
      if (!offence) continue;

      fail(
        `${file}:${line} introduces ${offence.what} as hard-coded English.\n` +
          "    Add a key to the owning project's `i18n/en.json` and bind it with the translate " +
          "pipe — `{{ 'browse.details.show' | translate }}` for text, " +
          '`[attr.aria-label]="\'…\' | translate"` for an accessible name.\n' +
          '    Add the translator context alongside it in `i18n/en.context.json`: INFO-144 ' +
          'requires every string to carry enough context to be translated without asking, and ' +
          'acronyms to be expanded.\n' +
          '    If the key names a control, it must also go in `en-fallback.ts` — see ' +
          '`checkAccessibleNameFallbacks`.',
      );
    }
  }
}

/**
 * A newly added hard-coded user-facing string in a **descriptor**, not a template.
 *
 * ## The category the template guardrail structurally cannot see
 *
 * Nav entries, packaged actions, column definitions and drawer links are data, not markup:
 *
 *     { id: 'app.navbar.browse', label: 'Browse', icon: 'folder' }
 *
 * rendered as `{{ item.label }}`. `checkNoHardcodedUiText` looks at added lines in `.html` and
 * sees an interpolation, which is the shape it is asking for — so every one of these passes it,
 * and no amount of template extraction ever reaches them.
 *
 * They were also absent from the extraction estimate, which counted template literals only.
 * Measured when this check was written: **294** across sixteen projects, against roughly 1350
 * in templates. The single most visible text in the product — the left navigation — is in this
 * category, which is how a screenshot of the application in French came to show one French
 * string and an entirely English nav.
 *
 * ## Scope and the properties chosen
 *
 * Diff-scoped, for the same reason as the template check: repo-wide would be red on arrival.
 *
 * `label`, `placeholder`, `ariaLabel` and `tooltip` only. These are unambiguously UI chrome in
 * every use in this repository. `title` and `description` are deliberately **excluded** despite
 * catching real strings, because they are also the names of Nuxeo document properties and of
 * schema documentation, so flagging them would mean judgement calls in review — and a check
 * that argues with you is a check that gets disabled.
 *
 * ## Fixing one
 *
 * A descriptor is Layer 1 data, so the fix is not to wrap it in a pipe at the definition. Put a
 * translation **key** in the descriptor and apply the pipe where it renders
 * (`{{ item.label | translate }}`). That keeps the descriptor addressable from a manifest and
 * makes the string translatable, which the current shape allows only one of.
 */
function checkNoHardcodedDescriptorText() {
  // `label: 'Browse'` and friends. Single-quoted only: this repo's formatter produces single
  // quotes, and a template literal usually means interpolation, which is not a fixed string.
  const DESCRIPTOR_TEXT = /\b(label|placeholder|ariaLabel|tooltip)\s*:\s*'([A-Z][^']*)'/g;

  for (const [file, lines] of addedLinesByFile) {
    if (!/^(libs|apps)\/.+\.ts$/.test(file)) continue;
    if (/\.spec\.ts$/.test(file)) continue;

    // A `label` paired with a `labelKey` is the **fixed** shape, not a violation. The key is
    // what renders and the literal is the fallback, which is the whole point of the two-field
    // contract — see `NavItemDescriptor.labelKey`. Read from the file rather than the diff
    // because the two lines are separate additions and a line-at-a-time check cannot see the
    // pair.
    const body = fileExists(file) ? read(file).split('\n') : [];
    const pairedWithKey = (lineNumber) => {
      const near = body.slice(Math.max(0, lineNumber - 3), lineNumber + 2).join('\n');
      return /\blabelKey\s*:/.test(near);
    };

    for (const { line, text } of lines) {
      const trimmed = text.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      if (pairedWithKey(line)) continue;

      for (const [, property, value] of trimmed.matchAll(DESCRIPTOR_TEXT)) {
        if ((value.match(/[A-Za-z]/g) ?? []).length < 2) continue;
        fail(
          `${file}:${line} introduces \`${property}: '${value}'\` — a user-facing string in a ` +
            'descriptor.\n' +
            '    Templates are not the only place these live, and the translate pipe cannot ' +
            'reach a descriptor. Put a key here and apply the pipe where it renders:\n' +
            `      { …, ${property}: 'nav.browse' }   →   {{ item.${property} | translate }}\n` +
            '    That keeps the descriptor manifest-addressable and makes the string ' +
            'translatable; the literal form allows only the first.',
        );
        break; // one report per line is enough
      }
    }
  }
}

/**
 * Our own translation catalogues: valid JSON, no blank values, and the same keys in every locale.
 *
 * ## Why each check is here
 *
 * **Parseable.** A catalogue with a trailing comma is not a style problem here — the Crowdin sync
 * rejects the file, so a malformed catalogue breaks the localization pipeline rather than the
 * build. `npm run build` never reads these; they are fetched at runtime. So nothing else in the
 * toolchain parses them.
 *
 * **No blank values.** An empty string is how the most widespread accessibility violation in this
 * product happened: `sat.platform-nav.expand` was deliberately blanked to suppress a duplicate
 * tooltip, and because upstream binds one key to both the tooltip and the accessible name, every
 * nav toggle rendered `aria-label=""` — axe `button-name`, critical, on seven of seven surfaces.
 * It stood for weeks, because an empty accessible name is invisible to anyone not using a screen
 * reader. A blank value is never what was meant; use a real string or remove the key.
 *
 * **Key parity.** A Crowdin pull that drops or renames a key leaves a locale silently falling
 * through to the reference language for that string. Comparing each locale's flattened key set
 * against `en.json` makes that a build failure rather than a bug report from a French customer.
 *
 * ## Scope
 *
 * `apps/` and `libs/` only. `node_modules` holds **48** upstream catalogues at exactly the same
 * relative shape — `.../i18n/en.json` from adf-core, both adf-hx bundles and satori-ui — and they
 * are not ours to validate. `walk()` prunes `node_modules` and `dist` already; the directory
 * roots keep it honest even if that changes.
 *
 * Parity needs two locales to assert anything, and for most of this repository's life there has
 * been one. That is not a silent pass: the count of comparisons is reported when it is zero, and
 * `review-guardrails.selftest.mjs` exercises parity against fixtures regardless of what the
 * repository currently ships.
 */
/**
 * `zz` is the generated pseudo-locale, not a shipped one.
 *
 * `tools/i18n/pseudo-locale.mjs` derives it from `en.json` on demand and `.gitignore` keeps it
 * out of the tree; it exists only while someone is auditing for strings no catalogue supplies.
 * Every locale check would otherwise treat it as a customer-facing language — demanding key
 * parity with a file that is regenerated from `en.json` anyway, and demanding Angular locale
 * data for a locale Angular has never heard of.
 */
const GENERATED_LOCALES = new Set(['zz']);
const isGeneratedLocale = (path) =>
  GENERATED_LOCALES.has(/(^|\/)i18n\/([a-z]{2}(?:-[A-Za-z]{2,4})?)\.json$/.exec(path)?.[2] ?? '');

function checkTranslationCatalogues() {
  const isCatalogue = (path) =>
    /(^|\/)i18n\/[a-z]{2}(-[A-Za-z]{2,4})?\.json$/.test(path) && !isGeneratedLocale(path);
  const catalogues = [...walk('apps', isCatalogue), ...walk('libs', isCatalogue)];

  if (catalogues.length === 0) {
    fail(
      'No translation catalogues were found under apps/ or libs/, so this gate asserted nothing. ' +
        'Check the `i18n/<locale>.json` glob before trusting a pass.',
    );
    return;
  }

  /** Flattens to dotted keys, mirroring `flattenCatalogue` in `app-translate-loader.ts`. */
  function flatten(value, prefix, out) {
    for (const [key, entry] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof entry === 'string') out.set(path, entry);
      else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        flatten(entry, path, out);
      }
    }
    return out;
  }

  /** @type {Map<string, Map<string, string>>} */
  const parsed = new Map();

  for (const catalogue of catalogues) {
    const body = read(catalogue);

    if (!body.endsWith('\n')) {
      fail(
        `${catalogue} has no trailing newline.\n` +
          '    Crowdin rewrites these files on every pull, so without one each sync produces a ' +
          'spurious last-line diff that hides the real change.',
      );
    }

    let json;
    try {
      json = JSON.parse(body);
    } catch (error) {
      fail(
        `${catalogue} is not valid JSON: ${error.message}\n` +
          '    The Crowdin sync rejects malformed catalogues, so this breaks localization rather ' +
          'than the build, and nothing else in the toolchain parses these files.',
      );
      continue;
    }

    const flat = flatten(json, '', new Map());
    parsed.set(catalogue, flat);

    for (const [key, value] of flat) {
      if (value.trim() !== '') continue;
      fail(
        `${catalogue} maps \`${key}\` to an empty string. A blank translation renders as a blank ` +
          'label — and where the key is bound to an `aria-label`, as a control with no accessible ' +
          'name, which axe reports as `button-name` (critical) and which is invisible without a ' +
          'screen reader. Use a real string or remove the key.',
      );
    }
  }

  // ---- parity, per i18n directory ----
  let comparisons = 0;
  const directories = new Set(catalogues.map((path) => path.slice(0, path.lastIndexOf('/'))));

  for (const directory of directories) {
    const reference = `${directory}/en.json`;
    const referenceKeys = parsed.get(reference);
    if (!referenceKeys) {
      // An unparseable en.json is already reported above, by name and with the parse error.
      // Reporting it a second time as "no en.json" would be worse than saying nothing: the file
      // is right there, so the reader goes looking for a missing-file problem that does not
      // exist. One defect, one message.
      if (fileExists(reference)) continue;
      fail(
        `${directory} holds translation catalogues but no en.json. English is the reference ` +
          'language and the Crowdin source of truth; without it there is nothing to compare ' +
          'against and no locale can fall back.',
      );
      continue;
    }

    for (const [catalogue, keys] of parsed) {
      if (catalogue === reference || !catalogue.startsWith(`${directory}/`)) continue;
      comparisons += 1;

      const missing = [...referenceKeys.keys()].filter((key) => !keys.has(key));
      const extra = [...keys.keys()].filter((key) => !referenceKeys.has(key));

      if (missing.length) {
        // A WARNING, not a failure, and the asymmetry with `extra` below is deliberate.
        //
        // A missing key is **handled**: `setFallbackLang('en')` means it renders the English
        // string, so the application is correct and merely untranslated. Failing on it would
        // mean every English string extracted has to be translated in the same commit — 1224
        // of them at the last count — by whoever ran the codemod. That is not who translates
        // this product. Crowdin and the translation crew own every non-English catalogue, per
        // the HXP standard, and inventing the content here to satisfy a gate would put
        // unreviewed machine translation in front of customers while *looking* finished.
        //
        // An extra key stays a hard failure: nothing renders it, nobody is paying attention to
        // it, and the translation crew is still being charged to maintain it.
        warn(
          `${catalogue} is missing ${missing.length} key(s) present in ${reference}: ` +
            `${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', …' : ''}\n` +
            '    Those strings render in English for this locale, which is the fallback working ' +
            'as designed. Never hand-edit a non-English catalogue — Crowdin owns them and ' +
            'overwrites edits on the next pull — so the fix is a Crowdin sync, not a local patch.',
        );
      }
      if (extra.length) {
        fail(
          `${catalogue} carries ${extra.length} key(s) absent from ${reference}: ` +
            `${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ', …' : ''}\n` +
            '    A key no longer in the reference is dead weight the translation crew is still ' +
            'paying to maintain. Push sources with `--delete-obsolete` to clear it.',
        );
      }
    }
  }

  if (comparisons === 0 && catalogues.length > 1) {
    fail(
      `${catalogues.length} catalogues were found but none was compared against an en.json ` +
        'sibling, so the parity half of this gate asserted nothing.',
    );
  }
}

/**
 * Translator context exists for every string, and for no string that no longer exists.
 *
 * INFO-144 (*Internationalization Strategy for software*) is unambiguous about this: "All strings
 * MUST provide this context as developers cannot know when this information is needed", and "All
 * acronyms or abbreviations MUST be expanded and explained in the comment". Its worked examples
 * are the argument — "Display Manager Failure" cannot be translated without knowing whether
 * "Display" is a noun or a verb, and Japanese needs different words for "from" depending on
 * whether a date range or an email sender is meant.
 *
 * Context lives in a sibling `en.context.json` rather than inside the catalogue, so that it stays
 * in version control next to the string and survives a change of translation tool — the Crowdin
 * RFC makes the same point about keeping the source of truth in the repository rather than in the
 * vendor.
 *
 * Only key parity is enforced. Whether a given sentence of context is *sufficient* is a judgement
 * a script cannot make; what a script can do is guarantee that a new string cannot be added
 * without someone writing something, and that context for a deleted string does not linger and
 * mislead. Keys beginning with `$` are file-level metadata, not strings.
 */
function checkTranslationContext() {
  const isReference = (path) => /(^|\/)i18n\/en\.json$/.test(path);
  const references = [...walk('apps', isReference), ...walk('libs', isReference)];

  if (references.length === 0) {
    fail(
      'No `i18n/en.json` was found under apps/ or libs/, so the translator-context gate ' +
        'asserted nothing.',
    );
    return;
  }

  let compared = 0;
  for (const reference of references) {
    const contextFile = reference.replace(/en\.json$/, 'en.context.json');
    if (!fileExists(contextFile)) {
      fail(
        `${reference} has no sibling en.context.json.\n` +
          '    INFO-144 requires every string to carry translator context: acronyms expanded, ' +
          'product names flagged as do-not-translate, placeholders explained, and enough to ' +
          'disambiguate a word that is a noun in one reading and a verb in another.',
      );
      continue;
    }

    let catalogue;
    let context;
    try {
      catalogue = JSON.parse(read(reference));
      context = JSON.parse(read(contextFile));
    } catch {
      // `checkTranslationCatalogues` reports an unparseable catalogue by name; an unparseable
      // context file is reported here rather than silently skipped.
      if (!fileExists(contextFile)) continue;
      try {
        JSON.parse(read(contextFile));
      } catch (error) {
        fail(`${contextFile} is not valid JSON: ${error.message}`);
      }
      continue;
    }

    const keys = new Set();
    (function collect(value, prefix) {
      for (const [key, entry] of Object.entries(value)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof entry === 'string') keys.add(path);
        else if (entry && typeof entry === 'object') collect(entry, path);
      }
    })(catalogue, '');

    const documented = new Set(Object.keys(context).filter((key) => !key.startsWith('$')));
    compared += 1;

    const undocumented = [...keys].filter((key) => !documented.has(key));
    const orphaned = [...documented].filter((key) => !keys.has(key));

    if (undocumented.length) {
      fail(
        `${contextFile} is missing context for ${undocumented.length} string(s) in ${reference}: ` +
          `${undocumented.slice(0, 8).join(', ')}${undocumented.length > 8 ? ', …' : ''}\n` +
          '    A translator handed only the English text cannot ask a question; INFO-144 makes ' +
          'the context mandatory for that reason. Say what part of speech it is, what the ' +
          'surrounding UI is, expand any acronym, and name anything that must stay in English.',
      );
    }
    if (orphaned.length) {
      fail(
        `${contextFile} documents ${orphaned.length} key(s) that ${reference} no longer has: ` +
          `${orphaned.slice(0, 8).join(', ')}${orphaned.length > 8 ? ', …' : ''}\n` +
          '    Stale context outlives the string it described and then describes the wrong one ' +
          'after a key is reused. Delete it with the key.',
      );
    }
  }

  if (compared === 0) {
    fail(
      `${references.length} reference catalogue(s) were found but none was compared against a ` +
        'context file, so this gate asserted nothing.',
    );
  }
}

/**
 * Every locale we ship a catalogue for has Angular locale data registered.
 *
 * Translating strings and formatting dates are separate mechanisms. `DatePipe`, `DecimalPipe`
 * and `CurrencyPipe` read Angular's per-locale data, which ships in `@angular/common/locales`
 * and must be registered explicitly; only `en-US` is built in. Asked to format in an
 * unregistered locale a pipe does not degrade — it throws `NG0701`, surfacing as
 * `NG02100: InvalidPipeArgument` wherever a date renders.
 *
 * This is gated because the symptom appears nowhere near the cause. Adding `es.json` is an
 * obviously-complete-looking change; the failure arrives later, as a pipe error on a document
 * list, for a reason that has nothing to do with the file that was added.
 *
 * It is also how the defect was found rather than shipped: adf-core was forcing the app back to
 * `en` on every adf-hx surface (`W14`), so no pipe was ever handed `fr` and the missing data was
 * invisible. Fixing that produced thirty-six console errors on the first French run. **The i18n
 * bug was hiding the l10n bug**, which is the argument for checking the pair rather than either
 * half.
 *
 * `en` is exempt: Angular bundles it.
 */
function checkLocaleDataRegistered() {
  const registration = 'apps/nuxeo-ui/src/app/i18n/register-locale-data.ts';
  if (!fileExists(registration)) {
    fail(
      `${registration} does not exist, but every non-English catalogue needs Angular locale ` +
        'data registered there or its dates throw NG0701 at runtime.',
    );
    return;
  }

  // `['fr', localeFr],` — the locale is the quoted first element of each tuple.
  const registered = new Set(
    [...read(registration).matchAll(/\[\s*'([a-z]{2}(?:-[A-Za-z]{2,4})?)'\s*,/g)].map(
      ([, locale]) => locale,
    ),
  );
  if (registered.size === 0) {
    fail(
      `${registration} yielded no registered locales, so this gate asserted nothing. Its ` +
        'literal shape must have changed — update the parser here before trusting a pass.',
    );
    return;
  }

  const isCatalogue = (path) =>
    /(^|\/)i18n\/[a-z]{2}(-[A-Za-z]{2,4})?\.json$/.test(path) && !isGeneratedLocale(path);
  const catalogues = [...walk('apps', isCatalogue), ...walk('libs', isCatalogue)];
  const shipped = new Set(
    catalogues
      .map((path) => path.slice(path.lastIndexOf('/') + 1).replace(/\.json$/, ''))
      .filter((locale) => locale !== 'en'),
  );

  for (const locale of shipped) {
    if (registered.has(locale)) continue;
    fail(
      `A catalogue ships for "${locale}" but ${registration} registers no Angular locale data ` +
        `for it.\n    Dates, numbers and currency will throw NG0701 the moment anything ` +
        'formats in that locale — and because that happens wherever a date renders, the error ' +
        `will not look like it came from adding ${locale}.json.\n    Import ` +
        `\`@angular/common/locales/${locale}\` and add it to LOCALE_DATA.`,
    );
  }

  for (const locale of registered) {
    if (shipped.has(locale)) continue;
    warn(
      `${registration} registers locale data for "${locale}" but no catalogue ships for it. ` +
        'Harmless, but it is dead weight in the bundle.',
    );
  }
}

/**
 * Every key our templates bind to an accessible name must survive a failed catalogue fetch.
 *
 * `AppTranslateLoader` falls back to `EN_FALLBACK_TRANSLATIONS` when it cannot fetch the app
 * catalogue, and that map is **deliberately partial** — visible text degrading to a raw key is
 * ugly, an accessible name degrading to one is a WCAG 4.1.2 failure. So the rule is not "mirror
 * the catalogue"; it is "mirror the keys that name controls".
 *
 * `settings.themes.search` was the live gap. It is the `[attr.aria-label]` of the themes
 * toolbar's search button, it was in the shipped catalogue and absent from the fallback, so a
 * failed fetch named that control `settings.themes.search`.
 *
 * ## Why nothing else catches this
 *
 * axe checks that a control **has** an accessible name, not that the name is words. A raw key is
 * a perfectly good non-empty string. The blank-name variant of the same defect (finding 4.6) was
 * caught by axe in a single scan; this variant sat through the same audit untouched. The
 * accessibility gates are not a substitute for this check, which is why it is a separate one.
 *
 * Only keys the app's own catalogue owns are in scope. Upstream's SCREAMING_CASE keys arrive
 * from seeded translation folders that the fallback map has no business duplicating.
 */
function checkAccessibleNameFallbacks() {
  const fallbackFile = 'apps/nuxeo-ui/src/app/i18n/en-fallback.ts';
  const catalogueFile = 'apps/nuxeo-ui/public/i18n/en.json';
  for (const required of [fallbackFile, catalogueFile]) {
    if (!fileExists(required)) {
      fail(`${required} does not exist, but the accessible-name fallback gate depends on it.`);
      return;
    }
  }

  /** `'key': 'value'` pairs from the fallback map's object literal. */
  const fallback = new Map(
    [...read(fallbackFile).matchAll(/'([^']+)':\s*'([^']*)'/g)].map(([, key, value]) => [
      key,
      value,
    ]),
  );
  if (fallback.size === 0) {
    fail(
      `${fallbackFile} yielded no key/value pairs, so this gate asserted nothing. The map's ` +
        'literal shape must have changed — update the parser here before trusting a pass.',
    );
    return;
  }

  // Keys the app catalogue owns. A key bound in a template but absent here belongs to an
  // upstream catalogue and is out of scope.
  //
  // Parsed defensively. An unguarded `JSON.parse` here threw an uncaught `SyntaxError` on a
  // malformed catalogue, which killed the process before the `failures` array was printed — so a
  // trailing comma in `en.json` produced a stack trace and **discarded every other guardrail's
  // diagnostics**, including `checkTranslationCatalogues`'s own clean report of the same file.
  // Found by running that exact negative control. A guardrail that can crash is a guardrail that
  // can silence the others.
  let catalogue;
  try {
    catalogue = JSON.parse(read(catalogueFile));
  } catch {
    // Not reported here: `checkTranslationCatalogues` names the file and the parse error, and one
    // defect should produce one message.
    return;
  }

  const owned = new Set();
  (function collect(value, prefix) {
    for (const [key, entry] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof entry === 'string') owned.add(path);
      else if (entry && typeof entry === 'object') collect(entry, path);
    }
  })(catalogue, '');

  const templates = git(['ls-files', '--cached', '--others', '--exclude-standard'])
    .split('\n')
    .filter((file) => /^(libs|apps)\/.+\.html$/.test(file));

  // `[attr.aria-label]`, `[aria-label]`, `[attr.title]` and `[title]` bound to a single
  // translate-piped literal key. A ternary or a concatenation is not matched, deliberately:
  // this stays a check with no judgement calls in it.
  const BINDING = /\[(?:attr\.)?(aria-label|title)\]="\s*'([^']+)'\s*\|\s*translate\s*"/g;

  // Collected per key rather than per occurrence. `nav.loading` names nine spinners in one
  // template, and nine identical paragraphs asking for one catalogue entry is how a gate earns
  // the reputation that gets it switched off. One missing key, one message, with a count.
  /** @type {Map<string, { attribute: string, sites: string[] }>} */
  const offences = new Map();
  let bindings = 0;

  for (const template of templates) {
    if (!fileExists(template)) continue;
    for (const [, attribute, key] of read(template).matchAll(BINDING)) {
      bindings += 1;
      if (!owned.has(key)) continue;
      if (fallback.has(key) && fallback.get(key).trim() !== '') continue;

      if (!offences.has(key)) offences.set(key, { attribute, sites: [] });
      offences.get(key).sites.push(template);
    }
  }

  for (const [key, { attribute, sites }] of offences) {
    const where =
      sites.length === 1
        ? sites[0]
        : `${[...new Set(sites)].join(', ')} (${sites.length} bindings)`;

    if (!fallback.has(key)) {
      fail(
        `${where} binds ${attribute} to \`${key}\`, which ${catalogueFile} owns but ` +
          `${fallbackFile} omits. A failed catalogue fetch names that control with the raw key. ` +
          'Add it to EN_FALLBACK_TRANSLATIONS.',
      );
    } else {
      fail(
        `${where} binds ${attribute} to \`${key}\`, and ${fallbackFile} maps it to an empty ` +
          'string. A failed fetch then leaves the control with no accessible name at all — axe ' +
          '`button-name`, critical. This is exactly how finding 4.6 shipped.',
      );
    }
  }

  if (bindings === 0) {
    fail(
      'No accessible name was found bound to the translate pipe in any template, so this gate ' +
        'asserted nothing. Check the binding pattern before trusting a pass.',
    );
  }
}

/**
 * REMOVED — superseded by `scripts/beta-harness/sanitizer-audit.mjs` check 5.
 *
 * This was a regex pairing check: every `bypassSecurityTrustHtml` had to have a `DOMPurify.sanitize`
 * or `escapeHtml` call in the same class member. It was correct about the risk — the safety of those
 * calls is a *pairing*, not a property of either half — but it had two defects that the AST-based
 * replacement does not.
 *
 * It matched `bypassSecurityTrustHtml` anywhere on a line, including **inside a comment**. Any file
 * that merely documented the helper failed the gate, and the `calls` total it refused to let reach
 * zero was inflated by prose. `renderTrustedHtml`'s own docstring tripped it.
 *
 * It found the enclosing member with `/^ {2}.../`, i.e. two-space indentation, so it only understood
 * class members. A top-level exported function fell back to "start of file", which silently widened
 * the search to every sanitiser call above it — the opposite of the confinement the docstring claimed.
 *
 * Check 5 in `sanitizer-audit.mjs` walks the TypeScript AST instead, so comments are not code, and it
 * additionally catches the forms a regex cannot see at all: `sanitizer['bypassSecurityTrustHtml']`,
 * destructuring, aliasing and `.call()`. The allow-list in `.ai/state/sanitizer-allowlist.json`
 * records the justification for each remaining call, and the budget ratchet means the count can only
 * shrink.
 */

/**
 * Every guardrail, in the order they run.
 *
 * A list rather than a sequence of bare calls so that `--only` can select from it and so the
 * authoritative set is one thing to read. `verify-gate.mjs` does the same and for the same
 * reason: its usage line went stale twice while gates were being added.
 */

/**
 * No Angular template syntax in a document shell.
 *
 * `index.html` is served as-is and Angular never compiles it, so `{{ 'key' | translate }}` in
 * the `<title>` renders those braces as literal text in the browser tab. The i18n extraction
 * codemod did exactly that: it globbed `*.html` and could not tell a component template from
 * the shell that hosts the application.
 *
 * Nothing else caught it. Lint does not parse `index.html` as a template, the build copies it
 * verbatim, and no test opens a browser and reads `document.title` before bootstrap. It was
 * found by loading the page and looking at the tab.
 *
 * The window is short — `AppShellComponent` replaces the title from Layer 0 branding once it
 * boots — but it is the first thing a user sees, and on a slow load it is the only thing.
 */
function checkNoTemplateSyntaxInDocumentShell() {
  const shells = [...walk('apps', (path) => /(^|\/)src\/index\.html$/.test(path))];

  if (shells.length === 0) {
    fail(
      'No `src/index.html` was found under apps/, so this gate asserted nothing. Check the ' +
        'glob before trusting a pass.',
    );
    return;
  }

  for (const shell of shells) {
    // Comments are blanked, not dropped, so the reported line number still points at the file
    // as written. The comment in `index.html` explaining this rule quotes the syntax it
    // forbids, and the first run of this check failed on that comment.
    const body = read(shell).replace(/<!--[\s\S]*?-->/g, (block) => block.replace(/[^\n]/g, ' '));
    for (const [index, line] of body.split('\n').entries()) {
      const match = /\{\{[^}]*\}\}|\*ngIf|\[[\w.]+\]="/.exec(line);
      if (!match) continue;
      fail(
        `${shell}:${index + 1} contains Angular template syntax \`${match[0].trim()}\`. ` +
          'This file is the document shell, not a component template — Angular never compiles ' +
          'it, so the braces render as literal text. Put the string in the component that owns ' +
          'the element, or set it at runtime as `branding.documentTitle` does.',
      );
    }
  }
}

/**
 * No prose in a plain attribute on a component — it is an `@Input`, not HTML.
 *
 * `checkNoHardcodedUiText` knows the HTML attributes that hold text: `title`, `aria-label`,
 * `placeholder`, `alt`. It cannot know that `label` on `<mat-tab>` is one too, because that is
 * a component input and there is no list of every input in every library.
 *
 * Fourteen tab labels sat in that gap — the four across the top of the browse page among them —
 * through a full extraction, a repo-wide residue scan and a pseudo-locale audit of nine routes.
 * The audit did see them; I read its output as upstream noise because Material rendered them.
 *
 * The heuristic is the element name: a hyphenated custom element or a PascalCase one is a
 * component, and a capitalised attribute value on it is prose. Known non-text inputs are
 * exempt, and that list is the part to extend when this reports a false positive — not the
 * element pattern.
 */
function checkNoProseInComponentInputs() {
  const NON_TEXT = new Set([
    'class',
    'style',
    'id',
    'type',
    'name',
    'role',
    'color',
    'appearance',
    'mode',
    'value',
    'href',
    'src',
    'target',
    'rel',
    'align',
    'fxLayout',
    'matTooltipPosition',
    'position',
    'animationDuration',
    'diameter',
    'strokeWidth',
    'fontSet',
    'svgIcon',
  ]);
  const ELEMENT = /<((?:mat|hxp|app|sat|adf|nx)-[\w-]+|[A-Z][\w-]*)\b([^>]*)>/gs;
  const ATTRIBUTE = /(?<![[(\w.-])([a-zA-Z][\w-]*)="([A-Z][^"<>{}]*)"/g;

  const templates = [
    ...walk('apps', (path) => path.endsWith('.html')),
    ...walk('libs', (path) => path.endsWith('.html')),
  ].filter((path) => !path.startsWith('apps/nuxeo-satori-template/'));

  if (templates.length === 0) {
    fail('No templates were found under apps/ or libs/, so this gate asserted nothing.');
    return;
  }

  for (const template of templates) {
    const body = read(template);
    for (const element of body.matchAll(ELEMENT)) {
      for (const [, attribute, value] of element[2].matchAll(ATTRIBUTE)) {
        if (NON_TEXT.has(attribute)) continue;
        if (value.replace(/[^A-Za-z]/g, '').length < 3) continue;
        fail(
          `${template} sets \`${attribute}="${value}"\` on \`<${element[1]}>\`. That is a ` +
            'component input holding user-facing text, not an HTML attribute, so no pipe runs ' +
            `and the English is hard-coded. Bind it: \`[${attribute}]="'some.key' | translate"\`. ` +
            `If \`${attribute}\` never holds text, add it to NON_TEXT in this check.`,
        );
      }
    }
  }
}

const GUARDRAILS = [
  checkThemeTokens,
  checkDocsNumbering,
  checkNoReviewCorpusChurn,
  checkVitestProjects,
  checkBlobUrlLifecycle,
  checkNoNuxeoUrlInImgSrc,
  checkNoAttrPrefixedLiteralAttributes,
  checkTypeSafetyEscapes,
  checkHardcodedSecrets,
  checkAngularDevAssets,
  checkAdfHxWorkaroundIds,
  checkNoAdfHxInPublicApi,
  checkNoHardcodedUiText,
  checkNoHardcodedDescriptorText,
  checkNoTemplateSyntaxInDocumentShell,
  checkNoProseInComponentInputs,
  checkTranslationCatalogues,
  checkTranslationContext,
  checkAccessibleNameFallbacks,
  checkLocaleDataRegistered,
];

/**
 * `--only <csv>` runs a subset, by function name.
 *
 * This exists for `review-guardrails.selftest.mjs`, which builds a throwaway git repository per
 * negative control and needs one guardrail's verdict from it. Running the whole set against a
 * fixture repository would report a dozen unrelated failures and prove nothing about the one
 * under test.
 *
 * An unknown name exits 2 with the real list, rather than silently running nothing — a typo that
 * selects an empty set would make every control in the selftest pass.
 */
function selectGuardrails() {
  const only = args.get('only');
  if (only === undefined || only === true) return GUARDRAILS;

  const wanted = new Set(
    String(only)
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
  );
  const byName = new Map(GUARDRAILS.map((guardrail) => [guardrail.name, guardrail]));

  const unknown = [...wanted].filter((name) => !byName.has(name));
  if (unknown.length || wanted.size === 0) {
    console.error(
      `review-guardrails: unknown --only value(s): ${unknown.join(', ') || '(empty)'}\n` +
        `Available:\n  ${[...byName.keys()].join('\n  ')}`,
    );
    process.exit(2);
  }
  return [...wanted].map((name) => byName.get(name));
}

for (const guardrail of selectGuardrails()) guardrail();

if (warnings.length) {
  console.warn('\nReview guardrail warnings:');
  for (const message of warnings) console.warn(`- ${message}`);
}

if (failures.length) {
  console.error('\nReview guardrail failures:');
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('Review guardrails passed.');
