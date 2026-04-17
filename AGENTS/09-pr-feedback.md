# Handling PR Review Comments

When asked to "fix PR comments", "address review feedback", or "fix all Copilot comments on PR #N":

---

## Step 1 — Fetch All Open Review Comments

```bash
# Get review-level comments (CHANGES_REQUESTED)
gh pr view <PR-number> --json reviews,comments \
  | jq '.reviews[] | select(.state == "CHANGES_REQUESTED") | .body'

# Get inline (line-level) comments
gh api repos/nuxeo/agentic-ui-poc/pulls/<PR-number>/comments \
  | jq '.[] | { path: .path, line: .line, body: .body, id: .id }'
```

---

## Step 2 — For Each Comment

1. Read the file at the specified line number
2. Understand what the reviewer is asking — do NOT just suppress the lint error
3. Implement the correct fix following all rules in `AGENTS/03-angular-conventions.md`, `AGENTS/07-security.md`, and `AGENTS/08-bug-patterns.md`
4. If the comment is unclear, make a reasonable fix and note what you did

---

## Step 3 — Verify, Commit, Push

```bash
npx nx affected -t lint
npx nx affected -t build
npx nx affected -t test
git commit -m "fix: address PR #<N> review comments"
git push
```

---

## Step 4 — Reply to Comments (Optional but Good Practice)

```bash
gh api repos/nuxeo/agentic-ui-poc/pulls/<PR-number>/comments/<comment-id>/replies \
  -f body="Fixed: added takeUntilDestroyed() to subscription in search.ts line 145"
```

---

## Common Comment → Fix Mapping

| Copilot comment                                 | What to do                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| "Missing unsubscribe" / "potential memory leak" | Add `.pipe(takeUntilDestroyed())` to the subscription                  |
| "Object URL not revoked"                        | Add `URL.revokeObjectURL(url)` in `ngOnDestroy`, track URLs in array   |
| "Direct img src to Nuxeo URL"                   | Fetch via `DocumentDetailService.fetchThumbnail()`, use blob URL       |
| "Potential XSS"                                 | Replace `innerHTML` with Angular template binding `{{ }}`              |
| "Hardcoded credential"                          | Move value to `process.env['...']`, add startup validation             |
| "Race condition"                                | Add a `currentUid` check before setting signal after async operation   |
| "Missing error handling"                        | Add `error: () => { this.loading.set(false); this.error.set('...'); }` |
| "Cross-feature import"                          | Move shared code to `libs/shared/`                                     |
| "Using snapshot for route params"               | Switch to `ActivatedRoute.paramMap` observable or `input()` signal     |
| "No accessibility"                              | Replace `<div (click)>` with `<button type="button">`                  |

---

## Skill File for Cursor

There is a dedicated Cursor skill at `.cursor/skills/fix-pr-comments.md` that
automates this entire workflow when you type "fix PR comments".
