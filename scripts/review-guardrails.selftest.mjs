#!/usr/bin/env node
/**
 * Negative controls for the i18n and configuration guardrails in `review-guardrails.mjs`.
 *
 * No count in this sentence on purpose. It said "three" through two rounds of additions and
 * was wrong by the end of the first; the executable report at the bottom of this file prints
 * the real total, and a number duplicated in prose diverges from it immediately.
 *
 * `CLAUDE.md`: *a gate is not evidence until you have seen it fail on purpose.* Three gates in
 * this programme were green while the thing they guarded was broken. Eleven guardrails shipped
 * before this file existed with **no tests at all**, so this began with the ones
 * added for NXSAT-227 and establishes somewhere for the rest to go.
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
/**
 * Positive controls that specifically assert a NON-violation is not flagged.
 *
 * Counted separately because it drifted once already: the summary hardcoded "eight" while the
 * list held nine, and then said "9" while a second set of seven had been added elsewhere. A
 * number in prose next to a list it does not come from is a number that goes wrong.
 */
let falsePositiveControls = 0;
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
 *
 * `mutate` receives `git` as well as `write` because `git diff` cannot see an UNTRACKED file.
 * A control that only writes a brand-new path produces an empty diff, and a diff-scoped
 * guardrail is then green on a tree that is broken on purpose — which is a control asserting
 * nothing. Staging the file is what makes it a reintroduction rather than a stray.
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

    if (mutate) mutate(write, git);

    return run((guardrail) => {
      // The fixture must not inherit the OUTER repository's refs.
      //
      // `review-guardrails.mjs` resolves its base and head as
      // `--base || NX_BASE || origin/main` and `--head || NX_HEAD || HEAD`. CI sets both, so
      // without this the child ran `git diff <fixture-base>...<real-repo-sha>` inside a
      // throwaway repository that has never heard of that SHA, and died with
      // `fatal: Invalid symmetric difference expression`.
      //
      // Locally neither variable is set, `head` fell back to `HEAD`, the dirty-tree branch of
      // `parseDiff()` was taken and everything passed. So this file was green here and red in
      // CI for an entire push — the exact trap `AGENTS/11-beta-program.md` §3 records as "only
      // a CI run is authoritative". Both are now passed explicitly *and* stripped from the
      // environment, because either alone would leave the other as a latent path.
      const env = { ...process.env };
      delete env.NX_BASE;
      delete env.NX_HEAD;

      const result = spawnSync(
        process.execPath,
        [GUARDRAILS, '--only', guardrail, '--base', base, '--head', 'HEAD'],
        { cwd: dir, encoding: 'utf8', env },
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

/**
 * Asserts the guardrail stays green but *warns*, naming the reason.
 *
 * Needed once missing-locale-key parity became a warning rather than a failure: a missing key
 * falls back to English and is handled, so failing would force whoever runs the extraction to
 * also invent the translations. Green-and-silent and green-with-a-warning are different
 * outcomes, and a control that only checks the exit code cannot tell them apart — which is how
 * a demoted check quietly becomes no check at all.
 */
function expectWarn(label, guardrail, files, mutate, expected) {
  negative += 1;
  withFixture(files, mutate, (runGuardrail) => {
    const { code, out } = runGuardrail(guardrail);
    if (code !== 0) {
      failures.push(`${label}: ${guardrail} failed, but this should only warn.\n    ${out.trim()}`);
      return;
    }
    if (!expected.test(out)) {
      failures.push(
        `${label}: ${guardrail} was green but did not warn about it.\n` +
          `    expected /${expected.source}/\n    got: ${out.trim()}`,
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

expectWarn(
  'locale missing a key the reference has — warns, because English is the fallback',
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

/* ---------------- checkTranslationContext ---------------- */

/** Context for every string in `EN_JSON`, keyed identically, plus one `$` metadata key. */
const EN_CONTEXT = `{
  "$note": "Translator context for en.json.",
  "app.title": "PRODUCT NAME — do not translate.",
  "app.nav.toggle": "Accessible name for the nav rail button. 'Toggle' is a verb.",
  "settings.themes.search": "Accessible name for the themes search button. A verb phrase."
}
`;

const WITH_CONTEXT = { ...APP, 'apps/nuxeo-ui/public/i18n/en.context.json': EN_CONTEXT };

expectGreen('context for every string', 'checkTranslationContext', WITH_CONTEXT);

expectRed(
  'no context file at all',
  'checkTranslationContext',
  APP,
  null,
  /has no sibling en\.context\.json/,
);

expectRed(
  'a new string with no context',
  'checkTranslationContext',
  WITH_CONTEXT,
  (write) =>
    write(
      'apps/nuxeo-ui/public/i18n/en.json',
      EN_JSON.replace(
        '"title": "Hyland Nuxeo",',
        '"title": "Hyland Nuxeo",\n    "undocumented": "New string",',
      ),
    ),
  /missing context for 1 string\(s\).*app\.undocumented/s,
);

expectRed(
  'context left behind for a deleted string',
  'checkTranslationContext',
  WITH_CONTEXT,
  (write) =>
    write(
      'apps/nuxeo-ui/public/i18n/en.context.json',
      EN_CONTEXT.replace('"$note"', '"app.removed": "Stale.",\n  "$note"'),
    ),
  /documents 1 key\(s\).*app\.removed/s,
);

expectRed(
  'an unparseable context file',
  'checkTranslationContext',
  WITH_CONTEXT,
  (write) => write('apps/nuxeo-ui/public/i18n/en.context.json', '{ "app.title": }\n'),
  /en\.context\.json is not valid JSON/,
);

/* ---------------- checkAngularDevAssets ---------------- */

/**
 * A control for the `ignore` field specifically. The parity key compared glob, input and output
 * only, so an entry excluding a file in the base array and not in `development` was identical as
 * far as this gate could see, while the two configurations served different files — the same
 * divergence the gate exists for, one field further in. Found while excluding the translator
 * context file from the build.
 */
const ANGULAR_JSON = (developmentIgnore) =>
  `${JSON.stringify(
    {
      projects: {
        'nuxeo-ui': {
          architect: {
            build: {
              options: {
                assets: [
                  { glob: '**/*', input: 'apps/nuxeo-ui/public', ignore: ['i18n/*.context.json'] },
                ],
              },
              configurations: {
                development: {
                  assets: [
                    {
                      glob: '**/*',
                      input: 'apps/nuxeo-ui/public',
                      ...(developmentIgnore ? { ignore: developmentIgnore } : {}),
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    null,
    2,
  )}\n`;

expectGreen('matching ignore lists', 'checkAngularDevAssets', {
  'angular.json': ANGULAR_JSON(['i18n/*.context.json']),
});

expectRed(
  'a configuration that drops the base ignore list',
  'checkAngularDevAssets',
  { 'angular.json': ANGULAR_JSON(null) },
  null,
  /overrides assets but omits/,
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
  falsePositiveControls += 1;
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

/* ---------------- checkNoHardcodedDescriptorText ---------------- */

/** A descriptor file doing it right: the label is a translation key, not English. */
const GOOD_DESCRIPTORS = `export const NAV_ITEMS = [
  { id: 'app.navbar.browse', label: 'nav.browse', icon: 'folder' },
  { id: 'app.navbar.trash', label: 'nav.trash', icon: 'delete' },
];
`;

const WITH_DESCRIPTORS = {
  ...APP,
  'libs/shared/extensions/src/lib/nav-items.ts': GOOD_DESCRIPTORS,
};

expectGreen('descriptor labels that are keys', 'checkNoHardcodedDescriptorText', WITH_DESCRIPTORS);

expectRed(
  'a hard-coded descriptor label',
  'checkNoHardcodedDescriptorText',
  WITH_DESCRIPTORS,
  (write) =>
    write(
      'libs/shared/extensions/src/lib/nav-items.ts',
      `${GOOD_DESCRIPTORS}export const EXTRA = [{ id: 'x', label: 'Knowledge Discovery' }];\n`,
    ),
  /introduces `label: 'Knowledge Discovery'` — a user-facing string in a descriptor/,
);

const SHELL = (title) =>
  `<!doctype html>\n<html lang="en">\n  <head>\n    <title>${title}</title>\n  </head>\n` +
  `  <body><app-root></app-root></body>\n</html>\n`;

expectRed(
  'an Angular interpolation in the document shell',
  'checkNoTemplateSyntaxInDocumentShell',
  { 'apps/nuxeo-ui/src/index.html': SHELL("{{ 'app.title' | translate }}") },
  null,
  /document shell/,
);

expectGreen('a static document title', 'checkNoTemplateSyntaxInDocumentShell', {
  'apps/nuxeo-ui/src/index.html': SHELL('Nuxeo Platform'),
});

// The comment in index.html that explains this rule quotes the syntax it forbids. The first
// run of the check failed on that comment, so the exemption is a control rather than a note.
expectGreen('the syntax quoted inside an HTML comment', 'checkNoTemplateSyntaxInDocumentShell', {
  'apps/nuxeo-ui/src/index.html':
    `<!doctype html>\n<html lang="en">\n  <head>\n` +
    `    <!-- Static on purpose: {{ 'x' | translate }} would render literally here. -->\n` +
    `    <title>Nuxeo Platform</title>\n  </head>\n  <body><app-root></app-root></body>\n</html>\n`,
});

// A gate that finds no file to read must say so rather than pass.
expectRed(
  'no document shell to check at all',
  'checkNoTemplateSyntaxInDocumentShell',
  { 'apps/nuxeo-ui/src/main.ts': 'export const x = 1;\n' },
  null,
  /asserted nothing/,
);

expectRed(
  'prose in a plain attribute on a component',
  'checkNoProseInComponentInputs',
  { 'libs/features/x/src/lib/x.html': '<mat-tab label="Permissions"></mat-tab>\n' },
  null,
  /component input holding user-facing text/,
);

expectGreen('a bound and translated component input', 'checkNoProseInComponentInputs', {
  'libs/features/x/src/lib/x.html': `<mat-tab [label]="'x.tab.permissions' | translate"></mat-tab>\n`,
});

// The element pattern deliberately matches components, not HTML. `title` on a <button> is an
// HTML attribute and belongs to checkNoHardcodedUiText, which is diff-scoped; reporting it
// here as well would make every pre-existing one a blocker.
expectGreen('a plain attribute on an HTML element', 'checkNoProseInComponentInputs', {
  'libs/features/x/src/lib/x.html': '<button title="Save">x</button>\n',
});

// A non-text input that happens to start with a capital must not be flagged.
expectGreen('a non-text input with a capitalised value', 'checkNoProseInComponentInputs', {
  'libs/features/x/src/lib/x.html': '<mat-icon fontSet="Material Icons">home</mat-icon>\n',
});

const BOOTSTRAP = (defaultLanguage, available = ['en', 'fr']) =>
  `${JSON.stringify({ defaultLanguage, availableLanguages: available }, null, 2)}\n`;
const CATALOGUES = {
  'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
  'apps/nuxeo-ui/public/i18n/fr.json': '{\n  "a": "A"\n}\n',
};

expectRed(
  'the generated pseudo-locale shipped as the default',
  'checkShippedDefaultLanguage',
  {
    ...CATALOGUES,
    'nuxeo-agentic-ui-package/src/main/config/bootstrap.json': BOOTSTRAP('zz', ['en', 'fr']),
  },
  null,
  /GENERATED pseudo-locale/,
);

expectRed(
  'a default language with no catalogue behind it',
  'checkShippedDefaultLanguage',
  {
    ...CATALOGUES,
    'nuxeo-agentic-ui-package/src/main/config/bootstrap.json': BOOTSTRAP('de', ['en', 'fr', 'de']),
  },
  null,
  /no catalogue exists for it/,
);

expectRed(
  'a default absent from availableLanguages',
  'checkShippedDefaultLanguage',
  {
    ...CATALOGUES,
    'nuxeo-agentic-ui-package/src/main/config/bootstrap.json': BOOTSTRAP('fr', ['en']),
  },
  null,
  /absent from/,
);

expectGreen('a real shipped default', 'checkShippedDefaultLanguage', {
  ...CATALOGUES,
  'nuxeo-agentic-ui-package/src/main/config/bootstrap.json': BOOTSTRAP('en', ['en', 'fr']),
});

// A gate that cannot find the file it checks must say so, not pass.
expectRed(
  'no packaged bootstrap.json at all',
  'checkShippedDefaultLanguage',
  { ...CATALOGUES },
  null,
  /asserted nothing/,
);

// ── slice 12: the sweep is repo-wide, so it must see an UNCHANGED file ──────────────────

expectRed(
  'a hard-coded string in a file the change never touched',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<button>Regression Bait</button>\n' },
  // No mutation: the file is in the baseline commit, so a diff-scoped check would not look.
  null,
  /Regression Bait/,
);

expectGreen('prose inside a multi-line HTML comment', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html': '<!--\n  Some explanation in prose.\n-->\n<div></div>\n',
});

expectGreen('a code sample inside a pre block', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html':
    '<pre class="code-block">\nImport The Component From Somewhere\n</pre>\n',
});

// ── the three blind spots found reviewing NXSAT-227 ──────────────────────────────────────
//
// Each of these passed before the fix, and each was a shape the check was written to catch.

expectRed(
  'prose alone on its own line, as Prettier and Angular control flow write it',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div>placeholder</div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      '<button>\n  @if (saving()) {\n    <mat-spinner />\n  } @else {\n    Create\n  }\n</button>\n',
    ),
  /hard-coded English/,
);

expectRed(
  'literal text beside a translated attribute on the same line',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div>placeholder</div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      `<button [attr.aria-label]="'x.y' | translate">Show details</button>\n`,
    ),
  /hard-coded English/,
);

// The exemption must still apply to what actually earned it.
expectGreen('a fully translated element across several lines', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html': `<button [attr.aria-label]="'x.y' | translate">\n  {{ 'x.z' | translate }}\n</button>\n`,
});

expectRed(
  'a catalogue value that is null rather than a string',
  'checkTranslationCatalogues',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": null\n}\n',
    'apps/nuxeo-ui/public/i18n/fr.json': '{\n  "a": "A"\n}\n',
  },
  null,
  // Must name en.json. It used to drop the key and then blame fr.json for an "extra" one.
  /en\.json maps `a` to null/,
);

expectRed(
  'translator context that is an empty string',
  'checkTranslationContext',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    'apps/nuxeo-ui/public/i18n/en.context.json': '{\n  "a": ""\n}\n',
  },
  null,
  /same as saying nothing/,
);

expectRed(
  'translator context that is only whitespace',
  'checkTranslationContext',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    'apps/nuxeo-ui/public/i18n/en.context.json': '{\n  "a": "   "\n}\n',
  },
  null,
  /same as saying nothing/,
);

expectGreen('a label paired with a labelKey', 'checkNoHardcodedDescriptorText', {
  ...WITH_DESCRIPTORS,
  'libs/shared/extensions/src/lib/nav-items.ts':
    `${GOOD_DESCRIPTORS}export const PAIRED = [
` +
    `  { id: 'x', labelKey: 'nav.browse', label: 'Browse' },
];
`,
});

expectRed(
  'a hard-coded descriptor placeholder',
  'checkNoHardcodedDescriptorText',
  WITH_DESCRIPTORS,
  (write) =>
    write(
      'libs/shared/extensions/src/lib/nav-items.ts',
      `${GOOD_DESCRIPTORS}export const F = { placeholder: 'Enter a name for your saved search' };\n`,
    ),
  /introduces `placeholder: 'Enter a name for your saved search'`/,
);

/**
 * The shapes that must NOT be flagged. `title` and `description` are excluded deliberately —
 * they name Nuxeo document properties and schema documentation as often as UI chrome, so
 * flagging them would mean arguing with the reviewer, and a check that argues gets disabled.
 */
for (const [label, line] of [
  ['a label that is already a key', `export const A = { label: 'nav.browse' };`],
  ['a lowercase value', `export const B = { label: 'folder' };`],
  ['an interpolated label', 'export const C = { label: `${prefix} items` };'],
  ['a title property', `export const D = { title: 'Saved Search' };`],
  ['a description property', `export const E = { description: 'Repository path of the doc.' };`],
  ['a commented-out label', `// label: 'Knowledge Discovery'`],
  ['a docblock mentioning one', ` * label: 'Knowledge Discovery'`],
]) {
  positive += 1;
  falsePositiveControls += 1;
  withFixture(
    WITH_DESCRIPTORS,
    (write) => write('libs/shared/extensions/src/lib/nav-items.ts', `${GOOD_DESCRIPTORS}${line}\n`),
    (runGuardrail) => {
      const { code, out } = runGuardrail('checkNoHardcodedDescriptorText');
      if (code !== 0) {
        failures.push(`false positive — ${label} was flagged.\n    ${out.trim()}`);
      }
    },
  );
}

expectRed(
  'a spec file is out of scope, but a real descriptor beside it is not',
  'checkNoHardcodedDescriptorText',
  WITH_DESCRIPTORS,
  (write) => {
    write(
      'libs/shared/extensions/src/lib/nav-items.spec.ts',
      `it('x', () => { const a = { label: 'Ignored In Specs' }; });\n`,
    );
    write(
      'libs/shared/extensions/src/lib/nav-items.ts',
      `${GOOD_DESCRIPTORS}export const G = { label: 'Real Descriptor' };\n`,
    );
  },
  /nav-items\.ts.*label: 'Real Descriptor'/s,
);

// ── controls for the blind spots Copilot found on #198 ───────────────────────────────────
//
// Each of these passed before the fix, and each is a shape the check was written to catch.

expectRed(
  'prose alone on its own line, as Prettier and Angular control flow write it',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div>placeholder</div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      '<button>\n  @if (saving()) {\n    <mat-spinner />\n  } @else {\n    Create\n  }\n</button>\n',
    ),
  /hard-coded English/,
);

expectRed(
  'literal text beside a translated attribute on the same line',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div>placeholder</div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      `<button [attr.aria-label]="'x.y' | translate">Show details</button>\n`,
    ),
  /hard-coded English/,
);

