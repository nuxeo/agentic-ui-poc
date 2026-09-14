---
name: fix-bug
description: >-
  End-to-end agentic playbook for fixing a Jira bug (NXSAT-<id>, NCO-<id>, NXENG-<id>) in the
  agentic-ui-poc Nx/Angular monorepo: runs fully autonomously end-to-end (YOLO mode, no
  confirmation gates), analyse the ticket + all comments, derive acceptance criteria when the
  ticket has none, take an isolated per-ticket workspace (own worktree, own ports and a
  ticket-scoped Nuxeo data root on the shared instance; a dedicated container only with
  --nuxeo own), reproduce and capture evidence (images AND videos) to
  ~/Desktop/agentic-ui-evidence/<TICKET-ID>/fix/ first, weigh the candidate fixes and record the
  choice, fix at the root cause, add a regression test, run an active blast-radius check and the
  full beta:gate, create a signed-commit PR, poll CI to green, close every review thread, then
  post the fix summary to Jira with attachments. Use when asked to fix a bug, a Jira bug ticket,
  "fix and raise PR", or take a defect to review.
---

# Fix an agentic-ui-poc bug — agentic, end-to-end

Drive the whole fix in **YOLO mode: run the entire workflow end-to-end without pausing for
confirmation between phases** — reproduce → decide → fix → validate → commit → push → open the PR
→ update the ticket → summarize. State the plan up front for the record, then keep going. The only
hard stops are the **Guardrails** at the bottom and the **Stop conditions** in Phase 3.5; YOLO
relaxes the _confirmation_ gates, not those. Track phases with a TODO list.

Delegate: review-comment mechanics to [`fix-pr-comments`](../fix-pr-comments.md), new tests to
[`generate-tests`](../generate-tests.md), gate iteration to [`verify-gate`](../verify-gate/SKILL.md),
and accessibility / i18n / cross-browser validation to [`validate-fix`](../validate-fix/SKILL.md).

> **Building a feature, enhancement or new module rather than fixing a defect?** Use
> [`build-feature`](../build-feature/SKILL.md), which extends this skill — it inherits the
> workspace, gate, evidence, PR, CI and metrics phases and replaces the bug-shaped ones
> (reproduce, root cause, failing-first regression test) with design and layer placement,
> vertical-slice delivery and docs as deliverables.

> **Evidence is always captured in BOTH forms — screenshots (images) AND screen recordings
> (videos), before and after.** Never ask which format; always produce both.

> **Core rule — this repo has ONE base branch, `main`.** There is no maintenance base and no
> backport: one branch, one PR. Do not go looking for a second base.
> What is non-negotiable instead: **every fix ships with written acceptance criteria, a recorded
> choice of approach, a stated root cause, a regression test that fails before and passes after,
> a blast-radius check, and before/after evidence in both forms.**

Useful constants:

- Atlassian cloudId: `252cce86-035e-4b0e-abd2-3c002935632f` (site `hyland.atlassian.net`)
- Jira projects: `NXSAT` · `NCO` · `NXENG` — Upstream repo: `nuxeo/agentic-ui-poc` — base: `main`
- SonarCloud: org `nuxeo`, project key `nuxeo_agentic-ui-poc`
- Shared dev infra you must **never** disturb: containers `nuxeo` (:8080) and `nuxeo-opensearch`
  (:9200), network `nuxeo-net`, and the primary checkout itself

## Time budget — how long this should take, and when to bail

There is no useful "time complexity" for a bug fix, but an unbounded agent run is worse than a
slow one. Budget the phases and **report any overrun rather than silently continuing**:

| Phase                                 | Budget  | On overrun                                                  |
| ------------------------------------- | ------- | ----------------------------------------------------------- |
| 1–1.6 ticket, workspace, expectations | ~20 min | `npm ci` and the image pull dominate; keep going            |
| 2 reproduce + before evidence         | ~30 min | **Cannot reproduce → stop and report.** Never fix blind.    |
| 3.5–4 decide + fix                    | ~45 min | Three failed attempts at a root cause → stop, per Phase 3.5 |
| 5 gate to green                       | ~30 min | Three attempts on one failure → stop (`verify-gate`)        |
| 7 CI poll                             | 45 min  | Hard cap — see Phase 7. Report what is still pending        |
| Whole run                             | ~3 h    | Report progress, the blocker, and what you need             |

Two loops are explicitly bounded: **fix ↔ evidence** (Phase 4, three iterations) and **gate**
(Phase 5, three attempts per failure). Nothing else may loop without a bound.

### Measure the run — one command per phase boundary

Budgets are guesses until they are measured. Mark every phase transition so the next run can be
compared against this one:

```bash
node scripts/agent-metrics.mjs start "$TICKET" --kind bug --model <the model you are>
node scripts/agent-metrics.mjs phase "$TICKET" <phase-id>    # at each phase below
node scripts/agent-metrics.mjs event "$TICKET" retry|gate-fail|stop-condition|evidence-rerun
node scripts/agent-metrics.mjs end   "$TICKET" --outcome pr-open|merged|blocked|abandoned
```

Phase ids are a fixed list and an unknown one is rejected: free-text phase names make runs
incomparable, and a table you cannot compare cannot tell you which phase to shorten. Each id
sits in one of three buckets, and **only `fix` is published**:

