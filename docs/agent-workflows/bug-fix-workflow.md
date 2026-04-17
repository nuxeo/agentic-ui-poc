# Workflow: Fix a Bug

## Trigger

Developer says one of:

- `"Thumbnail images not loading in search results"`
- `"Fix NCO-5678"`
- `"The export button crashes when no documents are selected"`

## Step-by-Step

### 1. Load context

```
Read AGENTS.md
Read AGENTS/08-bug-patterns.md   ← check known patterns first
```

If JIRA ticket provided → fetch story + steps to reproduce using Atlassian MCP.

### 2. Identify root cause

- Check `AGENTS/08-bug-patterns.md` — is this a known pattern?
- If yes, apply the known fix immediately
- If no, read the affected file(s) and trace the bug

Common root causes to check first:

- `<img [src]="nuxeoUrl">` → missing auth header
- `.subscribe()` without `takeUntilDestroyed()` → state persists after navigation
- `loading` not reset in error handler → user can't retry
- State signals not reset when route param changes

### 3. Write a regression test FIRST (TDD approach for bugs)

```typescript
it('should load thumbnails via HttpClient, not direct src binding', () => {
  // Write a test that would have caught the bug
  // This test currently fails — the fix will make it pass
});
```

### 4. Implement the fix

Follow `AGENTS/03-angular-conventions.md`.
Follow `AGENTS/07-security.md`.

### 5. Verify test passes

```bash
npx nx test <project>
```

### 6. Run full verification

```bash
npx nx affected -t lint
npx nx affected -t build
npx nx affected -t test
```

### 7. Commit and PR

```bash
git checkout -b fix/<description>
git add .
git commit -m "fix: <description>"
git push -u origin HEAD
gh pr create \
  --title "fix: <description>" \
  --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)" \
  --base main
```

## Total developer input

One sentence description of the bug
