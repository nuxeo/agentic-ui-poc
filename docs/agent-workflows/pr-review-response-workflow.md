# Workflow: Respond to PR Review Comments

## Trigger

Developer says one of:

- `"fix all PR review comments on PR #42"`
- `"fix Copilot comments"`
- `"address the review feedback"`

Or: GitHub Actions posts a comment via `pr-auto-fix.yml` with agent instructions.

## Step-by-Step

### 1. Get the PR number

If not provided, ask: "Which PR number?"

### 2. Fetch all open comments

```bash
# Inline (line-level) comments
gh api repos/nuxeo/agentic-ui-poc/pulls/<N>/comments \
  | jq '.[] | { path: .path, line: .line, body: .body, id: .id }'

# Review-level comments
gh pr view <N> --json reviews \
  | jq '.reviews[] | select(.state == "CHANGES_REQUESTED") | .body'
```

### 3. Categorize each comment

Use the mapping in `AGENTS/09-pr-feedback.md`:

| Comment says                | Fix                              |
| --------------------------- | -------------------------------- |
| Missing unsubscribe         | `takeUntilDestroyed()`           |
| Object URL not revoked      | cleanup array + ngOnDestroy      |
| Direct img src to Nuxeo URL | fetch via service + blob URL     |
| Potential XSS               | Angular template binding         |
| Hardcoded credential        | process.env + startup validation |
| Race condition              | stale-uid check                  |
| No error handling           | reset loading in error branch    |
| Cross-feature import        | move to libs/shared/             |

### 4. Implement fixes

For each comment:

- Read the file at the specified line
- Apply the correct fix
- Do NOT suppress linter errors

### 5. Verify

```bash
npx nx affected -t lint
npx nx affected -t build
npx nx affected -t test
```

### 6. Commit and push

```bash
git add .
git commit -m "fix: address PR #<N> review comments"
git push
```

### 7. Reply to comments (optional)

```bash
gh api repos/nuxeo/agentic-ui-poc/pulls/<N>/comments/<id>/replies \
  -f body="Fixed: added takeUntilDestroyed() to subscription in search.ts line 145"
```

## Total developer input

One sentence: "fix PR comments on PR #N"