| bucket     | phases                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `fix`      | `ticket` `expected` `reproduce` `design` `decide` `scaffold` `fix` `regression-test` `docs` `blast-radius` `gate` `validate` `review` |
| `evidence` | `evidence-before` `baseline` `verify-evidence`                                                                                        |
| `overhead` | `workspace` `pr` `ci` `jira` `cleanup`                                                                                                |

`cleanup` covers the final summary only. **Teardown is not measured**: `publish` must run
before the workspace is removed — removing it deletes the script — and `end` must precede
`publish`, so the run is always closed before teardown begins.

The shared page answers "how long do fixes take", so it gets the `fix` total alone. The first
row published wall clock — 4h 13m for a one-line change, 88% of it evidence capture and CI
polling — which is a number about the pipeline masquerading as a number about the work. All
three totals stay in the local report, which is where you look when a run felt slow.

**`publish` refuses until the `jira` phase is recorded.** A row is a record of finished work;
publishing before the ticket is updated puts a time on the page for something nobody can yet
go and look at.

`end` prints the per-phase table. Phase 10 publishes it to the team page.

> **Do not report a token count or a cost.** You cannot observe your own token usage, and a
> plausible figure printed next to measured ones gets believed. The metrics log records the
> account, model and UTC window instead, which is what Cursor's usage export needs to attribute
> spend. Say "not measured — join on the recorded window" rather than estimating.

### Filesystem layout — write only inside these roots

| What                                              | Where                                                  |
| ------------------------------------------------- | ------------------------------------------------------ |
| Evidence (screenshots, videos, logs)              | `~/Desktop/agentic-ui-evidence/<TICKET-ID>/fix/`       |
| Ticket workspace (worktree, node_modules, conf)   | `~/Desktop/Projects/agentic-ui-worktrees/<TICKET-ID>/` |
| Ticket-specific Playwright steps file (committed) | `scripts/collect-evidence/<TICKET-ID>.mjs`             |

> **Never create a folder directly on `~/Desktop`**, and **never put a worktree inside the repo**
> — a nested checkout with its own `node_modules` will be picked up by Nx and by `git add -A`.
> Evidence lives outside the repo on purpose and must never be committed; anything load-bearing
> belongs in `documentation/` or `docs/`.

## Setup check — first-time users

Before the first run on a new machine, verify the environment. If anything is missing, **pause and
walk the user through it** — do not silently continue past a missing prerequisite:

- **Atlassian MCP** authenticated (`atlassianUserInfo` succeeds). On `needsAuth`/403, run
  `mcp_auth` for the Atlassian namespace; confirm access to **NXSAT**/**NCO**/**NXENG**.
- **Jira token** for attachments: `~/.jira_email` and `~/.jira_token` exist. If absent, have the
  user create them — never accept a token pasted into chat.
- **GitHub CLI**: `gh auth status` logged in with push access to `nuxeo/agentic-ui-poc`.
- **Signed commits**: `git config commit.gpgsign` is `true`, `gpg.format=ssh`, key registered on
  GitHub as a **Signing Key** (distinct from an Authentication key).
- **Node 20** (`.nvmrc`) and `npm ci` done. On Node 22+ a built-in `localStorage` shadows jsdom's
  and a bare `nx test` fails on correct code — route verification through the gate.
- **Docker running**, with the shared `nuxeo` container present: the workspace script reads its
  image and licence from it.
- **Playwright**, installed **in the primary checkout** (`npm install --no-save @playwright/test
@axe-core/playwright && npx playwright install chromium`). Local-only and untracked, so it never
  touches the lock file — but it must exist before a workspace hardlinks `node_modules`, because
  you cannot safely `npm install` into a hardlinked tree afterwards.

## Phase 0 — Plan (non-blocking)

Restate the goal and list the phases below as a TODO list. **Show the plan, then immediately
proceed — do not wait for approval.** Re-plan on the fly if scope changes, or if Phase 1.6
contradicts the hypothesis.

## Phase 1 — Understand the ticket

- `getJiraIssue` (cloudId above, `issueIdOrKey=<TICKET>`, `fields:["*all"]` incl. `comment`).
  If Atlassian tools aren't listed, call `mcp_auth` first.
- Read the description **and every comment** — repro steps, expected vs actual, screenshots.
- Identify the affected app/lib and feature (AGENTS.md §2 and §6).
- Load context: `AGENTS.md`, `AGENTS/00-architecture.md`, `AGENTS/01-services.md`, and
  `AGENTS/08-bug-patterns.md` — check first whether this is an already-catalogued pattern.

### 1a — Derive the acceptance criteria when the ticket has none

Most bug tickets have no Acceptance Criteria, and a vague one is worse than none because it reads
as if it were a spec. **Do not stop, and do not silently invent them either.** Write them down:

1. If the ticket has AC, use them verbatim as the spec and quote them.
2. If not, **derive** them — from the reported symptom, the expected behaviour established in
   Phase 1.6, the existing unit tests for the area, and the surrounding code's evident intent.
   Derive what _should_ happen, rather than paraphrasing what the reporter said went wrong.
3. Print them as a numbered, testable list — each one something the regression test or the
   evidence capture can actually assert. "Works correctly" is not a criterion.
