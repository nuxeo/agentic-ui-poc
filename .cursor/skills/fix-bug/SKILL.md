---
name: fix-bug
description: End-to-end playbook for fixing a bug in the agentic-ui-poc (Nx/Angular) repo — analyse the JIRA ticket, reproduce and capture before/after evidence, branch as fix/<desc>, fix at the root cause following the AGENTS conventions without inducing regressions, add a regression test, run the review:preflight gate, then open a conventional-commit PR to main and take it through CI + review. Use when asked to fix a bug, a JIRA bug ticket (NCO-/NXSAT-/NXENG-<id>), "fix and raise PR", or take a defect to review.
---

# Fix a bug — agentic, end-to-end

Drive the whole fix autonomously, but **present a short plan first and pause for a go-ahead**
before changing code. Track the phases with a TODO list.

This is the `agentic-ui-poc` **Nx + Angular 19** monorepo (`nuxeo/agentic-ui-poc`, single base
branch `main`). Reuse the existing infra instead of reinventing it:

- Conventions live in `AGENTS.md` and `AGENTS/*.md` — read the relevant ones per phase.
- Local gate: `npm run review:preflight` (guardrails → `nx affected lint` → `nx affected test`).
- PR review feedback is handled by the [`fix-pr-comments`](../fix-pr-comments.md) skill.
- New tests follow the [`generate-tests`](../generate-tests.md) skill + `AGENTS/05-test-standards.md`.

## Phase 0 — Plan first

Restate the bug, list the phases below as concrete steps, then show the plan and pause for
confirmation. Re-plan if scope changes.

## Phase 1 — Understand the ticket

- If a JIRA id is given (e.g. `NCO-1234`, `NXSAT-160`), fetch it via the Atlassian MCP and read
  the description **and every comment** (repro steps, expected vs actual, screenshots, affected area).
  If Atlassian tools aren't listed, call `mcp_auth` for the Atlassian server first.
- Extract the expected behavior and the minimal reproduction. Identify the affected app/lib
  (`apps/*`, `libs/*`) and feature (`browse`, `document-detail`, `knowledge-discovery`, `search`, …).
- Load context: `AGENTS.md`, `AGENTS/00-architecture.md`, `AGENTS/01-services.md`, and
  `AGENTS/08-bug-patterns.md` (check whether this is a known pattern).

## Phase 2 — Branch

Never work on `main`. Branch per `AGENTS/06-git-workflow.md`:

```bash
git fetch origin main
git switch -c fix/<kebab-description> origin/main   # e.g. fix/thumbnail-blob-url-leak
```

Keep the JIRA id for the commit/PR (`fix(NCO-1234): …`), not necessarily the branch name.

## Phase 3 — Reproduce + capture evidence

Capture the bug **before** fixing so you can prove the fix.

```bash
mkdir -p ~/Desktop/<TICKET-ID>
```

- Run the app locally: `npm run dev` (`nx serve nuxeo-ui`). Most flows need a running local Nuxeo
  (see the [`kd-local-setup`](../kd-local-setup/SKILL.md) skill / `nuxeo-conf/` / `arender-docker-compose.yml`
  if the bug involves KD, ingestion, or ARender).
- Reproduce the exact steps from the ticket and save **before** screenshots/console logs to
  `~/Desktop/<TICKET-ID>/`. A short screen recording helps reviewers/QA.
- If the repo already has Playwright e2e scaffolding (`playwright-report/`, `test-results/`), a
  failing e2e/unit test that captures the bug is the strongest evidence — write it now so it goes
  red, then green after the fix.

## Phase 4 — Fix at the root cause (no regressions)

- Find the real root cause in the owning service/component before editing; make the **minimal** change.
- Follow the conventions strictly:
  - `AGENTS/03-angular-conventions.md` — Angular 19 patterns (standalone components, signals,
    `takeUntilDestroyed()` for subscriptions, `ngOnDestroy` cleanup).
  - `AGENTS/07-security.md` — never hardcode credentials; no direct `<img [src]>` to authenticated
    Nuxeo content (fetch via service + blob URL); revoke every `URL.createObjectURL()`.
  - `AGENTS/08-bug-patterns.md` — avoid re-introducing known defects.
