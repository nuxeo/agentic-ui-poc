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

function parseDiff() {
  const hasLocalChanges = head === 'HEAD' && git(['status', '--porcelain']).trim().length > 0;
  const diffArgs = hasLocalChanges
    ? ['diff', '--unified=0', '--diff-filter=ACMR', base]
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
      const key = (entry) =>
        typeof entry === 'string' ? entry : `${entry.glob}|${entry.input}|${entry.output ?? ''}`;

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

checkThemeTokens();
checkDocsNumbering();
checkVitestProjects();
checkBlobUrlLifecycle();
checkNoNuxeoUrlInImgSrc();
checkNoAttrPrefixedLiteralAttributes();
checkTypeSafetyEscapes();
checkHardcodedSecrets();
checkAngularDevAssets();
checkAdfHxWorkaroundIds();
checkNoAdfHxInPublicApi();

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
