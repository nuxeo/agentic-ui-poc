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
  /advertises "es".*no catalogue ships/s,
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