4. Mark each as `[from ticket]` or `[derived]`, and carry them into the PR body and the Jira
   comment so a human can challenge a derived one.
5. **If a criterion cannot be derived without a product decision** — two defensible behaviours and
   nothing in the ticket, the tests, the server or the code settles it — that is a Phase 3.5 stop
   condition. Do not pick one silently.

## Phase 1.5 — Take an isolated ticket workspace (before touching anything)

**Never work a ticket in the primary checkout, and never `git stash` to make room for it.** One
working tree can only be on one branch, so two agents in one clone fight over `HEAD`, over
`node_modules`, and over the stash stack — a global stack, where another agent can pop yours. The
single base branch does **not** remove this problem; it only removes the need for two bases.

Every ticket gets its own worktree, `node_modules`, dev-server port, proxy config and Nuxeo data
root:

```bash
export TICKET=NXSAT-<id>
bash .cursor/skills/fix-bug/scripts/new-ticket-workspace.sh "$TICKET"
. ~/Desktop/Projects/agentic-ui-worktrees/$TICKET/env.sh   # NX_WT, NX_PORT, NX_APP_PORT, NX_PROXY, EVID…
cd "$NX_WT"
npx nx serve nuxeo-ui --proxy-config "$NX_PROXY" --port "$NX_APP_PORT"
```

The script is idempotent — re-running reuses and re-prints the workspace. It:

- creates the worktree on `fix/<ticket-slug>` cut from `origin/main`;
- **hardlinks `node_modules`** from the primary checkout when the lockfile matches — 920 MB
  across 66k files, shared by inode, so it costs no disk and takes seconds instead of minutes.
  Falls back to `npm ci` when the lockfile differs. **Never run `npm install` in a hardlinked
  tree** — it would edit the primary checkout too;
- **shares the `nuxeo` container by default**, with a per-ticket data root at
  `/default-domain/workspaces/<TICKET>` so two tickets do not trip over each other's documents;
- writes `apps/nuxeo-ui/proxy.conf.ticket-<slug>.json`, because the tracked `proxy.conf.json`
  hardcodes `:8080`. Gitignored, so it cannot be committed.

### When the ticket needs its own Nuxeo

```bash
bash .cursor/skills/fix-bug/scripts/new-ticket-workspace.sh "$TICKET" --nuxeo own
```

Use `--nuxeo own` when the bug needs a **different package set or server config, a clean or empty
instance, a specific Nuxeo version, or destructive operations** (trash purge, reindex, admin
settings). Otherwise share. An extra container costs ~2 GB of RAM — the image layers are shared,
so disk is only the writable layer — and containers accumulate silently: this machine already
carries 24 GB of reclaimable images and 221 volumes.

`--nuxeo own` pulls the latest build of the shared instance's image, records the digest to
`$EVID/nuxeo-image.txt` so the evidence says which server produced it, reuses the licence (read
at run time, never written to disk), and joins `nuxeo-net` to share the OpenSearch node while
**namespacing every index by ticket** (`nuxeo-<slug>`, `nuxeo-<slug>-audit`) so it can never
write to the shared instance's indices.

**Parallel-safety rules that follow:**

- Run everything from `$NX_WT`; never git-write in the primary checkout.
- Never `git stash`. To set changes aside use `git diff > /tmp/$TICKET.patch`.
- Never kill by pattern (`pkill -f node`, `docker rm` on a container you did not create) — those
  match another agent's run. Kill only PIDs you started and only your own `$NX_CONTAINER`.
- **Budget parallelism.** Sharing Nuxeo and hardlinking modules makes a workspace nearly free, so
  the limit is dev servers and CPU — four or five concurrent tickets. Each `--nuxeo own` ticket
  costs ~2 GB of RAM on top and pulls that ceiling down fast.
- If the primary checkout is dirty when you arrive, **leave it alone** — you never need it clean.

## Phase 1.6 — Establish the expected behaviour

Before you can call something a defect you need a defensible statement of what correct is.
**Do not infer it from the symptom, and do not infer it from REST documentation alone** — docs
describe what an endpoint accepts, not what this application should render.

Work through these in order and stop at the first that settles it:

1. **The existing tests for the area.** A spec that encodes the intended behaviour is the
   strongest source, because someone wrote it down deliberately. `rg` the owning service and
   component for their `.spec.ts` and read what they assert.
2. **The Nuxeo server itself.** For anything about data, permissions, audit entries or
   renditions, ask the server rather than guessing — it is the authority on its own responses:

   ```bash
   curl -s -u "$NUXEO_USER:$NUXEO_PASS" "$NX_URL/api/v1/id/<uid>?enrichers.document=permissions" | jq .
   ```

   Record the actual response in the evidence folder. A behaviour argued from memory of an API
   is the most common way a "fix" ends up encoding a second bug.

3. **Adjacent implementations in this repo.** The same problem is usually solved somewhere
   already — another feature module, another service method. Consistency with our own codebase
   is a real argument; inconsistency with it is a real defect.
4. **The product documentation** in `documentation/20-product/` for intended behaviour, and
   `AGENTS/02-nuxeo-apis.md` for the endpoint and enricher contracts.

**Record what you found and which source settled it**, citing the file, test or response. If
none of them settles it, the expected behaviour is a product decision — that is a Phase 3.5
stop condition, not something to resolve by picking the reading that is easiest to implement.

