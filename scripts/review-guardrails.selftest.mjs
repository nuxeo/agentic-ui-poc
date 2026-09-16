#!/usr/bin/env node
/**
 * Negative controls for the three i18n guardrails in `review-guardrails.mjs`.
 *
 * `CLAUDE.md`: *a gate is not evidence until you have seen it fail on purpose.* Three gates in
 * this programme were green while the thing they guarded was broken. Eleven guardrails shipped
 * before this file existed with **no tests at all**, so this covers the three added for
 * NXSAT-227 and establishes somewhere for the rest to go.
 *
 * ## Why a throwaway repository rather than perturbing tracked files
 *
 * `sanitizer-audit.selftest.mjs` edits real tracked files and restores them in a `finally`, with
 * signal handlers for the paths `finally` misses. It works, and it is the sharpest thing in this
 * repository: a hard kill leaves a dirty tree, and its own docstring says so.
 *
 * These guardrails need no such risk. They read the repository through `git rev-parse
 * --show-toplevel`, `git ls-files` and `git diff`, all relative to the process's working
 * directory — so a fixture repository in `os.tmpdir()` exercises them completely, and nothing
 * outside that directory is ever written. A crash leaks a temp directory, which the OS reclaims.
 *
 * `--only` is what makes this precise. Running all fifteen guardrails against a fixture tree
 * would report a dozen unrelated failures and prove nothing about the one under test.
 *
 * ## What "covered" means here
 *
 * Each control asserts the guardrail goes red **for the expected reason**, matched against the
 * message, not merely that the exit code is non-zero — a control that passes on the wrong
 * failure is how a tautological check survives. Positive controls (a correct tree must be green)
 * are counted separately from negative ones, because a total that mixes them reads as more
 * assurance than it is.
 *
 * Usage:  node scripts/review-guardrails.selftest.mjs
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const GUARDRAILS = join(ROOT, 'scripts', 'review-guardrails.mjs');

let negative = 0;
let positive = 0;
const failures = [];

/** A minimal but valid app catalogue. */
const EN_JSON = `{
  "app": {
    "title": "Hyland Nuxeo",
    "nav": { "toggle": "Toggle navigation menu" }
  },
  "settings": {
    "themes": { "search": "Search themes" }
  }
}
`;

/** A fallback map carrying both keys the fixture templates bind to accessible names. */
const EN_FALLBACK = `export const EN_FALLBACK_TRANSLATIONS: Record<string, string> = {
  'app.nav.toggle': 'Toggle navigation menu',
  'settings.themes.search': 'Search themes',
};
`;

/** A template that does everything right: both accessible names go through the pipe. */
const GOOD_TEMPLATE = `<button type="button" [attr.aria-label]="'app.nav.toggle' | translate">
  <mat-icon>menu</mat-icon>
</button>
<button type="button" [attr.aria-label]="'settings.themes.search' | translate">
  <mat-icon>search</mat-icon>
</button>
`;

/**
 * Builds a fixture repository with one commit, then applies `mutate` to it uncommitted.
 *
 * The uncommitted step matters for the diff-scoped guardrail: `parseDiff()` falls back to
 * `git diff <base>` when the tree is dirty, so a working-tree change is what a developer's
 * pre-commit run actually sees.
 */
