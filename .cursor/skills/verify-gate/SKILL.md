---
name: verify-gate
description: Run the agentic-ui-poc quality gates and iterate to green without churning — cheapest-first gate ordering, fix only the first reported failure, three-attempt cap, and explicit stop conditions that require a human. Use when asked to verify a change, get the build green, run preflight or the Beta gate, fix lint/test/build failures, or confirm a step is actually complete.
---

# Verify and iterate to green

The purpose of this skill is to stop two specific failure modes: declaring
success without evidence, and thrashing on a failure that needs a human.

## The loop

### 1. Fast inner loop while coding

```bash
npm run beta:gate -- --gates guardrails,lint
```

Seconds, not minutes. Run it after every meaningful edit.

### 2. Full gate before claiming completion

```bash
npm run beta:gate -- --phase <phase-id>
```

Runs guardrails, affected lint, affected test, affected build — cheapest first,
stopping at the first failure and printing only its output tail. Reports land in
`$AGENTIC_UI_EVIDENCE_DIR/beta/gates/`.

For non-Beta work the equivalent is `npm run review:preflight` followed by
`npx nx affected -t build`.

### 3. Fix exactly one thing

Fix **the first reported failure only**. Do not batch speculative fixes: when
several land together you cannot attribute the improvement, and a wrong one hides
behind a right one. Re-run, then move to the next.

### 4. Cap the attempts

**Three attempts per step.** On the third failure, stop and report:

- what you changed each time
- the exact failing output
- your current hypothesis
- what you need in order to proceed

Continuing past three is how agents burn an hour producing a worse diff.

## Reading failures

| Symptom                                                         | Usual cause                                                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Cannot find module '@hylandsoftware/...'` or `'@alfresco/...'` | Registry token missing. Check `SATORI_GH_READONLY_TOKEN` before touching code.                                       |
| `__decorate is not defined` in a spec                           | `tsconfig.spec.json` missing `importHelpers: false` — compare against `libs/shared/nuxeo-client/tsconfig.spec.json`. |
| Test passes alone, fails in the suite                           | Shared state. Check for un-reset signals or a missing `takeUntilDestroyed()`.                                        |
| Lint error about cross-feature import                           | Real architecture violation. Move the shared code to `libs/shared/`, do not suppress.                                |
| Guardrails failure on hardcoded colour                          | Use a theme token, not a literal.                                                                                    |
| Build passes locally, fails in CI                               | Stale local `node_modules`. Re-run `npm ci` and compare.                                                             |

## Never do these

- Add an eslint-disable to silence a rule instead of fixing the cause.
- Skip, `.only`, or weaken a test to get green.
- Widen a type to `any` to satisfy the compiler.
- Delete a failing assertion because the new behaviour "looks right".
- Report success while a gate is red, or while gates were skipped because an
  earlier one failed. The report lists `skipped` for exactly this reason — read it.

## Stop and ask a human when

- The same failure survives three distinct fix attempts.
- Passing would require any item from "Never do these".
- The fix widens the public API or exposes an adf-hx type through it.
- The fix touches `install.xml` or marketplace packaging.
- The fix contradicts a verified fact in `AGENTS/11-beta-program.md` section 3.

## Completion criteria

A step is complete when, and only when:

1. The full gate exits 0 with no skipped gates, **and**
2. the phase evidence run exits 0 — see [`capture-phase-evidence`](../capture-phase-evidence/SKILL.md).

Reasoning about correctness is not a substitute for either. Quote the gate
verdict line and the evidence verdict line when you report completion.
