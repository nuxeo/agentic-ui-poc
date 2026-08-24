---
title: Dev Harness & Gates
parent: Engineering
order: 8
last_reviewed: 2026-08-24
repo_commit: 77265f9
audience: engineering
---

# The Development Harness and the 15 Gates

> **Last reviewed:** 2026-08-24 · **Repository:** `77265f9`
> This is the **development-time** harness. For the customer-facing runtime AI features see
> [Runtime AI Features](10-runtime-ai-features.md).

---

## 1. What this is, and why it exists

The product was built largely by AI coding agents. That works, and it produces a specific
failure mode: **an agent will report success, and the report will be wrong in a way that
passes every check it knows about.**

Not hypothetically. In this repository:

- Three generators spliced every registration **inside a comment**, reported success,
  printed the IDs they had "registered" — and lint, typecheck and six specs all passed.
- An evidence gate compared script `src` attributes instead of bundle bytes.
- A path check was tautological under the dev base href.
- A lockfile gate matched dependency names but not versions.
- A published package could not be published at all, for an entire phase, while six other
  gates were green.

So the harness is not a convenience. It is the mechanism that converts "the agent says it
works" into "here is an artifact that would have gone red if it did not". Its governing
rule:

> **A gate is not evidence until you have seen it fail on purpose.** Break it deliberately,
> watch it go red, then trust it.

Three gates in this programme were green while the thing they guarded was broken. Every gate
described below has a recorded negative control.

---

## 2. The 15 gates

```bash
npm run beta:gate -- --phase <id>                      # all 15, cheapest first, stop at first failure
npm run beta:gate -- --gates lockfile,guardrails,lint  # fast inner loop
```

Ordered deliberately: a lint error usually explains the test failure that would follow, and
running the full set on a known-broken tree wastes minutes per iteration.

| #   | Gate                  | Asserts                                                                               | Why it exists                                                                                                                                                                   |
| --- | --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `node`                | The runtime is one whose results mean anything                                        | An agent on the wrong Node major gets a red indistinguishable from a code defect, and the obvious response — edit the failing spec — damages working code. That happened        |
| 2   | `lockfile`            | Every non-optional dependency edge resolves **within the lock**                       | The failure the other gates structurally cannot see. `npm ci --dry-run` only demands what the current platform resolves, so on macOS it never looks at the pruned Linux subtree |
| 3   | `guardrails`          | 10 repo invariants — see §3                                                           |                                                                                                                                                                                 |
| 4   | `assertions`          | Every evidence assertion is **capable of failing**                                    | Phase 1 shipped a defect past two checks that "certified properties they could not observe"                                                                                     |
| 5   | `lint`                | Affected ESLint, incl. real module boundaries                                         |                                                                                                                                                                                 |
| 6   | `test`                | Affected unit tests                                                                   | **Does not typecheck** — vitest strips types through esbuild                                                                                                                    |
| 7   | `build`               | Affected builds                                                                       |                                                                                                                                                                                 |
| 8   | `typecheck`           | `ngc` per library                                                                     | Most libraries have no `build` target, so before this a type error confined to a library reached `main`                                                                         |
| 9   | `bundle`              | Banned symbols absent; required assets present **and non-empty**                      | Found adf-hx importing `ng-mocks` — a test library — into the shipped runtime bundle, with two `eval()` calls                                                                   |
| 10  | `api-surface`         | The published `.d.ts` matches a 2,221-line snapshot                                   |                                                                                                                                                                                 |
| 11  | `publishability`      | A real `npm publish --dry-run`, generators resolve, declarations typecheck standalone |                                                                                                                                                                                 |
| 12  | `fork-simulation`     | The template compiles against the **built** package                                   |                                                                                                                                                                                 |
| 13  | `upgrade-rehearsal`   | A Layer 0/1/2 customisation survives a version bump                                   | The only gate that crosses a version boundary                                                                                                                                   |
| 14  | `reference-drift`     | The customer-facing extension reference agrees with the code                          | The only customer-facing document nothing checked                                                                                                                               |
| 15  | `customer-guardrails` | The guardrail we ship, run against our own reference library                          | A tool we hand customers and never run ourselves is one we would learn was broken from a customer's CI log                                                                      |

### Two traps that have each cost a phase

1. **A green `test` is not type safety.** Only `build` and `typecheck` catch a TS error.
2. **Nothing except `lockfile` reads `package-lock.json`.** CI was red for the whole of
   Phase 2 while every local gate was green.

### What each gate caught — the honest ledger