// The exemption must still apply to whatever actually earned it.
expectGreen('a fully translated element across several lines', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html': `<button [attr.aria-label]="'x.y' | translate">\n  {{ 'x.z' | translate }}\n</button>\n`,
});

// `Object.entries(null)` throws, which killed the script and took every other guardrail's
// diagnostics with it. Going red for the right reason is the whole point of this one.
expectRed(
  'a catalogue that parses to null',
  'checkTranslationCatalogues',
  { 'apps/nuxeo-ui/public/i18n/en.json': 'null\n' },
  null,
  /parses but is null, not an object/,
);

expectRed(
  'a catalogue value that is null rather than a string',
  'checkTranslationCatalogues',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": null\n}\n',
    'apps/nuxeo-ui/public/i18n/fr.json': '{\n  "a": "A"\n}\n',
  },
  null,
  // Must name en.json. It used to drop the key and then blame fr.json for an "extra" one.
  /en\.json maps `a` to null/,
);

expectRed(
  'translator context that is an empty string',
  'checkTranslationContext',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    'apps/nuxeo-ui/public/i18n/en.context.json': '{\n  "a": ""\n}\n',
  },
  null,
  /same as saying nothing/,
);

expectRed(
  'a context file that parses to null',
  'checkTranslationContext',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    'apps/nuxeo-ui/public/i18n/en.context.json': 'null\n',
  },
  null,
  /parses but is null/,
);

