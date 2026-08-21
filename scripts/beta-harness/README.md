# Beta harness

Tooling the AI agents use to execute the Nuxeo Satori Beta plan: per-phase
evidence capture with verification, and a re-runnable quality gate.

Related: `AGENTS/11-beta-program.md` (phase gates, agent roster, model policy)
and the `beta-phase` skill, which orchestrates both scripts.

## How this differs from `scripts/collect-evidence/`

|              | `collect-evidence/`              | `beta-harness/`                                    |
| ------------ | -------------------------------- | -------------------------------------------------- |
| Unit of work | one JIRA ticket                  | one Beta phase                                     |
| Output       | screenshots + video              | screenshots + video + `manifest.json` + `INDEX.md` |
| Verification | none — captures whatever renders | every step records pass/fail checks                |
| Exit code    | always 0                         | 1 when any check fails, so agents can iterate      |

The helper contract (`step`, `screenshot`, `login`, `goToDoc`, `baseUrl`) is a
superset of the ticket runner's, so existing ticket steps files run unchanged
under the phase runner.

## Prerequisites

Playwright is deliberately **not** a tracked dependency, so it never affects the
CI install. Install it locally once:

```bash
npm install --no-save @playwright/test
npx playwright install chromium
```

Then start the app in another terminal:

```bash
npx nx serve nuxeo-ui
```

## Capture phase evidence

```bash
npm run beta:evidence -- phase-0-baseline
```

Loads `scripts/beta-harness/steps/phase-0-baseline.mjs` and writes to
`$EVIDENCE_ROOT/beta/phase-0-baseline/<timestamp>/`:

- `NN-*.png` — screenshots numbered by step
- `*.webm` — video of the whole run
- `manifest.json` — steps, checks, environment, verdict
- `INDEX.md` — narrative report with the images inlined, ready to paste into a
  PR description or attach to the RFC

Exits non-zero if any check failed, or if **no** checks were recorded — a
capture that asserts nothing is not evidence.

To add a phase, copy `steps/_template.mjs` to `steps/<phase-id>.mjs`. The
template documents the four rules that keep a capture meaningful.

## Run the verification gate

```bash
npm run beta:gate -- --phase phase-1-config
npm run beta:gate -- --gates guardrails,lint        # fast inner loop
npm run beta:gate -- --base main --tail 80
```

Runs guardrails, then affected lint, tests and build — cheapest first, stopping
at the first failure and printing only its output tail. That ordering is
deliberate: a lint error usually explains the test failure that would follow,
and running the full set on a known-broken tree wastes minutes per iteration.

Reports land in `$EVIDENCE_ROOT/beta/gates/<timestamp>-<phase>.json`.

## Environment

| Variable                  | Default                         | Purpose                                  |
| ------------------------- | ------------------------------- | ---------------------------------------- |
| `APP_URL`                 | `http://localhost:4200`         | Dev server URL                           |
| `NUXEO_USER`              | `Administrator`                 | Login username                           |
| `NUXEO_PASS`              | `Administrator`                 | Login password                           |
| `NUXEO_DOC_UID`           | _(none)_                        | Document UID for doc-specific steps      |
| `AGENTIC_UI_EVIDENCE_DIR` | `~/Desktop/agentic-ui-evidence` | Evidence root                            |
| `EVIDENCE_HEADLESS`       | `0`                             | Set `1` to run without a visible browser |
| `EVIDENCE_SLOWMO`         | `300`                           | Milliseconds between interactions        |

Credentials come from the environment only. Never commit real ones.