| Gate                  | Live defect found                                                      | Hole closed before exploitation                      |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| `publishability`      | Package unpublishable (full compilation mode)                          | —                                                    |
| `lint` (boundaries)   | 4 real cross-boundary imports                                          | —                                                    |
| `api-surface`         | Blind to `const`/`type` bodies — a renamed slot ID read as "no change" | —                                                    |
| `fork-simulation`     | 27 wrongly non-nullable public types                                   | —                                                    |
| `bundle`              | `ng-mocks` + 2 `eval()` in the shipped bundle                          | i18n catalogue check asserted existence, not content |
| `reference-drift`     | Reference wrong in both directions                                     | Treated a **comment** as code                        |
| `customer-guardrails` | —                                                                      | 3 of 5 checks satisfiable without doing the work     |
| `lockfile`            | CI red for a phase                                                     | Skipped 52 devDependency edges                       |
| `state-check`         | 6 phases citing an insufficient re-gate                                | Read `verdict` and not `totals.failed`               |

---

## 3. The commit-time guardrails

[`scripts/review-guardrails.mjs`](../../scripts/review-guardrails.mjs), 10 checks, run by
the gate and by CI.

| Check                     | Enforces                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `checkThemeTokens`        | Colour literals come from a themed namespace with a fallback, or declare a `--*` token |
| `checkDocsNumbering`      | No duplicate `## n.` section numbers in `docs/`                                        |
| `checkVitestProjects`     | A project with an `@nx/vitest:test` target has a Vite config                           |
| `checkBlobUrlLifecycle`   | Every file creating an object URL revokes one — **repo-wide**                          |
| `checkNoNuxeoUrlInImgSrc` | No `<img [src]>` bound to a Nuxeo URL                                                  |
| `checkTypeSafetyEscapes`  | Warns on `as unknown as` / `as never`                                                  |
| `checkHardcodedSecrets`   | Credential-shaped literals                                                             |
| `checkAngularDevAssets`   | Dev-only assets do not ship                                                            |
| `checkAdfHxWorkaroundIds` | A `WORKAROUND(adf-hx): W<n>` marker has a register row **and vice versa**              |
| `checkNoAdfHxInPublicApi` | No adf-hx type reachable through a library barrel, walking the re-export graph         |

Two of these were **diff-scoped** until 2026-08-24, meaning every violation predating the
check was permanently exempt — not a rule, a rule for new code. Four real blob-URL leaks
lived behind that exemption while the gate reported pass on every run.

`checkNoAdfHxInPublicApi` walks the barrel's re-export graph to **depth**, because the leak
that cost 0.95 MB of initial bundle was two hops away: the barrel exported a providers file
which imported adf-hx.

---

## 4. The evidence system

Two separate systems, often confused.

### Phase evidence — `scripts/beta-harness/`

```bash
npx nx serve nuxeo-ui                    # separate terminal
npm run beta:evidence -- <phase-id>
```

[`phase-runner.mjs`](../../scripts/beta-harness/phase-runner.mjs) drives Playwright against
the live app, executing a per-phase **steps file** from
[`scripts/beta-harness/steps/`](../../scripts/beta-harness/steps). Exit codes: `0` pass,
`1` fail, `2` **precondition-not-met** — fix the environment, do not iterate on the code.

Every step must record **at least one check**, and every check must pass. A capture that
asserts nothing fails deliberately.

Helpers available to a steps file ([`helpers.mjs`](../../scripts/beta-harness/helpers.mjs)):
`step`, `check`, `screenshot`, `login`, `goToDoc`, `expectVisible`, `expectText`,
`expectNoConsoleErrors`, `expectNoA11yViolations`, `requirePrecondition`, `note`.

| Steps file               | Phase claim                                                                   |
| ------------------------ | ----------------------------------------------------------------------------- |
| `phase-0-baseline.mjs`   | The state before any Beta work                                                |
| `phase-0-no-backend.mjs` | The app degrades honestly with no backend                                     |
| `phase-1-config.mjs`     | Configuration alone changes the app, with no rebuild                          |
| `phase-2-registry.mjs`   | A manifest edit changes the addressable surface with no rebuild               |
| `phase-3-adf-hx.mjs`     | Written **before** the swap, recording the hand-written component's behaviour |
| `phase-3-search.mjs`     | Search against the real index                                                 |
| `phase-4-platform.mjs`   | The platform is an installable package a customer can fork against            |
| `phase-5-harness.mjs`    | Generators produce **live** registrations                                     |
| `phase-6-a11y.mjs`       | Three axe scans, ratcheted, plus keyboard reachability                        |
| `showcase-adf-hx.mjs`    | Not a gate — presentation screenshots                                         |

