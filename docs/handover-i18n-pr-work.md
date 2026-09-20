# Handover — take NXSAT-227 / NXSAT-284 to merge

Paste everything below the line into a fresh agent session in this repository.

---

You are continuing i18n work on `nuxeo/agentic-ui-poc`. Two stacked pull requests are open and
neither is merged. Read `AGENTS.md` and `CLAUDE.md` first, then `docs/i18n-localization-plan.md`
(the plan of record) and `docs/i18n-status.md`.

## The stack

| PR                                                                 | Base ← head                                                       | State                                             |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- |
| [#198](https://github.com/nuxeo/agentic-ui-poc/pull/198) NXSAT-227 | `main` ← `feature/nxsat-227a-i18n`                                | `MERGEABLE`, 6 unresolved review threads          |
| [#215](https://github.com/nuxeo/agentic-ui-poc/pull/215) NXSAT-284 | `feature/nxsat-227a-i18n` ← `feature/nxsat-284-descriptor-labels` | **`CONFLICTING`**, not yet reviewed in this round |

`#198` merges first. `#215` is built on its branch, so when `#198` lands GitHub retargets `#215`
to `main` — and only then does `#215` get the full 16-check suite. It currently runs 5, because
workflows keyed to `pull_request: branches: [main]` do not fire for a feature-branch base. Do not
read `#215`'s green as equivalent to `#198`'s.

`#215` is conflicting because both branches now carry guardrail fixes for the same review
findings. The conflicts are semantic duplicates, not disagreements — resolve by keeping the
`#198` version and re-applying anything `#215` adds on top.

## Read this before starting the review loop

**Copilot never approves.** 115 Copilot reviews exist in this repository and every one is
`COMMENTED`; zero are `APPROVED`. `reviewDecision` will stay `REVIEW_REQUIRED` no matter how many
rounds you run. Verify it yourself before believing it:

```bash
gh api graphql -f query='{repository(owner:"nuxeo",name:"agentic-ui-poc"){pullRequests(last:40,states:[OPEN,MERGED,CLOSED]){nodes{reviews(first:20){nodes{author{login} state}}}}}}' \
  --jq '[.data.repository.pullRequests.nodes[].reviews.nodes[] | select(.author.login=="copilot-pull-request-reviewer")] | group_by(.state) | map({state: .[0].state, count: length})'
```

So the exit condition agreed with the requester is: **loop until a Copilot round produces no new
threads**, then hand back for a human approval. Branch protection needs one and Copilot cannot
give it.

## The six open threads on #198

Judge each on merit — several earlier Copilot comments in this PR were not just correct but found
defects no gate could see. Reply on the thread citing the fixing commit, then resolve it.

- **`PRRT_kwDOR0er586kHaif`** — `scripts/beta-harness/steps/nxsat-227-i18n.mjs:187`
  `page.evaluate()` serializes this callback into the browser, where module-scope bindings are unavailable. `isRawKey` is also not defined anywhere in this file, and the serialized `matchers` argument is never used, so the first call to `rawKeysOnPage()` throws a `ReferenceError` instead of producing evidence. Define the matcher inside the callback and include `OUR_KEYS` in the serialized arguments.

- **`PRRT_kwDOR0er586kHaiq`** — `apps/nuxeo-ui/src/app/shell/app-shell.component.html:242`
  The visible suggestion is translated, but clicking it still sends the hard-coded English sentence. `AiChatService.send()` records that value as the user's message and sends it to the backend, so French/German users immediately see an English message and are likely to receive an English response. Resolve the same translation key before calling `sendAiMessage()` for all three suggestions.

- **`PRRT_kwDOR0er586kHai1`** — `scripts/review-guardrails.mjs:1935`
  The comment and diagnostic say these options are required on every source entry, but this only checks whether each token occurs anywhere in the whole YAML body. With two mappings, deleting both options from one entry still passes because the other entry contains them, so this gate cannot enforce the policy it reports. Parse or segment each `files` entry and validate both values per entry; add a ne

- **`PRRT_kwDOR0er586kHajB`** — `tools/i18n/crowdin-push-context.mjs:44`
  This hard-codes the only context source to the app catalogue, while `crowdin-conf.yml` explicitly supports future `libs/**/i18n/en.json` sources and `checkTranslationContext` requires sibling context for them. Once that mapping matches, library context will never be uploaded; additionally, the project-wide identifier map can select the wrong string when two files reuse a key. Discover each sibling

- **`PRRT_kwDOR0er586kHajF`** — `apps/nuxeo-ui/public/i18n/en.context.json:57`
  This translator instruction says “AI” must not be translated, but the catalogues added in this PR already render it as French “IA” and German “KI”, while `shell.ai.open` correctly instructs translators to expand or transliterate it according to the target language. Make this context use the same instruction; otherwise Crowdin translators are told to undo the intended localized acronym.

- **`PRRT_kwDOR0er586kHajN`** — `docs/i18n-localization-plan.md:560`
  The test plan claims the French pass invokes `h.expectNoA11yViolations`, but the added steps file contains no such call. The recorded evidence therefore does not cover this row. Add the promised French axe assertion or explicitly mark this validation as deferred/not covered.

## The loop

For each round:

1. Fix every thread you agree with. Where you disagree, say so on the thread with evidence rather
   than resolving it silently.
2. `npm run beta:gate` — 20 of 23 green is the current local ceiling; `supply-chain`,
   `code-scanning` and `sanitizer-selftest` need CI or a network.
3. Commit with a Conventional Commit and a body that says _why_, then push.
4. Reply to each thread and resolve it:
   ```bash
   gh api graphql -f query='mutation($t:ID!,$b:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$t,body:$b}){clientMutationId}}' -f t=<THREAD_ID> -f b=<BODY>
   gh api graphql -f query='mutation($t:ID!){resolveReviewThread(input:{threadId:$t}){thread{isResolved}}}' -f t=<THREAD_ID>
   ```
   Put reply bodies in a **Python file**, not a shell heredoc. Backticks in a heredoc get
   command-substituted and every code identifier vanishes from the posted comment; this already
   happened once and ten replies had to be reposted.
5. Re-request the review:
   ```bash
   gh api -X POST repos/nuxeo/agentic-ui-poc/pulls/198/requested_reviewers -f "reviewers[]=copilot-pull-request-reviewer[bot]"
   ```
6. Wait for CI and the new review. Repeat until a round produces no new threads.

## What this session got wrong — do not repeat it

These are not hypotheticals. Each one shipped to a pull request and was caught by review rather
than by a gate.

- **I verified logic in isolation and never ran the thing.** A `page.evaluate` callback referenced
  a helper that existed only in module scope, so the harness threw a `ReferenceError` on first
  call while my standalone node check of the same regex passed. If you change the evidence
  harness, **run it**: `npm run beta:evidence -- nxsat-227-i18n`.
- **A fix one round became the defect the next.** I added a route-reached check to stop vacuous
  passes and compared `/#/browse` against `window.location.hash`, which is `#/browse` — every
  route failed. Check the new assertion can both pass and fail.
- **A check that cannot match its own founding defect.** The raw-key sweep required the whole
  value to _be_ a key, and the regression was `DOCUMENT_TREE.TOGGLE_ARIA-LABEL Home`.
- **An assertion that passes on the failure it tests for.** The date check asserted the page text
  did not contain `InvalidPipeArgument`. Angular logs pipe errors to the console and leaves the
  binding _empty_, so it passed with every date blank.
- **Claims in docs that the code contradicts.** `docs/i18n-status.md` said both shell templates
  were at zero hard-coded strings while twelve remained — all of them the exact shape the
  guardrail was blind to. Re-measure a claim before restating it.
- **Copying a reference repo instead of reading our own plan.** The Crowdin pipeline was built
  from `nuxeo-web-ui` and missed four things D8 in `docs/i18n-localization-plan.md` already
  specified: the enterprise endpoint, `export_only_approved`, `update_option`, `--delete-obsolete`.
- **Counts duplicated in prose.** Selftest and gate totals went stale in four places in two
  rounds. Generate them from the executable output or do not state them.

## Traps in this repository

- **`npm test` does not typecheck.** Vitest strips types through esbuild. Only `build` and
  `typecheck` catch a TS error.
- **Node 20 only.** `.nvmrc` pins it. `nx serve` dies silently on Node 25, and a backgrounded dev
  server is killed when the shell's process group ends — start it and use it in the _same_ call.
- **`nuxeo-ui` uses Karma, not Vitest**, and resolves translations through
  `apps/nuxeo-ui/src/app/i18n/translate-testing.ts`, not `@agentic-ui/testing/i18n`.
- **`TestBed.resetTestingModule()` discards the global translation providers.** Any spec that
  calls it must re-add `testTranslateModule()`.
- **The generated `zz` pseudo-locale is gitignored on `#215` but not on `#198`.** Delete
  `apps/nuxeo-ui/public/i18n/zz.json` before running the guardrails on `#198`.
- **A guardrail whose own comment quotes the syntax it forbids will fail on itself.** Strip
  comments before scanning. This has now happened three times.

## Still outstanding beyond the review threads

- **NXSAT-227 AC5** — the Crowdin pipeline is built and gated but **blocked** on two things
  nobody here can do: the project is created manually via the INTERN board, and "who owns the
  daily translation PR" is an open decision. Both workflows are gated on
  `vars.CROWDIN_SYNC_ENABLED` so they stay dormant until then.
  `tools/i18n/crowdin-push-context.mjs` has **never run against a real project**.
- **NXSAT-284 AC4** — per-library catalogues. All 1,600-odd keys live in
  `apps/nuxeo-ui/public/i18n/`, and `libs/platform` is publishable, so its strings do not travel
  with it. Largest remaining piece of real work.
- **NXSAT-284 AC5** — target locale set `[needs decision]`; `fr`/`de` hold ~74 of ~1,600 keys.
- **NXSAT-284 B0** — eight literal `aria-label` selectors remain in `phase-6-a11y.mjs` and
  `phase-1-tag-styles.mjs`. All six labels are now translated, so those selectors are **latently
  broken**: they pass only because English resolves to identical words, and will match nothing in
  any other locale.
- **160 user-facing strings still built in TypeScript** — snackbars, dialog titles, error text.
  Surveyed, not extracted; outside AC1's wording but a reader will call the ticket done without
  them.
- **NXSAT-284 is still `Open` in Jira** although most of it has shipped.

## Definition of done for this handover

1. A Copilot round on `#198` produces no new threads, and all threads are resolved.
2. `#198` CI is fully green and it is handed back for a human approval.
3. After `#198` merges: rebase `#215`, resolve the duplicate-guardrail conflicts, confirm it
   retargeted to `main` and now runs all 16 checks, then run the same loop on it.
4. Update `docs/i18n-status.md` from measured output, not from this document.
