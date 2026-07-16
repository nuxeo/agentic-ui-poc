---
name: fix-bug
description: End-to-end playbook for fixing a bug in the agentic-ui-poc (Nx/Angular) repo — analyse the JIRA ticket, reproduce and capture before/after evidence, branch as fix/<desc>, fix at the root cause following the AGENTS conventions without inducing regressions, add a regression test, run the review:preflight gate, collect Playwright evidence, get user sign-off, open a conventional-commit PR to main, then monitor CI checks and review comments until the PR is approved and ready to merge. Use when asked to fix a bug, a JIRA bug ticket (NCO-/NXSAT-/NXENG-<id>), "fix and raise PR", or take a defect to review.
---

# Fix a bug — agentic, end-to-end

Drive the whole fix autonomously, but **present a short plan after ticket + Web UI analysis**
and pause for a go-ahead before changing code. Track the phases with a TODO list.

This is the `agentic-ui-poc` **Nx + Angular 19** monorepo (`nuxeo/agentic-ui-poc`, single base
branch `main`). Reuse the existing infra instead of reinventing it:

- Conventions live in `AGENTS.md` and `AGENTS/*.md` — read the relevant ones per phase.
- Local gate: `npm run review:preflight` (guardrails → `nx affected lint` → `nx affected test`), then
  **`npx nx affected -t build`** — build must pass before commit (see Phase 7 / Phase 8).
- PR review feedback is handled by the [`fix-pr-comments`](../fix-pr-comments.md) skill.
- New tests follow the [`generate-tests`](../generate-tests.md) skill + `AGENTS/05-test-standards.md`.

## Phase 1 — Understand the ticket

- If a JIRA id is given (e.g. `NCO-1234`, `NXSAT-160`), fetch it via the Atlassian MCP and read
  the description **and every comment** (repro steps, expected vs actual, screenshots, affected area).
  If Atlassian tools aren't listed, call `mcp_auth` for the Atlassian server first.
- Extract the expected behavior and the minimal reproduction. Identify the affected app/lib
  (`apps/*`, `libs/*`) and feature (`browse`, `document-detail`, `knowledge-discovery`, `search`, …).
- Load context: `AGENTS.md`, `AGENTS/00-architecture.md`, `AGENTS/01-services.md`, and
  `AGENTS/08-bug-patterns.md` (check whether this is a known pattern).

### Classic Web UI parity check

Satori bugs often require matching Classic Web UI behavior — do not guess from audit labels or
REST docs alone.

