# i18n — where we actually are

**Dated 16 September 2026.** Measured, not estimated: every number below comes from a command
that is quoted next to it, so it can be re-run rather than believed.

This is the status page. The **plan** is [`docs/i18n-localization-plan.md`](i18n-localization-plan.md);
the two are separate on purpose, because a plan that carries its own progress report goes stale
silently and gets believed anyway.

|              |                                                                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Beta ticket  | [NXSAT-227](https://hyland.atlassian.net/browse/NXSAT-227) — delivered, in review                                                                                                                                                 |
| GA ticket    | [NXSAT-284](https://hyland.atlassian.net/browse/NXSAT-284) — not started                                                                                                                                                          |
| Pull request | [#198](https://github.com/nuxeo/agentic-ui-poc/pull/198)                                                                                                                                                                          |
| Branch       | `feature/nxsat-227a-i18n`                                                                                                                                                                                                         |
| Gate         | **23 of 23 green**, `code-scanning` included. Re-measure rather than reading this: `npm run beta:gate`. This row said 21 of 22 and named a blocker that no longer exists — the gate count grew and CodeQL now runs on the branch. |

---

## How to read this page

Three distinctions do most of the work here, and conflating any of them produces a wrong answer
about how far along we are.

**Internationalization is not localization.** i18n is the machinery — a key/value lookup, a way
to choose a language, a fallback when a key is missing. l10n is the content: the actual
translated strings. The Hyland Crowdin RFC governs only the second and says so in its Scope
section. **Our machinery has been done since Phase 1. The content is barely started.** Every
number that looks bad below is a content number.

**Mechanism working is not application translated.** The French screenshot in the evidence shows
a French search placeholder inside an otherwise English page. That is a true and useful result —
it proves a customer can change language with no rebuild — and it is not a localised product.

**Extraction is not translation.** Converting `>Show details<` into
`{{ 'browse.details.show' | translate }}` makes a string _translatable_. Somebody still has to
translate it, and per the standard that somebody is the Hyland translation crew working in
Crowdin, not a developer editing a JSON file.

---

## Coverage, measured

### Translation keys

```bash
# flattened key count per catalogue
python3 -c "import json;d=json.load(open('apps/nuxeo-ui/public/i18n/en.json'));..."
```

|                              | Before (on `main`) | Now                  |
| ---------------------------- | ------------------ | -------------------- |
| Keys in the app catalogue    | **16**             | **60**               |
| Locales shipped              | 1 (`en`)           | 3 (`en`, `fr`, `de`) |
| Locales at full key parity   | n/a                | 3 of 3, gated        |
| Keys with translator context | 0                  | 60 of 60, gated      |

### Call sites

```bash
git grep -c "| translate" origin/main -- '*.html' | awk -F: '{s+=$3} END {print s}'
git grep -c "| translate" HEAD        -- '*.html' | awk -F: '{s+=$3} END {print s}'
```

|                           | Before  | Now     |
| ------------------------- | ------- | ------- |
| `\| translate` call sites | **7**   | **55**  |
| Templates using it        | 3 of 92 | 4 of 92 |

| Still hard-coded                 | Count         |
| -------------------------------- | ------------- |
| Template strings                 | **1350**      |
| Descriptor strings in TypeScript | **257**       |
| Passed imperatively in `.ts`     | never counted |

Four of ninety-two is the honest headline. It went up by one template because the work was
deliberately deep rather than wide: `app-shell.component.html` is at **zero** remaining
hard-coded strings, which no template in this repository was before.

`nav-drawer.component.html` is **not** at zero, and this passage claimed both templates were.
One string is left — `isOverdue(task) ? 'Overdue' : 'Due'` at line 266 — a quoted literal inside an
Angular expression, which `checkNoHardcodedUiText` does not inspect: the interpolation braces mean it
matches neither the element-text pattern nor the bare-prose one. It predates this diff, and the gate
is diff-scoped, so **the gate cannot certify either template as fully extracted** — it can only say
nothing new was added. That distinction is the honest version of this row.

Verified rather than asserted, twice over. The claim was false when first written — twelve strings
were left, all of them prose alone on its own line, the shape `checkNoHardcodedUiText` could not see
until this PR fixed it. A reviewer found those, not the gate that existed to. The ternary is the
thirteenth, found the same way.

### What is still hard-coded

Counting element text starting with a capital and `aria-label` / `title` / `placeholder` /
`matTooltip` / `alt` attributes with a literal value, excluding lines already using the pipe.

| Project                             | Templates | Text    | `aria-label` | `title` | Other attrs | **Total** |
| ----------------------------------- | --------- | ------- | ------------ | ------- | ----------- | --------- |
| `libs/features/document-detail`     | 4         | 96      | 85           | 24      | 31          | **236**   |
| `libs/features/administration`      | 12        | 125     | 46           | 0       | 20          | **191**   |
| `libs/features/browse`              | 5         | 106     | 51           | 2       | 25          | **184**   |
| `libs/shared/ui`                    | 12        | 75      | 25           | 0       | 16          | **116**   |
| `apps/nuxeo-ui`                     | 15        | 89      | 10           | 7       | 1           | **107**   |
| `apps/nuxeo-satori-template`        | 11        | 89      | 3            | 13      | 0           | **105**   |
| `libs/features/search`              | 3         | 44      | 16           | 0       | 13          | **73**    |
| `libs/shared/adf-hx-bridge`         | 13        | 35      | 19           | 10      | 3           | **67**    |
| `libs/features/tasks`               | 3         | 43      | 11           | 2       | 9           | **65**    |
| `libs/features/collections`         | 1         | 39      | 13           | 0       | 12          | **64**    |
| `libs/features/trash`               | 2         | 30      | 17           | 0       | 16          | **63**    |
| `libs/features/knowledge-discovery` | 3         | 30      | 14           | 1       | 2           | **47**    |
| `libs/features/assets`              | 3         | 16      | 7            | 0       | 4           | **27**    |
| `libs/extensions/acme-extensions`   | 2         | 3       | 0            | 0       | 0           | **3**     |
| others                              | 2         | 2       | 0            | 0       | 0           | **2**     |
| **Total**                           |           | **822** | **317**      | **59**  | **152**     | **1350**  |

`libs/shared/nuxeo-client` is the only project with no remaining strings, and it has one
template.

**`apps/nuxeo-ui` still shows 107** because two of its fifteen templates were extracted. The
rest, in descending size: `contracts-page` (24), `dashboard-page` (20), `profile-page` (17),
`nuxeo-drive-page` (15), `change-password-dialog` (8), `cloud-services-page` (7), `login-page`
(7), three smaller pages and `index.html`.

### Descriptors — a whole category the template count missed

**257 more user-facing strings live in TypeScript descriptors**, not templates. Nav entries,
packaged actions, column definitions and drawer links are data:

```ts
{ id: 'app.navbar.browse', label: 'Browse', icon: 'folder' }
```

rendered as `{{ item.label }}`.

| Project                         | Descriptor strings |
| ------------------------------- | ------------------ |
| `libs/shared/extensions`        | 59                 |
| `libs/features/assets`          | 35                 |
| `libs/features/search`          | 31                 |
| `apps/nuxeo-satori-template`    | 26                 |
| `libs/features/document-detail` | 25                 |
| `apps/nuxeo-ui`                 | 19                 |
| others (10 projects)            | 62                 |
| **Total**                       | **257**            |

Three things follow, and the first two are why this was invisible until someone looked at a
screenshot and asked whether the application was really in French.

**No amount of template extraction reaches them.** The translate pipe cannot be applied at a
descriptor definition, because the descriptor is Layer 1 data rather than markup.

**`checkNoHardcodedUiText` is structurally blind to them.** It reads added lines in `.html` and
sees `{{ item.label }}`, which is exactly the shape it asks for. `checkNoHardcodedDescriptorText`
now covers the gap, diff-scoped, over `label`, `placeholder`, `ariaLabel` and `tooltip`. `title`
and `description` are deliberately excluded — they name Nuxeo document properties and schema
documentation as often as UI chrome, and a check that argues with the reviewer gets disabled.

**This is the most visible text in the product.** The entire left navigation is in this category.
A demo of the application in French shows a French search box beside a wholly English nav, which
is the single biggest reason the French screenshots read worse than the mechanism deserves.

The fix is not a sweep: the descriptor must carry a translation **key** and the pipe must move to
the render site — `{ label: 'nav.browse' }` with `{{ item.label | translate }}`. That keeps the
descriptor manifest-addressable _and_ makes the string translatable, which the current shape
allows only one of. It is a change to the Layer 1 descriptor contract, so it wants doing
deliberately and early in NXSAT-284 rather than being folded into a per-project sweep.

### The number nobody has measured

**The remaining `.ts` strings are still not counted.** The 257 descriptor strings above are
object-literal `label`/`placeholder`/`ariaLabel`/`tooltip` properties. Strings passed
imperatively — snackbar messages, dialog titles opened in code, error text, confirmation
prompts — are in neither figure. A discovery pass is
scoped as the first thing in NXSAT-284, precisely so the estimate for the rest is not built on
an unknown.

### Locale coverage is uneven upstream, and that bites

| Catalogue source                          | Locales shipped                    |
| ----------------------------------------- | ---------------------------------- |
| `@alfresco/adf-core`                      | 19                                 |
| `@hylandsoftware/satori-ui`               | 15                                 |
| `adf-hx-content-services` (ui + services) | **7** — `de es fr it pl pt` + `en` |
| ours                                      | 3                                  |

**A locale outside adf-hx's seven gets English adf-hx strings inside an otherwise translated
application.** That is why `fr` and `de` were chosen for the first pass: both are covered by
every catalogue we seed, so switching locale exercises the whole stack rather than our own file
alone.

---

## What existed before this work

Delivered by Phase 1 and Phase 3, and all of it still stands:

- **`ngx-translate` v17**, one hoisted copy, matching the `ngx-translate 16/17` norm across the
  CIC portfolio. No transloco remnants.
- **`AppTranslateLoader`** — merges N catalogue folders, then the app's own catalogue, then the
  manifest's `labels`. That last layer is a shipped **Layer 0** capability: a customer relabels
  the product with a JSON edit and no rebuild.
- **Four upstream catalogues seeded** — `adf-core`, both adf-hx bundles, `satori-ui` — because
  adf-hx registers its own catalogues at _component construction_, long after the language has
  loaded, so registration landed and the strings never arrived (`W6`).
- **`defaultLanguage` and `availableLanguages`** as Layer 0 bootstrap keys, validated and
  unit-tested.
- A compiled-in English fallback for a failed catalogue fetch.

Two things that were _not_ true, despite the ticket saying so:

- adf-hx translations were described as unwired. They were wired, and gated by the `bundle` gate.
- The raw-key defect was attributed to those unwired assets. It was an upstream typo.

---

## What was done now

### The defect that started it

`HxpDocumentTreeComponent` binds its folder toggle's accessible name to

```
('DOCUMENT_TREE.TOGGLE_ARIA-LABEL ' | translate) + node.name
```

— a **trailing space inside the key literal**. The catalogue ships the key without one, so the
lookup missed a key that was present, ngx-translate fell through to its key passthrough, and
every folder toggle in the tree was announced as `DOCUMENT_TREE.TOGGLE_ARIA-LABEL undefined`
— on **every surface**, because the tree is the app shell's nav drawer.

`undefined`, not the folder name. `Default domain` is only the label rendered _beside_ the toggle;
the toggle itself appends `node.name`, which upstream's node wrapper does not have. Writing the
folder name here obscured why the W13 alias alone was never going to be enough, and W15 is what
supplies a real name.

A WCAG 4.1.2 failure, and **axe cannot detect it**: axe checks that a control _has_ an accessible
name, not that the name is words. The blank-name variant of the same defect (upstream finding
4.6) was caught by axe in a single scan. This one sat through the same audit untouched.

Fixed by aliasing, which copies the _resolved_ value so a translated catalogue still yields a
translated name, and which yields to an upstream-shipped key so it becomes inert rather than
authoritative if upstream fixes it. Recorded as `W13` and as upstream finding 1.3, whose ask is
one character plus an interpolation parameter.

A **second instance of the same class** turned up on the way: `settings.themes.search` is the
themes search button's `aria-label`, it was in the catalogue and missing from the fallback, so a
failed fetch named that control with the raw key. Its catalogue value was also literally
`"Search (placeholder)"` — shipping as a real accessible name.

### Four gates, and the first controls any guardrail here has had

| Guardrail                      | Enforces                                                                 | Scope    |
| ------------------------------ | ------------------------------------------------------------------------ | -------- |
| `checkNoHardcodedUiText`       | a newly added hard-coded user-facing string                              | **diff** |
| `checkTranslationCatalogues`   | valid JSON, no blank values, trailing newline, key parity across locales | repo     |
| `checkTranslationContext`      | translator context exists for every string and for no deleted one        | repo     |
| `checkAccessibleNameFallbacks` | every key bound to `aria-label`/`title` survives a failed fetch          | repo     |

Plus `checkAngularDevAssets` extended to compare the `ignore` list, which it did not before — an
entry excluding a file in the base array and not in `development` read as identical while the two
configurations served different files.

`review-guardrails.selftest.mjs`. **Its totals are not restated here** — the suite prints them,
`npm run review:guardrails-selftest`, and a number copied into prose next to a list it does not
come from goes stale silently: this sentence said 58, then 71, while the suite held 78. It builds a
throwaway git repository per control under `os.tmpdir()`, so unlike the sanitizer selftest a hard
kill cannot leave a dirty tree. Registered as gate `guardrails-selftest`, as an npm script, in
`review:preflight` and in CI.

Eleven guardrails shipped before this with **no tests at all**.

### Extraction and locales

48 occurrences across the app shell and nav drawer, taking both templates to zero. `fr` and `de`
catalogues at full key parity. `en.context.json` carrying part of speech, surrounding UI, expanded
acronyms and do-not-translate flags for all 60 keys — 44 at the first extraction, and sixteen more
since, each added with its context because `checkTranslationContext` fails a key without one.

### Evidence

`npm run beta:evidence -- nxsat-227-i18n` → **PASS, 38/38 across 10 steps**, read from that run's
`manifest.json` rather than transcribed. Re-run it rather than trusting this line: the figure here
was `25/25 across 9 steps` from the 16 September run, which **predated five of the assertions it
was being cited as proving** — the adf-hx language check, the translated suggestion payload, the
French axe scan, route reachability and the date-formatting check were all added after it.

Asserts off the rendered DOM: no raw key in any `aria-label`, `title` or leaf text node on all
eight routes; the toggle named `Toggle <folder>`; `fr` and `de` differing from each other; an
unshipped locale degrading to English rather than to keys, and still rendering dates rather than
leaving them blank; a suggestion click sending the French string rather than the English one behind
its label; and **no axe violation at any impact** on the French shell — `failOn` is
`[minor, moderate, serious, critical]`, not the helper's serious-and-critical default — with no
ignore list.

Every language switch goes through a real `page.reload()`, because `withHashLocation()` makes
`goto()` same-document and without it `APP_INITIALIZER` never re-runs.

Six of those checks were failing when the assertions were first run honestly, and four of the six
were defects in the evidence rather than the application — a raw-key sweep reading `<style>`
elements, a route-reached check that rejected a legitimate child route, and a date check measuring
a surface that renders no date cells. The fourth was real: the French axe scan found the navigation
tree's folder toggles had no accessible name at all.

### Two defects found by running the application, which the controls did not catch

Recorded prominently because they are the more interesting failure: a capture that reported
**25/25 PASS** was live at the time, and both of these were present.

**`W14` — adf-hx surfaces silently reverted the language to English.** adf-core's
`TranslationService` reads the locale from its own `UserPreferencesService` and calls
`translate.use(...)` on the shared ngx-translate instance when it constructs. So
`defaultLanguage: 'fr'` held on the seven ordinary shell routes and reverted the moment the
`/#/browse-adf-hx` route or the adf-hx nav drawer rendered — no page reload involved,
`performance.getEntriesByType('navigation')` stayed at one entry, and all five catalogues were
re-fetched for `en`.

The capture missed it because step 5 navigated to `/#/browse` before asserting French — a `goTo`
added to get away from a drawer an earlier step had opened, which happens to be exactly the
navigation that avoids the bug. **The evidence was true and incomplete.** Fixed by re-asserting
our Layer 0 language into adf-core's preference on every boot, with a regression step that drives
the adf-hx surfaces explicitly.

A side effect worth knowing: upstream's own catalogues now resolve too. The document tree root
renders `Accueil` rather than `Home`, because adf-hx ships `fr` and was previously being fetched
as `en`.

**Missing Angular locale data — and the first bug was hiding it.** Once the locale actually
applied, `DatePipe` was handed `fr` for the first time and threw `NG0701: Missing locale data`,
thirty-six times on one pass. Translating strings and formatting dates are separate mechanisms;
only `en-US` locale data is built into Angular. Fixed by registering `fr` and `de`, gated by
`checkLocaleDataRegistered` so a catalogue cannot be added without its data — the symptom
otherwise appears as a pipe error on an unrelated page.

Then the same run showed eleven more for the deliberately-unshipped `xx` locale: strings degraded
to English correctly, dates threw. A customer mistyping `defaultLanguage` would get readable text
and a broken date in every list. Fixed by only handing adf-core a locale we have data for, so the
string language and the formatting locale are allowed to differ.

**The order matters and is the lesson: the i18n bug was hiding the l10n bug.** A half-applied
locale looks like a working one right up until it works.

### Defects found by the controls, not by review

Worth recording, because it is the argument for writing controls at all:

1. An unguarded `JSON.parse` in a new guardrail **crashed the whole script**, discarding every
   other guardrail's diagnostics. A trailing comma in `en.json` produced a stack trace and no
   guardrail report.
2. A parity branch reported "no en.json" for a file that was present but unparseable — a wrong
   message, which is worse than none.
3. A `.first()` selector read an adf-hx input instead of the header search box, which looked
   exactly like "the locale did not apply". Instrumentation recording the `defaultLanguage` the
   interception actually served is what separated the two explanations.
4. **CI caught one that every local run missed.** The selftest passed `--base` but not `--head`;
   CI sets `NX_HEAD`, so each fixture repo tried to diff against the real repo's SHA and all 33
   controls failed for one unrelated reason. Locally `NX_HEAD` is unset and everything was green.

---

## Standards position

| Question                       | Answer                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which translation tool?        | **Crowdin.** INFO-144's Weblate mandate is scoped to BitBucket; we are on GitHub, and Weblate is being retired on the Hyland Experience side.                                                                                                                                                                    |
| Which file layout?             | The **current Hyland/CIC** one — `i18n/en.json` + `i18n/<locale>.json`, which our repo already matched. **Not** Web UI's `messages.json`; that is a Polymer-era convention needing a locale-rename table we do not need.                                                                                         |
| Framework?                     | `ngx-translate` v17, already the portfolio norm.                                                                                                                                                                                                                                                                 |
| Fully compliant with INFO-144? | **No — one documented deviation.** INFO-144 requires a changed source string to be flagged for translator review. The HXP standard's `update_option: update_without_changes` does not do that, mitigating with a manual Crowdin filter plus the convention _never change the meaning of a key — change the key_. |
| Compliant on string context?   | Yes, and gated, for the 60 keys that exist.                                                                                                                                                                                                                                                                      |
| Compliant on concatenation?    | Ours, yes. **Upstream's tree is not** — `(translate) + node.name` cannot be reordered by a translator. Finding 1.3.                                                                                                                                                                                              |

---

## Next steps

### Immediate — what [#198](https://github.com/nuxeo/agentic-ui-poc/pull/198) is actually waiting on

**One thing: a human approval.** CI is green, every review thread is resolved, and nothing here
needs a repo admin.

`copilot-pull-request-reviewer` **never submits `APPROVED`** — it has not once in this repository,
across every pull request it has reviewed — so `reviewDecision` stays `REVIEW_REQUIRED` however many
rounds run. The query to verify that, and the exit condition it implies, are in
`AGENTS/09-pr-feedback.md`. Branch protection needs a human, and that is the only step left.

Both items this section used to list are **done**, and leaving them here contradicted the 23/23 gate
row twelve lines above:

- ~~Approve the `pull_request` workflow runs so CodeQL can analyse `refs/pull/198/merge`.~~ The runs
  have fired and `code-scanning` is green. No admin action outstanding.
- **Whether RTL is in scope does not block this PR**, which is why it has moved out of this section
  rather than being ticked off. Decision **Q3 in the plan is still formally open**, with a
  recommendation of _no_ for both Beta and the GA extraction — so calling it "answered" would be
  wrong in the other direction. Nothing in #198 implements or depends on RTL; it is tracked as
  [DS-2277](https://hyland.atlassian.net/browse/DS-2277) and listed under separate stories below.
- ~~Answer who owns the daily Crowdin translation PR.~~ Retired on 20 September 2026 — the premise
  that an unowned one rots is contradicted by the measurement in D8b of
  `docs/i18n-localization-plan.md`.

### Slice S6 — the Crowdin pipeline is BUILT and dormant; what is left is external

This section used to tell the reader to write the pipeline. It is written, in this pull request,
and the distinction that matters now is between what the repository contains and what only a Crowdin
admin can do.

**In the repository, gated off.** `crowdin-conf.yml`, `.github/workflows/crowdin-push.yaml` and
`crowdin-pull.yaml`, and `tools/i18n/crowdin-push-context.mjs` for the translator context the JSON
source format cannot carry. Both workflows are gated on `vars.CROWDIN_SYNC_ENABLED`, so merging
this changes no behaviour: nothing runs until that variable is set. `checkCrowdinConfig` and
`checkTranslatorContextPush` hold the shape.

**Not in the repository, and nobody here can do it.**

3. **The Crowdin project itself**, requested as
   [INTERN-1346](https://hyland.atlassian.net/browse/INTERN-1346). Created manually by global
   admins; the project name must match the repository, `agentic-ui-poc`.
4. **Set the secrets and then the variable**, in that order —
   `CROWDIN_PROJECT_ID`, `CROWDIN_PERSONAL_TOKEN`, `CROWDIN_BOT_GITHUB_TOKEN`, and the bot GPG
   pair. `crowdin-pull.yaml` refuses to run on a half-configured activation rather than quietly
   committing unsigned or opening a pull request with no CI, so a missing secret is a red job with
   a message naming it, not a silent downgrade.
5. **The first sync has never run.** `tools/i18n/crowdin-push-context.mjs` has never made a real
   HTTP call, and its pure parts being covered is not the same as having worked. Treat the first
   push as a thing to watch, and check what reached Crowdin against the repository before letting
   the daily pull open anything.

One trap is already handled and must stay handled: the standard's `/**/**/i18n/en.json` glob, with
`base_path: "."`, sweeps `node_modules` and its 48 upstream catalogues — which would push
Alfresco's and Satori's strings into our project and bill the translation crew for work another team
has already paid for. `crowdin-conf.yml` is scoped to `apps/` and `libs/`, and `checkCrowdinConfig`
fails any source that is not.

### NXSAT-284 — GA extraction: 1350 template strings, 257 descriptor strings, plus an unknown number passed imperatively

6. **~~B0 first, and it blocks everything after it.~~ Corrected 19 Sep 2026 — it is not a
   blocker.** The claim was that translating the nine literal English `aria-label` values that
   `phase-6-a11y.mjs` and `phase-1-tag-styles.mjs` select on would turn both harnesses red, so
   the selectors had to move to `data-testid` first.

   That is wrong, and a live counter-example was already in the repository.
   `browse.details.toggle` has been bound through the pipe in `browse-adf-hx-poc.html` since
   before this work, and `phase-1-tag-styles.mjs` selects it as
   `button[aria-label="Toggle details panel"]`. That harness **passes 21/21**. Angular resolves
   the pipe and sets the attribute to the resolved string, so in English the DOM is byte-identical
   to the literal it replaced, and a literal selector still matches.

   The real constraint is narrower and belongs to the extraction rather than to a prerequisite
   slice: **the English catalogue value must be byte-identical to the literal it replaces.**
   Change the wording while extracting and the selector breaks — not because it was translated,
   but because the string changed.

   Migrating the selectors to `data-testid` is still worth doing, because the harnesses remain
   locale-coupled and would break if ever run in `fr`. It is cleanup with a real payoff, not a
   gate. **Per-project extraction can start immediately.**

7. Then one PR per project, largest first: document-detail (236, and the `.ts` discovery pass),
   administration (191), browse (184), `shared/ui` (116, shared so run the blast-radius check),
   then the smaller features.
8. **B6:** per-library catalogues, so `libs/platform` ships its own strings — it is a publishable
   package and strings in `apps/nuxeo-ui/public/i18n/` do not travel with it. This needs **no
   loader change**: `AppTranslateLoader` already merges N folders and exposes
   `registerProvider`. Then flip `checkNoHardcodedUiText` to repo-wide.

### Known-incomplete, and easy to read as done

These were carried in a temporary handover document that has been deleted — a working note that
duplicated mutable state and went stale within a day. They are recorded here because each one is a
place a reader will call the ticket finished and be wrong.

- **Literal `aria-label` selectors in `phase-6-a11y.mjs` and `phase-1-tag-styles.mjs` will break
  silently when NXSAT-284 reaches them — one of them already can.** An earlier version of this
  bullet said all the labels they select on "are now translated". That was wrong, and measured
  rather than assumed it is one in six: of `Card view`, `List view`, `Manage columns`, `Grid view`,
  `Close panel` and `Toggle details panel`, only the last has a catalogue key
  (`browse.details.toggle`). The other five are still literal English in feature and shared
  templates that this PR deliberately excludes.

  So the risk is latent rather than live: those selectors match today because the DOM really does
  contain those English words. The moment NXSAT-284 localises those libraries, a non-English run
  matches nothing and the harness goes **green having asserted less** — silence, not a red, which
  is why it belongs on this list rather than in a backlog. They want `data-testid` before the
  strings move, not after.

- **Roughly 160 user-facing strings are still built in TypeScript** — snackbar messages, dialog
  titles, error text. Surveyed, not extracted. Outside AC1's wording, which is about templates, so
  the ticket can close with all of them still hard-coded.
- **`NXSAT-284`'s Jira state and the work in flight are not the same thing, and neither is "mostly
  done".** An earlier version of this bullet, carried over from a working note, said most of
  NXSAT-284 had shipped. That contradicts this page's own status row (`not started`) and its own
  measurement of what is left — 1,350 template strings and 257 descriptor strings. What is actually
  true: the descriptor-label slice is built and in review on
  [#215](https://github.com/nuxeo/agentic-ui-poc/pull/215), which is not merged; the bulk extraction
  has not begun. Jira says `Open`, and for once that is the accurate summary.

### Separate stories, not part of either ticket

9. **A language picker.** `availableLanguages` is validated, unit-tested and read by nothing.
   adf-core ships `LanguagePickerComponent`.
10. **`LOCALE_ID`.** Locale _data_ is now registered for `fr` and `de`, and adf-core's
    formatting locale follows the configuration — so dates format per locale instead of
    throwing. What is still missing is providing `LOCALE_ID` itself from configuration, so
    anything relying on Angular's default locale rather than adf-core's explicit one is still
    `en-US`. Narrower than it was, not closed.
11. **RTL** — DS-2277. Satori needs 4–6 weeks of its own work before an app can start, and the
    target should be the "good enough" level from its spectrum, agreed explicitly.
12. **Pluralisation** — no ICU usage anywhere; needs `ngx-translate-messageformat-compiler`.
    Defer until a real plural string appears.
13. `GET /nuxeo/api/v1/group/Administrator` **404s on every adf-hx drawer open** because
    `Administrator` is a user, not a group. Unrelated to i18n, currently suppressed in the
    evidence capture with a comment saying so, and it deserves its own ticket.
14. The Nuxeo platform's [Crowdin Integration page](https://hyland.atlassian.net/wiki/spaces/NuxEng/pages/3148546309)
    **publishes a live Crowdin API token in plaintext**, against the HXP standard's explicit MUST.
    Belongs to `nuxeo-lts`, so hand it off — but rotate it before we add a second token.

---

## If you only remember four things

1. **The machinery is done and has been since Phase 1.** Everything that looks unfinished is
   content, and content was descoped from Beta on 21 August.
2. **4 of 92 templates use the translate pipe. 1350 template strings and 257 descriptor
   strings remain**, plus an uncounted number passed imperatively in `.ts`. That is GA-sized
   work, tracked as NXSAT-284.
3. **The French screenshot proves the mechanism, not a localised product.** Say that when you
   show it, before someone else points at the English nav — and note the nav is English for a
   structural reason, not because it was skipped: those labels are descriptors, not templates.
4. **Never hand-edit a non-English catalogue.** Crowdin owns them and overwrites edits on the
   next pull. And never change the meaning of an existing key — change the key, because
   `update_without_changes` will otherwise keep the old translation and it will be wrong in every
   locale.
