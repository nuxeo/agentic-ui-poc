---
title: Risks & Opportunities
parent: Executive / Leadership
order: 7
last_reviewed: 2026-08-24
repo_commit: 77265f9
audience: leadership
---

# Risks, Technical Debt & Opportunities

> **Last reviewed:** 2026-08-24 · **Repository:** `77265f9`
> Combines the RFC's risk register (R1–R10, rev. 6) with what the repository shows at this
> commit. Where the RFC's position has since changed, the current status is given.

---

## 1. Critical

### C1 · The central economic assumption is unvalidated

**Layers 0 and 1 are assumed to absorb most customer requests.** If they do not, every
engagement becomes a Layer 2 software project and the maintenance economics of the platform
change materially.

- RFC risk **R8**: _"Too few addressable IDs in Layer 1 would cap customisation and push work
  into Layer 2, undermining the maintenance economics."_
- The RFC's own mitigation was to _"fix the addressable surface explicitly before Phase 2
  begins, informed by real customer requests."_ **Phase 2 completed without that input.**
- Reinforcing evidence: **4 of 8 slots are reserved** (`routes`, `toolbar`, `contextMenu`,
  `tabs`) — read by nothing. The addressable surface is narrower than the slot list implies.

**Mitigation:** ten real requests, two accounts, attempt each as Layer 0/1 only, count
fall-through. Days of work. **Do it before further platform investment.**

### C2 · Zero customers

Nothing published, nothing installed externally, no customer has configured or extended it. Every
benefit claim in the product documentation is mechanical rather than observed.

**Mitigation:** a design partner, framed as the Beta ask.

### C3 · Accessibility non-compliance

**WCAG 2.1 AA is not met.** Four rule classes violated and _ratcheted_ — visible, not fixed —
including `button-name` (critical) on the platform nav title icon **on every screen**, plus
`label` on two checkboxes, `color-contrast`, and `role-img-alt` on avatars and folder icons.

A procurement blocker in public-sector and large-enterprise accounts. Ratcheting was the right
engineering call — a gate that cannot pass gets bypassed — but the debt is real and named.

**Mitigation:** Phase 6 step 3. Self-contained and demoable.

---

## 2. High

### H1 · adf-hx supply chain — no stable release in twelve months

RFC **R2**. The `latest` dist-tag is itself a **prerelease** from January 2026
(`7.20.0-automate.292`); the last true stable is `7.19.5` (August 2025) with an Angular **15**
baseline. We would ship an enterprise product depending on a prerelease.

Pin exact versions, never a dist-tag — this is a hard stop in the phase skill.

### H2 · adf-hx dependency contract is under-declared

RFC **R3**, verified first-hand. `package.json` declares **one** peer (`@angular/core`) and one
dependency (`tslib`) against **thirteen** packages actually imported. We maintain the true pin
set ourselves.

Worse, **test artifacts ship in the published bundle**: `ng-mocks` appears among bundle imports
and `api/index.d.ts` exports `./lib/testing/hxcs-js-client.mock`. That put a test library's
implementation and **two `eval()` calls** into a customer-facing chunk. Mitigated locally with a
hand-written stub (`tools/stubs/ng-mocks`) and guarded by `npm run beta:bundle`, which now
reports 0 `eval()`.

### H3 · Review capacity is the binding constraint

RFC **R10**: _"Autonomous delivery outpaces review capacity, so defects accumulate faster than
they are caught — the failure mode the POC branch already demonstrated at smaller scale."_

Empirically confirmed in this programme: after Phase 5, an independent review found **every
phase had self-reported green while containing at least one overstated claim**.

**Mitigation:** resource review separately from authoring; keep human gates on decisions that
are expensive to reverse — public API, action descriptor shape, anything touching
authentication, credentials or blob lifecycle.

### H4 · No SAST; SCA is `npm audit` only

No static application security testing exists. Dependency scanning is `npm audit` plus
Dependabot. Current: 1 low (`quill` XSS), 0 high, 0 critical.

Given nine real security defects were found by adversarial review — blob-URL leaks, unguarded
subscriptions, an `<img [src]>` bypassing the HTTP interceptor, and an HXQL injection — the
absence of automated security analysis is a material gap.

### H5 · No production observability

No APM, structured logging, metrics export or error reporting. **We could not diagnose a
customer incident.** The cost of a production problem is currently unbounded because diagnosis
has no tooling.

### H6 · `@alfresco/js-api` in a Nuxeo product

RFC **R5**. The Alfresco REST client becomes a mandatory dependency of a Nuxeo product, along
with the wider adf-core peer set including `pdfjs-dist` and `@mat-datetimepicker/core`. SCA,
licensing and **product-optics** implications. Mitigated for `js-api` by making it a
devDependency (types-only import), but the adf-core surface remains.

---

## 3. Medium

