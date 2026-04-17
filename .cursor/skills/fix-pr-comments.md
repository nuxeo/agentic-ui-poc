# Skill: Fix PR Comments

Use this skill when asked to "fix PR comments", "address review feedback", or "fix Copilot comments on PR #N".

## Steps

1. **Get the PR number** — ask the developer if not provided

2. **Fetch all open comments**

   ```bash
   # Inline (line-level) comments
   gh api repos/nuxeo/agentic-ui-poc/pulls/<N>/comments \
     | jq '.[] | { path: .path, line: .line, body: .body, id: .id }'

   # Review-level comments
   gh pr view <N> --json reviews \
     | jq '.reviews[] | select(.state == "CHANGES_REQUESTED") | .body'
   ```

3. **Read the comment → fix mapping** in `AGENTS/09-pr-feedback.md`

4. **For each comment**
   - Read the file at the specified line
   - Understand the reviewer's intent
   - Implement the fix — do NOT suppress lint errors
   - Common fixes:
     - "Missing unsubscribe" → `takeUntilDestroyed()`
     - "Object URL not revoked" → cleanup array + ngOnDestroy
     - "Direct img src" → service fetch + blob URL
     - "Hardcoded credential" → process.env + validation
     - "No error handling" → reset loading in error branch

5. **Verify all fixes**

   ```bash
   npx nx affected -t lint
   npx nx affected -t build
   npx nx affected -t test
   ```

6. **Commit and push**

   ```bash
   git add .
   git commit -m "fix: address PR #<N> review comments"
   git push
   ```

7. **Optionally reply to each comment**
   ```bash
   gh api repos/nuxeo/agentic-ui-poc/pulls/<N>/comments/<id>/replies \
     -f body="Fixed: <brief description>"
   ```