function withFixture(files, mutate, run) {
  const dir = mkdtempSync(join(tmpdir(), 'guardrail-selftest-'));
  try {
    const git = (args) => {
      const result = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
      if (result.status !== 0) {
        throw new Error(`git ${args.join(' ')} failed in fixture: ${result.stderr}`);
      }
    };

    const write = (relative, body) => {
      const path = join(dir, relative);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, body);
    };

    git(['init', '--quiet', '--initial-branch=main']);
    git(['config', 'user.email', 'selftest@example.invalid']);
    git(['config', 'user.name', 'Guardrail Selftest']);
    git(['config', 'commit.gpgsign', 'false']);

    for (const [relative, body] of Object.entries(files)) write(relative, body);
    git(['add', '-A']);
    git(['commit', '--quiet', '-m', 'fixture baseline']);

    // `--base` defaults to origin/main, which a fixture repository does not have. Every control
    // passes the baseline commit explicitly instead.
    const base = spawnSync('git', ['rev-parse', 'HEAD'], {
      cwd: dir,
      encoding: 'utf8',
    }).stdout.trim();

    if (mutate) mutate(write);

    return run((guardrail) => {
      const result = spawnSync(
        process.execPath,
        [GUARDRAILS, '--only', guardrail, '--base', base],
        { cwd: dir, encoding: 'utf8' },
      );
      return { code: result.status, out: `${result.stdout}${result.stderr}` };
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Asserts the guardrail goes red, and that the message says why. */
function expectRed(label, guardrail, files, mutate, expected) {
  negative += 1;
  withFixture(files, mutate, (runGuardrail) => {
    const { code, out } = runGuardrail(guardrail);
    if (code === 0) {
      failures.push(`${label}: ${guardrail} passed, but the tree is broken on purpose.`);
      return;
    }
    if (!expected.test(out)) {
      failures.push(
        `${label}: ${guardrail} failed, but not for the expected reason.\n` +
          `    expected /${expected.source}/\n    got: ${out.trim().split('\n').join('\n         ')}`,
      );
    }
  });
}

/** Asserts a correct tree is green — the control that stops a guardrail failing on everything. */
function expectGreen(label, guardrail, files) {
  positive += 1;
  withFixture(files, null, (runGuardrail) => {
    const { code, out } = runGuardrail(guardrail);
    if (code !== 0) {
      failures.push(`${label}: ${guardrail} failed on a correct tree.\n    ${out.trim()}`);
    }
  });
}

const APP = {
  'apps/nuxeo-ui/public/i18n/en.json': EN_JSON,
  'apps/nuxeo-ui/src/app/i18n/en-fallback.ts': EN_FALLBACK,
  'apps/nuxeo-ui/src/app/shell/app-shell.component.html': GOOD_TEMPLATE,
};

/* ---------------- checkTranslationCatalogues ---------------- */

expectGreen('a valid single-locale catalogue set', 'checkTranslationCatalogues', APP);

expectRed(
  'malformed catalogue',
  'checkTranslationCatalogues',
  APP,
  (write) => write('apps/nuxeo-ui/public/i18n/en.json', EN_JSON.replace('"Search themes"', '"x",')),
  /is not valid JSON/,
);

expectRed(
  'blank catalogue value',
  'checkTranslationCatalogues',
  APP,
  (write) => write('apps/nuxeo-ui/public/i18n/en.json', EN_JSON.replace('"Search themes"', '""')),
  /maps `settings\.themes\.search` to an empty string/,
);

expectRed(
  'catalogue with no trailing newline',
  'checkTranslationCatalogues',
  APP,
  (write) => write('apps/nuxeo-ui/public/i18n/en.json', EN_JSON.trimEnd()),
  /has no trailing newline/,
);

expectRed(
  'locale missing a key the reference has',
  'checkTranslationCatalogues',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/public/i18n/fr.json',
      '{\n  "app": { "title": "Hyland Nuxeo", "nav": { "toggle": "Basculer" } }\n}\n',
    ),
  /fr\.json is missing 1 key\(s\).*settings\.themes\.search/s,
);

expectRed(
  'locale carrying a key the reference dropped',
  'checkTranslationCatalogues',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/public/i18n/fr.json',
      EN_JSON.replace('"Search themes"', '"Rechercher"').replace(
        '  "settings": {',
        '  "dead": { "key": "Obsolete" },\n  "settings": {',
      ),
    ),
  /fr\.json carries 1 key\(s\) absent from.*dead\.key/s,
);

expectRed(
  'a locale with no en.json to compare against',
  'checkTranslationCatalogues',
  {
    'apps/nuxeo-ui/public/i18n/fr.json': '{\n  "app": { "title": "Nuxeo" }\n}\n',
    ...Object.fromEntries(Object.entries(APP).filter(([path]) => !path.endsWith('en.json'))),
  },
  null,
  /no en\.json/,
);

expectRed(
  'no catalogues at all must not read as a pass',
  'checkTranslationCatalogues',
  { 'apps/nuxeo-ui/src/app/i18n/en-fallback.ts': EN_FALLBACK },
  null,
  /asserted nothing/,
);

/* ---------------- checkAccessibleNameFallbacks ---------------- */

expectGreen('every accessible name in the fallback', 'checkAccessibleNameFallbacks', APP);

expectRed(
  'accessible-name key missing from the fallback',
  'checkAccessibleNameFallbacks',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/i18n/en-fallback.ts',
      EN_FALLBACK.replace("  'settings.themes.search': 'Search themes',\n", ''),
    ),
  /binds aria-label to `settings\.themes\.search`.*omits/s,
);

