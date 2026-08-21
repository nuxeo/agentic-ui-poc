# Beta Program — Nuxeo Satori Component Platform

Context every agent needs before doing Beta work. Read this **after** `AGENTS.md`
and alongside `AGENTS/00-architecture.md`.

**RFC:** "RFC: Nuxeo Satori Beta - Component Platform and Customer Extensibility Model"
**Tickets:** NXENG-619 (Discovery) under NXENG-615 (Epic)
**Harness:** `scripts/beta-harness/` · **Entry skill:** `beta-phase`

---

## 1. What we are building, in one paragraph

A deep core ECM slice — browse, folder tree, search, document detail, metadata,
permissions, versions, upload and CRUD — built on real `adf-hx` components and
made customisable through a four-layer extensibility contract. Workflow, users
and groups, administration and publishing are **out of scope for Beta**.

The governing principle: **the extension contract is the product; AI agents are
the accelerator.** Customers customise through a documented, versioned API. They
do not edit our source, and neither do their agents.

---

## 2. The four layers

| Layer                  | Surface                                                                 | Customer writes     | Build needed       |
| ---------------------- | ----------------------------------------------------------------------- | ------------------- | ------------------ |
| 0 — Configuration      | Theme tokens, nav items, action visibility, presets, labels             | JSON, CSS variables | No                 |
| 1 — Declarative wiring | Manifest references components, rules, actions, routes by registered ID | JSON                | No                 |
| 2 — Customer code      | New components, actions, rules, guards in their own library             | TypeScript          | Yes, in their repo |
| 3 — Agent harness      | Knowledge base, generators, runnable guardrails                         | Prompts             | Yes, in their repo |

When implementing anything, ask which layer it belongs to. Behaviour that a
manifest can express must not be hardcoded; behaviour that needs code must not
be faked in configuration.

---

## 3. Verified facts — do not re-litigate these

These were established by first-hand inspection of the published artifact.
Treat them as settled; if you contradict one, prove it first.

- `@alfresco/adf-hx-content-services` **is installable** with a `read:packages`
  token. 648 published versions. `latest` = `7.20.0-automate.292`,
  `beta` = `7.21.0-automate.86`.
- **There has been no stable release in twelve months.** The last true stable,
  `7.19.5`, is from August 2025 with an Angular 15 baseline. We pin an exact
  prerelease, never a dist-tag.
- adf-hx exposes **twelve API ports as overridable injection tokens** —
  `CHECKIN`, `COPY`, `DOCUMENT`, `DOWNLOAD`, `GROUP`, `MODEL`, `MOVE`, `QUERY`,
  `RENDITIONS`, `UPLOAD`, `USER`, `VERSION` — plus the aggregate
  `ADF_HX_CONTENT_SERVICES_API_PROVIDERS`. This is the substitution point the
  whole plan rests on.
- Its **dependency contract is under-declared**: one peer declared
  (`@angular/core`) against thirteen actually imported. We maintain the true pin
  set ourselves.
- `@alfresco/adf-extensions@9.0.0` is on **public npm**, runtime dependency
  `tslib` only, and is **installed and in use** as of Phase 2. Layers 0 and 1 need
  no privileged access. Three corrections established by installing it:
  - It declares three peers but its public `.d.ts` also imports
    `@angular/material/menu` and `@angular/router`, so it is **under-declared in
    the same way adf-hx is**. A second data point for R2, not a one-off.
  - Its shipped `index.d.ts` does **not** typecheck under `skipLibCheck: false` —
    six intrinsic `TS2411` index-signature errors, independent of missing peers.
    Consuming it requires `skipLibCheck: true`, which this repo already sets.
  - `@alfresco/js-api` is a mandatory peer but a **types-only** import: the
    runtime `.mjs` never references it. It is therefore a devDependency here, so
    a 7 MB Alfresco Content Services REST client does not ship inside a Nuxeo
    product to satisfy a compile-time constraint.
- **adf-extensions' `RuleContext` is Alfresco-domain-shaped** (`NodeEntry`,
  `SiteEntry`, `RepositoryInfo`), describing a repository we do not talk to. Our
  rule context is our own, in upstream's _shape_ but not its types; reusing
  upstream's would put ACS types in the signature every customer rule is written
  against. Its domain-neutral parts — `mergeObjects`, `mergeArrays`,
  `filterEnabled`, `sortByOrder`, `getValue` — are used directly.