// The comment beside `availableLanguages` claimed an invariant nothing enforced.
expectRed(
  'an advertised locale with no catalogue behind it',
  'checkAdvertisedLocalesShip',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    'nuxeo-agentic-ui-package/src/main/config/bootstrap.json':
      '{\n  "defaultLanguage": "en",\n  "availableLanguages": ["en", "es"]\n}\n',
  },
  null,
  // The message now names the catalogue directory it looked in, because the gate reads more than
  // one config and "no catalogue ships" was ambiguous about which application was meant.
  /advertises "es"[\s\S]*ships no catalogue for it/,
);

expectGreen('an advertised locale that ships', 'checkAdvertisedLocalesShip', {
  'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
  'apps/nuxeo-ui/public/i18n/fr.json': '{\n  "a": "A"\n}\n',
  'nuxeo-agentic-ui-package/src/main/config/bootstrap.json':
    '{\n  "defaultLanguage": "en",\n  "availableLanguages": ["en", "fr"]\n}\n',
});

// ── controls for round two of the Copilot review ─────────────────────────────────────────

expectRed(
  'a bound literal in a text attribute',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div>placeholder</div>\n' },
  (write) =>
    write('libs/features/x/src/lib/x.html', `<button [title]="'Recently Edited'"></button>\n`),
  /Recently Edited/,
);

