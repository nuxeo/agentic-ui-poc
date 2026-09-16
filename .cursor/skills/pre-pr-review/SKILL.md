---
name: pre-pr-review
description: Review your own change before opening the pull request, using the defect classes that actually get caught here rather than a generic checklist — comparing code against its own comments, a check's body against its name, the PR description against its diff, and every documented guarantee against the line that enforces it. Use before every `gh pr create`, after the gate is green, and when asked to self-review, pre-review, or "check this before I raise the PR".
---

# Review it before the reviewer does

Run this after the gate is green and before `gh pr create`.

```bash
node scripts/pre-pr-review.mjs        # the mechanisable part; exits non-zero on a finding
```

Then work the four comparisons below. **The script is the floor, not the review** — it covers
three of the ten defect classes, and the three largest are judgement. See the distribution
below for how the weight actually falls.

## Why this is not a generic checklist

Built from the reviewer findings in `docs/pr-review-findings.jsonl`, each classified by _why_
it was missed. **Every count in this file is derived from that corpus, never typed** — `npm run
review:analysis -- check` fails if this section and the data disagree, so the numbers cannot go
stale the way the ones they replaced were about to:

<!-- pr-review-stats:start -->
<!-- generated from docs/pr-review-findings.jsonl by `npm run review:analysis -- sync`. Do not edit by hand. -->

**60 findings** across 7 pull requests, every one accepted as valid.
The three largest classes are **38 of 60**.

| Class                  | Findings |
| ---------------------- | -------- |
| `proxy-check`          | 15       |
| `unenforced-guarantee` | 13       |
| `stale-prose`          | 10       |
| `ordering`             | 5        |
| `silent-failure`       | 5        |
| `false-claim`          | 4        |
| `incomplete-fetch`     | 3        |
| `scope`                | 2        |
| `broken-reference`     | 1        |
| `dead-branch`          | 1        |
| `other`                | 1        |

<!-- pr-review-stats:end -->

The findings themselves, with the reason each was missed, are on
[PR Review analysis by Copilot](https://hyland.atlassian.net/wiki/x/lwFlAAE).

**The block above is not a fixed statement — it is a rendering of the corpus as it stands.**
Every review loop that records findings appends to `docs/pr-review-findings.jsonl`, and
`pr-review-analysis publish` re-derives the counts, the class table and the accepted/argued-down
split from the new total. The numbered sections below are **not** re-derived: their order is an
editorial decision, so `check` verifies it against the corpus ranking and tells you to re-order
them by hand when the ranking changes. The numbers you are reading will be larger next month,
and the ranking may differ; that is the point. Commit the corpus and this file together — the
`review-corpus` gate fails if one moves without the other.

If you argue a finding down rather than fixing it, record it as `"accepted": false` on its
row. The sentence above counts it, so the corpus stays honest about what the reviewer got
wrong as well as what it got right.

Almost none were logic errors. In every case the author understood the problem and wrote code
that solved it. What went wrong was **the gap between what the code does and what its author
believed it does** — and that gap is invisible from the inside, because the belief is what
produced the code. Re-reading your own diff more carefully does not help: you will read your
intention off the page.

So every check here **compares two artifacts**. That is the only reliable way to see your own
blind spot: not by looking harder at one thing, but by holding two things that should agree
next to each other and finding that they do not.

---

## 1. Each check's body against its own name — `proxy-check`

The largest class by a distance, and always the same shape: the code tests something
_adjacent_ to what its name claims, because the adjacent thing was easier to query.

Real examples, all shipped:

| The check said            | It actually tested                                                          |
| ------------------------- | --------------------------------------------------------------------------- |
| the element is visible    | `isConnected` — `display:none`, zero-size and off-screen all passed         |
| the reproduction failed   | `verdict !== 'pass'` — which also admits `error` and `precondition-not-met` |
| the ticket was updated    | a `jira` phase mark existed — which opens a phase, not closes it            |
| my overlay survived       | an element with that id existed — a _replacement_ looked like survival      |
| the page navigated        | a `load` event fired — hash routing never fires one                         |
| the spotlight is fine now | the current state — a loss that healed left no trace                        |
| this run's phases         | the first `start` in the log — a second run merged into the first           |

**Read every assertion and predicate you added, and ask: does this test the noun in its own
name?** If the name says "visible" and the body says "connected", one of them is wrong. Rename
it or fix it — an honest narrow name is better than a broad one that lies.

Watch for the tell: you reached for a property because it was one call away.

## 2. Documented guarantees against the lines that enforce them — `unenforced-guarantee`

A promise made in prose that the code lets a caller break.

- A colour documented as derived from the phase, with an override parameter still exposed.
- "Fetches everything", with `first:60` and no pagination.
- A same-actions contract reported in the output but never made a condition of the verdict.
- "No hardcoded credentials" ticked on the PR, with an `Administrator` fallback in the code.
- A validated vocabulary of four values, and a default that was a fifth.
- Restoration failures recorded, and used only to word the message.

**Grep your diff and its docs for every `must`, `never`, `always`, `only` and "guarantee", and
name the line that enforces each one.** If you cannot point at it, the guarantee is a comment.
Either enforce it or delete the claim — the second is often right and always honest.

Also check the inverse: a parameter you added that lets a caller contradict something you
documented as fixed.

## 3. Your prose against your code — `stale-prose`

The fix lands and text describing the old behaviour survives beside it — usually in the same
file, often a header far above the change, twice in a frontmatter that drives selection.

**After changing a default, a name or a behaviour, grep the file _and its docs_ for the claim
you just invalidated.** Specifically:

- the module or script header, which was written when the design was different
- a table of options, ids or buckets — add a row to the data, add it to the header too
- frontmatter `description`, and the `Recommended extras` / DoD sections of a skill
- the _other_ place the same rule is stated; two statements of one rule is two things to update

If you added an exception to a rule, find every place that states the rule.

## 4. The PR description against the diff — `false-claim`

- A body listing a file the diff never touched.
- A checklist item ticked that the code contradicted.
- A count quoted from the wrong measurement (top-level keys reported as entries).
- Documented legacy support that would have failed on first execution.

**Read the description with `git diff origin/main...HEAD` open beside it.** Every claim is
either visible in the diff or has evidence you ran. Tick a box only after doing the thing.

A claim about _why_ is not verifiable and is fine. A claim about _what_ is verifiable, so
verify it.

---

## The rest, briefly

**`ordering`** — guards appended after the code they guard, because that is where you were
editing; validation before the state it validates; a gate run before the push whose result it
depends on. Read your new sequence as a sequence, and ask what each step needs to already be
true.

**`silent-failure`** — the script catches `curl` writes that cannot fail and empty
`.catch()`. It cannot catch an `|| true`, an ignored exit code, or a `try` that logs and
continues.

**`incomplete-fetch`** — one page, one source, one of three connections. If you wrote
"every" or "all", prove it.

**`scope`** — a second change bundled in, or one the title does not mention. Either split
it or describe it.

## Re-check the previous round, not only the new diff

Three findings were **regressions of fixes made earlier in the same review loop**: a latch
discarded by a later re-injection, a guard applied to one of two injectors, a `curl` flag fixed
in one call and not its twin.

When you fix a class of defect, grep for the _pattern_, not the instance. And on the second and
later rounds of a review, re-verify the earlier findings still hold.

## What this cannot do

It will not find a logic error, a wrong algorithm or a misunderstood requirement — not one
recorded finding was any of those. It is built for one failure mode: the distance between a
change and its author's
belief about it. Expect it to keep missing things a reviewer with no stake in the code will
see, and keep sending the PR to one.
