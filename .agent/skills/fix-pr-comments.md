# Skill: Fix PR Comments — superseded

**Use the [`pr-review-responder`](../agents/pr-review-responder.md) subagent instead.**

This skill claimed the same triggers — "fix PR comments", "address review feedback", "fix
Copilot comments on PR #N" — and three of its instructions were wrong in ways that lose
feedback:

- It fetched with **unpaginated REST**, which exposes neither `isResolved` nor `isOutdated`.
  Its output therefore listed comments that had already been dealt with, and silently dropped
  anything past the first page.
- It read only `CHANGES_REQUESTED` review summaries. Copilot submits its verdict as
  `COMMENTED`, so the summary telling you what to look at was never fetched.
- Replying was listed as step 7, "optionally". A reply is not optional, and it does not
  resolve a thread either — that needs the GraphQL `resolveReviewThread` mutation, which this
  skill never mentioned.

Two entry points for one workflow means the obsolete one stays selectable. The subagent is the
authoritative path: it paginates threads, review bodies and conversation comments, pulls Sonar
issues, verifies each fix against the full gate, then replies citing the commit and resolves.

`AGENTS/09-pr-feedback.md` remains the reference for the comment-to-fix mapping.