expectRed(
  'accessible-name key blank in the fallback',
  'checkAccessibleNameFallbacks',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/i18n/en-fallback.ts',
      EN_FALLBACK.replace(
        "'settings.themes.search': 'Search themes'",
        "'settings.themes.search': ''",
      ),
    ),
  /maps it to an empty string/,
);

expectRed(
  'no accessible names bound at all must not read as a pass',
  'checkAccessibleNameFallbacks',
  {
    ...APP,
    'apps/nuxeo-ui/src/app/shell/app-shell.component.html': '<button type="button"></button>\n',
  },
  null,
  /asserted nothing/,
);

expectRed(
  'a fallback map this parser cannot read must not read as a pass',
  'checkAccessibleNameFallbacks',
  {
    ...APP,
    'apps/nuxeo-ui/src/app/i18n/en-fallback.ts':
      'export const EN_FALLBACK_TRANSLATIONS = Object.freeze(buildMap());\n',
  },
  null,
  /yielded no key\/value pairs/,
);

/* ---------------- checkNoHardcodedUiText ---------------- */

expectGreen('a template routing everything through the pipe', 'checkNoHardcodedUiText', APP);

expectRed(
  'hard-coded element text added',
  'checkNoHardcodedUiText',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/shell/app-shell.component.html',
      `${GOOD_TEMPLATE}<span>Show details</span>\n`,
    ),
  /introduces the text `Show details` as hard-coded English/,
);

expectRed(
  'hard-coded aria-label added',
  'checkNoHardcodedUiText',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/shell/app-shell.component.html',
      `${GOOD_TEMPLATE}<button type="button" aria-label="Close panel"></button>\n`,
    ),
  /introduces aria-label="Close panel"/,
);

expectRed(
  'hard-coded placeholder added',
  'checkNoHardcodedUiText',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/shell/app-shell.component.html',
      `${GOOD_TEMPLATE}<input placeholder="Search documents" />\n`,
    ),
  /introduces placeholder="Search documents"/,
);

/**
 * The false-positive controls. Each is a thing that sits where prose sits and is not prose; if
 * any of these went red the guardrail would be unusable and someone would switch it off, which
 * is a worse outcome than not having it.
 */
const NOT_PROSE = [
  ['an icon ligature', '<mat-icon>search</mat-icon>'],
  ['an interpolation', '<span>{{ document.title }}</span>'],
  ['a translated binding', `<span [attr.title]="'app.title' | translate"></span>`],
  ['a translated text node', `<span>{{ 'app.title' | translate }}</span>`],
  ['a single character', '<span>×</span>'],
  ['a number', '<span>42</span>'],
  ['an empty element', '<span></span>'],
  ['a comment', '<!-- Show details -->'],
  ['a class attribute', '<div class="Show details"></div>'],
];

for (const [label, line] of NOT_PROSE) {
  positive += 1;
  withFixture(
    APP,
    (write) =>
      write('apps/nuxeo-ui/src/app/shell/app-shell.component.html', `${GOOD_TEMPLATE}${line}\n`),
    (runGuardrail) => {
      const { code, out } = runGuardrail('checkNoHardcodedUiText');
      if (code !== 0) {
        failures.push(
          `false positive — ${label} was flagged as hard-coded text.\n    ${out.trim()}`,
        );
      }
    },
  );
}

/* ---------------- report ---------------- */

const total = negative + positive;
console.log(
  `review-guardrails selftest: ${total} controls — ${negative} negative (a broken tree must go ` +
    `red, for the stated reason) and ${positive} positive (a correct tree must stay green, ` +
    `including ${NOT_PROSE.length} shapes that sit where prose sits and are not prose).`,
);

if (failures.length) {
  console.error(`\n${failures.length} control(s) did not behave as required:`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('All controls behaved as required.');