## Phase 2 — Reproduce + capture evidence (first hands-on step)

**Reproduce the bug before writing any code.** The workspace is already on the branch cut from
`origin/main`, so the repro reflects released behaviour.

```bash
node scripts/agent-metrics.mjs phase "$TICKET" reproduce   # confirming the defect is fix work
```

> **Reproduce autonomously (no confirmation).** Everything runs against `$NX_URL`. By default
> that is the **shared** `nuxeo` instance — the isolation is `$NX_DATA_ROOT`
> (`/default-domain/workspaces/<TICKET>`), so create and seed your documents there and do not
> treat repository-wide operations as isolated. Only under `--nuxeo own` (Phase 1.5) is
> `$NX_URL` a container of your own.
>
> **Always capture BOTH images and videos**, before _and_ after. Never ask which format.

**If you cannot reproduce it, stop and report.** A fix for a bug you never saw fail cannot be
verified by the after-capture, and "it looks right now" is how a non-fix ships. Say what you tried,
what you saw instead, and what you need — a document UID, a permission, a data shape.

### Capture a story, not a pile of screenshots

Evidence here is a **narrative with assertions**, produced by `scripts/collect-evidence/` (see
its `README.md`). A scenes file is written once and run twice — unfixed, then fixed — and the
report step combines the halves into side-by-side comparisons.

Playwright is **deliberately untracked** — local-only DX tooling kept out of the lock file so it
never perturbs the CI install. It is a **one-time, per-machine** setup, and it must happen in the
**primary checkout**, never in a ticket workspace:

```bash
node -e "require.resolve('@playwright/test')" 2>/dev/null && echo available || echo missing
# only if missing — note the cd: a workspace's node_modules is hardlinked, and npm writing
# into it can reach through into the primary checkout.
(cd ~/Desktop/Projects/agentic-ui-poc \
   && npm install --no-save @playwright/test @axe-core/playwright \
   && npx playwright install chromium)
```

Then re-create the workspace so it links the new packages
(`new-ticket-workspace.sh "$TICKET" --remove --force` then without `--remove`). The workspace
script warns at creation time if Playwright is absent, so you find this out before the repro is
set up rather than after.

That download is ~150 MB on a first-time machine and can take several minutes. Two notes:

- **It needs a display.** The runner is headed by default so the team can watch. Over SSH or in a
  container there is none — say so and stop rather than silently producing no evidence.
- **If the browser download fails** (proxy, offline, disk), do not fall back to prose. Report it
  and stop: the before/after capture is the only proof this workflow produces, and Phase 4a's
  verification loop depends on it.

Copy the template and write the scenes:

```bash
cp scripts/collect-evidence/TEMPLATE.scenes.mjs scripts/collect-evidence/$TICKET.mjs
```

Each scene declares `act`, `title`, `intent`, `criterion` and a `run()`. The **three acts** are
Setup (what the user was trying to do — the reviewer was not in the ticket), the Behaviour, and
the Proof. Then capture the first half:

**Mark the boundary here.** `reproduce` is in the `fix` bucket and `evidence-before` is not, so
leaving `reproduce` open through the capture puts the capture straight back into the published
fix total — which is the one thing the buckets exist to separate:

```bash
node scripts/agent-metrics.mjs phase "$TICKET" evidence-before

APP_URL="$APP_URL" EVIDENCE_PHASE=before NUXEO_DOC_UID=<uid> \
  npm run evidence:collect -- "$TICKET" scripts/collect-evidence/$TICKET.mjs
```

**Write the same file for both halves.** Never branch on `EVIDENCE_PHASE` inside a scene: the two
runs must perform identical actions, or the comparison is illustration rather than evidence.

Four rules the tooling enforces, so a capture cannot quietly stop proving anything — **a red here
is a defect in the evidence, and you fix it before reading the result**:

| Rule                                                                | Why                                                                                |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| All three acts must be present                                      | A screenshot without context proves nothing to someone new to the ticket           |
| Every scene names a `criterion` from Phase 1a                       | "It looked right" is the claim this artifact replaces                              |
| Every scene must **assert** something                               | Screenshots show the app rendered _something_, not the right thing                 |
| A byte-identical before/after pair fails **unless a check flipped** | Identical images prove nothing alone; an invisible fix is proved by its assertions |

Gotchas:

- **Auth needs both mechanisms.** `h.login()` injects the session the route guard reads; the
  runner's `httpCredentials` authenticates the XHRs. Without both, `/nuxeo/api` calls
  intermittently 403 and you photograph empty states that read as component defects.
- **Hash routing.** `withHashLocation()` makes `goto('/#/x')` same-document, so anything asserting
  a **reloaded** app needs an explicit `page.reload()` or `APP_INITIALIZER` never re-runs.
- **Probe the DOM, not the pixels.** A change inheriting theme colours makes before/after stills
  near-identical — which the pair audit will fail you for. Assert the attribute, text or request.
- **State limits with `h.note()`**, not by omission. It records the gap without inflating the
  check count, and it appears in the story.

## Phase 3 — Branch

The workspace already created `fix/<ticket-slug>` from `origin/main`. Nothing to do unless you
want a different name (`AGENTS/06-git-workflow.md`). The Jira id goes in the commit and PR title
(`fix(NXSAT-123): …`), not necessarily the branch name. **Never work on `main`.**