- **`@alfresco` spans two registries and npm resolves per scope, not per
  package.** Phase 2 pointed the scope at public npm. **Phase 3 cannot simply add
  adf-hx from GitHub Packages** — it needs a CI-side `.npmrc` swap, a proxy
  fronting both, or a committed tarball reference.
- **Layer 1 slots are additive by construction.** `ExtensionSlotRegistry` keys
  slots by opaque string with no enum, union or `switch` on slot identity, so a
  tenth slot requires no change to the nine. Do not introduce a central slot
  dispatch; it would undo the property the Beta addressable-surface decision
  rests on.
- **An unregistered rule id fails open.** A manifest naming a rule this build does
  not have leaves the entry visible. That is deliberate: Layer 1 visibility is not
  an authorisation boundary, and failing closed would let a typo strip working
  actions out of the UI.
- **The `test` gate does not typecheck.** Vitest transpiles through esbuild, so two
  real type errors in Phase 2 code passed 46 green unit tests and were caught only
  by `build`. Never treat a green `test` gate as evidence that types are sound.
- The marketplace installer copies the web directory with `overwrite="true"`, so
  **configuration inside the bundle is destroyed on upgrade**.
- The POC's bridge tokens (`DOCUMENT_API_TOKEN`, `QUERY_API_TOKEN`,
  `ROOT_DOCUMENT`, `DEFAULT_REPOSITORY_ID`) are local clones of published
  exports. Migration is to import upstream's and delete the clones.
- **The non-overwriting installer path targets `nxserver/nuxeo.war/agentic-ui-config`.**
  A second `install.xml` copy step with `overwrite="false"` puts customer
  configuration in a _sibling_ of the bundle, outside the destructive copy's
  source tree, so it survives an upgrade. **The destination must be under
  `nxserver/nuxeo.war`** — that is the Tomcat docBase for the `/nuxeo` context
  (`docBase="../nxserver/nuxeo.war"`). `nxserver/web` holds only `root.war`, is
  not a docBase, and anything installed there is never served. Phase 1 shipped the
  `nxserver/web/…` variant and it would have 404'd in every deployment; the
  corrected path is verified served on the local container. **Risk R7 is still
  Medium:** no package has been built, installed and upgraded on a real server.
  That is the Phase 6 upgrade rehearsal.
- **Configuration is loaded, not compiled.** `libs/shared/app-config` reads a
  static bootstrap file pre-auth and a runtime manifest from the Nuxeo document
  at `/default-domain/config/agentic-ui` post-auth. Eleven `InjectionToken`
  factories resolve from it. Both loads are tolerant: a missing file, absent
  document, 403 or malformed JSON falls back to the packaged defaults, and the
  packaged defaults reproduce the pre-Phase-1 compiled values exactly.
- **Angular's hash routing hides configuration reloads from evidence captures.**
  `withHashLocation()` makes route changes same-document, so `page.goto('/#/x')`
  does not re-run `APP_INITIALIZER`. Any capture that changes configuration must
  force a full reload, and route interception must send `Cache-Control: no-store`
  or the browser answers from cache and the interception is never seen.

---

## 4. Phases and their gates

Each phase is complete only when **all three** of its gates pass. Partial
completion is not completion; see section 6.

| Phase              | Deliverable                                                                      | Evidence steps file          |
| ------------------ | -------------------------------------------------------------------------------- | ---------------------------- |
| `phase-0-baseline` | Dependencies install, gates run, CI validates the branch                         | `steps/phase-0-baseline.mjs` |
| `phase-1-config`   | Runtime configuration that survives upgrade, runtime theming, i18n for the slice | `steps/phase-1-config.mjs`   |
| `phase-2-registry` | Extension registry, rules, nav and routes from manifest, action registry         | `steps/phase-2-registry.mjs` |
| `phase-3-adf-hx`   | ~10 of 12 Nuxeo-backed API ports, component swap, encapsulation gate             | to be added                  |
| `phase-4-platform` | Publishable libraries, public API, semver, template and starter                  | to be added                  |
| `phase-5-harness`  | Customer knowledge base, generators, runnable guardrails                         | to be added                  |
| `phase-6-quality`  | Coverage, E2E, accessibility, security scans, upgrade rehearsal                  | to be added                  |

### The three gates