1. **Find the Web UI reference** in upstream Hyland/Nuxeo repos:
   - UI behavior: [`nuxeo/nuxeo-web-ui`](https://github.com/nuxeo/nuxeo-web-ui) (`elements/`, `i18n/`, `test/`)
   - Shared elements: [`nuxeo/nuxeo-ui-elements`](https://github.com/nuxeo/nuxeo-ui-elements) (viewers, download actions)
   - Platform API: Nuxeo `DownloadService` javadoc (`X-Client-Reason` header / `clientReason` query param)
   - Release notes: [Web UI 3.0.18+ view vs download](https://doc.nuxeo.com/nxdoc/2021/web-ui-release-notes-3-0-18/)

2. **Search for the relevant keywords** (via `gh api search/code` or GitHub UI):
   `clientReason`, `activity.view`, `activity.download`, `@blob`, `nuxeo-document-activity`,
   `nuxeo-document-preview`, `X-Client-Reason`.

3. **Capture what to mirror** — note the exact:
   - HTTP header or query param sent on preview vs explicit download
   - Audit `extended.clientReason` values (`view` | `download`)
   - Activity/history label logic (i18n keys, fallbacks when `clientReason` is missing)
   - Unit tests in Web UI that encode expected behavior (prefer these as the spec)

4. **Cross-check this repo** — grep Satori for the same area (`fetchBlob`, `activityLabel`,
   `eventLabel`, `@audit`) and list the delta vs Web UI.

5. **Record findings for the plan** — cite the Web UI file(s) and test(s) that define parity.
   If Web UI behavior is ambiguous or version-dependent, call that out before proposing a fix.

## Phase 2 — Plan first (planning gate)

After Phase 1 (including the Classic Web UI parity check), restate the bug, summarize the Web UI
references you found, list Phases 3–9 as concrete steps, then show the plan and pause for
confirmation. Re-plan if scope changes or Web UI research contradicts the initial hypothesis.

## Phase 3 — Branch

Never work on `main`. Branch per `AGENTS/06-git-workflow.md`:

```bash
git fetch origin main
git switch -c fix/<kebab-description> origin/main   # e.g. fix/thumbnail-blob-url-leak
```

Keep the JIRA id for the commit/PR (`fix(NCO-1234): …`), not necessarily the branch name.

## Phase 4 — Reproduce + capture evidence

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

## Phase 5 — Fix at the root cause (no regressions)

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

## Phase 6 — Regression test

Add or extend a unit test that fails before the fix and passes after (`AGENTS/05-test-standards.md`,
`generate-tests` skill). Run just the affected project while iterating:

```bash
npx nx test <project>            # e.g. npx nx test document-detail
```

## Phase 7 — Validate locally (gate before evidence + commit)

Run the same checks CI gates on (`.github/workflows/ci.yml`). **All three must pass** before
moving to evidence collection or commit:

```bash
npm run review:preflight          # guardrails + nx affected lint + nx affected test
npx nx affected -t build          # mandatory — catches template/type/build errors preflight misses
```

If you touched `nuxeo-ui`, sanity-check the production build/bundle-size expectation
(`npx nx build nuxeo-ui --configuration=production`; CI enforces a 5 MB JS+CSS limit).

**Do not proceed to Phase 7.5 or Phase 8 until lint, test, and build are all green.**
If build fails, fix the errors and re-run the full gate. Never use `--no-verify` to bypass the
Husky hook.

## Phase 7.5 — Evidence collection + human sign-off (mandatory gate)

**STOP before committing.** You MUST collect evidence and get explicit user approval.

### 7.5a — Start the dev server (if not already running)

```bash
npx nx serve nuxeo-ui   # wait for "Local: http://localhost:4200/"
```

### 7.5b — Ensure Playwright is available locally

The evidence runner uses Playwright, but it is **intentionally not** a tracked dependency in
`package.json` (it's local-only DX tooling — keeping it out of the lock file avoids perturbing the
CI install). So before running the collector, check whether Playwright is already available:

```bash
node -e "require.resolve('@playwright/test')" 2>/dev/null && echo "playwright: available" || echo "playwright: missing"
```

- **Available** → continue directly to 7.5c.
- **Missing** → Playwright is **required to collect evidence**. Prompt the user to install it
  locally before continuing (use `--no-save` so `package.json`/`package-lock.json` stay untouched):

  ```bash
  npm install --no-save @playwright/test
  npx playwright install chromium
  ```

  Do not proceed to the collector until the install succeeds.

### 7.5c — Create a ticket-specific evidence steps file and run the collector

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

### 7.5d — Wait for explicit user confirmation

Use `AskQuestion` to present a binary choice:

- "Evidence collected and recording saved — proceed with commit + PR?"
- "No — I found a problem."

**Do NOT commit or push until the user explicitly says YES.**

## Phase 8 — Commit + open PR

This is the "fix and raise PR" trigger. Only reached after Phase 7.5 sign-off.

### 8a — Re-run build gate immediately before commit

Even if Phase 7 passed earlier, **re-run build right before committing** to catch any drift:

```bash
npx nx affected -t build
```

If build fails, fix the issue and re-run `npm run review:preflight` + build. **Do not commit**
until build is green.

### 8b — Commit and push

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

## Phase 9 — Monitor PR (CI checks + review comments)

### 9a — Ask the user whether to watch the PR

Immediately after the PR URL is printed, use `AskQuestion` to present:

- "Watch this PR for CI results and review comments now?"
- "No thanks — I'll check manually."

**Only start monitoring if the user says YES.**

### 9b — Poll CI checks

Run the following every ~60 seconds until all checks reach a terminal state
(`SUCCESS`, `FAILURE`, `CANCELLED`, `SKIPPED`):

```bash
gh pr view <N> --repo nuxeo/agentic-ui-poc --json statusCheckRollup \
  --jq '[.statusCheckRollup[]|{name:(.name//.context),state:(.conclusion//.state)}]'
```

Report a compact summary table each time checks change state. Stop polling once every
check is terminal.

- All green → tell the user: "All CI checks passed ✓"
- Any failure → read the failing job log and tell the user exactly which step failed
  and what the error was, then offer to fix it:

  ```bash
  gh run view <run-id> --log-failed
  ```

  Fix on the branch → re-run `review:preflight` → push → continue monitoring.

### 9c — Watch for review comments

After CI is green, check for unresolved review comments:

```bash
gh pr view <N> --repo nuxeo/agentic-ui-poc --json reviews,comments \
  --jq '{reviews:[.reviews[]|{author:.author.login,state:.state,body:.body}],
         comments:[.comments[]|{author:.author.login,body:.body,path:.path,line:.line}]}'
```

- If there are `CHANGES_REQUESTED` reviews or inline comments, surface them to the
  user grouped by file/concern, then invoke the `fix-pr-comments` skill to address them.
- If the review state is `APPROVED` with CI green, tell the user the PR is ready to merge.

### 9d — Report final status

Once the PR is approved and all checks pass, present a closing summary:

| Item      | Status                       |
| --------- | ---------------------------- |
| CI checks | ✅ all passed                |
| Review    | ✅ approved                  |
| PR        | 🟢 ready to squash-and-merge |

Ask the user: "Merge now, or leave it for a team member?"

## Guardrails

- Never commit to `main`; never force-push `main`; never `--no-verify`.
- Never commit secrets, `.env`, or `node_modules`. Never print client secrets.
- Only commit/push when the user asks; keep the PR scoped to the single fix.