- Respect the automated guardrails (`scripts/review-guardrails.mjs`) so the gate stays green:
  no hard-coded colors in new `.scss`/`.html` (use `--mat-sys-*` / `--kd-*` tokens), every new
  `URL.createObjectURL` has a matching `URL.revokeObjectURL`, avoid `as unknown as` / `as never`
  type escapes, and any new `@nx/vitest:test` project has a config + specs (or `passWithNoTests`).
- Keep the diff focused — don't bundle unrelated changes. Capture the **after** evidence.

## Phase 5 — Regression test

Add or extend a unit test that fails before the fix and passes after (`AGENTS/05-test-standards.md`,
`generate-tests` skill). Run just the affected project while iterating:

```bash
npx nx test <project>            # e.g. npx nx test document-detail
```

## Phase 6 — Validate locally (gate before push)

Run the same checks CI gates on (`.github/workflows/ci.yml`):

```bash
npm run review:preflight          # guardrails + nx affected lint + nx affected test
npx nx affected -t build          # CI also builds affected projects
```

If you touched `nuxeo-ui`, sanity-check the production build/bundle-size expectation
(`npx nx build nuxeo-ui --configuration=production`; CI enforces a 5 MB JS+CSS limit).
Only proceed when everything is green. Never use `--no-verify` to bypass the Husky hook.

## Phase 6.5 — Evidence collection + human sign-off (mandatory gate)

**STOP before committing.** You MUST collect evidence and get explicit user approval.

### 6.5a — Start the dev server (if not already running)

```bash
npx nx serve nuxeo-ui   # wait for "Local: http://localhost:4200/"
```

### 6.5b — Create a ticket-specific evidence steps file and run the collector

The project ships a reusable Playwright-based evidence runner at
`scripts/collect-evidence/`. See `scripts/collect-evidence/README.md` for full docs.

1. **Create** `scripts/collect-evidence/<TICKET-ID>.mjs` — export a default async function
   that calls `helpers.login()`, `helpers.goToDoc(uid)`, and `helpers.screenshot(name)` for
   every fix being verified. Use the NXSAT-175 file as a template.

2. **Run** the collector (dev server must be up, and a real Nuxeo instance reachable):

   ```bash
   NUXEO_DOC_UID=<uid> npm run evidence:collect -- <TICKET-ID> scripts/collect-evidence/<TICKET-ID>.mjs
   ```

   Output lands in `~/Desktop/<TICKET-ID>/` — screenshots + a WebM screen recording.

3. **Present** a per-bug checklist table to the user (Before → After, navigation steps).

### 6.5c — Wait for explicit user confirmation

Use `AskQuestion` to present a binary choice:

- "Evidence collected and recording saved — proceed with commit + PR?"
- "No — I found a problem."

**Do NOT commit or push until the user explicitly says YES.**

## Phase 7 — Commit + open PR

This is the "fix and raise PR" trigger. Only reached after Phase 6.5 sign-off.

- Conventional-commit message (`AGENTS/06-git-workflow.md`), lowercase, present tense, with the
  JIRA id when known:

```bash
git add <changed files>           # stage only the fix + test (not unrelated churn)
git commit -m "fix(NCO-1234): <concise description of the fix>"
git push -u origin HEAD
```

- Open a PR to `main`, filling the template:

```bash
gh pr create --repo nuxeo/agentic-ui-poc --base main \
  --title "fix(NCO-1234): <summary>" \
  --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)"
```

Complete the template sections (What changed & why, JIRA ticket, files modified, how to test,
checklist). Attach the before/after evidence. Push branches to `origin` (never a fork) so CI
runs against the upstream repo.

## Phase 8 — CI + review

```bash
gh pr view <N> --repo nuxeo/agentic-ui-poc --json statusCheckRollup \
  --jq '[.statusCheckRollup[]|{name:(.name//.context),conclusion:(.conclusion//.state)}]'
```

- Real failure → read the failing job log, fix on the branch, re-run `review:preflight`, push.
- Address Copilot/reviewer comments via the `fix-pr-comments` skill — do NOT suppress lint errors.
- Wait for CI (guardrails + lint + build + test + bundle size) to pass and at least one approval;
  squash-and-merge is the team's merge style.

## Guardrails

- Never commit to `main`; never force-push `main`; never `--no-verify`.
- Never commit secrets, `.env`, or `node_modules`. Never print client secrets.
- Only commit/push when the user asks; keep the PR scoped to the single fix.