expectGreen('a bound TRANSLATED value in the same position', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html': `<button [title]="'x.y' | translate"></button>\n`,
});

// `Object.entries(null)` throws. checkTranslationCatalogues records the shape error but
// cannot stop this guardrail crashing on the same file and taking the run's output with it.
expectRed(
  'a reference catalogue that parses to null, reaching the context gate',
  'checkTranslationContext',
  {
    'apps/nuxeo-ui/public/i18n/en.json': 'null\n',
    'apps/nuxeo-ui/public/i18n/en.context.json': '{\n  "a": "context"\n}\n',
  },
  null,
  /parses but is null/,
);

// The rebrand demo edits the packaged config and the runbook says to reset it. It was not
// reset, and the demo branding reached a pull request inside an unrelated change.
expectRed(
  'the demo rebrand left in the packaged marketplace config',
  'checkPackagedConfigIsNotADemo',
  {
    'libs/shared/app-config/src/lib/bootstrap-config.ts':
      'export const DEFAULT_APP_BOOTSTRAP_CONFIG = {\n' +
      "  branding: { applicationTitle: 'Hyland Nuxeo' },\n  defaultThemeId: 'nuxeo',\n};\n",
    'nuxeo-agentic-ui-package/src/main/config/bootstrap.json':
      '{\n  "branding": { "applicationTitle": "Acme Content Cloud" },\n' +
      '  "defaultThemeId": "acme",\n  "themes": [{ "id": "acme" }]\n}\n',
  },
  null,
  /not the compiled default/,
);

expectGreen('a packaged config matching the compiled defaults', 'checkPackagedConfigIsNotADemo', {
  'libs/shared/app-config/src/lib/bootstrap-config.ts':
    'export const DEFAULT_APP_BOOTSTRAP_CONFIG = {\n' +
    "  branding: { applicationTitle: 'Hyland Nuxeo' },\n  defaultThemeId: 'nuxeo',\n};\n",
  'nuxeo-agentic-ui-package/src/main/config/bootstrap.json':
    '{\n  "branding": { "applicationTitle": "Hyland Nuxeo" },\n' +
    '  "defaultThemeId": "nuxeo",\n  "themes": []\n}\n',
});

// ── controls for round three of the Copilot review ───────────────────────────────────────

/**
 * A `crowdin-conf.yml` with two source entries, and the workflow pair that reads it.
 *
 * `checkCrowdinConfig` shipped with no controls at all, and the gap hid a real defect: its D8
 * options check asked `body.includes('export_only_approved')` once for the whole file, so with
 * two mappings it could not tell which entry declared what. Two entries is therefore the
 * minimum fixture — a single-entry one passes body-wide and per-entry checks identically and
 * would have proved nothing.
 */
const CROWDIN_ENTRY = (source) =>
  `    {\n` +
  `      'source': '${source}',\n` +
  `      'translation': '/%original_path%/%two_letters_code%.%file_extension%',\n` +
  `      'export_only_approved': 'true',\n` +
  `      'update_option': 'update_without_changes',\n` +
  `    },\n`;

const crowdinConf = (entries) =>
  `'base_url': 'https://hyland.api.crowdin.com'\n` +
  `'project_id_env': 'CROWDIN_PROJECT_ID'\n` +
  `'api_token_env': 'CROWDIN_PERSONAL_TOKEN'\n` +
  `'base_path': '.'\n` +
  `'preserve_hierarchy': true\n` +
  `'files': [\n${entries.join('')}  ]\n`;

const CROWDIN_WORKFLOW = (extra) =>
  `name: crowdin\non: push\njobs:\n  sync:\n    if: \${{ vars.CROWDIN_SYNC_ENABLED == 'true' }}\n` +
  `    runs-on: ubuntu-latest\n    steps:\n      - uses: crowdin/github-action@v2\n` +
  `        with:\n          config: crowdin-conf.yml\n${extra}`;

const CROWDIN = {
  'crowdin-conf.yml': crowdinConf([
    CROWDIN_ENTRY('/apps/*/public/i18n/en.json'),
    CROWDIN_ENTRY('/libs/**/i18n/en.json'),
  ]),
  // The push workflow both WATCHES the context files and RUNS the uploader. The green fixture
  // originally had only the `paths`, which is the same gap the guardrail had — so the control for
  // the trigger passed while nothing asserted the job did any work.
  '.github/workflows/crowdin-push.yaml':
    CROWDIN_WORKFLOW(`          command_args: '--delete-obsolete'\n`) +
    `      - name: Push translator context\n` +
    `        run: node tools/i18n/crowdin-push-context.mjs\n`,
  // The pull workflow signs on the ACTION, because that is the only placement that signs
  // anything — see the control for it below.
  '.github/workflows/crowdin-pull.yaml': CROWDIN_WORKFLOW(
    `          gpg_private_key: \${{ secrets.GPG_PRIVATE_KEY }}\n`,
  ),
  'apps/nuxeo-ui/public/i18n/en.json': EN_JSON,
};

expectGreen('a D8-compliant two-entry Crowdin config', 'checkCrowdinConfig', CROWDIN);

// Signing has to be configured on the ACTION, because `crowdin/github-action` is a Docker action
// and commits inside its own container. A host-level key import succeeds, changes nothing the
// container sees, and leaves the commit unsigned — a step that can neither fail nor work.
//
// The fixture deliberately KEEPS a host-level import step while removing the action's input, which
// is the exact arrangement that shipped. It is also what caught the first version of this check:
// that searched the whole file for `gpg_private_key:`, matched the host step's identically-named
// input, and passed on the defect.
expectRed(
  'the pull workflow importing a key on the host but not signing the action',
  'checkCrowdinConfig',
  CROWDIN,
  (write) =>
    write(
      '.github/workflows/crowdin-pull.yaml',
      CROWDIN_WORKFLOW('').replace(
        '      - uses: crowdin/github-action@v2\n',
        `      - uses: crazy-max/ghaction-import-gpg@v6\n` +
          `        with:\n` +
          `          gpg_private_key: \${{ secrets.GPG_PRIVATE_KEY }}\n` +
          `          git_commit_gpgsign: true\n` +
          `      - uses: crowdin/github-action@v2\n`,
      ),
    ),
  /without passing `gpg_private_key`, so its commits are unsigned/,
);

