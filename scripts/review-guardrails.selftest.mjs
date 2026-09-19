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
