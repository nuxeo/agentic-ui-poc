# Git Workflow

## Branch Naming

```
feature/<description>     → feature/bulk-export
fix/<description>         → fix/thumbnail-memory-leak
docs/<description>        → docs/update-api-registry
refactor/<description>    → refactor/search-aggregation-service
chore/<description>       → chore/update-dependencies
```

**Never commit directly to `main`.**

---

## Commit Message Format (Conventional Commits)

```
feat: add bulk export to browse page
fix: resolve thumbnail blob URL memory leak in app shell
docs: update api-integrations.md for Blob.BulkDownload
test: add unit tests for DocumentDetailService.bulkExport
refactor: extract tag service from document-detail component
chore: update Angular to 19.2
```

Rules:

- lowercase type + colon + space + lowercase description
- present tense ("add", not "added")
- no period at end
- body (optional): blank line after subject, then explanation of _why_

---

## Before Every Commit

```bash
npx nx affected -t lint    # must pass — run manually or enforced by CI
npx nx affected -t build   # must pass
npx nx affected -t test    # must pass
```

The Husky pre-commit hook runs `lint-staged` (not `nx affected`), which lints and formats only staged files.
Run `npx nx affected -t lint` manually before committing to catch all affected project lint errors.
If the pre-commit hook fails, **fix the errors before retrying**. Never use `--no-verify`.

---

## Creating a PR

```bash
# 1. Create and push branch
git checkout -b feature/my-feature
git add .
git commit -m "feat: add my feature"
git push -u origin HEAD

# 2. Create PR via gh CLI
gh pr create \
  --title "feat: add my feature" \
  --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)" \
  --base main
```

Always fill the PR template with:

- What changed and why (not just what)
- Files modified
- Test plan (steps to verify)
- Completed checklist

---

## After PR is Created

1. Wait for CI (lint + build + test) to pass
2. Wait for Copilot code review
3. Fix any Copilot comments: `"fix all PR review comments on PR #<N>"`
4. Get human approval
5. Squash and merge

---

## Linking to JIRA

Include the ticket ID in the PR title or description:

```
feat(NCO-1234): add bulk export to browse page
```

Or in the PR body: `Implements NCO-1234`

When using Cursor with the Atlassian MCP: `"implement NCO-1234"` → agent fetches the story,
extracts Acceptance Criteria, and uses them as the technical specification automatically.

---

## Never

- Never force-push to `main`
- Never use `--no-verify` to skip Husky hooks
- Never commit `.env` files (they are gitignored)
- Never commit `node_modules`
- Never commit secrets, tokens, or passwords
- Never merge your own PR without at least one reviewer approval