// The founding defect. Both options deleted from the SECOND entry only: the first still
// contains both tokens, so the body-wide check this replaced stayed green here.
expectRed(
  'one Crowdin source entry stripped of both D8 options',
  'checkCrowdinConfig',
  CROWDIN,
  (write) =>
    write(
      'crowdin-conf.yml',
      crowdinConf([
        CROWDIN_ENTRY('/apps/*/public/i18n/en.json'),
        `    {\n      'source': '/libs/**/i18n/en.json',\n` +
          `      'translation': '/%original_path%/%two_letters_code%.%file_extension%',\n    },\n`,
      ]),
    ),
  /entry `\/libs\/\*\*\/i18n\/en\.json` omits `export_only_approved`/,
);

// Presence is not the policy. `export_only_approved: 'false'` does the opposite of what D8 asks
// and satisfied every token-counting form of this check.
expectRed(
  'a Crowdin entry that declares export_only_approved and disables it',
  'checkCrowdinConfig',
  CROWDIN,
  (write) =>
    write(
      'crowdin-conf.yml',
      crowdinConf([
        CROWDIN_ENTRY('/apps/*/public/i18n/en.json'),
        CROWDIN_ENTRY('/libs/**/i18n/en.json').replace(
          `'export_only_approved': 'true'`,
          `'export_only_approved': 'false'`,
        ),
      ]),
    ),
  /sets `export_only_approved: false`, not `true`/,
);

// An ABSENT mapping, which is what a check that iterates only the values it finds cannot see.
// With the `translation` line deleted from the second entry, the source count still said two, the
// segment count still said two, and the surviving entry's valid pattern carried the gate to green.
expectRed(
  'a Crowdin entry that declares no translation mapping at all',
  'checkCrowdinConfig',
  CROWDIN,
  (write) =>
    write(
      'crowdin-conf.yml',
      crowdinConf([
        CROWDIN_ENTRY('/apps/*/public/i18n/en.json'),
        CROWDIN_ENTRY('/libs/**/i18n/en.json').replace(
          /\s*'translation': '[^']*',/,
          '',
        ),
      ]),
    ),
  /entry `\/libs\/\*\*\/i18n\/en\.json` declares no `translation`/,
);

// A mapping that is present but wrong, per entry rather than anywhere in the body.
expectRed(
  'one Crowdin entry mapping translations to a regional filename',
  'checkCrowdinConfig',
  CROWDIN,
  (write) =>
    write(
      'crowdin-conf.yml',
      crowdinConf([
        CROWDIN_ENTRY('/apps/*/public/i18n/en.json'),
        CROWDIN_ENTRY('/libs/**/i18n/en.json').replace(
          '%two_letters_code%.%file_extension%',
          '%locale%.json',
        ),
      ]),
    ),
  /entry `\/libs\/\*\*\/i18n\/en\.json` maps translations to `[^`]*%locale%\.json`/,
);

// A gate that cannot segment the file must say so rather than report a policy it stopped
// enforcing. Block-style YAML is valid Crowdin config and this segmenter does not read it.
expectRed(
  'a files block this guardrail cannot segment',
  'checkCrowdinConfig',
  CROWDIN,
  (write) =>
    write(
      'crowdin-conf.yml',
      `'base_url': 'https://hyland.api.crowdin.com'\n'base_path': '.'\n` +
        `'files':\n  - 'source': '/apps/*/public/i18n/en.json'\n` +
        `    'translation': '/%original_path%/%two_letters_code%.%file_extension%'\n` +
        `    'export_only_approved': 'true'\n    'update_option': 'update_without_changes'\n`,
    ),
  /cannot segment into entries/,
);

/* ---------------- checkNoReviewCorpusChurn ---------------- */

/**
 * Both halves of the corpus check, which shipped with neither.
 *
 * They are separate assertions and neither implies the other: the path half catches the corpus
 * file returning under its own name, the marker half catches the generated statistics block
 * returning to any file — including under a different name, which the path half cannot see.
 */
// Split, like the guardrail's own copy is. `checkNoReviewCorpusChurn` fails any ADDED line
// carrying this marker, and it does not exempt itself or this file — so writing it whole here
// makes the gate red on the change that adds its controls. That is the fourth time a guardrail
// in this repository has matched the text describing it; the split is the standing workaround.
const CORPUS_MARKER = `pr-review-stats${':'}start`;
/** The guardrail's diagnostic, assembled so this line does not contain the marker either. */
const CORPUS_MARKER_MESSAGE = new RegExp(`adds a generated \`${CORPUS_MARKER}\` block`);

expectGreen('a diff that touches no review bookkeeping', 'checkNoReviewCorpusChurn', {
  'docs/some-doc.md': '# A document\n',
});

expectRed(
  'the tracked findings corpus back in the diff',
  'checkNoReviewCorpusChurn',
  { 'docs/some-doc.md': '# A document\n' },
  (write, git) => {
    write('docs/pr-review-findings.jsonl', '{"finding":"one"}\n');
    // Staged, because `git diff` does not report an untracked path. Written and left untracked,
    // this control was green against a tree carrying the corpus — it asserted nothing.
    git(['add', 'docs/pr-review-findings.jsonl']);
  },
  /docs\/pr-review-findings\.jsonl is back in the diff/,
);

expectRed(
  'the generated statistics block re-added under another path',
  'checkNoReviewCorpusChurn',
  { '.cursor/skills/pre-pr-review/SKILL.md': '# Pre-PR review\n' },
  (write) =>
    write(
      '.cursor/skills/pre-pr-review/SKILL.md',
      `# Pre-PR review\n\n<!-- ${CORPUS_MARKER} -->\n| finding | count |\n`,
    ),
  CORPUS_MARKER_MESSAGE,
);

// The marker check reads ADDED lines, not file contents, so a pull request that merely touches
// a file already carrying the marker is not blamed for it. Without this the check would go red
// on every unrelated change to that file, and a gate nobody can pass gets bypassed.
falsePositiveControls += 1;
expectGreen('a file that already carried the marker before this diff', 'checkNoReviewCorpusChurn', {
  '.cursor/skills/pre-pr-review/SKILL.md': `# Pre-PR review\n\n<!-- ${CORPUS_MARKER} -->\n`,
});

/* ---------------- checkNoHardcodedUiText: parameterised translate spans ---------------- */

// A parameterised pipe's own braces ended the interpolation pattern, so `| translate` survived
// into the remainder and the whole-line escape skipped the line — carrying the hard-coded sibling
// text with it. A false negative in the gate that enforces AC1, created by this PR: parameterised
// pipes became the recommended form once accessible names started carrying values.
expectRed(
  'hard-coded text beside a parameterised translate interpolation',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div></div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      `{{ 'x.items' | translate: { count: n } }} <span>Show Details</span>\n`,
    ),
  /Show Details/,
);

