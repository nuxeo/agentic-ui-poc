# Workflow: Implement a New Feature

## Trigger

Developer says one of:

- `"Add bulk export to the browse page"`
- `"Implement NCO-1234"`
- `"Build a notification bell for workflow tasks"`

## Step-by-Step

### 1. Load context

```
Read AGENTS.md
Read AGENTS/00-architecture.md
Read AGENTS/01-services.md
```

If JIRA ticket provided → use Atlassian MCP to fetch story + Acceptance Criteria.

### 2. Expand intent → technical spec

Identify:

- Which existing services cover this feature (check `AGENTS/01-services.md`)
- Which existing UI components are reusable (check `libs/shared/ui/`)
- Which files need to change
- Whether a new service method is needed
- Whether a new feature module or dialog is needed

### 3. Create todo list (TodoWrite tool)

Example for "Add bulk export":

```
☐ Check if bulkDownload() exists in DocumentDetailService
☐ Add bulkDownload(uids: string[]) to DocumentDetailService
☐ Add 'Export' to SelectionTopbarComponent actions
☐ Wire SelectionService.selectedIds() into the export action
☐ Write unit test: DocumentDetailService.bulkDownload() happy + error path
☐ Run: npx nx affected -t lint && build && test
☐ Update docs/api-integrations.md with Blob.BulkDownload endpoint
☐ Update AGENTS/01-services.md with new method
☐ git checkout -b feature/bulk-export
☐ git commit -m "feat: add bulk export to browse page"
☐ gh pr create
```

### 4. Implement

Follow `AGENTS/03-angular-conventions.md` for all Angular code.
Follow `AGENTS/07-security.md` for all security-sensitive code.
Scan each file touched against `AGENTS/08-bug-patterns.md`.

### 5. Write tests

Follow `AGENTS/05-test-standards.md`.
Run `npx nx test <project>` — fix any failures before continuing.

### 6. Verify

```bash
npx nx affected -t lint
npx nx affected -t build
npx nx affected -t test
```

All must pass.

### 7. Commit and PR

```bash
git checkout -b feature/<description>
git add .
git commit -m "feat: <description>"
git push -u origin HEAD
gh pr create \
  --title "feat: <description>" \
  --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)" \
  --base main
```

## Expected CI outcome

- Lint → pass
- Build → pass
- Tests → pass (new test verifies the feature)
- Copilot → reviews PR
- If Copilot flags issues → run "fix PR comments" workflow

## Total developer input

One sentence (or JIRA ticket ID) + PR approval
