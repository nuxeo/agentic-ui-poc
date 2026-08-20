#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
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

function git(args) {
  // `maxBuffer` raised from the 1 MB default: a long-lived branch with a large
  // uncommitted working tree produces a diff bigger than that, and the failure
  // mode is an ENOBUFS stack trace rather than a guardrail result — the gate
  // reports nothing at exactly the point it has most to say.
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
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

function checkThemeTokens() {
  const colorLiteral = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
  for (const [file, lines] of addedLinesByFile) {
    if (!file.endsWith('.scss') && !file.endsWith('.html')) continue;
    for (const { line, text } of lines) {
      const trimmed = text.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;
      const hasColor = colorLiteral.test(trimmed);
      const isThemed = trimmed.includes('var(--mat-sys-') || trimmed.includes('var(--kd-');
      if (hasColor && !isThemed) {
        fail(
          `${file}:${line} introduces a hard-coded color. Use --mat-sys-* theme tokens with a fallback.`,
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
    read(file)
      .split('\n')
      .forEach((line, index) => {
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

const AGENT_CONFIG = 'libs/shared/agent-client/src/lib/agent.config.ts';
const NGINX_EXAMPLE = 'apps/agent-gateway/deploy/nginx.conf.example';

/**
 * The browser's gateway path and every proxy table that has to route it must agree.
 *
 * They are four files in three languages that nothing links together, and when they drift
 * the failure is silent in the worst way: the capability probe 404s, the app concludes no
 * gateway is deployed, and the Automation fallback answers instead — fluently, with a
 * confident and invented account of why it has no data. No test fails, no error appears,
 * and the badge quietly reads STANDARD.
 *
 * So this checks the agreement rather than any one file's contents:
 *
 *  - a dev proxy rule for the gateway must be keyed on the path the client actually
 *    requests, derived from `AGENT_BASE_PATH` rather than restated here;
 *  - it must be declared before any broader rule that also matches it, because the Angular
 *    dev proxy resolves in declaration order and `/nuxeo` would otherwise swallow it;
 *  - it must rewrite the prefix away, because the gateway serves `/agent/*` and knows
 *    nothing of the `/nuxeo` prefix the cookie scope forces on the browser;
 *  - the nginx example must publish a matching `location`.
 *
 * It cannot check a *running* dev server, which reads `--proxy-config` once at startup. A
 * stale `ng serve` will still produce exactly the failure described above, and the only
 * defence there is restarting it.
 */
function checkAgentGatewayPathAgreement() {
  if (!fileExists(AGENT_CONFIG)) return;

  const basePath = read(AGENT_CONFIG).match(/AGENT_BASE_PATH\s*=\s*'([^']+)'/)?.[1];
  if (!basePath) {
    fail(
      `${AGENT_CONFIG} no longer declares AGENT_BASE_PATH as a string literal, so the proxy ` +
        `tables can no longer be checked against it — re-point checkAgentGatewayPathAgreement().`,
    );
    return;
  }

  const probePath = `${basePath}/capabilities`;

  // Nuxeo scopes JSESSIONID to Path=/nuxeo and a cookie is only sent to paths inside its
  // Path, so a gateway outside /nuxeo/ gets no credential at all. See AGENT_BASE_PATH.
  if (!(basePath === '/nuxeo' || basePath.startsWith('/nuxeo/'))) {
    fail(
      `${AGENT_CONFIG} sets AGENT_BASE_PATH to '${basePath}', which is outside the Nuxeo ` +
        `session cookie's Path=/nuxeo. The browser will not send JSESSIONID there, so every ` +
        `run is unauthenticated while the capability probe still succeeds.`,
    );
  }

  for (const config of walk('apps/nuxeo-ui', (file) => /proxy\.conf\..*json$/.test(file))) {
    let table;
    try {
      table = JSON.parse(read(config));
    } catch {
      fail(`${config} is not valid JSON.`);
      continue;
    }
    if (!table || typeof table !== 'object') continue;

    const keys = Object.keys(table);
    // A config may legitimately have no gateway rule — proxy.conf.beta.json points at a
    // deployment whose own reverse proxy publishes the gateway. Only rules that claim to
    // route the gateway are held to the contract.
    const gatewayKeys = keys.filter((key) => key.includes('agent'));
    if (gatewayKeys.length === 0) continue;

    for (const key of gatewayKeys) {
      if (!probePath.startsWith(key)) {
        fail(
          `${config} proxies '${key}', but the client requests '${probePath}' ` +
            `(AGENT_BASE_PATH in ${AGENT_CONFIG}). The probe will miss this rule.`,
        );
        continue;
      }

      const swallowedBy = keys
        .slice(0, keys.indexOf(key))
        .find((earlier) => probePath.startsWith(earlier));
      if (swallowedBy) {
        fail(
          `${config} declares '${swallowedBy}' before '${key}', and the Angular dev proxy ` +
            `matches in declaration order, so agent requests go to '${swallowedBy}' instead. ` +
            `Move '${key}' above it.`,
        );
      }

      // The gateway serves /agent/*; the /nuxeo prefix exists only to satisfy the cookie.
      // So apply the declared rewrites and check what the gateway would actually receive.
      let forwarded = probePath;
      for (const [pattern, replacement] of Object.entries(table[key]?.pathRewrite ?? {})) {
        forwarded = forwarded.replace(new RegExp(pattern), replacement);
      }
      if (forwarded.startsWith('/nuxeo')) {
        fail(
          `${config} would forward '${forwarded}' to the gateway for '${key}'. The gateway ` +
            `serves '/agent/*' and knows nothing of the '/nuxeo' prefix, so this needs a ` +
            `pathRewrite of { "^/nuxeo": "" }.`,
        );
      }
    }
  }

  if (fileExists(NGINX_EXAMPLE)) {
    const locations = [...read(NGINX_EXAMPLE).matchAll(/^\s*location\s+([^\s{]+)\s*\{/gm)].map(
      (match) => match[1],
    );
    // `location /` is the Nuxeo catch-all and matches everything, so it does not count:
    // the probe needs a mount of its own or it lands on Nuxeo.
    const serves = locations.some((location) => {
      const prefix = location.replace(/\/$/, '');
      return prefix.startsWith('/') && prefix.length > 1 && probePath.startsWith(prefix);
    });
    if (!serves) {
      fail(
        `${NGINX_EXAMPLE} has no location matching '${probePath}', so the documented ` +
          `production deployment would send the capability probe to Nuxeo and 404.`,
      );
    }
  }
}

function checkBlobUrlLifecycle() {
  for (const [file, lines] of addedLinesByFile) {
    if (!file.endsWith('.ts') || !fileExists(file)) continue;
    const addsObjectUrl = lines.some(({ text }) => text.includes('URL.createObjectURL'));
    if (!addsObjectUrl) continue;
    const content = read(file);
    if (!content.includes('URL.revokeObjectURL')) {
      fail(`${file} creates Blob/Object URLs but does not revoke them.`);
    }
  }
}

/**
 * Layout properties an app stylesheet must not take away from a Material drawer.
 *
 * A component-scoped class compiles to `.foo[_ngcontent-…]` — two compound parts against
 * Material's single-class `.mat-drawer` — so *anything* declared in a rule for a class on
 * a `mat-sidenav` beats Material's own value. Overriding `width` that way is intended and
 * is how the assistant panel is sized. Overriding these three is not: `.mat-drawer` is
 * `position: absolute` with `top: 0; bottom: 0`, and that is what gives the drawer its
 * height. Take the positioning away and the drawer drops into normal flow, its height
 * collapses to `auto`, any child sized `height: 100%` resolves against zero, and the
 * drawer renders as a correctly-sized area of empty space — with no console error, no
 * failing unit test and nothing in the diff that looks wrong.
 *
 * This was a real regression, found by a person looking at the screen rather than by the
 * 249-test suite. It is checked here rather than in a spec because Karma cannot read a
 * stylesheet off disk, and the mistake is a *declaration*, not a behaviour.
 */
const DRAWER_LAYOUT_PROPERTIES = ['position', 'top', 'bottom'];

function checkDrawerLayoutOverrides() {
  const styleSheets = walk('apps', (path) => path.endsWith('.scss')).concat(
    walk('libs', (path) => path.endsWith('.scss')),
  );

  for (const file of styleSheets) {
    const content = stripComments(read(file));
    // Only classes that are actually put on a `mat-sidenav`/`mat-drawer` in the sibling
    // template matter. Anything else named `.*-sidenav` is a container, not the drawer.
    const template = file.replace(/\.scss$/, '.html');
    if (!fileExists(template)) continue;
    const markup = read(template);

    for (const [, selector, body] of content.matchAll(/^\.([\w-]+)\s*\{([^{}]*)\}/gm)) {
      const onADrawer = new RegExp(
        `<mat-(?:sidenav|drawer)\\b[^>]*class="[^"]*\\b${selector}\\b`,
        's',
      ).test(markup);
      if (!onADrawer) continue;

      for (const property of DRAWER_LAYOUT_PROPERTIES) {
        if (new RegExp(`(^|;|\\s)${property}\\s*:`).test(body)) {
          fail(
            `${file} sets \`${property}\` on \`.${selector}\`, which is a mat-sidenav in ` +
              `${template}. A component-scoped class outranks Material's \`.mat-drawer\`, and ` +
              `\`.mat-drawer\` uses \`position: absolute; top: 0; bottom: 0\` to get its height — ` +
              `overriding it drops the drawer into normal flow and it renders as empty space. ` +
              `\`.mat-drawer\` is already a containing block, so a child needing one does not ` +
              `require this.`,
          );
        }
      }
    }
  }
}

// The app styles a handful of Satori internals that have no public API. Those reaches
// are centralised and annotated in one file; everywhere else must use tokens or public
// selectors. This check runs over the whole repo rather than the diff, because the thing
// most likely to break these overrides is a @hylandsoftware/satori-ui version bump that
// touches no app file at all.
const SATORI_ROOT = 'node_modules/@hylandsoftware';
const SATORI_OVERRIDES_FILE = 'apps/nuxeo-ui/src/styles/_satori-overrides.scss';

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
}

// Satori generates many of its tokens through Sass interpolation, so the only honest way
// to learn its token surface is to compile the theme and read what actually came out.
function compileSatoriTokens() {
  let sass;
  try {
    sass = createRequire(import.meta.url)('sass');
  } catch {
    return null;
  }
  const { css } = sass.compileString(
    "@use '@hylandsoftware/satori-ui/theme' as sat; html { @include sat.theme; }",
    {
      loadPaths: [join(repoRoot, 'node_modules')],
      quietDeps: true,
      logger: sass.Logger.silent,
    },
  );
  return new Set([...css.matchAll(/--sat-[a-z0-9-]+(?=\s*:)/g)].map((match) => match[0]));
}

let satoriSurface;
function readSatoriSurface() {
  if (satoriSurface !== undefined) return satoriSurface;
  satoriSurface = null;
  if (!fileExists(SATORI_ROOT)) return satoriSurface;
  const tokens = compileSatoriTokens();
  if (!tokens) return satoriSurface;

  const classes = new Set();
  for (const file of walk(SATORI_ROOT, (file) => /\.(scss|mjs|css)$/.test(file))) {
    for (const match of read(file).matchAll(/\.(sat-[a-z0-9-]+)/g)) {
      classes.add(match[1]);
    }
  }
  satoriSurface = { tokens, classes };
  return satoriSurface;
}

function checkSatoriContract() {
  const satori = readSatoriSurface();
  if (!satori) return;

  const styleFiles = [
    ...walk('apps', (f) => f.endsWith('.scss')),
    ...walk('libs', (f) => f.endsWith('.scss')),
  ];

  for (const file of styleFiles) {
    const content = stripComments(read(file));

    for (const match of content.matchAll(/--sat-[a-z0-9-]+/g)) {
      if (!satori.tokens.has(match[0])) {
        fail(
          `${file} uses \`${match[0]}\`, which @hylandsoftware/satori-ui does not declare. ` +
            `A missing token silently falls through to its fallback forever — use a real token or drop it.`,
        );
      }
    }

    for (const match of content.matchAll(/\.(sat-[a-z0-9-]+)/g)) {
      const className = match[1];
      if (!satori.classes.has(className)) {
        fail(
          `${file} styles \`.${className}\`, which no longer exists in @hylandsoftware/satori-ui. ` +
            `Satori renamed or removed it; the override is now dead.`,
        );
      } else if (file !== SATORI_OVERRIDES_FILE) {
        fail(
          `${file} reaches into the Satori internal \`.${className}\`. ` +
            `Move it to ${SATORI_OVERRIDES_FILE} and annotate what it depends on.`,
        );
      }
    }
  }
}

// Satori builds a tag's colour by splicing the `status`/`category` input straight into
// a custom property name at runtime: SatStatusTagComponent computes
// `var(--sat-tag-${status}-container)`, SatCategoryTagComponent
// `var(--sat-tag-cat-${category}-container)`, and binds the result inline on the host.
//
// Nothing joins the two halves at build time. `strictTemplates` checks the literal in
// the template against Satori's own union type, and the theme declares the tokens, but
// no compiler checks that a union member still HAS a token. The app used to be immune
// because it forced every tag grey with `!important`; it no longer does (see block 6 of
// _satori-overrides.scss), so a token Satori renames now resolves to nothing and the tag
// renders as a transparent chip with inherited text — on screens nobody re-checks after
// a version bump. Verify the whole union, not just the variants used today.
const SATORI_TAG_VARIANTS = [
  {
    declaration: 'node_modules/@hylandsoftware/satori-ui/tag/types/tag-status-type.d.ts',
    union: 'SatTagStatus',
    usage: (value) => `<sat-status-tag status="${value}">`,
    tokens: (value) => [`--sat-tag-${value}-container`, `--sat-tag-on-${value}-container`],
  },
  {
    declaration: 'node_modules/@hylandsoftware/satori-ui/tag/types/tag-category-type.d.ts',
    union: 'SatTagCategory',
    usage: (value) => `<sat-category-tag category="${value}">`,
    tokens: (value) => [`--sat-tag-cat-${value}-container`, `--sat-tag-on-cat-${value}-container`],
  },
];

function checkSatoriTagVariants() {
  const satori = readSatoriSurface();
  if (!satori) return;

  for (const variant of SATORI_TAG_VARIANTS) {
    if (!fileExists(variant.declaration)) {
      fail(
        `Cannot find ${variant.union} at ${variant.declaration}. Satori moved it, so the tag ` +
          `colour contract can no longer be verified — re-point checkSatoriTagVariants().`,
      );
      continue;
    }

    const union = read(variant.declaration).match(
      new RegExp(`type\\s+${variant.union}\\s*=([^;]+);`),
    );
    const members = union ? [...union[1].matchAll(/'([^']+)'/g)].map((match) => match[1]) : [];
    if (!members.length) {
      fail(`Read no members out of ${variant.union} in ${variant.declaration}.`);
      continue;
    }

    for (const member of members) {
      for (const token of variant.tokens(member)) {
        if (!satori.tokens.has(token)) {
          fail(
            `Satori accepts \`${variant.usage(member)}\` but its theme declares no \`${token}\`. ` +
              `The component interpolates that name at runtime, so the tag renders transparent ` +
              `with inherited text instead of its semantic colour.`,
          );
        }
      }
    }
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

// AGENTS.md section 3 and AGENTS/01-services.md are the first thing every agent and every new
// engineer reads, so a wrong class name, a method credited to the wrong service or a wrong return
// type does not just mislead one reader — it gets copied into new code. Three separate hand-review
// passes over these two documents each found errors the previous pass had missed: favorites
// attributed to DocumentDetailService when the list is CollectionService.getFavorites; five
// SearchService methods credited to SearchAggregationService, which does no HTTP at all;
// ARenderService misspelled as ArenderService, given a getViewerUrl() that does not exist, and
// typed as returning a Promise when it returns an Observable. Hand-checking does not converge, so
// everything mechanically checkable about the service map is checked here instead.
//
// These roots are exactly what AGENTS/01-services.md claims to cover. libs/shared/ai-client and
// libs/shared/agent-client are deliberately absent: their surface is documented in
// AGENTS/10-ai-features.md, not here.
const SERVICE_MAP_DOC = 'AGENTS/01-services.md';
const SERVICE_QUICK_REF_DOC = 'AGENTS.md';
const SERVICE_SOURCE_ROOTS = [
  'libs/shared/nuxeo-client/src/lib/services',
  'libs/shared/kd-client/src/lib',
  'libs/shared/ke-client/src/lib',
];

// Words in a one-line "Primary use" cell that claim the service performs an operation, mapped to
// the substrings a method implementing that operation would plausibly have in its name. Several of
// the errors found by hand were of exactly this shape — CollectionService described as "CRUD" with
// neither a create nor a delete, TagService as "CRUD" with no update — so the claim is worth
// checking even though the rest of a description is prose no script can grade.
//
// The synonyms exist to keep the check permissive: a false pass is a missed error, a false failure
// is a guardrail people learn to ignore. This runs ONLY against the single-line table cells in
// AGENTS.md section 3, never against free prose, because prose legitimately names operations to
// say a service does NOT have them ("Agent create/update/delete are not exposed" in the
// KdClientService section of AGENTS/01-services.md would fail instantly).
const CLAIMED_OPERATIONS = new Map([
  ['create', ['create', 'new']],
  ['update', ['update', 'edit', 'patch', 'set']],
  ['delete', ['delete', 'remove', 'purge']],
  ['remove', ['remove', 'delete']],
  ['add', ['add']],
  ['upload', ['upload']],
  ['download', ['download']],
  ['import', ['import']],
  ['export', ['export']],
  ['copy', ['copy', 'duplicate']],
  ['move', ['move']],
]);
const CRUD_OPERATIONS = ['create', 'update', 'delete'];

function normalizeTypeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s*([<>,;|])\s*/g, '$1')
    .trim();
}

let serviceSurface;

// Reads the real public surface of every service with the TypeScript parser rather than a regex,
// so overloads, decorators and accessors are read the way the compiler reads them.
function readServiceSurface() {
  if (serviceSurface !== undefined) return serviceSurface;

  let ts;
  try {
    ts = createRequire(import.meta.url)('typescript');
  } catch {
    serviceSurface = null;
    return serviceSurface;
  }

  const byFile = new Map();
  const classesByName = new Map();
  const sourceFiles = SERVICE_SOURCE_ROOTS.flatMap((root) =>
    walk(root, (file) => file.endsWith('.ts') && !/\.(spec|test)\.ts$/.test(file)),
  );

  for (const file of sourceFiles) {
    const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
    const classes = new Map();
    const moduleExports = new Set();

    for (const statement of source.statements) {
      const exported = (statement.modifiers ?? []).some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );
      if (!exported) continue;

      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) moduleExports.add(declaration.name.text);
        }
        continue;
      }
      if (!statement.name || !ts.isIdentifier(statement.name)) continue;
      moduleExports.add(statement.name.text);
      if (!ts.isClassDeclaration(statement)) continue;

      const members = new Map();
      for (const member of statement.members) {
        if (!member.name) continue;
        const hidden =
          ts.isPrivateIdentifier(member.name) ||
          (member.modifiers ?? []).some(
            (modifier) =>
              modifier.kind === ts.SyntaxKind.PrivateKeyword ||
              modifier.kind === ts.SyntaxKind.ProtectedKeyword,
          );
        if (hidden) continue;
        members.set(member.name.getText(source), {
          isMethod: ts.isMethodDeclaration(member),
          returnType: member.type ? normalizeTypeText(member.type.getText(source)) : null,
        });
      }

      const injectable = (ts.getDecorators?.(statement) ?? []).some((decorator) =>
        /^Injectable\b/.test(decorator.expression.getText(source)),
      );
      classes.set(statement.name.text, { members, injectable, file });
      const declaredIn = classesByName.get(statement.name.text) ?? [];
      declaredIn.push(file);
      classesByName.set(statement.name.text, declaredIn);
    }

    byFile.set(file, { classes, moduleExports });
  }

  serviceSurface = { byFile, classesByName };
  return serviceSurface;
}

// Reads one documented line — `getAuditLog(uid: string, pageSize?: number): Observable<AuditLogList>`,
// `readonly contextPath: Signal<string>`, `get<T>(path: string): Observable<T>` or a bare
// `ImportProgress;` — into a name and, when the line declares one, a return type. Argument lists and
// type-parameter lists are skipped by bracket matching because they contain colons of their own.
function parseDocumentedSignature(line) {
  const declaration = line
    .replace(/\s*\/\/.*$/, '')
    .trim()
    .replace(/;$/, '');
  const nameMatch = declaration.match(/^(?:readonly\s+)?([A-Za-z_$][\w$]*)/);
  if (!nameMatch) return null;

  let rest = declaration.slice(nameMatch[0].length);
  for (const [open, close] of [
    ['<', '>'],
    ['(', ')'],
  ]) {
    if (!rest.startsWith(open)) continue;
    let depth = 0;
    let index = 0;
    for (; index < rest.length; index += 1) {
      if (rest[index] === open) depth += 1;
      else if (rest[index] === close && (depth -= 1) === 0) {
        index += 1;
        break;
      }
    }
    rest = rest.slice(index);
  }

  const returnType = rest.match(/^\s*:\s*(.+)$/);
  return {
    name: nameMatch[1],
    returnType: returnType ? normalizeTypeText(returnType[1]) : null,
  };
}

function parseServiceSections(text) {
  const sections = [];
  let current = null;
  let insideFence = false;

  text.split('\n').forEach((line, index) => {
    if (/^```/.test(line)) {
      insideFence = !insideFence;
      return;
    }
    if (!insideFence) {
      const heading = line.match(/^##\s+([A-Za-z_$][\w$]*)\s+\(`([^`]+)`\)\s*$/);
      if (heading) {
        current = { className: heading[1], file: heading[2], line: index + 1, signatures: [] };
        sections.push(current);
      }
      return;
    }
    if (!current) return;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) return;
    const signature = parseDocumentedSignature(trimmed);
    if (signature) current.signatures.push({ ...signature, line: index + 1 });
  });

  return sections;
}

function parseKeyServicesTable(text) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => /^##\s+\d+\.\s+Key Services/.test(line));
  if (start === -1) return null;

  const rows = [];
  for (let index = start + 1; index < lines.length && !/^##\s/.test(lines[index]); index += 1) {
    const row = lines[index].match(/^\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|\s*$/);
    if (row) rows.push({ className: row[1], description: row[2], line: index + 1 });
  }
  return rows;
}

function claimedOperations(description) {
  const claims = new Set(/\bCRUD\b/.test(description) ? CRUD_OPERATIONS : []);
  for (const word of CLAIMED_OPERATIONS.keys()) {
    if (new RegExp(`\\b${word}(s|d|es|ed|ing)?\\b`, 'i').test(description)) claims.add(word);
  }
  return [...claims];
}

function checkServiceMapDocs() {
  for (const doc of [SERVICE_MAP_DOC, SERVICE_QUICK_REF_DOC]) {
    if (!fileExists(doc)) {
      fail(`${doc} is missing, so the service map could not be verified.`);
      return;
    }
  }

  const surface = readServiceSurface();
  if (!surface) {
    fail(
      `Cannot load the typescript package, so the service map in ${SERVICE_MAP_DOC} was not ` +
        `verified. Run npm ci — this guardrail must not be allowed to pass by being skipped.`,
    );
    return;
  }
  const { byFile, classesByName } = surface;

  const sections = parseServiceSections(read(SERVICE_MAP_DOC));
  const documented = new Map(sections.map((section) => [section.className, section]));

  for (const section of sections) {
    const namedFiles = [...byFile.keys()].filter((file) => basename(file) === section.file);
    const owner = namedFiles.find((file) => byFile.get(file).classes.has(section.className));

    if (!owner) {
      const declaredIn = classesByName.get(section.className);
      if (declaredIn) {
        fail(
          `${SERVICE_MAP_DOC}:${section.line} documents \`${section.className}\` as living in ` +
            `\`${section.file}\`, but it is declared in ${declaredIn.join(', ')}.`,
        );
      } else if (namedFiles.length) {
        const exported = namedFiles.flatMap((file) => [...byFile.get(file).classes.keys()]);
        fail(
          `${SERVICE_MAP_DOC}:${section.line} documents a class \`${section.className}\` that ` +
            `${namedFiles.join(', ')} does not export. That file exports ` +
            `${exported.length ? exported.join(', ') : 'no classes'}.`,
        );
      } else {
        fail(
          `${SERVICE_MAP_DOC}:${section.line} names the source file \`${section.file}\`, which ` +
            `does not exist under ${SERVICE_SOURCE_ROOTS.join(', ')}.`,
        );
      }
      continue;
    }

    const { classes, moduleExports } = byFile.get(owner);
    const members = classes.get(section.className).members;

    for (const signature of section.signatures) {
      const member = members.get(signature.name);
      if (!member) {
        if (moduleExports.has(signature.name)) continue;
        const elsewhere = [...byFile.entries()].flatMap(([file, entry]) =>
          [...entry.classes.entries()]
            .filter(([, klass]) => klass.members.has(signature.name))
            .map(([name]) => `${name} (${file})`),
        );
        fail(
          `${SERVICE_MAP_DOC}:${signature.line} documents \`${section.className}.${signature.name}\`, ` +
            `which ${owner} does not export.` +
            (elsewhere.length ? ` It is on ${elsewhere.join(', ')}.` : ''),
        );
        continue;
      }
      // Only method return annotations are compared. A documented `Signal<T>` property has no
      // annotation to compare against in the source (they are all `x = signal(...)`), and
      // inferring one would mean grading a design nuance rather than checking a fact.
      if (signature.returnType && member.isMethod && member.returnType) {
        if (signature.returnType !== member.returnType) {
          fail(
            `${SERVICE_MAP_DOC}:${signature.line} documents \`${section.className}.${signature.name}\` ` +
              `as returning \`${signature.returnType}\`, but it returns \`${member.returnType}\`. ` +
              `A wrong wrapper type (Promise for Observable) changes every call site.`,
          );
        }
      }
    }
  }

  for (const [file, entry] of byFile) {
    for (const [className, klass] of entry.classes) {
      if (!klass.injectable || documented.has(className)) continue;
      fail(
        `${SERVICE_MAP_DOC} has no "## ${className} (\`${basename(file)}\`)" section, but ` +
          `${file} exports it as an injectable service. Every service under ` +
          `${SERVICE_SOURCE_ROOTS.join(', ')} has to be findable there.`,
      );
    }
  }

  // Dotted references such as `CollectionService.getFavorites` are how these documents redirect a
  // reader from the wrong class to the right one, which is precisely what goes stale.
  for (const doc of [SERVICE_MAP_DOC, SERVICE_QUICK_REF_DOC]) {
    read(doc)
      .split('\n')
      .forEach((line, index) => {
        for (const match of line.matchAll(/\b([A-Z][A-Za-z0-9_$]*)\.([a-zA-Z_$][\w$]*)/g)) {
          const declaredIn = classesByName.get(match[1]);
          if (!declaredIn) continue;
          const entry = byFile.get(declaredIn[0]);
          if (
            entry.classes.get(match[1]).members.has(match[2]) ||
            entry.moduleExports.has(match[2])
          ) {
            continue;
          }
          fail(
            `${doc}:${index + 1} refers to \`${match[1]}.${match[2]}\`, which ` +
              `${declaredIn[0]} does not export.`,
          );
        }
      });
  }

  const rows = parseKeyServicesTable(read(SERVICE_QUICK_REF_DOC));
  if (!rows) {
    fail(
      `${SERVICE_QUICK_REF_DOC} has no "## <n>. Key Services" heading, so the service table ` +
        `could not be read — re-point checkServiceMapDocs().`,
    );
    return;
  }

  for (const row of rows) {
    const declaredIn = classesByName.get(row.className);
    if (!declaredIn) {
      fail(
        `${SERVICE_QUICK_REF_DOC}:${row.line} lists \`${row.className}\`, which no file under ` +
          `${SERVICE_SOURCE_ROOTS.join(', ')} exports. Check the spelling against the class.`,
      );
      continue;
    }
    if (!documented.has(row.className)) {
      fail(
        `${SERVICE_QUICK_REF_DOC}:${row.line} lists \`${row.className}\` but ${SERVICE_MAP_DOC} ` +
          `has no section for it, so its methods are undocumented.`,
      );
    }

    const members = [...byFile.get(declaredIn[0]).classes.get(row.className).members.keys()].map(
      (name) => name.toLowerCase(),
    );
    for (const claim of claimedOperations(row.description)) {
      const hints = CLAIMED_OPERATIONS.get(claim);
      if (members.some((name) => hints.some((hint) => name.includes(hint)))) continue;
      fail(
        `${SERVICE_QUICK_REF_DOC}:${row.line} describes \`${row.className}\` as doing "${claim}", ` +
          `but ${declaredIn[0]} has no public method named for it. Either the description claims ` +
          `an operation another class owns, or it needs rewording.`,
      );
    }
  }
}

checkThemeTokens();
checkDocsNumbering();
checkVitestProjects();
checkAgentGatewayPathAgreement();
checkBlobUrlLifecycle();
checkDrawerLayoutOverrides();
checkSatoriContract();
checkSatoriTagVariants();
checkTypeSafetyEscapes();
checkServiceMapDocs();

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