// A quoted literal inside an Angular EXPRESSION. Displayed text that nothing could reach: the
// interpolation braces mean it matches neither the element-text pattern nor the bare-prose one.
// `nav-drawer.component.html:266` is exactly this shape and sat in a template this repository
// described as having zero hard-coded strings left.
expectRed(
  'a hard-coded literal inside a ternary interpolation',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div></div>\n' },
  (write) =>
    write('libs/features/x/src/lib/x.html', `<span>{{ isOverdue(t) ? 'Overdue' : 'Due' }}</span>\n`),
  /the quoted literal `'Overdue'`/,
);

// Expressions quote keys, ids, types and CSS classes constantly. Flagging every quoted string would
// make this gate unpassable, so `isDisplayText` and a dotted-token exemption do the judging.
falsePositiveControls += 1;
expectGreen('quoted non-prose inside expressions', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html':
    `<span>{{ doc.lastModified | date: 'mediumDate' }}</span>\n` +
    `<div [class.active]="mode === 'grid'"></div>\n` +
    `<span>{{ 'browse.title' | translate }}</span>\n` +
    `<hxp-icon name="refresh" [attr.data-type]="'Folder'" />\n`,
});

// Prose on the same line as a TRANSLATED interpolation, which the bare-prose branch could never
// reach: it tested the raw line, and the raw line contains `{`, so `BARE_PROSE_LINE` rejected it and
// the hard-coded words were never judged. Every other branch already used the remainder.
expectRed(
  'hard-coded prose beside a translated interpolation on one line',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div></div>\n' },
  (write) =>
    write('libs/features/x/src/lib/x.html', `{{ 'x.label' | translate }} Show Details\n`),
  /Show Details/,
);

// And the parameterised interpolation alone is still exempt, or the fix would fail every
// pluralised string in the repository.
falsePositiveControls += 1;
expectGreen('a parameterised translate interpolation on its own', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html': `{{ 'x.items' | translate: { count: n } }}\n`,
});

falsePositiveControls += 1;
expectGreen('a parameterised translate bound to an accessible name', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html':
    `<button [attr.aria-label]="'x.y' | translate: { name: nodeLabel(node) }"></button>\n`,
});

/* ---------------- checkNoHardcodedUiText: comment and <pre> spans ---------------- */

// The founding case. A multi-line template comment's interior lines start with prose, so the
// `startsWith('<!--')` skip never saw them and every sentence beginning with a capital was
// reported as hard-coded English — including a comment explaining why a label uses an
// interpolation parameter.
falsePositiveControls += 1;
expectGreen('the interior lines of a multi-line template comment', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html':
    '<!--\n  The name goes through an interpolation parameter, not a concatenation.\n' +
    '  INFO-144 forbids building a string from concatenated substrings.\n-->\n' +
    `<button [attr.aria-label]="'x.y' | translate"></button>\n`,
});

// Code shown to customers as documentation. Translating an import statement would be wrong.
falsePositiveControls += 1;
expectGreen('a code sample inside a <pre> block', 'checkNoHardcodedUiText', {
  'libs/features/x/src/lib/x.html':
    '<pre>\n  import { Component } from "@angular/core";\n  Register The Rule Here\n</pre>\n',
});

// The dangerous failure mode: if the span never closes, everything after the first comment in the
// file is exempt and the guardrail is dead while still reporting green.
expectRed(
  'a hard-coded label after a CLOSED multi-line comment',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div></div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      '<!--\n  An explanation spanning lines.\n-->\n<button title="Recently Edited"></button>\n',
    ),
  /Recently Edited/,
);

expectRed(
  'a hard-coded label after a CLOSED <pre> block',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div></div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      '<pre>\n  import { Component } from "@angular/core";\n</pre>\n' +
        '<button title="Show Details"></button>\n',
    ),
  /Show Details/,
);

// The hole that skipping whole lines left: a real label escaped the gate by having a comment
// after it on the same line. Spans are blanked instead, so what is left on the line is the markup.
expectRed(
  'a hard-coded label on the same line as a trailing comment',
  'checkNoHardcodedUiText',
  { 'libs/features/x/src/lib/x.html': '<div></div>\n' },
  (write) =>
    write(
      'libs/features/x/src/lib/x.html',
      '<button title="Recently Edited"></button> <!-- a trailing note -->\n',
    ),
  /Recently Edited/,
);

/* ---------------- checkTranslatorContextPush ---------------- */

/** The two lines of the loader's flattener this guardrail holds the script's copy to. */
const LOADER_FLATTENER = `export function flattenCatalogue(source, prefix = '', target = {}) {
  if (typeof source !== 'object' || source === null || Array.isArray(source)) return target;
  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof value === 'string') target[path] = value;
    else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenCatalogue(value, path, target);
    }
  }
  return target;
}
`;

const SCRIPT_FLATTENER = `export function flattenKeys(node, prefix = '') {
  const out = [];
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof value === 'string') out.push(path);
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...flattenKeys(value, path));
    }
  }
  return out;
}
`;

const CONTEXT_PUSH = {
  'tools/i18n/crowdin-push-context.mjs': SCRIPT_FLATTENER,
  'apps/nuxeo-ui/src/app/i18n/app-translate-loader.ts': LOADER_FLATTENER,
  'crowdin-conf.yml': crowdinConf([
    CROWDIN_ENTRY('/apps/*/public/i18n/en.json'),
    CROWDIN_ENTRY('/libs/**/i18n/en.json'),
  ]),
  'apps/nuxeo-ui/public/i18n/en.json': EN_JSON,
  'apps/nuxeo-ui/public/i18n/en.context.json': EN_CONTEXT,
};

expectGreen('a context file reachable through a declared source', 'checkTranslatorContextPush', {
  ...CONTEXT_PUSH,
});

// The `libs/**` glob crosses separators, so a deeply nested library catalogue IS reachable.
// Without this control the reachability half could be satisfied by a glob translation that
// treated `**` as `*`, and would then reject every real library catalogue.
falsePositiveControls += 1;
expectGreen('a deeply nested library context file the libs glob covers', 'checkTranslatorContextPush', {
  ...CONTEXT_PUSH,
  'libs/platform/nuxeo-client/src/i18n/en.json': EN_JSON,
  'libs/platform/nuxeo-client/src/i18n/en.context.json': EN_CONTEXT,
});

// The founding defect, the other way round: a context file whose catalogue no source matches.
// Its context reaches Crowdin through nothing, and the script still prints a success line.
expectRed(
  'a context file no Crowdin source mapping reaches',
  'checkTranslatorContextPush',
  { ...CONTEXT_PUSH },
  (write) => {
    write('tools/other/i18n/en.json', EN_JSON);
    write('tools/other/i18n/en.context.json', EN_CONTEXT);
    // Under `apps/`, so the walk finds it, but at a depth the `/apps/*/public/` glob cannot reach.
    write('apps/nuxeo-ui/src/deep/i18n/en.json', EN_JSON);
    write('apps/nuxeo-ui/src/deep/i18n/en.context.json', EN_CONTEXT);
  },
  /apps\/nuxeo-ui\/src\/deep\/i18n\/en\.context\.json documents .*which no `source`/s,
);