## Phase 3.5 — Decide the approach, in writing

Most bugs have more than one defensible fix, and YOLO removed the human who used to pick. So make
the choice explicit instead of letting the first idea win by default.

**Enumerate at least two candidate fixes** and print a short comparison before writing code:

| For each candidate, state                                                             |
| ------------------------------------------------------------------------------------- |
| Where it lives — which layer (component / service / bridge / manifest) and which file |
| What it costs — blast radius, new public API, new dependency, migration               |
| How it fails — what it does _not_ fix, and what it could break                        |
| Whether the expected behaviour established in Phase 1.6 settles it                    |

Then pick one and **state why in one sentence**. Prefer, in order: the fix at the true root cause
over one at the symptom; the smaller blast radius; the one consistent with how this repo already
solves the same problem elsewhere; the one needing no public API change. A fix in `libs/shared/` is consumed by all eight features — that is
rarely "minimal" just because the diff is small.

### Stop conditions — ask a human rather than choosing

- Two defensible behaviours and nothing in the ticket, the tests, the server or the code settles
  it (Phase 1a step 5).
- The fix would widen the public API, or expose an adf-hx type through it.
- The fix touches `install.xml`, marketplace packaging, or a registered extension ID — a
  registered ID is a published contract.
- The fix contradicts a verified fact in `AGENTS/11-beta-program.md` §3.
- The root cause is in a dependency rather than this repo.
- Three distinct attempts have failed to locate the root cause.

## Phase 4 — Fix (no new induced issues)

> **Fix autonomously (no confirmation)** once the bug is reproduced, the before-evidence captured,
> and the approach recorded. Still **print the root cause first** — file, function, line, and _why_
> it misbehaves — so it lands in the record before any change.

- Make the **minimal** change consistent with the approach you chose, at the root cause.
- Follow the conventions strictly:
  - `AGENTS/03-angular-conventions.md` — `standalone: true`, `inject()` not constructor DI,
    `signal()` not `BehaviorSubject` for UI state, `takeUntilDestroyed()` on every `.subscribe()`,
    `templateUrl` always.
  - `AGENTS/07-security.md` — credentials from environment only; never `<img [src]>` bound to
    authenticated Nuxeo content (fetch via service → blob URL); revoke every
    `URL.createObjectURL()` in `ngOnDestroy`.
  - `AGENTS/08-bug-patterns.md` — do not re-introduce a catalogued defect.
- Respect `scripts/review-guardrails.mjs`: no hardcoded colours in new `.scss`/`.html` (use
  `--mat-sys-*` / `--kd-*` tokens), every `createObjectURL` paired with `revokeObjectURL`, no
  `as unknown as` / `as never`, and any new `@nx/vitest:test` project has a config + specs.
- **Never cross-feature imports** — shared logic goes in `libs/shared/`, and a new library needs
  `scope:`/`type:` tags before it can import anything.
- **adf-hx types must never appear in our public API** — wrap them in `adf-hx-bridge`.
- Keep the diff focused — do not bundle unrelated files.

### 4a — Verify against the evidence, and loop if it is not fixed

Capture the second half with the **same scenes file**, then build the comparison:

```bash
APP_URL="$APP_URL" EVIDENCE_PHASE=after NUXEO_DOC_UID=<uid> \
  npm run evidence:collect -- "$TICKET" scripts/collect-evidence/$TICKET.mjs
npm run evidence:story -- "$TICKET"
```

`evidence:story` writes `$EVID/STORY.md` (both halves, images inlined — paste this into Jira),
`contact-sheet.png` (one image for the PR body), `diptychs/` and `annotated/`. It **exits
non-zero** when the comparison does not support the claim, and says which of these it is:

- the BEFORE capture passed everything, so the bug did not reproduce or the scenes assert the
  fixed behaviour;
- the AFTER capture is not `pass`;
- a before/after pair is byte-identical **and no assertion changed between the halves**
  (when a check did flip, the change is simply not visual and the pair is a stated limitation);
- no scene appears in both halves, so nothing is actually compared.

Then:

- `evidence:story` green and every Phase 1a criterion asserted → go to Phase 4b.
- A criterion still failing → **return to Phase 4** (or Phase 3.5 if the approach was wrong).
  **Three iterations maximum**, then stop and report what you changed each time, what the story
  still shows, and your hypothesis.
- `evidence:story` red → fix the **evidence** first. A comparison that cannot fail cannot support
  a claim, and a red here is not a reason to re-edit the fix.

### 4b — Regression test

Add a unit test that **fails before the fix and passes after** — run it against the unfixed code
first and watch it go red, because a test that never failed is not a regression test
(`AGENTS/05-test-standards.md`, the `generate-tests` skill):

```bash
npx nx test <project>              # e.g. npx nx test document-detail
```

## Phase 4.5 — Blast-radius check (active, before the gate)

Documenting the blast radius in the final summary is too late to act on it. Do the search now:

1. **Find every consumer** of what you changed — `rg` for the symbol, the method, the model, the
   i18n key, the CSS token, the registered ID. A `libs/shared/` change reaches all eight features.