### Rules the evidence system enforces on itself

- **Evidence must assert the claim, not the pulse.** A falsifiable check on the app shell
  still only proves the app booted.
- Anything asserting a _reloaded_ app needs a real `page.reload()` — `withHashLocation()`
  makes `goto('/#/x')` same-document, so `APP_INITIALIZER` never re-runs.
- Console-error suppressions are listed in the audit output, because a suppression nobody
  has to look at is how a real regression stays invisible.
- `npm run beta:audit` statically classifies every assertion and fails any that cannot fail
  — literals, self-comparisons, `Boolean(constant)`, negated constants, missing conditions.
  257 assertions across 13 steps files at last run.

### Ticket evidence — `scripts/collect-evidence/`

~20 runners, one per Jira ticket (`NXSAT-151` … `NXSAT-201`), each capturing before/after
for a specific bug fix — largely Nuxeo Web UI parity gaps. Run via
`npm run evidence:collect`. Evidence is written **outside the repo** to
`~/Desktop/agentic-ui-evidence/`, so it does not travel with a clone. **Anything
load-bearing belongs in the repo docs.**

---

## 5. Phase state — the anti-false-completion control

`.ai/state/phases.json`, checked by
[`state-check.mjs`](../../scripts/beta-harness/state-check.mjs).

```bash
npm run beta:state
```

A phase may claim `complete` only if its cited manifest exists, says `pass`, records
non-zero checks, has `totals.failed === 0`, and cites a gate report that is `pass` — not
`pass-partial`.

It exists because Phase 1 was recorded complete, in prose and in the agent contract, and
used to downgrade a risk, while its upgrade-safe config path was wrong by one segment and
"would have 404'd on every install". Nothing mechanically connected the claim to an
artifact.

It is deliberately sceptical of its own inputs: evidence lives outside the repository,
unversioned and writable, so a `verdict: pass` alongside `totals.failed > 0` is reported as
a **doctored manifest** with the instruction to re-run the phase rather than reconcile the
numbers.

Adding a gate correctly turns it red — every phase then cites a re-gate with a smaller gate
count. That has happened twice and the gate was right both times. Re-run the full gate and
re-cite; do not relax the check.

---

## 6. The coverage ratchet

```bash
npm run beta:coverage                     # check
npm run beta:coverage -- --run            # run the tests first
npm run beta:coverage -- --update-baseline
```

The Beta bar is >90%. Nothing is near it, so a gate set at 90% would be red on every run —
and _a gate that cannot pass gets bypassed and then ignored, which is worse than no gate_.
So it **ratchets**: it records where each project is and fails when one goes backwards,
while reporting how far each still is from 90% so the debt stays visible.

It also fails on:

- an **orphaned** baseline entry — a project the workspace no longer has. One lingered for
  a deleted library, reported forever as "not measured, unchanged";
- an **unratcheted** project — measured but absent from the baseline, previously printed as
  `new` and then excluded from every check, so a new library's coverage could fall to zero
  silently.

### A defect in the numbers — fixed 2026-08-24

`tasks` and `assets` have **zero spec files** and were recorded at **100%**. Their coverage
reports contain 4–5 files and **0 total statements**, and the summariser computed 0/0 as 100%,
so both were counted as meeting the Beta bar.

`core` was reported alongside them as having no specs. **That was wrong** — it has one, the
generated `should create` spec, and its 100% is truthful. It is simply an untouched Nx scaffold:
a placeholder component with an empty template, **7 statements**, imported by nothing.

The gate now distinguishes three states rather than two:

| State            | Meaning                                              | Counted towards the bar |
| ---------------- | ---------------------------------------------------- | ----------------------- |
| **measured**     | a real percentage over real statements               | yes                     |
| **thin**         | meets the bar over fewer than 20 statements — `core` | yes, but flagged        |
| **unmeasurable** | a report with zero statements, or no specs at all    | **no**, and it fails    |

A baseline entry for an unmeasurable project now **fails** the gate, because that entry is the
defect: `--update-baseline` prunes it, and until then the gate names it. The table also prints
the **statement count and spec count** next to every percentage — a percentage without its
denominator is what made this possible, and `core`'s 100% over 7 statements read identically to
`shared-app-config`'s 100% over 428.

