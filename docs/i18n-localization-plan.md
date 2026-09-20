# i18n and Localization Plan — NXSAT-227

**Ticket:** [NXSAT-227](https://hyland.atlassian.net/browse/NXSAT-227) — "Complete i18n string
extraction and wire adf-hx translation assets" · Epic
[NXENG-615](https://hyland.atlassian.net/browse/NXENG-615) · duplicate/related
[NXSAT-280](https://hyland.atlassian.net/browse/NXSAT-280) (identical summary — close one).

**Status:** slices S1–S5 delivered on `feature/nxsat-227a-i18n`. S6 (the Crowdin pipeline) is
blocked on manual project creation via the INTERN board. The GA extraction is
[NXSAT-284](https://hyland.atlassian.net/browse/NXSAT-284).

> **Looking for where we stand rather than what we decided?** Read
> [`docs/i18n-status.md`](i18n-status.md). It carries the measured coverage numbers, what existed
> before, what shipped, and the ordered next steps. This file is the plan and the reasoning behind
> each decision; that one is the position. They are separate because a plan that carries its own
> progress report goes stale silently and gets believed anyway.

### What shipped, 16 September 2026

| Slice | Delivered                                                                                                                                                                                                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1    | The `DOCUMENT_TREE.TOGGLE_ARIA-LABEL` alias (W13) and the missing `settings.themes.search` fallback. Its catalogue value was literally `"Search (placeholder)"`, shipping as a real accessible name.                                                                                                                            |
| S2    | `checkTranslationCatalogues` and `checkAccessibleNameFallbacks`.                                                                                                                                                                                                                                                                |
| S3    | `checkNoHardcodedUiText`, plus `review-guardrails.selftest.mjs` — **33 controls, 19 negative and 14 positive** — registered as gate `guardrails-selftest`, an npm script, in `review:preflight` and in CI. It is the first negative-control suite any guardrail in this repository has had; eleven shipped before it with none. |
| S3a   | `checkTranslationContext`, and `checkAngularDevAssets` extended to compare `ignore`.                                                                                                                                                                                                                                            |
| S4    | 48 occurrences extracted across `apps/nuxeo-ui`, with `en.context.json`.                                                                                                                                                                                                                                                        |
| S5    | `fr` and `de` catalogues at full key parity, and `steps/nxsat-227-i18n.mjs` — **29/29 checks**.                                                                                                                                                                                                                                 |
| S5a   | `W14` — adf-core no longer resets the language on adf-hx surfaces — plus Angular locale data for `fr`/`de`, `checkLocaleDataRegistered`, and a formatting-locale guard so an unshipped locale degrades instead of throwing. All three found by running the application, not by the gates.                                       |

**Two defects in this work were found by writing its own controls, not by review:** an unguarded
`JSON.parse` that crashed the guardrail script and discarded every other guardrail's
diagnostics, and a parity branch that reported "no en.json" for a file that was present but
unparseable. A third — a fragile `.first()` selector that read an adf-hx input instead of the
header search box — was found because the instrumentation separated "the swap never reached the
browser" from "the locale did not apply".

**Read the French and German screenshots as proof of the mechanism, not of a localised
application.** The header search is French; the nav labels, column headers and adf-hx toolbar are
still English, because those strings live in `libs/` and are NXSAT-284. The capture says so in
its own notes.

The `fr` and `de` catalogues are developer-supplied bootstrap translations, **not
translation-crew output**. Crowdin is the source of truth for every non-English locale once the
project exists; these prove the mechanism, not the wording.

This plan covers the five phases requested: requirement, design, build, test, and
maintenance. It is written against the repository as it stands on `main` at `829feae`, and
against the Hyland localization standard rather than a locally invented one.

---

## Sources of truth this plan is built on

| Source                                                                                                                                 | What it settles                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Guidelines for Localization Management with Crowdin Translations Tool](https://hyland.atlassian.net/wiki/spaces/HXP/pages/1891566724) | The enterprise standard. Status **Accepted**, approved 12 Sep 2024, RFC 2119 language. This is normative, not advisory.                                                                                                                                                                                                 |
| **INFO-144 — Internationalization Strategy for software** (RFC, RFC 2119)                                                              | The string-level requirements: translator context REQUIRED on every string, acronyms expanded, no strings built by concatenation, a typo fix must not discard translations, and strings not shared across different concepts. Its _Weblate_ mandate is scoped to BitBucket and does not reach this repository — see D0. |
| [Localization with Crowdin Translations Tool: Technical Usage Guide](https://hyland.atlassian.net/wiki/spaces/HXP/pages/1891600892)    | `crowdin.yml` shape, CLI bootstrap, the two GitHub Actions, signed-commit setup, token scopes.                                                                                                                                                                                                                          |
| [Translations for Web UI and Elements](https://hyland.atlassian.net/wiki/spaces/NuxEng/pages/2232484224)                               | How Nuxeo Web UI does it today — the reference implementation the ticket alludes to.                                                                                                                                                                                                                                    |
| [Crowdin Integration (i18n)](https://hyland.atlassian.net/wiki/spaces/NuxEng/pages/3148546309)                                         | The Nuxeo platform (Java) side. **Contains a live Crowdin API token in plaintext — see the security note below.**                                                                                                                                                                                                       |
| [The State of Localization in Satori / CIC](https://hyland.atlassian.net/wiki/spaces/HDF/pages/4194568689)                             | The RTL maturity spectrum and the honest position: Satori is a foundation, not a switch. Tracked as [DS-2277](https://hyland.atlassian.net/browse/DS-2277).                                                                                                                                                             |
| [Satori Components Consumers](https://hyland.atlassian.net/wiki/spaces/HDF/pages/3803285020)                                           | `ngx-translate` 16/17 is the de-facto provider across the CIC portfolio. We are already aligned.                                                                                                                                                                                                                        |
| `docs/adf-hx-beta-plan.md` (plan of record)                                                                                            | The 21 Aug 2026 decision that descopes translations from Beta.                                                                                                                                                                                                                                                          |
| `AGENTS/11-beta-program.md` §3                                                                                                         | Verified facts, including four about `AppTranslateLoader` that this ticket must not re-litigate.                                                                                                                                                                                                                        |

There is **no** Hyland-wide standard for the _internationalization_ half — locale detection,
date formats, RTL, pluralisation. The Crowdin RFC says so explicitly in its Scope section:
it governs localization (managing keys and translations) and assumes the app already has i18n
machinery. So the framework choice is ours, and `ngx-translate` is already the portfolio norm.

---

## Phase 1 — Requirement

### What the ticket claims, checked against the code

The ticket was carved out of the closed NXENG-638 and two of its three premises have since
gone stale. Measured on `main` at `829feae`:

| Ticket claim                                                                 | Verified?                        | Evidence                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `en.json` holds 16 keys in three namespaces                                  | **True**                         | `apps/nuxeo-ui/public/i18n/en.json` — `app`, `browse`, `settings`.                                                                                                                                                     |
| `\| translate` appears 7 times across ~90 templates                          | **True**                         | 7 call sites in 3 templates; 92 templates, 89 tracked.                                                                                                                                                                 |
| "Upstream adf-hx translations are not wired"                                 | **Stale — already done**         | `SEEDED_FOLDERS` in `apps/nuxeo-ui/src/app/i18n/app-translate-loader.ts:62-93` seeds `adf-core`, both adf-hx catalogues and `@hylandsoftware/satori-ui`. The `bundle` gate asserts all three ship. Phase 3 fixed this. |
| The raw `DOCUMENT_TREE.TOGGLE_ARIA-LABEL` key is a symptom of unwired assets | **False — different root cause** | See below.                                                                                                                                                                                                             |

### The accessible-name defect has a different root cause than the ticket states

The key **exists** in the shipped catalogue:

```json
"DOCUMENT_TREE": { "TOGGLE_ARIA-LABEL": "Toggle" }
```

`node_modules/@alfresco/adf-hx-content-services/ui/assets/adf-enterprise-adf-hx-content-services-ui/i18n/en.json`

But upstream's own template asks for a different key — there is a **trailing space inside the
key literal**:

```html
[attr.aria-label]="('DOCUMENT_TREE.TOGGLE_ARIA-LABEL ' | translate) + node.name"
```

`HxpDocumentTreeComponent`, compiled into
`node_modules/@alfresco/adf-hx-content-services/fesm2022/alfresco-adf-hx-content-services-ui.mjs`.

So the lookup misses a catalogue entry that is present, ngx-translate falls through to its key
passthrough, and the button's accessible name becomes `DOCUMENT_TREE.TOGGLE_ARIA-LABEL <node
name>`. **No amount of asset wiring fixes this.** It is an upstream typo in the same class as
finding 4.6 in `docs/adf-hx-upstream-findings.md`, and it renders on every surface because the
tree is the app shell's nav drawer (`libs/shared/adf-hx-bridge/src/lib/ui/hxp-browse-nav-drawer/`).

This matters for sizing: the ticket's headline deliverable "wire adf-hx translation assets" is
already delivered, and the visible defect it cites needs a one-line Layer 0 entry, not an
integration.

### The scope question the ticket asks is already answered

The ticket's own closing note says: _"Worth confirming whether full i18n is a Beta requirement
or a GA one before committing to it."_ It was confirmed, and recorded in the plan of record:

> **Translations are descoped from Beta.** No further i18n extraction before Beta. The
> _mechanism_ stays, because the manifest's `labels` map layers over the catalogue and that is
> a Layer 0 capability — a customer relabels without a rebuild. Extraction beyond the slice
> chrome moves to GA.
>
> — `docs/adf-hx-beta-plan.md`, "Decisions taken 21 August 2026"

**Recommendation: split NXSAT-227 along that line rather than run it as one story.** As
written it is a single ticket whose acceptance criteria straddle a scope boundary that has
already been decided, and it will read 80% done for weeks while the remaining 20% is the bulk.
That is exactly the failure mode that caused NXENG-638 to be split in the first place.

### Proposed split

| Ticket                | Scope                                                                                                                                                                 | Why here                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **NXSAT-227a — Beta** | Fix the accessible-name defect; add the raw-key guardrail and its selftest; prove one non-English locale end to end; stand up Crowdin against the existing catalogue. | Closes a WCAG defect, stops regression, and puts the localization pipeline in place while the key count is small enough that the Crowdin bootstrap is cheap. |
| **NXSAT-227b — GA**   | Extract the ~750 hard-coded strings and ~400 literal `aria-label`/`title` attributes across 13 projects.                                                              | Explicitly moved to GA by the 21 Aug decision. Needs the guardrail from 227a to not regress behind it.                                                       |

If leadership overturns the 21 Aug decision and wants full i18n for Beta, that is a scope
change to the Beta plan and should be recorded there, not absorbed silently into this ticket.

### Acceptance criteria, restated as testable statements

Tagged `[ticket]` for verbatim, `[derived]` where the ticket implies but does not state, and
`[decision]` where a human must choose before build starts.

**227a (Beta):**

| #   | Criterion                                                                                                                                                                             | Source                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A1  | No control in the running application has an accessible name matching `/^[A-Z][A-Z0-9_]*\.[A-Z0-9_.-]+$/`, asserted over `aria-label`, `title` and rendered text on all eight routes. | `[ticket]` AC 2, made measurable                                                           |
| A2  | `apps/nuxeo-ui/public/i18n/en.json` and `en-fallback.ts` blank no key that upstream uses as an accessible name.                                                                       | `[derived]` — extends the existing `phase-6-a11y.mjs` check from `sat.*` to all namespaces |
| A3  | A new hard-coded user-facing string added to the core slice fails `npm run review:guardrails`, demonstrated by a deliberate red run.                                                  | `[ticket]` AC 3                                                                            |
| A4  | Setting Layer 0 `defaultLanguage: 'fr'` and reloading renders French in the shell chrome, with a screenshot and a passing check.                                                      | `[ticket]` AC 4                                                                            |
| A5  | `crowdin.yml` exists, a Crowdin project is created for this repository, and push/pull workflows run green with the source catalogue uploaded.                                         | `[derived]` — required by the HXP standard, which the ticket does not mention at all       |
| A6  | Translation catalogues are validated by a unit test: parseable, UTF-8, no empty string values, key parity against `en.json`.                                                          | HXP standard, "Basic Unit Testing Setup" (SHOULD)                                          |

**227b (GA):**

| #   | Criterion                                                                                                                                                              | Source          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| B1  | Every user-facing string in browse, search, document detail and shell resolves through the translation service; no hard-coded display text remains in those templates. | `[ticket]` AC 1 |
| B2  | The guardrail from A3 runs repo-wide over the core slice rather than diff-scoped.                                                                                      | `[derived]`     |
| B3  | Target locale set agreed and translated to the release bar.                                                                                                            | `[decision]`    |

### Decisions

Q1 and Q2 were settled on 16 September 2026. Q3 and Q4 remain open: Q4 blocks slice S6, and
Q3 blocks any RTL commitment.

| ID  | Question                       | Answer                                                                                                                                                                                                                                                                              |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | Is full extraction Beta or GA? | **GA — decided. Split the ticket** into 227a (Beta) and a new GA ticket, per the table above. This confirms the 21 Aug decision rather than overturning it.                                                                                                                         |
| Q2  | Which target locales?          | **`fr` and `de` — decided.** Both are covered by every upstream catalogue we seed (adf-core, both adf-hx bundles, satori-ui), so a locale switch exercises the whole stack rather than our own file alone. Web UI ships 16; matching that at Beta is not credible.                  |
| Q3  | Is RTL in scope?               | **Open.** Recommendation: no, for neither Beta nor the GA extraction. Track against [DS-2277](https://hyland.atlassian.net/browse/DS-2277) and target the "good enough" level from the Satori spectrum. Arabic and Hebrew are Web UI release-blocking locales, so this will return. |
| Q4  | Who owns the daily Crowdin PR? | **Open, and it blocks S6.** Needs a named owner before the pull workflow is enabled, or the PR rots. Web UI's process names a translation-crew contact; we need the equivalent.                                                                                                     |

---

## Phase 2 — Design

### D0 — Crowdin governs, not Weblate, and the reason needs recording

Two Hyland RFCs name different translation tools, so this will be re-litigated unless the
resolution is written down.

INFO-144 says _"All new development in BitBucket MUST use Weblate"_. That mandate is scoped to
BitBucket; this repository is `github.com/nuxeo/agentic-ui-poc`. The Hyland Experience side has
its own Accepted RFC naming Crowdin, the whole Nuxeo estate is already on Crowdin, and Weblate is
being retired over there — Hyland Mobile ran a "Weblate-to-Crowdin Migration" and Clinician
Window's Weblate page is titled "Deprecated". INFO-144 reads as the OnBase/LRM/TFS lineage
throughout.

**So: Crowdin for the tool, INFO-144 for the string-level rules.** The two do not otherwise
conflict, with one exception below.

### D0a — One documented deviation from INFO-144, not compliance

INFO-144 requires **both** that a typo fix _"MUST NOT remove previous translations"_ and that
_"Any change made to the source string MUST identify the associated translation as requiring a
review"_.

The HXP standard's chosen `update_option: update_without_changes` satisfies the first and **not**
the second — its own pros/cons table gives the con as "translations team cannot easily detect if
translations need to be checked again". The alternative, `update_as_unapproved`, satisfies the
second and breaks the first, because translations revert to English while awaiting re-approval.

The HXP standard mitigates with a manual Crowdin "Modified Source Strings" filter plus a
developer convention: **never change the meaning of an existing key — change the key.** That is
defensible, and it is a deviation rather than compliance. Recorded here so a future audit finds
the reasoning instead of the gap.

### D0b — Translator context lives in a sibling file, and is gated

INFO-144: _"All available context is REQUIRED for all strings"_, and _"All acronyms or
abbreviations MUST be expanded and explained in the comment"_. Its worked examples are the
argument — "Display Manager Failure" cannot be translated without knowing whether "Display" is a
noun or a verb, and Japanese needs different words for "from" depending on whether a date range
or an email sender is meant.

Context goes in a sibling `i18n/en.context.json`, keyed identically to the catalogue. Chosen over
embedding it in the catalogue or entering it in the Crowdin UI because it then sits in version
control next to the string and survives a change of translation tool — the same argument the
Crowdin RFC makes for keeping the source of truth in the repository rather than the vendor.

`checkTranslationContext` enforces key parity in both directions: a new string cannot arrive
without context, and context for a deleted string cannot linger and later describe a reused key.
Whether a given sentence of context is _sufficient_ is a judgement no script can make, and the
guardrail's docstring says so rather than implying more.

The file is excluded from the build assets in every configuration, so it does not ship. That
exclusion is itself gated: `checkAngularDevAssets` now compares the `ignore` list, which it did
not before — an entry excluding a file in the base array and not in `development` read as
identical while the two configurations served different files.

### D0c — Concatenated strings are forbidden, and upstream does it

INFO-144: _"Strings MUST NOT be built from concatenated substrings or values."_ Upstream's
document tree does exactly that — `('DOCUMENT_TREE.TOGGLE_ARIA-LABEL ' | translate) + node.name`
— so even with the key resolved, no translator can reorder for a language that needs the noun
first. Our alias fixes the key; it cannot fix the word order. Both halves are finding 1.3 in
`docs/adf-hx-upstream-findings.md`, with the ask being an interpolation parameter rather than a
`+`.

### D1 — Keep `ngx-translate` and `AppTranslateLoader`; do not replace either

Already correct and already aligned with the portfolio: `@ngx-translate/core@17.0.0`,
one hoisted copy, matching the `ngx-translate 16/17` norm in
[Satori Components Consumers](https://hyland.atlassian.net/wiki/spaces/HDF/pages/3803285020).

`AGENTS/11-beta-program.md` §3 records why the loader must not be swapped for adf-core's
`TranslateLoaderService`: doing so deletes the manifest-`labels` layering, which is a shipped
Layer 0 capability, and pulling `@alfresco/adf-core` onto an import chain from `app.config.ts`
moved the initial bundle 1.71 MB → 2.86 MB. That is a verified fact. Do not re-litigate it.

The loader's existing merge order is the design, and it is already right:

```
seeded upstream folders  →  our app catalogue  →  manifest `labels`
       (lowest)                                       (highest)
```

### D2 — Follow the Hyland CIC file layout, not Web UI's

Web UI uses `i18n/messages.json` + `messages-<locale>.json` with a build-time merge script
(`scripts/merge-messages.js`) and a `crowdin-conf.yml` full of `translation_replace` locale
renames. That is a Polymer-era convention carried forward, and the Hyland standard has since
converged on something different:

```yaml
'source': '/**/**/i18n/en.json'
'translation': '/%original_path%/%locale%.%file_extension%'
```

Our repo already matches the standard's shape — `apps/nuxeo-ui/public/i18n/en.json`. **Do not
port Web UI's `messages.json` naming.** We would be adopting a locale-rename table we do not
need in order to look like a repo we are not.

What _is_ worth taking from Web UI is the process, not the file layout: the `translation` Jira
label, the pre-QA check on translation-labelled tickets, and the hard rule that
`messages-<locale>.json` equivalents are never hand-edited.

### D3 — Per-library catalogues, enabled now, populated in 227b

`libs/platform` is a **publishable package**. A customer consuming it needs its strings, and
strings that live in `apps/nuxeo-ui/public/i18n/en.json` do not ship with it. So the eventual
layout is per-library:

```
libs/platform/…/i18n/en.json
libs/features/browse/…/i18n/en.json
apps/nuxeo-ui/public/i18n/en.json
```

The good news is that **this needs no loader change**. `AppTranslateLoader` already merges N
folders and already exposes `registerProvider(name, path)`. Adding a library catalogue is an
asset glob plus a registration — the same mechanism the four upstream folders use.

**Design decision:** land 227a against the single app catalogue, and write the Crowdin glob so
that per-library catalogues are picked up automatically when 227b adds them. No migration step
later.

### D4 — Key naming: keep lowercase dotted, do not adopt SCREAMING_CASE

Our keys are lowercase dotted (`browse.details.show`); every upstream catalogue we seed uses
SCREAMING_CASE (`DOCUMENT_TREE.ROOT`, `MANAGE_VERSIONS.DIALOG.TITLE`). Keeping the two
distinguishable is worth more than consistency with upstream, for three reasons: a raw key
rendered on screen tells you immediately whose catalogue is at fault; the guardrail in D6 can
use case to tell "an untranslated upstream key leaked" from "one of ours is missing"; and
there is no collision risk when the merge is flat.

Convention, matching what is already in `en.json`:

```
<namespace>.<area>.<element>       app.nav.toggle
                                   browse.details.toggle
                                   settings.themes.apply
```

Namespace per feature library, plus `app` for the shell. Alphabetically sorted. Placeholders
use ngx-translate's `{{ }}` interpolation.

### D5 — The accessible-name fix: three options

| Option                         | Mechanism                                                                                        | Verdict                                                                                                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **a. Manifest `labels` entry** | Layer 0 entry keyed on the literal `'DOCUMENT_TREE.TOGGLE_ARIA-LABEL '`, trailing space and all. | Ugly, but no rebuild, and it is precisely what the `labels` layer exists for.                                                                                                                                                                          |
| **b. Seeded-catalogue shim**   | Add the trailing-space alias to the merged folder catalogue in `app-translate-loader.ts`.        | **Recommended.** It belongs with the other adf-hx workarounds, gets a `WORKAROUND(adf-hx): W#` marker and a row in `docs/adf-hx-workarounds.md`, so the `checkAdfHxWorkaroundIds` guardrail keeps it from being orphaned when upstream fixes the typo. |
| **c. Wait for upstream**       | File the finding and live with it.                                                               | Not acceptable — it is a live WCAG 4.1.2 / 2.4.6 defect on every surface.                                                                                                                                                                              |

Take (b), and file the upstream finding alongside 4.6 in `docs/adf-hx-upstream-findings.md`
regardless of which is chosen. There has been no stable adf-hx release in twelve months, so
"upstream will fix it" is not a plan.

### D6 — The guardrail: diff-scoped first, with a selftest

The ticket asks for a gate "in the same spirit as the existing hard-coded-colour guardrail"
(`checkThemeTokens`, `scripts/review-guardrails.mjs:194-229`). Registration is trivial — a
`function checkX()` that calls `fail()`, plus a call at the bottom of the file.

Two design points the existing guardrails have already litigated:

- **Scope.** `checkThemeTokens` is diff-scoped; `checkBlobUrlLifecycle` was deliberately
  converted to repo-wide because diff-scoping permanently exempts every pre-existing
  violation, and four real leaks hid behind that. With ~750 pre-existing hard-coded strings,
  repo-wide is not tractable today. So: **diff-scoped for 227a, repo-wide over the core slice
  in 227b**, and say so in the guardrail's own docstring rather than leaving the reader to
  guess which it is.
- **Testing.** There are **no unit tests for `scripts/review-guardrails.mjs`** — not one, for
  eleven guardrails. The only mechanised negative-control precedent in the repo is
  `scripts/beta-harness/sanitizer-audit.selftest.mjs`, which is registered as its own gate
  (`sanitizer-selftest`) on the stated principle that "a gate whose evidence is optional is a
  gate on trust rather than on proof." Per `CLAUDE.md` — _"A gate is not evidence until you
  have seen it fail on purpose"_ — **ship a selftest with the guardrail**, modelled on that
  one. Three guardrails in this programme were green while the thing they guarded was broken.

Two guardrails are worth having, not one:

| Guardrail                    | Checks                                                                                                                                                                 | Scope                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `checkNoHardcodedUiText`     | Added lines in `.html` introducing element text, `placeholder=`, `matTooltip=`, `alt=`, `aria-label=` or `title=` with a literal display string and no `\| translate`. | diff (227a) → core slice repo-wide (227b) |
| `checkTranslationCatalogues` | Every `i18n/*.json` parses, is UTF-8, has no empty-string values, and has key parity with its sibling `en.json`.                                                       | repo-wide, cheap                          |

The second is what the HXP standard means by "Basic Unit Testing Setup", and it earns its
keep independently: a JSON file with a trailing comma breaks the Crowdin sync, and an
empty-string value is how the `aria-label=""` critical violation happened in the first place.

### D7 — Proving a non-English locale requires consuming `availableLanguages`

`defaultLanguage` and `availableLanguages` are both Layer 0 keys, both validated, both
unit-tested — and **`availableLanguages` is never read by anything**. Only `defaultLanguage`
is consumed, in `apps/nuxeo-ui/src/app/config/provide-app-config.ts:59`. There is no language
picker anywhere in the application.

That is exactly the "registering descriptors nothing renders" pattern `CLAUDE.md` warns about,
and it makes AC 4 ambiguous. Two ways to satisfy it:

| Option                                                     | What it proves                                                                                                                        | Cost                                                                                                                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bootstrap override + full reload**                       | `defaultLanguage` works, which is the literal AC.                                                                                     | Low. But note `withHashLocation()` makes `goto('/#/x')` same-document, so the evidence capture **must** call `page.reload()` or `APP_INITIALIZER` never re-runs and the assertion is vacuous. |
| **Minimal language picker driven by `availableLanguages`** | Both keys work, and the config surface stops being half-dead. adf-core already ships `LanguagePickerComponent` and `LanguageService`. | Higher — a new UI surface, a new a11y surface, and a decision about where it lives in the shell.                                                                                              |

**Recommendation for 227a: the bootstrap override**, and file the picker as its own story.
AC 4 says "the Layer 0 `defaultLanguage` key does something visible", which the override
proves. Do not let a picker in through the side door of an extraction ticket.

### D8 — Crowdin configuration, and the one trap in it

Per the technical usage guide. Project name must match the GitHub repository name, so
`agentic-ui-poc`; request creation via a Jira issue on the
[INTERN](https://hyland.atlassian.net/jira/software/c/projects/INTERN/boards/1031) project.

```yaml
'project_id': '<assigned at creation>'
'api_token_env': 'CROWDIN_TOKEN'
'base_path': '.'
'base_url': 'https://hyland.api.crowdin.com'
'preserve_hierarchy': true

'files':
  - 'source': '/apps/*/public/i18n/en.json'
    'translation': '/%original_path%/%locale%.%file_extension%'
    'export_only_approved': 'true'
    'update_option': 'update_without_changes'
  - 'source': '/libs/**/i18n/en.json'
    'translation': '/%original_path%/%locale%.%file_extension%'
    'export_only_approved': 'true'
    'update_option': 'update_without_changes'
```

> **The trap: do not copy the standard's `/**/**/i18n/en.json` glob verbatim.** With
> `base_path: "."` it sweeps `node_modules`, which in this repo contains **48 upstream
> `i18n/en.json` catalogues** — adf-core's 19 locales, both adf-hx bundles, and satori-ui's 15. Uploading those would push Alfresco's and Satori's strings into our Crowdin project and
> bill the translation crew for work another team already paid for. Scope the globs to `apps/`
> and `libs/`, and verify with a `crowdin upload sources --dry-run` before the first real push.

### D8a — `%two_letters_code%`, not `%locale%`

The D8 snippet above maps translations to `%locale%.%file_extension%`. Built as written, that
is wrong for this application and wrong in the quiet way.

Crowdin's `%locale%` renders French as `fr-FR`. `AppTranslateLoader` fetches
`i18n/${lang}.json` using the language ngx-translate was handed, and Layer 0
`availableLanguages` holds two-letter codes — so the sync would download `fr-FR.json`, the
loader would request `fr.json`, every string would fall through to the English fallback, and
the pipeline would report success the whole time. An application that looks untranslated
while the tooling looks healthy.

`crowdin-conf.yml` therefore uses `%two_letters_code%`, and `checkCrowdinConfig` fails any
mapping that does not. A region-specific locale — `pt-BR` against `pt-PT` is the usual first —
needs a matching change in the loader and in `availableLanguages`, not a rename rule on its
own.

`update_option: update_without_changes` is the standard's current choice and it carries an
explicit assumption we inherit: **a developer must never change the meaning of an existing
key — change the key instead.** Put that in the maintenance checklist, because nothing
enforces it.

Two workflows, per the guide:

- **Push** on push to `main` touching a source catalogue, `upload_sources_args: --delete-obsolete`.
- **Pull** daily on cron plus `workflow_dispatch`, `create_pull_request: true`,
  `export_only_approved`. Signed commits via the bot GPG key — this repo already has that
  infrastructure (`docs/github-bot-commit-signing.md`), so reuse it rather than minting
  another key.

Pin the action by SHA, not by tag: `@AGENTS/11-beta-program.md` and the HXP standard's own
security table both require it.

### Security note — an exposed token

[Crowdin Integration (i18n)](https://hyland.atlassian.net/wiki/spaces/NuxEng/pages/3148546309)
publishes a Crowdin **project ID and API token in plaintext** on a Confluence page. The HXP
standard is unambiguous — _"API Tokens MUST be considered as secrets, and shared via proper
usual secured means"_ — and its risk table makes revocation on improper disclosure the token
owner's responsibility. That token should be rotated and the page redacted. It belongs to the
`nuxeo-lts` platform project, not to us, so this is a report-and-hand-off, not a task in this
ticket. Worth doing before we add a second token to the estate.

### D9 — Sequencing constraint: translating `aria-label`s breaks two evidence harnesses

`scripts/beta-harness/steps/phase-6-a11y.mjs` selects on literal English accessible names —
`button[aria-label="Card view"]`, `"List view"`, `"Manage columns"`, `"Grid view"` — and
`phase-1-tag-styles.mjs` uses `"Close panel"` and `"Toggle details panel"`. Nine literal
selectors across two files. Translate those labels and both harnesses go red for reasons that
have nothing to do with the product.

**So 227b must migrate those selectors to `data-testid` before it translates a single
`aria-label`.** That is a prerequisite slice, not a cleanup. The e2e specs under
`apps/nuxeo-ui-e2e/` do not use `aria-label` selectors and are unaffected.

---

## Phase 3 — Build

Delivered as vertical slices per the `build-feature` skill: each one shippable on its own,
each leaving `main` green, each closed before the next opens.

### 227a — Beta slices

| Slice                            | Deliverable                                                                                                                                                        | Gate for the slice                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **S1** Accessible-name fix       | Trailing-space alias in the seeded catalogue, `WORKAROUND(adf-hx): W#` marker, row in `docs/adf-hx-workarounds.md`, finding in `docs/adf-hx-upstream-findings.md`. | `guardrails` (`checkAdfHxWorkaroundIds` is bidirectional — it fails if either half is missing) |
| **S2** Catalogue validation      | `checkTranslationCatalogues` guardrail + unit test over every `i18n/*.json`.                                                                                       | `guardrails`, `test`                                                                           |
| **S3** Hard-coded-text guardrail | `checkNoHardcodedUiText`, diff-scoped, with `review-guardrails.selftest.mjs` registered as a gate.                                                                 | `guardrails`, deliberate red run captured                                                      |
| **S4** Chrome extraction top-up  | Extract the shell, nav and settings strings that S3 would now reject, so the guardrail is not born red. Bounded: `apps/nuxeo-ui` only, ~94 text nodes.             | `lint`, `test`, `build`                                                                        |
| **S5** Locale proof              | `fr.json` catalogue, bootstrap override, evidence steps file with a real `page.reload()`.                                                                          | `beta:evidence` exits 0                                                                        |
| **S6** Crowdin pipeline          | `crowdin.yml`, push and pull workflows, project requested and initialised, `CROWDIN_TOKEN` secret.                                                                 | Both workflows green; first sync PR reviewed                                                   |

S6 has an external dependency — project creation is manual and goes through INTERN — so
**request it at the start of S1**, not when you reach S6.

### 227b — GA slices

One slice per project, largest first, each its own PR. **B0 is not a prerequisite** — see the
correction in `docs/i18n-status.md`. Translating an `aria-label` leaves the English DOM
byte-identical, so a literal selector still matches; `phase-1-tag-styles` passes 21/21 today
against a piped label. The constraint that does bind is that the English catalogue value must
match the literal it replaces.

| Slice  | Scope                                                                                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **B0** | Migrate the nine literal `aria-label` selectors in `phase-6-a11y.mjs` and `phase-1-tag-styles.mjs` to `data-testid`. **Not a blocker** — worth doing because the harnesses stay locale-coupled and would break if run in `fr`, but extraction does not wait on it. |
| **B1** | `libs/features/document-detail` — 92 text nodes, 85 `aria-label`, 24 `title`. The heaviest.                                                                                                                                                                        |
| **B2** | `libs/features/administration` — 111 text nodes, 46 `aria-label`.                                                                                                                                                                                                  |
| **B3** | `libs/features/browse` — 96 text nodes, 51 `aria-label`.                                                                                                                                                                                                           |
| **B4** | `libs/shared/ui` — 68 text nodes, 24 `aria-label`. Shared, so it reaches all eight feature modules; run the blast-radius check.                                                                                                                                    |
| **B5** | `libs/features/search`, `collections`, `tasks`, `trash`, `assets`, `knowledge-discovery` — smaller, batchable.                                                                                                                                                     |
| **B6** | Per-library catalogue layout per D3, plus flip `checkNoHardcodedUiText` to repo-wide over the core slice.                                                                                                                                                          |

Strings in `.ts` files — snackbar messages, dialog titles, error text — are **not** in those
counts and were never surveyed. Budget a discovery pass in B1 before committing to B2–B5
estimates.

### Rough sizing

|                         | Estimate                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| 227a                    | 3–5 days, of which S6 is mostly waiting on project creation                              |
| 227b                    | 3–4 weeks of extraction, plus translation lead time                                      |
| RTL (separate, DS-2277) | 4–6 weeks Satori-side before we can start; "good enough" level, per the Satori l10n page |

---

## Phase 4 — Test

Four layers. The repo's own rule applies throughout: **`test` does not typecheck** — Vitest
strips types through esbuild — so a green `test` proves nothing about type safety. Only
`build` and `typecheck` do, and they run last.

### Unit

| Test               | Asserts                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalogue validity | Every `i18n/*.json` parses, is UTF-8, has no empty-string values, sorted keys, newline at EOF. Required by the HXP standard.                                                                                                                                                                                                                             |
| Key parity         | Every non-`en` catalogue's key set matches `en.json`. Catches a Crowdin pull that dropped a file.                                                                                                                                                                                                                                                        |
| Loader precedence  | Seeded folders < app catalogue < manifest `labels`, asserted with all three supplying the same key. Currently untested.                                                                                                                                                                                                                                  |
| Fallback parity    | Every key `en.json` uses as an accessible name is present and non-empty in `en-fallback.ts`. **This already has a live gap:** `settings.themes.search` is in the catalogue and absent from the fallback, so a failed fetch renders a raw key as that button's `aria-label` — the same defect class as the `sat.*` one, which was a critical axe finding. |
| Guardrail selftest | Each new guardrail fires on a crafted violation and stays silent on a crafted near-miss. Negative controls counted separately from positive ones.                                                                                                                                                                                                        |

Note for whoever touches `AppTranslateLoader`: `upstream-permissions-panel.spec.ts` defines a
`StubAdfTranslateLoader` duck-typing all five adf-core methods. **Add a method to the loader
and that stub must grow it too**, or the spec fails in a way that looks unrelated.

### Evidence capture

New steps file, `scripts/beta-harness/steps/nxsat-227-i18n.mjs`, run via
`npm run beta:evidence -- nxsat-227-i18n`. Per `_template.mjs`'s six rules, and per the
`assertions` gate, which parses steps files with acorn and **exits 1 if any assertion's
condition is a constant**. Do not record a limitation as `h.check(name, true)` — use `h.note`.

| Step                   | Load-bearing assertion                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw-key sweep          | On each of the eight routes, no element's `aria-label`, `title` or text content matches `/^[A-Z][A-Z0-9_]*\.[A-Z0-9_.-]+$/`.                                                                      |
| Document tree          | The toggle button's accessible name is `Toggle <node name>`, read from the DOM, not from the catalogue.                                                                                           |
| French locale          | Bootstrap set to `fr`, **`page.reload()` called**, shell chrome renders French. Without the reload `APP_INITIALIZER` never re-runs and the check is vacuous — this has caught people here before. |
| Empty accessible names | No `aria-label=""` anywhere. The regression test for the `sat.*` critical finding.                                                                                                                |
| axe, French            | `h.expectNoA11yViolations` in `fr`, `KNOWN_VIOLATIONS` empty.                                                                                                                                     |

Negative controls to run before trusting any of it: blank a catalogue key and confirm the
raw-key sweep goes red; remove the `fr.json` file and confirm the locale step goes red;
remove the `page.reload()` and confirm the French check goes **green** — which is the proof
that the reload is what makes it an assertion.

### Static and CI

- `checkTranslationCatalogues` and `checkNoHardcodedUiText` in the `guardrails` gate, which
  runs in `ci.yml` and in the fast inner loop `beta:gate -- --gates guardrails,lint`.
- Guardrail selftest as its own gate, following `sanitizer-selftest`.
- Extend `phase-6-a11y.mjs`'s existing "no catalogue blanks an accessible-name key" step from
  `sat.*` to every namespace.
- **Everything added to CI must be static.** `a11y.yml` documents why the live axe scan is not
  in CI: it needs a running Nuxeo through the dev proxy, and this repo holds no
  `packages.nuxeo.com` credentials. An i18n job that needs a browser will not run there.

### Validation (via the `validate-fix` skill)

Cross-browser Chromium and WebKit; static and runtime a11y gates; the French locale exercised
by hand as well as by the harness. RTL explicitly **not** validated — out of scope per Q3, and
say so in the report rather than leaving it unstated.

---

## Phase 5 — Maintenance and future changes

### The recurring loop

| Cadence                   | Action                                                                                                                                                                                                                | Owner               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Daily, automated          | Crowdin pull workflow opens a translation PR.                                                                                                                                                                         | Bot                 |
| Per PR                    | Review and merge the translation PR. **A rotting translation PR is the main failure mode of this setup** — the technical guide recommends also triggering the pull on push to `main` when PRs are not merged quickly. | Named owner, per Q4 |
| Per feature PR            | New keys go in `en.json` **only**. Tag the Jira ticket `translation`, per the Web UI process.                                                                                                                         | Author              |
| 3 business days before QA | Manual check of `translation`-labelled tickets, so missing translations can still be requested in time. Adopted from the Web UI process, which documents this exact gap.                                              | Release owner       |
| Per adf-hx bump           | Confirm the new component's keys resolve — not merely that it renders. Registering a catalogue is not the same as loading it, which is what made the versions panel render `MANAGE_VERSIONS.DIALOG.TITLE`.            | Whoever bumps       |

### Standing rules

- **Never hand-edit a non-`en` catalogue.** Crowdin is the source of truth for every language
  but the reference one; a direct edit is silently overwritten on the next pull.
- **Never change the meaning of an existing key — change the key.** This is the explicit
  assumption behind `update_without_changes`, and nothing enforces it. A reworded English
  string keeps its approved translations, which will then be wrong in every locale.
- **Never blank a key to suppress a duplicate tooltip.** That is how `aria-label=""` reached
  every surface in the product and survived to a WCAG audit — invisible to anyone not using a
  screen reader. `checkTranslationCatalogues` now fails on it.
- **Crowdin tokens are secrets**, fine-grained, project-scoped, in GitHub secrets only.
  Scopes cannot be edited after creation; a scope change means a new token.

### Adding a locale — the four touchpoints

1. Add the target language on the Crowdin project (translation team).
2. Add it to `availableLanguages` in the packaged bootstrap defaults.
3. Confirm the upstream catalogues cover it. Coverage is **uneven**: adf-core ships 19
   locales, both adf-hx bundles ship 7 (`de es fr it pl pt` + `en`), satori-ui ships 15. A
   locale outside adf-hx's seven gets English adf-hx strings inside a translated
   application — which reads as a bug, not as a gap.
4. Add it to the evidence capture's locale matrix.

### Known debt this plan deliberately leaves open

| Item                                 | Why it is being left                                                                                                                                                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RTL                                  | Separate initiative, [DS-2277](https://hyland.atlassian.net/browse/DS-2277). Satori needs 4–6 weeks of its own work before an app can start. Arabic and Hebrew are Web UI release-blocking locales, so this returns at GA.                                           |
| Language picker                      | `availableLanguages` stays validated-but-unconsumed after 227a. Own story; adf-core ships the component.                                                                                                                                                             |
| Strings in `.ts` files               | Not surveyed, not counted, not scoped. Discovery pass in 227b/B1.                                                                                                                                                                                                    |
| Date, number and currency formatting | Angular's `DatePipe`/`DecimalPipe` need `LOCALE_ID` wired to the selected language and the locale data registered. Untouched — a French UI currently renders English-formatted dates. Small, but it is not free, and it is the most commonly forgotten half of i18n. |
| Pluralisation                        | No `{count, plural, ...}` usage anywhere. ngx-translate needs `ngx-translate-messageformat-compiler` for ICU. Defer until a real plural string appears.                                                                                                              |
| Per-library catalogues               | Designed in D3, enabled by the existing loader, populated in 227b/B6.                                                                                                                                                                                                |

### Documentation to update, in the same PR as the code

- `AGENTS/03-angular-conventions.md` — the key-naming convention and the "never hand-edit a
  locale file" rule, so the next agent follows it without being told.
- `docs/adf-hx-workarounds.md` — the trailing-space alias row. The `checkAdfHxWorkaroundIds`
  guardrail is bidirectional and will fail without it.
- `docs/adf-hx-upstream-findings.md` — the upstream typo, alongside finding 4.6.
- `docs/adf-hx-beta-plan.md` — amend the 21 Aug decision to record what 227a delivered inside
  the descoped position, so the two do not read as contradicting each other.
- This file — as decisions Q1–Q4 are answered.