2. **Run their tests**, not just the ones `nx affected` picked: `npx nx test <each consumer>`. If
   the dependency graph disagrees with your `rg` results, trust `rg` and investigate the gap.
3. **Exercise the adjacent behaviours** in the same component — pagination, sorting, filtering,
   selection, counts, empty states, read-only/permission variants. Note which you actually
   exercised; do not claim the ones you did not.
4. **Check the extension surface**: did you change a registered ID, a manifest-addressable rule,
   action, route, nav item, or the adf-hx bridge boundary? Those are published contracts.
5. **Record the result** — it becomes section 6 of the Phase 9 summary. Only list something as
   unaffected once you have actually checked it.

## Phase 5 — Validate locally (gate before any push)

Run the gate this repo actually trusts. While iterating, use the fast inner loop; before pushing,
run the **full** gate with no `--gates` filter:

```bash
npm run beta:gate -- --gates guardrails,lint      # seconds — after every meaningful edit
npm run beta:gate                                 # full run before pushing
```

An unfiltered run executes **all 20 gates** cheapest-first — `node`, `lockfile`, `supply-chain`,
`code-scanning`, `guardrails`, sanitizers, `assertions`, then affected `lint`, `test`, `build`,
`typecheck`, `spec-types`, `bundle`, `api-surface` and the packaging gates. It stops at the first
failure. Expect it to take a while; that is the cost of the two traps it catches that
`review:preflight` does not:

- **`test` does not typecheck.** Vitest strips types through esbuild, so a green test run is not
  type safety. Only `build` and `typecheck` catch a `TS` error, and they run late.
- **Nothing except the `lockfile` gate reads `package-lock.json`.** CI was red for the whole of
  Phase 2 while every local gate was green. Revert incidental lockfile churn, and **never run a
  bare `npm install` and commit the result** — on macOS it prunes optional platform entries Linux
  needs and `npm ci` then refuses the tree.

Only a run with **no** `--gates` filter can be cited. A filtered run reports `pass-partial`; read
`gates.notRequested` before quoting anything. Use [`verify-gate`](../verify-gate/SKILL.md) to
iterate: fix only the first reported failure, no speculative batching, three attempts then stop.

### 5a — Coverage

The DoD requires a unit test for every new service method, and `AGENTS/05-test-standards.md` sets
the thresholds: **80%+ lines** on `libs/shared/nuxeo-client/src/lib/services/`, **60%+** on feature
components with business logic, **100%** on utility functions.

```bash
npx nx test <project> --coverage      # the projects you touched
npm run beta:coverage                 # the repo's coverage gate
```

Report the numbers. If your change lowered coverage on a touched project, add the missing test
rather than noting the dip — and cover the **error path**, not just the happy path.

### 5b — Hand off the wider validation

Accessibility, i18n, RTL and cross-browser checks are **not** in this skill — they live in
[`validate-fix`](../validate-fix/SKILL.md), which runs against the same workspace and evidence
folder. Run it before pushing: `a11y.yml` fires on every push to `fix/**`, so an a11y regression
you did not check locally becomes a red PR.

> **No manual-verification pause.** In YOLO mode do not stop to ask a human to click through it —
> the before/after capture already proves the fix. Write the numbered **"Steps to verify the fix"**
> into the Phase 9 summary and the Jira comment so a human can re-verify later.

## Phase 6 — Commit (signed) + raise the PR

This is the "fix and raise PR" trigger.

> **Commit + push + open the PR autonomously (no confirmation).** The Guardrails still apply.

- **Signed commits are required.** Confirm with `git log -1 --format='%G?'` → `G`.
- Conventional Commit, lowercase, present tense, Jira id, why-focused body:

  ```bash
  git add <the fix + the test + the evidence steps file>     # only these, no churn
  git commit -m "fix(NXSAT-123): <concise description>"
  git push -u origin HEAD
  ```

  Never `--no-verify`. Confirm the per-ticket proxy config and conf dir are **not** staged.

- Open the PR against `main`, pushing to `origin`, **never a fork**:

  ```bash
  gh pr create --repo nuxeo/agentic-ui-poc --base main \
    --title "fix(NXSAT-123): <summary>" \
    --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)"
  ```

  Fill every template section — including the acceptance criteria from Phase 1a (marked
  `[from ticket]` / `[derived]`), the approach you chose and why, and the blast-radius findings.
  Embed the before/after screenshots. Tick checklist items only once true.

- Confirm the commit is **Verified**:
  `gh api repos/nuxeo/agentic-ui-poc/commits/<sha> --jq '.commit.verification'`. `unknown_key`
  means the key is registered for authentication but not as a **Signing Key** — fix on GitHub, no
  re-push needed.

## Phase 7 — Poll CI to green; fix or rerun

Poll **every 60 seconds, for at most 45 minutes**, reporting a compact table whenever a check
changes state:

```bash
gh pr view <pr> --repo nuxeo/agentic-ui-poc --json statusCheckRollup \
  --jq '[.statusCheckRollup[]|{name:(.name//.context),conclusion:(.conclusion//.state)}]'
```

Terminal is `SUCCESS`/`FAILURE`/`CANCELLED`/`SKIPPED`. **Terminal is not the same as green** —
keep going until every check is `SUCCESS`, or the cap is hit. At the cap, stop polling and report
exactly which checks are still pending; do **not** claim green. This PR runs more than `ci.yml`:
`sonarcloud`, `codeql`, `a11y`, `dependency-review`, `dead-code`, `build-marketplace`.