**The true figure: 15 projects are measurable, 4 meet 90%, and 3 do so substantively**
(`shared-app-config` 428 statements, `shared-extensions` 480, `permission-dialogs` 439). Any
statement of the form "5 of 17 meet the bar" — including one written into the plan and delivery
record on 2026-08-24 — **overstated**, and `assets` and `tasks` are untested rather than
perfect. Both documents are corrected.

Two consequences worth separating, from `nx graph`:

- **`assets` and `tasks` are consumed by `nuxeo-ui`.** They are shipping features with **no
  tests at all** — a worse finding than the reporting defect that concealed them, and squarely
  Phase 6 step 6 work.
- **`core` has no inbound dependencies.** Nothing in the workspace imports `@agentic-ui/core`.
  It is a generated scaffold that was never used, and deleting it would remove the only thin
  entry from the table. Left in place for now, recorded as debt rather than quietly pruned.

---

## 7. What runs where

| Check                                                           | Local gate | PR CI | Notes                                                    |
| --------------------------------------------------------------- | :--------: | :---: | -------------------------------------------------------- |
| node, lockfile                                                  |     ✅     |   —   | `npm ci` and `setup-node` are CI's stronger equivalents  |
| guardrails, lint, test, build, typecheck                        |     ✅     |  ✅   |                                                          |
| assertions, reference-drift, customer-guardrails                |     ✅     |  ✅   | Added to CI 2026-08-24                                   |
| bundle                                                          |     ✅     |  ✅   | Needs the production build; added to CI 2026-08-24       |
| api-surface, publishability, fork-simulation, upgrade-rehearsal |     ✅     |  ✅   | Run unconditionally — they catch the expensive class     |
| **E2E**                                                         |     ✅     |  ❌   | Needs Docker Nuxeo + a served app. **A real limitation** |
| **Phase evidence**                                              |     ✅     |  ❌   | Needs a live backend                                     |
| Bundle **size** ceiling                                         |     —      |  ✅   | 6 MiB total shipped JS+CSS                               |

Until 2026-08-24, CI ran 8 of 15 gates, so "green locally" and "green in CI" made different
claims and neither disclosed it.

---

## 8. GitHub Actions — 8 workflows

| Workflow                | Trigger                                  | Does                                                                                  |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `ci.yml`                | push to `main`/`feature/**`/`fix/**`, PR | guardrails, static gates, lint, test, typecheck, published-package gates, bundle size |
| `build-marketplace.yml` | push, PR                                 | Maven build of the marketplace package (3 jobs)                                       |
| `release.yml`           | manual                                   | Release                                                                               |
| `changelog.yml`         | push, manual                             | Changelog generation                                                                  |
| `dead-code.yml`         | weekly, Mon 06:00 UTC                    | Dead-code sweep                                                                       |
| `staleness-check.yml`   | scheduled, manual                        | Flags `AGENTS/01-services.md` drifting from the service inventory                     |
| `stale.yml`             | scheduled, manual                        | Stale issues/PRs                                                                      |
| `pr-auto-fix.yml`       | PR review, issue comment                 | Applies review feedback                                                               |

`staleness-check.yml` is the interesting one: it is a **documentation** gate — an automated
check that a knowledge-base file still matches the code it describes.

---

## 9. Independent adversarial review

Mandatory before a phase is signed off. **Every phase so far self-reported green and
CI-green, and every one contained at least one overstated or self-confirming claim.** Phase
1's would have shipped a dead feature to every customer.

Two review agents are defined as Claude Code subagents:

| Agent                                                                  | Role                                                                                                                                                                  | Constraint                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`evidence-auditor`](../../.claude/agents/evidence-auditor.md)         | Audits evidence adversarially: is every assertion capable of failing, does it assert the deliverable or the app's pulse, are screenshots and suppressions hiding gaps | **MUST NOT** be used on evidence the caller wrote themselves |
| [`acceptance-validator`](../../.claude/agents/acceptance-validator.md) | Validates the phase delivered what the plan said, and that the written record matches the code                                                                        | Runs after the evidence auditor                              |

Both are specified in [`AGENTS/12-review-agents.md`](../../AGENTS/12-review-agents.md) — that
file is the specification and wins if the agent definitions disagree with it. Both are
`tools: Bash, Read, Grep, Glob` — deliberately read-only. They do not implement or fix.

Guidance that survived contact: **verify every claim first-hand before acting on it.**
Reviewers report false positives. Of the findings from the post-Phase-5 review, two did not
reproduce and were recorded as not reproducing rather than quietly dropped.