| ID  | Risk                                     | Detail                                                                                                                                                                                      |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Coverage in the highest-traffic code** | 3 of 17 projects genuinely ≥90%. `search` 22.8%, `document-detail` 29.8% — the two surfaces users touch most                                                                                |
| M2  | **Coverage numbers overstate**           | `tasks`, `assets`, `core` report **100% with zero spec files** (0/0 statements). Any "N of 17 meet the bar" figure is inflated until fixed                                                  |
| M3  | **Knowledge-base decay**                 | 13 `AGENTS/` files, ~3.1k lines. Exactly **one** has an automated staleness check                                                                                                           |
| M4  | **Gates rot**                            | Seven were found asserting less than they claimed. Gates are software                                                                                                                       |
| M5  | **RFC and reality diverge**              | RFC plans 5+ npm packages and 3 repositories; reality is 1 package and 1 monorepo. Both simplifications, but the RFC has not been revised                                                   |
| M6  | **Component render fidelity**            | RFC **R4** — adf-hx component inputs are typed on the HxPR SDK and upstream's neutral-type work has not started                                                                             |
| M7  | **Eager adf-core**                       | Initial bundle 1.71 → 2.86 MB. The real fix (lazy adf-core) is explicitly deferred; the ceiling note says do not raise it again without attempting that first                               |
| M8  | **Two unused production dependencies**   | `openai` and `express` are in `package.json` and imported nowhere. Dead weight in the shipped lockfile and an SCA surface                                                                   |
| M9  | **Anonymous auth behaviour**             | With anonymous auth enabled server-side, the app signs unauthenticated visitors in as `Anonymous`. Correct behaviour, invisible from the UI, and it makes a class of auth test unobservable |
| M10 | **E2E does not run in PR CI**            | Needs Docker Nuxeo plus a served app. A check that only runs when someone remembers                                                                                                         |
| M11 | **Reserved slots read as capability**    | 4 of 8. Easy to over-promise from the slot list                                                                                                                                             |
| M12 | **`selection` rule context empty**       | Permission-gated bulk actions are not manifest-gateable                                                                                                                                     |

---

## 4. Low

| ID  | Risk                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------- |
| L1  | Node 20 pin — Node 22+ shadows jsdom's `localStorage` and breaks specs on correct code. Worked around in the gate               |
| L2  | Evidence lives outside the repository (`~/Desktop/agentic-ui-evidence/`) — does not travel with a clone                         |
| L3  | Knowledge concentration — the harness and its rationale sit with very few people. **This documentation set is the mitigation**  |
| L4  | 29 pre-existing docs, several superseded and contradictory. Partly addressed by this set                                        |
| L5  | `@nuxeo-satori` scope ownership (RFC **R9**) — **resolved**: `@nuxeo/satori-platform` on Nuxeo Nexus                            |
| L6  | Angular 20 monorepo upgrade (RFC **R6**) — **resolved**, landed                                                                 |
| L7  | Package entitlement (RFC **R1**) — **resolved** by authenticated download                                                       |
| L8  | Packaging sign-off for the non-overwriting installer (RFC **R7**) — implemented; **sign-off status not verified in repository** |

---

## 5. Technical debt register

| Debt                                         | Cost of carrying                                 | Cost of fixing                                        |
| -------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| Coverage gap in `search` / `document-detail` | Regressions in the highest-traffic paths         | Large — the two biggest files in the repo, ~60pp each |
| 4 reserved extension slots                   | Over-promising; narrower surface than advertised | Medium — each needs a host that resolves it           |
| Eager adf-core (+1.15 MB)                    | Slower first load for every user                 | Medium — defer behind an outlet                       |
| `selection` rule context                     | Two documented rules permanently `false`         | Small–medium — needs a fetch per selected row         |
| Zero-statement 100% coverage artefact        | Inflated reporting                               | Small — treat a zero-statement report as unmeasured   |
| 12 unwatched `AGENTS/` files                 | Silent drift                                     | Small per file — extend the staleness pattern         |
| No SAST                                      | Undetected vulnerability classes                 | Small — add CodeQL                                    |
| Unused `openai` / `express`                  | Lockfile weight, audit surface                   | Trivial — remove                                      |
| E2E absent from CI                           | Regressions reach `main`                         | Medium — needs Nuxeo in CI                            |

---

## 6. Opportunities — recommendations, not capabilities

Explicitly labelled: **none of these exists today.**

### O1 · Validate then widen the addressable surface _(highest value)_

Turn C1 from a risk into a designed decision. Widening Layer 1 to cover the top request classes
directly increases the proportion of engagements that are configuration rather than code — which
is the entire economic thesis.

### O2 · Customer self-service configuration UI

The Layer 1 manifest is already a **Nuxeo document**. A UI over it would let a business user
reconfigure navigation and actions with versioning, audit and ACLs for free. The hard part —
storage, governance, merge semantics — is done.

### O3 · Productise the verification apparatus

The 15 gates, evidence assertions and adversarial review pattern are **product-independent** and
address the industry's live question: how do you ship AI-written code safely? Potentially more
broadly valuable than Satori itself, either internally across product lines or externally.

### O4 · Extension marketplace

Generators plus a stable contract plus a guardrail is the substrate for customers and partners
sharing extensions. Requires: publishing, versioning policy, and a curation model.

### O5 · AI-assisted upgrade migration

An agent that reads a release's changelog and adapts a customer's Layer 2 code. The upgrade
rehearsal already proves _whether_ a customisation survives; this would help when it does not.

### O6 · Ship the harness as a customer-facing accelerator

Already partly true — generators and the guardrail ship in the package. Making it an explicit,
supported product artifact with its own versioning is a differentiator no comparable product has.

### O7 · Automated support triage

Per-ticket evidence runners already exist (~20, `NXSAT-*`). Extending that into customer-facing
reproduction capture would cut support cost.

---

## 7. If you read one thing

Three actions dominate everything else on this page:

1. **Validate the Layer 0/1 assumption.** Ten requests, two accounts. Days of work. It
   determines whether the platform is economically viable as designed.
2. **Resource review separately from authoring.** Named as the binding constraint by the RFC and
   confirmed empirically here.
3. **Find a design partner.** Zero customers is the root of most of the unvalidated claims.

Everything else — accessibility, coverage, SAST, observability — is known, named, and has an
owner in Phase 6.
