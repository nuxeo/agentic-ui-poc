---
title: AI Harness Strategy
parent: Executive / Leadership
order: 5
last_reviewed: 2026-08-24
repo_commit: 77265f9
audience: leadership
---

# AI Harness Strategy

> **Last reviewed:** 2026-08-24 · **Repository:** `77265f9`
> "The harness" = the **development-time** apparatus. The 12 customer-facing `AI.*` operations
> are a separate thing with a separate owner — see [Cost & TCO §1](03-cost-and-tco.md).

---

## Why it exists

Not to make development faster. To make **fast development safe**.

The control experiment is this programme's own predecessor, from RFC §7.1:

> It was AI-built and produced roughly 18,400 lines quickly. It also produced seven code-level
> defects, eleven tests for 2,949 lines of bridge source, and a branch that had never been
> compiled by CI.

And the conclusion the RFC draws, which is the strategic sentence:

> **Agents move cost from authoring to verification rather than removing it.**

Every expensive thing in this repository — 15 gates, ~20k lines of harness scripts, 10
commit-time guardrails, mandatory adversarial review — is that verification cost, made
systematic instead of hoped for.

---

## What it is, concretely

**There is no agent runtime here.** No orchestrator, no LLM call, no MCP server. The
intelligence is whichever AI tool the developer runs; the repository supplies knowledge and
gates.

| Component           | Scale                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| Knowledge base      | 13 `AGENTS/` files, ~3.1k lines, tool-agnostic                              |
| Tool adapters       | Claude Code, Cursor, Windsurf, Copilot, plus a shell script for any LLM CLI |
| Skills — procedures | 13                                                                          |
| Review agents       | 2, **read-only by construction**                                            |
| Generators          | 4, **shipped to customers**                                                 |
| Gates               | 15, cheapest-first, stop at first failure                                   |
| Commit guardrails   | 10                                                                          |
| Automated workflows | 8                                                                           |
| Evidence assertions | 257 across 13 steps files, all audited for falsifiability                   |

**Deliberately multi-tool.** One knowledge base, five adapters — the investment is not hostage
to a single vendor's product decisions.

---

## Why it is strategically valuable

### 1. It is the credible answer to the industry's live question

"How do you ship AI-written code safely?" is being asked in every enterprise software
organisation right now. We have a worked answer with evidence, including the counter-evidence.
That is a reusable asset **independent of Satori**, and arguably more broadly valuable.

### 2. It converts agent claims into artifacts

The failure mode of agentic delivery is not bad code. It is **confident, plausible, wrong
reports that pass every check the agent knows about**. Observed here:

- Three generators spliced every registration **inside a comment**, reported success, printed
  the IDs they had "registered" — and lint, typecheck and six specs all passed.
- A published package **could not be published at all** while six other gates were green.
- Seven gates asserted less than they claimed.

The governing rule — _a gate is not evidence until you have seen it fail on purpose_ — is the
transferable practice.

### 3. It ships to customers, which no comparable product does

Generators and a runnable guardrail are **inside the npm package**. A customer's own AI agent
gets correct scaffolding and can verify its own conformance before a human reviews it. That is a
differentiator, and it is what makes the Layer 2 economics plausible.

### 4. It compounds

`AGENTS/08-bug-patterns.md` is 413 lines of bugs already made. The counterfactual is a team
re-making them, and a new joiner learning them by breaking things.

---

## What it demands

Stated plainly, because these are the costs leadership signs up for.

| Demand                                            | Detail                                                                                                                                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Review resourced separately from authoring**    | The RFC's binding constraint. A few hundred lines a day per engineer, against phases that could emit 15–25k lines. Ignore this and autonomy reproduces the POC failure mode at higher volume                       |
| **Adversarial review is not optional**            | Every phase self-reported green and every one contained an overstated claim. This is a permanent process cost                                                                                                      |
| **The harness is maintained forever**             | ~20k lines of scripts. Seven gates were found rotten. Gates are software                                                                                                                                           |
| **The knowledge base decays**                     | 13 files; exactly **one** has an automated staleness check                                                                                                                                                         |
| **Human gates on expensive-to-reverse decisions** | Public API, action descriptor shape, anything touching authentication, credentials or blob lifecycle. _"A public API is permanent once customers depend on it, and that is not a place to trade review for speed"_ |

### The recommended operating mode, from the RFC

> **Scoped autonomy.** Let agents auto-run freely inside a phase's implementation loop, and keep
> human gates on the decisions that are expensive to reverse.

And the precondition:

> Autonomy is only safe behind the phase harness — the verification gate, per-step evidence
> assertions, and contract tests on all twelve ports.

---

## Governance required

| Control                                                                                        | Status                                                                                                                                |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| A phase cannot be marked complete without a passing evidence manifest **and** a full-gate pass | **Implemented** — `beta:state`, and it has correctly gone red twice when a gate was added                                             |
| Every evidence assertion must be capable of failing                                            | **Implemented** — `beta:audit` over 257 assertions                                                                                    |
| Independent adversarial review before sign-off                                                 | **Process, partly tooled.** 2 read-only review agents; the discipline is human                                                        |
| Public API changes are visible                                                                 | **Implemented** — 2,221-line snapshot gate                                                                                            |
| Only a CI run is authoritative                                                                 | **Stated, and has been broken** — across twenty consecutive pushes while CI was red for sixteen. Now with the command in the contract |
| Knowledge-base staleness                                                                       | **1 of 13 files** automated                                                                                                           |
| Documentation updated with the change                                                          | **This documentation set + the governance rule**                                                                                      |

---

## Honest assessment of the leverage

The RFC's own estimate, which is the most credible figure available:

| Work class                                             | Leverage         | Why                                                     |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------- |
| Test authoring, i18n extraction, codemods, scaffolding | **High, ~2–3×**  | Mechanical, verifiable, high volume                     |
| API port implementation, adapter wiring                | Moderate, ~1.5×  | Pattern-repetitive but needs integration judgement      |
| Public API design, registry refactor                   | **Low–moderate** | Design decisions dominate; agents assist, do not decide |
| Dependency resolution, CI, packaging                   | **Low**          | Wall-clock is external systems, not typing              |
| Adversarial review                                     | **High**         | Multiple model families catch each other's blind spots  |

Roughly **40% of remaining effort** is agent-amenable. Four things do not compress: CI
wall-clock, genuine discovery, **decisions** (calendar time, not engineering time), and **review
capacity**.

**No actual leverage has been measured in this programme.** No time tracking exists. The
estimates above are the RFC's, not observed outcomes — and that is itself a gap worth closing,
since we now have 111 commits of history to reconcile against calendar time.

---

## The strategic recommendation

1. **Keep the harness, and fund its maintenance explicitly.** It is the reason AI-assisted
   delivery here has not produced an unshippable product. Treat it as infrastructure, not
   overhead.
2. **Resource review separately.** This is the single highest-leverage operational change.
3. **Measure the leverage.** We are claiming benefits from AI-assisted development with no
   instrumentation. Reconciling the git history against calendar time is hours of work.
4. **Consider productising the apparatus** beyond Satori — see opportunity O3 in
   [Risks & Opportunities](07-risks-and-opportunities.md).
5. **Do not let the harness become the product.** ~20k lines of scripts exist to verify ~104k
   lines of product. That ratio is defensible now, given what the POC demonstrated, but it should
   be watched.