- Real failure → `gh run view <run-id> --log-failed`, fix on the branch, re-run the gate, push.
  Each push restarts the 45-minute budget once; a third restart means stop and report.
- Known flake that passes locally → `gh run rerun <run-id> --failed`, don't "fix" it.
- **Sonar surfaces new issues even when the Quality Gate passes** — fetch them per PR
  (`GET https://sonarcloud.io/api/issues/search?componentKeys=nuxeo_agentic-ui-poc&pullRequest=<pr>&resolved=false`,
  or the SonarQube MCP) alongside Copilot inline comments; fix both.
- **Close the loop on every review thread — reply _and_ resolve.** A reply alone does not resolve
  it; that needs the GraphQL mutation. Do this autonomously; only leave a thread open if you
  disagree, and then reply explaining why. Use [`fix-pr-comments`](../fix-pr-comments.md) for the
  fixes and `AGENTS/09-pr-feedback.md` for the comment→fix mapping.

  ```bash
  gh api graphql -f query='{repository(owner:"nuxeo",name:"agentic-ui-poc"){pullRequest(number:<pr>){
    reviewThreads(first:50){nodes{id isResolved comments(first:1){nodes{author{login} body}}}}}}}' \
    --jq '.data.repository.pullRequest.reviewThreads.nodes[]|select(.isResolved==false)
      |{id,first:.comments.nodes[0].author.login,snippet:(.comments.nodes[0].body[0:80])}'
  gh api repos/nuxeo/agentic-ui-poc/pulls/<pr>/comments -f body='…' -F in_reply_to=<commentId>
  gh api graphql -f query='mutation{resolveReviewThread(input:{threadId:"<threadId>"}){thread{isResolved}}}'
  ```

## Phase 7.5 — Update the ticket with the fix

> **Update the ticket autonomously (no confirmation)** once the PR is open and CI status is known.

Post the **structured fix-summary comment** (the Phase 9 sections) via `addCommentToJiraIssue`
(cloudId above, `contentFormat:"markdown"`). Include the acceptance criteria and which were
derived, the root cause, the files changed, the PR link, the gate and coverage numbers, the
reproduce and verify steps, and the recording filenames. Keep it honest — only say a file is
"attached" once it is.

> **Write real Markdown, not Jira wiki markup.** With `contentFormat:"markdown"` use `###`,
> `**bold**`, `-`/`1.`, and triple-backtick fences. Jira wiki syntax (`h3.`, `{code}`, `*bold*`)
> renders **literally**. To correct a comment, re-send with the same `commentId` rather than
> posting a duplicate.