// The flattener half. Two implementations with nothing comparing them is how a wrong half
// survives; a disagreement here attaches context to identifiers the app never resolves.
//
// The guardrail IMPORTS the fixture's flattener and runs it, so this control asserts changed
// OUTPUT, not changed source text: dropping the array guard makes an array leaf recurse into the
// identifier `a.0`, which Crowdin has never heard of. An earlier revision of both the check and
// this control compared source patterns while claiming to compare behaviour.
expectRed(
  'the script flattener dropping its array-leaf guard while the loader keeps it',
  'checkTranslatorContextPush',
  { ...CONTEXT_PUSH },
  (write) =>
    write(
      'tools/i18n/crowdin-push-context.mjs',
      SCRIPT_FLATTENER.replace(` && !Array.isArray(value)`, ''),
    ),
  /disagrees with the loader on "array leaves are not keys"[\s\S]*\["a\.0","b"\]/,
);

// A flattener that no longer exports `flattenKeys` leaves nothing to compare. Without this the
// import half could fail open: a missing export is not a disagreement.
expectRed(
  'the script no longer exporting its flattener',
  'checkTranslatorContextPush',
  { ...CONTEXT_PUSH },
  (write) =>
    write('tools/i18n/crowdin-push-context.mjs', SCRIPT_FLATTENER.replace('export function', 'function')),
  /no longer exports `flattenKeys`/,
);

// The loader-shape tripwire. It is a SOURCE check, not a behavioural one, because the loader is
// TypeScript and this script has no compiler — so what it must do is fire when the loader is
// rewritten, forcing the transcribed expectations above to be re-derived rather than trusted.
expectRed(
  'the loader flattener rewritten so the transcribed contract no longer describes it',
  'checkTranslatorContextPush',
  { ...CONTEXT_PUSH },
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/i18n/app-translate-loader.ts',
      LOADER_FLATTENER.replace(' && value !== null', ''),
    ),
  /no longer visibly "excludes null from the recursion"/,
);

expectRed(
  'the context push script deleted while the guardrail still claims to gate it',
  'checkTranslatorContextPush',
  {
    'apps/nuxeo-ui/src/app/i18n/app-translate-loader.ts': LOADER_FLATTENER,
    'crowdin-conf.yml': crowdinConf([CROWDIN_ENTRY('/apps/*/public/i18n/en.json')]),
  },
  null,
  /tools\/i18n\/crowdin-push-context\.mjs is missing/,
);

// ── controls for round nine: the template config the gate never read ─────────────────────

/**
 * `checkAdvertisedLocalesShip` read one bootstrap config while the repository had two.
 *
 * `nuxeo-satori-template` is the public Layer 0 example a customer copies. It advertised `fr` and
 * `de`, ships no catalogue directory and wires no `TranslateModule` — so the example described two
 * languages it could not render, and the gate was looking somewhere else entirely.
 */
const TEMPLATE_CONFIG = 'apps/nuxeo-satori-template/public/agentic-ui-config/bootstrap.json';
const PACKAGED_CONFIG = 'nuxeo-agentic-ui-package/src/main/config/bootstrap.json';
const EN_ONLY = '{\n  "defaultLanguage": "en",\n  "availableLanguages": ["en"]\n}\n';

expectRed(
  'the template config advertising a locale it ships no catalogue for',
  'checkAdvertisedLocalesShip',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    [PACKAGED_CONFIG]: EN_ONLY,
    [TEMPLATE_CONFIG]: '{\n  "defaultLanguage": "en",\n  "availableLanguages": ["en", "fr"]\n}\n',
  },
  null,
  /nuxeo-satori-template[\s\S]*advertises "fr"[\s\S]*ships no catalogue/,
);

// English needs no catalogue — it is the source language, compiled in as the fallback — so an
// application with no catalogue directory may advertise English and nothing else. Without this the
// widened gate would fail every template that has no i18n yet, which is a gate nobody can pass.
falsePositiveControls += 1;
expectGreen(
  'a template advertising English only, with no catalogues',
  'checkAdvertisedLocalesShip',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    [PACKAGED_CONFIG]: EN_ONLY,
    [TEMPLATE_CONFIG]: EN_ONLY,
  },
);

// The two configs stay independent: a catalogue in the main app must not satisfy the template.
expectRed(
  "the template borrowing the main app's catalogues",
  'checkAdvertisedLocalesShip',
  {
    'apps/nuxeo-ui/public/i18n/en.json': '{\n  "a": "A"\n}\n',
    'apps/nuxeo-ui/public/i18n/fr.json': '{\n  "a": "A"\n}\n',
    [PACKAGED_CONFIG]: '{\n  "defaultLanguage": "en",\n  "availableLanguages": ["en", "fr"]\n}\n',
    [TEMPLATE_CONFIG]: '{\n  "defaultLanguage": "en",\n  "availableLanguages": ["en", "fr"]\n}\n',
  },
  null,
  /nuxeo-satori-template[\s\S]*advertises "fr"/,
);

// ── controls for round four of the Copilot review ────────────────────────────────────────

/* ---------------- checkAccessibleNameFallbacks: parameterised bindings ---------------- */

/**
 * The binding shape the accessible-name fix itself introduced, which this gate could not see.
 *
 * `nav-drawer.component.html` binds `'nav.tree.toggle' | translate: { name: nodeLabel(node) }`.
 * The matcher stopped at `| translate`, so the key could be deleted from the fallback map and this
 * guardrail stayed green — restoring exactly the raw-key accessible name it exists to prevent.
 * Verified against the real repository before the fix by deleting that entry: still green.
 *
 * A parameterised name is MORE likely here, not less: INFO-144 forbids concatenation, so every
 * label that carries a value is pushed towards this form.
 */
const PARAM_TEMPLATE =
  `<button type="button"\n` +
  `  [attr.aria-label]="'app.nav.toggle' | translate: { name: nodeLabel(node) }"\n` +
  `></button>\n`;

const PARAM_APP = {
  'apps/nuxeo-ui/public/i18n/en.json': EN_JSON,
  'apps/nuxeo-ui/src/app/i18n/en-fallback.ts': EN_FALLBACK,
  'apps/nuxeo-ui/src/app/shell/app-shell.component.html': PARAM_TEMPLATE,
};

expectRed(
  'a parameterised accessible name whose key is missing from the fallback map',
  'checkAccessibleNameFallbacks',
  PARAM_APP,
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/i18n/en-fallback.ts',
      EN_FALLBACK.replace(/\s*'app\.nav\.toggle': 'Toggle navigation menu',/, ''),
    ),
  /binds aria-label to `app\.nav\.toggle`.*omits/s,
);