1. **Quality gate** — `npm run beta:gate -- --phase <id>` is green
   (guardrails, affected lint, affected test, affected build).
2. **Evidence gate** — `npm run beta:evidence -- <id>` exits 0, meaning every
   step recorded at least one check and every check passed.
3. **Review gate** — the phase's `INDEX.md` is attached to the PR, and a
   multi-model adversarial review has run over the diff.

---

## 5. Agent roster

Cursor's subagent types are fixed, so this roster is a convention the skills
apply rather than a config file. Use the `Task` tool with the stated type and
model.

| Role           | Subagent type         | Model                                     | Used for                                                               |
| -------------- | --------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| Architect      | `generalPurpose`      | Claude Opus 5 thinking / GPT-5.6          | Public API design, action registry shape, extension contract decisions |
| Implementer    | inherit (main thread) | Claude Sonnet 5 thinking                  | API ports, component swaps, feature work                               |
| Explorer       | `explore`             | inherit                                   | Locating code, mapping call sites before a change                      |
| Test author    | `generalPurpose`      | Composer 2.5 Fast / Gemini 3.7 Flash      | Spec scaffolding, i18n extraction, codemods                            |
| Reviewer panel | `generalPurpose` x2-3 | Opus 5 **and** GPT-5.6 **and** Gemini 3.7 | Adversarial review; different families surface different defects       |
| Bug hunter     | `bugbot`              | inherit                                   | Pre-PR review of branch changes                                        |
| Security       | `security-review`     | inherit                                   | Any change touching auth, blobs or config loading                      |

**Rule on reviews:** never accept a single model's verdict on its own output.
Agreement across two families is the signal; disagreement means a human looks.

---

## 6. Iteration protocol

Agents consistently declare victory early. This protocol exists to prevent that.

1. Make the smallest change that could satisfy the step.
2. Run the **fast inner loop**: `npm run beta:gate -- --gates guardrails,lint`.
3. Fix the single first reported failure. Do not batch speculative fixes.
4. Repeat 2-3 until green, then run the **full gate**.
5. Run the evidence capture for the phase.
6. If either gate fails, return to step 3. **Maximum three attempts per step**;
   after the third, stop and report what is blocking rather than continuing to
   churn.
7. Only when both gates pass may the step be marked complete.

Stop conditions that require a human, not another attempt:

- The same failure recurs after three distinct fix attempts.
- A fix requires changing a verified fact in section 3.
- A fix requires widening the public API or touching `install.xml` packaging.
- A test would have to be weakened or skipped to pass.

**Never** mark a step complete on the basis of reasoning alone. The gate output
and the evidence manifest are the only acceptable proof.

---

## 7. Non-negotiables for Beta code

Beyond the standing rules in `AGENTS.md`:

- **adf-hx types never appear in our public API signatures.** Wrap them in
  `libs/shared/adf-hx-bridge`. Their instability must not become the customer's.
- **Pin exact adf-hx versions**, never a range or dist-tag.
- **Anything a customer might want to change goes through Layer 0 or 1.** No new
  hardcoded action lists, nav entries, or theme values.
- **No configuration inside the packaged web directory.** It will be destroyed on
  upgrade.
- **Every new service method gets a unit test including its error path.** The
  bridge currently has 11 tests for 2,949 lines; do not add to that debt.
- **Credentials from the environment only**, per `AGENTS/07-security.md`.

---

## 8. Where things live

| Artifact                | Location                                                |
| ----------------------- | ------------------------------------------------------- |
| Phase evidence runner   | `scripts/beta-harness/phase-runner.mjs`                 |
| Verification gate       | `scripts/beta-harness/verify-gate.mjs`                  |
| Phase steps files       | `scripts/beta-harness/steps/<phase-id>.mjs`             |
| Evidence output         | `$AGENTIC_UI_EVIDENCE_DIR/beta/<phase-id>/<timestamp>/` |
| Gate reports            | `$AGENTIC_UI_EVIDENCE_DIR/beta/gates/`                  |
| Bridge (adf-hx wrapper) | `libs/shared/adf-hx-bridge/`                            |
| Action plan             | `docs/adf-hx-poc-action-plan.md`                        |
| Extension reference     | `docs/extension-reference.md`                           |
| Extension registry      | `libs/shared/extensions/`                               |
| Orchestrating skill     | `.cursor/skills/beta-phase/SKILL.md`                    |