**Attaching evidence — MCP can't do it.** The Atlassian MCP has no attachment tool, so binaries go
through the Jira REST endpoint. Credentials live outside the repo and must never be committed:
`~/.jira_email` and `~/.jira_token` (`chmod 600`; rotate at
https://id.atlassian.com/manage-profile/security/api-tokens if leaked).

```bash
cd "$EVID"
U="$(cat ~/.jira_email):$(cat ~/.jira_token)"
for f in before/*.png before/$TICKET-before.webm after/*.png after/$TICKET-after.webm; do
  curl -s -u "$U" -H "X-Atlassian-Token: no-check" -F "file=@$f" \
    "https://hyland.atlassian.net/rest/api/3/issue/$TICKET/attachments" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print('OK', d[0]['filename']) if isinstance(d,list) and d else print('FAIL', d)"
done
```

If `~/.jira_token` is absent, have the user create it (`printf '%s' '<token>' > ~/.jira_token &&
chmod 600 ~/.jira_token`) rather than pasting it into chat. Drag-and-drop is the manual fallback.

## Phase 8 — Definition of Done self-check

Evaluate AGENTS.md §7 and report it **in chat only** — this repo has no Ready-for-QA Confluence
checklist, so do not post this table to Jira. Produce a table (Item | Y/N/NA | Evidence):

full `beta:gate` green with `verdict: "pass"` and nothing in `skipped`/`notRequested`; coverage
thresholds met on touched projects; unit test for every new service method including its error
path; `validate-fix` run and clean; `docs/api-integrations.md` updated if a new Nuxeo endpoint was
called; `docs/ai-features.md` if AI behaviour changed; `AGENTS/01-services.md` if a service method
was added; `AGENTS/00-architecture.md` if architecture changed; PR on a `fix/*` branch; every
review thread replied to and resolved; before/after evidence in both forms attached to the ticket;
all checks `SUCCESS`; all commits Verified. Quote the gate verdict line rather than asserting it.

## Phase 9 — Final fix summary (always output)

End every run with one structured summary — printed in chat **and** posted to Jira (Phase 7.5).
Use exactly these sections, in this order:

1. **Issue** — the user-visible symptom and impact (1–2 sentences), with the ticket link.
2. **Acceptance criteria** — the numbered list from Phase 1a, each marked `[from ticket]` or
   `[derived]`, and how each was verified.
3. **Root cause** — what actually causes it (file / function / code path and why).
4. **Fix provided** — the approach chosen, the alternatives rejected and why, the files touched,
   and the PR link.
5. **Steps to reproduce the issue** — numbered and copy-pasteable. **Explicitly call out any
   environment setup required** — the Nuxeo image digest, KD/ingestion config, seed data created
   via REST/Automation, a document UID. If none, say "no environment changes required".
6. **Steps to verify the fix** — numbered: how to build and run the branch, the exact URL/screen,
   the actions, and the expected result vs the old behaviour.
7. **Areas that may be affected (impact / regression surface)** — the Phase 4.5 findings, so QA
   knows where to focus. Cover: other consumers of the touched code (searched, not assumed);
   adjacent behaviours in the same component and which you exercised; edge cases and scale (empty
   / 1-item / large sets, paging, special characters, permission variants, and anything
   deliberately out of scope); cross-cutting concerns (i18n, accessibility, theming, bundle size,
   the extension-manifest contract, the adf-hx bridge boundary); and **explicitly what was NOT
   affected**, listed only once actually checked.
8. **Verification numbers** — gate verdict, test pass count, coverage on touched projects,
   `validate-fix` result, CI state.
9. **Time** — the per-phase table from `agent-metrics report`, the slowest phase, and total wall
   clock against the budget above. State cost as **not measured**, with the recorded join window;
   never estimate it.

Reference the evidence in both forms: `$EVID/before/` (`*.png` + `<TICKET>-before.webm`) and
`$EVID/after/` (`*.png` + `<TICKET>-after.webm`).

## Phase 10 — Clean up & report

**Close and publish the metrics first, then tear down.** The teardown removes the worktree you
are standing in _and_ the copy of `scripts/agent-metrics.mjs` inside it, so running `end` or
`publish` afterwards fails on a deleted directory:

```bash
node scripts/agent-metrics.mjs end     "$TICKET" --outcome pr-open
node scripts/agent-metrics.mjs publish "$TICKET"
cd "$REPO_ROOT"     # leave the worktree before deleting it
bash .cursor/skills/fix-bug/scripts/new-ticket-workspace.sh "$TICKET" --remove
```

**Record the outcome you actually observed.** This workflow opens and validates a PR; it does
not merge one. Use `pr-open` when you finish with the PR open, `merged` only if you watched it
merge, `blocked` if a stop condition ended the run, and `abandoned` if the work was dropped.
Publishing `merged` by default would make every row claim a delivery that had not happened.

The teardown removes the worktree — and the container and its indices too, if the ticket had its
own — and **keeps the evidence**. It refuses to delete uncommitted work unless you add `--force`,
and checks that before destroying anything. The shared `nuxeo` container and the ticket's Nuxeo
data root are left in place: the data root is cheap, and deleting it would destroy a repro
someone may still need. Then:

- Stop the dev server you started. Kill only PIDs you started — never `pkill -f node`.
- Never remove or disturb the shared `nuxeo` / `nuxeo-opensearch` containers, the `nuxeo-net`
  network, or another ticket's workspace.
- Leave the evidence in `$EVID` — it is the one thing that outlives the run. Never commit it.
- Report the PR's final CI state. If a long check (`codeql`, `sonarcloud`, `a11y`,
  `build-marketplace`) is still running, say so explicitly — do **not** claim green until it is.
- `publish` (run above, before teardown) appends one row — **user, ticket id, time to fix** — to
  [Bug Fix/Feature Development Skill Performance](https://hyland.atlassian.net/wiki/x/nQFlAAE),
  authenticating as the engineer who ran it. **Time to fix is the `fix` bucket alone** — evidence
  capture and all overhead are excluded, so the row answers how long the work took rather than
  how slow the pipeline is. The per-phase breakdown and the other two subtotals are **not**
  published; they stay in the local `metrics.jsonl`. Print that table in the final summary and
  name the slowest phase — that is the one worth attacking next.

## Recommended extras (do these when applicable, still autonomously)

- **Commit the evidence steps file.** `scripts/collect-evidence/<TICKET>.mjs` is tracked on purpose
  — it makes the fix re-verifiable by anyone later.
- **Update the docs the DoD names** in the same PR rather than a follow-up.
- **Attach the videos.** MCP can't attach — use the Phase 7.5 `curl`.
- **Add the bug to `AGENTS/08-bug-patterns.md`** if the root cause is a pattern likely to recur.

## Guardrails (these still hold in YOLO mode)

- Never commit to `main`; never force-push `main`; feature branches only (`--force-with-lease`).
- Never `--no-verify`. Never weaken, skip or `.only` a test to get green.
- Never commit secrets, `.env`, `node_modules`, evidence output, the per-ticket proxy config, or
  the copied `nuxeo-conf`. Never print the `NUXEO_CLID` or a Jira token.
- Never disturb the shared `nuxeo` containers, and never kill processes by a pattern that could
  match another agent's run.
- Never `git stash`, and never git-write in the primary checkout.
- Never run a bare `npm install` and commit the resulting lockfile.
- Never edit git config silently beyond the one-time signing setup.
- Keep the PR scoped to the single fix — never bundle unrelated files.
- Never claim a fix works from reasoning alone: the after-capture and the gate verdict are the
  only acceptable proof.
- YOLO relaxes _confirmation gates only_. It does not authorize destructive git operations,
  force-pushes to protected branches, committing secrets, or choosing past a Phase 3.5 stop
  condition.
