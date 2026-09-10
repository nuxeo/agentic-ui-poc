# Security — what is next, after PR #157

Forward-looking companion to `docs/sonarcloud-security-remediation-plan.md`, which is the record of
what PR #157 did. This file is what remains, in priority order, with the evidence each item rests on
so the next person does not have to re-derive it.

Every count and claim below was established by query or grep on 2026-09-10, not from memory. Where a
figure can drift, the command that produces it is given.

## Where the sanitiser work landed

`S6268` bypasses: **32 → 4**. The four that remain are the audited ones, and they are not defects:

```bash
curl -s 'https://sonarcloud.io/api/issues/search?componentKeys=nuxeo_agentic-ui-poc&pullRequest=157&impactSoftwareQualities=SECURITY&issueStatuses=OPEN,CONFIRMED&ps=500' \
  | jq -r '.issues[] | "\(.component | sub("^nuxeo_agentic-ui-poc:";"")):\(.line)"'
```

| Site                                       | Category | Why it stays                                                                               |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| `render-trusted-html.ts`                   | D        | Policy boundary — DOMPurify output under a reviewed allow-list, not Angular's fixed policy |
| `trust-object-url.ts`                      | B        | Structural — `iframe[src]` is `RESOURCE_URL` and throws on a raw string                    |
| `document-detail.ts` `loadPreviewFallback` | C        | Trust decision, origin-allow-listed                                                        |
| `document-detail.ts` `loadARenderUrl`      | C        | Trust decision, scheme-validated, origin deliberately unbounded                            |

---

## P1 — Ship a CSP `frame-src` / `frame-ancestors` header

**The single highest-value item, and the one that closes two accepted residual risks.**

Verified absent: the only occurrence of `frame-src` in the repository is a source comment saying it
is missing.

```bash
grep -rniE "content-security-policy|frame-src|frame-ancestors" --include="*.html" --include="*.ts" \
  --include="*.json" --include="*.conf" apps libs docs
```

Two risks currently rest on client-side TypeScript alone, and a header is the only control that holds
regardless of what that TypeScript does:

1. **ARender's `viewerOrigin` is unbounded by design.** A customer configures where their own ARender
   lives, so there is no origin allow-list. Whoever can edit the Layer 0 bootstrap can point that
   iframe at any `https:` origin. Accepted, because the manifest is already a trusted surface — but
   `frame-src` is what would actually bound it.
2. **Blob iframes are same-origin.** PR #157 gated three of them on the served `Content-Type`. That
   reduces what reaches the iframe; it does not replace a header.

**Where it goes.** The app ships as a Nuxeo marketplace package (Maven `nuxeo-agentic-ui`), so the
header belongs in the Nuxeo/Tomcat response configuration or a fronting nginx. `nuxeo-conf/` already
holds per-deployment `.conf` files, and `nginx-arender-proxy.conf` exists at the root.

**Why it has not happened, and the real work.** `viewerOrigin` is per-deployment, so the header must
be templated per deployment rather than committed as a constant. That is the actual task; the
directive itself is one line.

Shape:

```
Content-Security-Policy: frame-src 'self' blob: <configured-arender-origin>;
                         frame-ancestors 'self';
```

**Evidence to require before calling it done.** Two checks, per the rule that a gate is not evidence
until it has been seen to fail: the header is present on a real response, **and** an origin outside
the allow-list is actually refused by the browser. A test that only asserts the header string proves
the string, not the control.

---

## P2 — Transition the four remaining `S6268` to _Accepted_ in SonarCloud

Until this happens the project's security rating stays **E** and the quality gate stays red on
`new_security_rating`, which trains everyone to ignore it.

Each of the four already has a written justification in `.ai/state/sanitizer-allowlist.json`; the task
is to paste it into the Sonar issue and transition it, not to write anything new.

**Correction to the old plan:** `sonarcloud-security-remediation-plan.md` section 6 says to accept
"the three remaining" issues, one per category B, C and D. It is **four** — Category C has two
(`loadPreviewFallback` and `loadARenderUrl`).

Needs a SonarCloud token with issue-administer permission. This is a security decision with a name
against it, so it should be a deliberate act by an owner, not automated.

---

## P3 — Settle the metadata-vs-served-type question server-side

PR #157 closed this client-side in three components (attachment dialog, document viewer, citation
dialog) by gating iframe branches on `Blob.type` rather than the recorded mime type.

**Nobody has established whether Nuxeo can serve a `Content-Type` that disagrees with the recorded
mime type.** That determines what the client gate is worth:

- If it can disagree, the client gate is the only control and deserves that billing.
- If it cannot, the gate is defence in depth and the recorded type was never the weak link.

**Concrete test:** upload an HTML file named `.pdf`, fetch its blob, observe the served
`Content-Type`. One experiment, and it decides how the three gates should be described.

---

## P4 — Two shipped security fixes have no tests

| Fix                                 | Component    | Test coverage                  |
| ----------------------------------- | ------------ | ------------------------------ |
| Thumbnail ledger reconciliation     | `nav-drawer` | **none** — no spec file exists |
| Search-race generation guard        | `trash`      | **none** — no spec file exists |
| `forgetPreviews` call before revoke | `trash`      | **none**                       |

PR #157's own experience is the argument: three tests in that PR passed for the wrong reason and were
only caught by review. An untested guard is worth less than it looks, and both of these are guards.

`nav-drawer` is the harder one — a large dependency graph — but `trash` is ordinary.

---

## P5 — Correct a stale claim in the remediation plan

`sonarcloud-security-remediation-plan.md` says the `bootstrap-config.ts` comment/code mismatch is
**"NOT fixed"**. That is now stale: `completeARenderConfig` returns `null` unless both ARender
endpoints are present, so a half configuration no longer yields a blank endpoint.

Left uncorrected it will mislead the next reader into re-doing work, which is the same failure mode
`CLAUDE.md` records for prose summaries of mutable state.

---

## P6 — Close the harness gap PR #157 exposed

The gate set is strong on **structural** invariants — bypass registration with per-member counts, API
surface snapshotting, publishability, NONE-context binding detection. It has no coverage for
**behavioural** invariants, and that is where every real defect in that review cycle lived: request
races, stale-response overwrites, loading-flag ordering.

Concretely, in rough order of cost:

1. **A lint rule for `takeUntilDestroyed`.** `tasks-page.component.ts` alone has **12** `.subscribe()`
   calls without it (lines 221, 358, 365, 420, 447, 492, 498, 526, 568, 574, 602, 631), and CLAUDE.md
   lists it as non-negotiable. A rule turns a convention into a gate.
2. **Mutation testing on the security-critical specs.** Nothing detects a test that cannot fail. Three
   instances in PR #157: a spec that stubbed the template it was asserting, a selftest control that
   went red for the wrong reason, and queue specs whose synchronous mocks could never reach the guard
   they existed for.
3. **Run the selftest's negative controls against an isolated checkout.** They mutate tracked sources
   in the caller's working tree. PR #157 removed the worst part (it no longer repoints
   `refs/remotes/origin/main`) and added detection for clobbering a concurrent edit, but `SIGKILL` and
   power loss cannot be covered in-process. Only isolation closes that.

**Why this is not solvable by care alone.** `check 4`'s discovery path accumulated **seven** fail-open
spellings — the binding syntax, the decorator, the template value, the quoted key, shorthand metadata,
interface inheritance, and a depth cap that returned "safe" on exhaustion. The first four were found by
whoever wrote the controls; the last three by adversarial review. The harness enumerates known-bad
shapes, and enumeration is bounded by whoever wrote the list. That is a structural limit, not an
attention problem, and it is the evidence behind CLAUDE.md's rule that independent adversarial review
is mandatory.

---

## P7 — Consolidate two duplicated patterns

Not style. Both are defect classes that recurred once per copy.

| Pattern                  | Copies | Evidence                                                                                                                                                   |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request-generation guard | **6**  | search ×2, trash, tasks ×2, collections — every one needed the same guard added separately, and three needed a second correction after the first was wrong |
| Object-URL ledger        | **9**  | dashboard, nav-drawer, browse, collection-detail, search, trash, assets, search-queue, assets-queue                                                        |

A shared helper for each would have made one fix instead of fifteen. The object-URL one is
security-adjacent: every copy is an unbounded memory leak when it is wrong.

---

## Not security, but blocking PR #157

- **Contract-owner sign-off** on ten breaking public API changes, and the version decision — `0.2.0`
  (semver minor, since the package is `0.1.0`) versus going `1.0.0` first. The package is
  `private: true` and 404 on the npm registry, so no external consumer breaks today.
- **`license/cla` is unsigned.**
- **A convention decision:** 28 spec files stub templates via `TestBed.overrideComponent`. Either that
  is fine or all 28 should change; two files should not decide it.
- **The merge-base ratchet is inert until this branch lands on `main`**, because the allowlist does not
  exist at the merge base. Its two controls are verified specific — each comparison was stubbed
  independently and observed `matched: false` — but they only ever run against a base repointed to
  `HEAD`.