falsePositiveControls += 1;
expectGreen(
  'a parameterised accessible name whose key IS in the fallback map',
  'checkAccessibleNameFallbacks',
  PARAM_APP,
);

// A PLACEHOLDER is the only thing naming the two shell text inputs, so its key needs a fallback
// exactly as an `aria-label`'s does. Neither `shell.search.placeholder` nor
// `shell.ai.input-placeholder` was in the map, and nothing noticed: this gate read only `aria-label`
// and `title`, while the evidence harness's unnamed-control sweep deliberately accepts a placeholder
// AS a name. Between them a raw key could be announced as the global search box's name.
const PLACEHOLDER_CATALOGUE =
  '{\n  "shell": { "search": { "placeholder": "Search documents" } }\n}\n';
const PLACEHOLDER_TEMPLATE = `<input [placeholder]="'shell.search.placeholder' | translate" />\n`;

expectRed(
  'a translated placeholder whose key is missing from the fallback map',
  'checkAccessibleNameFallbacks',
  {
    'apps/nuxeo-ui/public/i18n/en.json': PLACEHOLDER_CATALOGUE,
    'apps/nuxeo-ui/src/app/i18n/en-fallback.ts':
      'export const EN_FALLBACK_TRANSLATIONS: Record<string, string> = {\n' +
      "  'unrelated.key': 'Unrelated',\n};\n",
    'apps/nuxeo-ui/src/app/shell/app-shell.component.html': PLACEHOLDER_TEMPLATE,
  },
  null,
  /binds placeholder to `shell\.search\.placeholder`[\s\S]*omits/,
);

falsePositiveControls += 1;
expectGreen(
  'a translated placeholder whose key IS in the fallback map',
  'checkAccessibleNameFallbacks',
  {
    'apps/nuxeo-ui/public/i18n/en.json': PLACEHOLDER_CATALOGUE,
    'apps/nuxeo-ui/src/app/i18n/en-fallback.ts':
      'export const EN_FALLBACK_TRANSLATIONS: Record<string, string> = {\n' +
      "  'shell.search.placeholder': 'Search documents',\n};\n",
    'apps/nuxeo-ui/src/app/shell/app-shell.component.html': PLACEHOLDER_TEMPLATE,
  },
);

// A catalogue of `null` is valid JSON, so the `try` around `JSON.parse` does not catch it and
// `Object.entries(null)` threw — killing the process before any accumulated diagnostic printed and
// discarding every other guardrail's output. A guardrail that can crash silences the others.
expectGreen('a catalogue that parses to null does not crash this gate', 'checkAccessibleNameFallbacks', {
  'apps/nuxeo-ui/public/i18n/en.json': 'null\n',
  'apps/nuxeo-ui/src/app/i18n/en-fallback.ts': EN_FALLBACK,
  'apps/nuxeo-ui/src/app/shell/app-shell.component.html': GOOD_TEMPLATE,
});

// A key in OUR shape that no catalogue defines. ngx-translate renders an unresolved key as the key
// itself, so this names the control `app.nav.togle` — and the gate used to wave it through as
// "upstream-owned", which is the commonest way of producing the defect it exists to stop.
expectRed(
  'a misspelled accessible-name key no catalogue defines',
  'checkAccessibleNameFallbacks',
  APP,
  (write) =>
    write(
      'apps/nuxeo-ui/src/app/shell/app-shell.component.html',
      `<button type="button" [attr.aria-label]="'app.nav.togle' | translate"></button>\n`,
    ),
  /binds aria-label to `app\.nav\.togle`, which no catalogue defines/,
);

// Upstream's SCREAMING_CASE keys come from seeded catalogues this repository does not own, so
// absence there is expected and must stay silent. D4 chose the case convention for exactly this.
falsePositiveControls += 1;
expectGreen('an upstream SCREAMING_CASE key absent from our catalogue', 'checkAccessibleNameFallbacks', {
  ...APP,
  'apps/nuxeo-ui/src/app/shell/app-shell.component.html':
    `<button type="button" [attr.aria-label]="'DOCUMENT_TREE.TOGGLE_ARIA-LABEL' | translate"></button>\n`,
});

/* ---------------- checkTranslatorContextPush: the push STEP ---------------- */

// The gate verified which files trigger the job and never that the job runs the uploader. Deleting
// the step left every guardrail green while no translator context reached Crowdin — the doorbell
// checked, nobody answering.
expectRed(
  'a push workflow that watches the context files but never runs the uploader',
  'checkTranslatorContextPush',
  {
    ...CONTEXT_PUSH,
    '.github/workflows/crowdin-push.yaml':
      "on:\n  push:\n    paths:\n      - 'apps/*/public/i18n/en.json'\n" +
      "      - 'apps/*/public/i18n/en.context.json'\n      - 'libs/**/i18n/en.context.json'\n",
  },
  null,
  /never runs `node tools\/i18n\/crowdin-push-context\.mjs`/,
);

/* ---------------- checkTranslatorContextPush: the push trigger ---------------- */

// `paths` and the discovery walk are two independent lists of what counts as a source, and they
// drifted the moment discovery grew. A context file read by the script but watched by no trigger
// means Crowdin serves context the repository has already moved past.
expectRed(
  'a context file the push workflow watches no path for',
  'checkTranslatorContextPush',
  {
    ...CONTEXT_PUSH,
    '.github/workflows/crowdin-push.yaml':
      "on:\n  push:\n    paths:\n      - 'apps/*/public/i18n/en.json'\n",
  },
  null,
  /watches no path matching apps\/nuxeo-ui\/public\/i18n\/en\.context\.json/,
);

falsePositiveControls += 1;
expectGreen('a push workflow watching every discovered context file', 'checkTranslatorContextPush', {
  ...CONTEXT_PUSH,
  // Carries the uploader step as well as the globs, or this positive control fails on the
  // *invocation* half and stops saying anything about the trigger half it exists for.
  '.github/workflows/crowdin-push.yaml':
    "on:\n  push:\n    paths:\n      - 'apps/*/public/i18n/en.json'\n" +
    "      - 'apps/*/public/i18n/en.context.json'\n      - 'libs/**/i18n/en.context.json'\n" +
    '    steps:\n      - run: node tools/i18n/crowdin-push-context.mjs\n',
});

/* ---------------- report ---------------- */

const total = negative + positive;
console.log(
  `review-guardrails selftest: ${total} controls — ${negative} negative (a broken tree must go ` +
    `red, for the stated reason) and ${positive} positive (a correct tree must stay green), ` +
    `of which ${falsePositiveControls} assert that a specific non-violation is NOT flagged.`,
);

if (failures.length) {
  console.error(`\n${failures.length} control(s) did not behave as required:`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log('All controls behaved as required.');
