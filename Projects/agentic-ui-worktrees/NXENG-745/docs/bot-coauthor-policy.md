# Bot Co-Author Policy

## Overview

This repository **automatically strips bot co-authors** from commit messages to keep git history clean and focused on human contributors.

## What Gets Removed

The following bot accounts are automatically removed from `Co-authored-by` trailers:

- `github-actions[bot]` - GitHub Actions workflows
- `dependabot[bot]` - Dependency updates
- `renovate[bot]` - Dependency updates
- `Claude Sonnet 4.5` / `claude` - Anthropic AI assistant
- `Cursor` / `cursoragent` - Cursor AI assistant

## Why Remove Bot Co-Authors?

### 1. Legal Clarity

**CLA (Contributor License Agreement) applies to humans only:**

- Bots cannot sign legal agreements (not legal entities)
- Human developer is responsible for ALL code they contribute
- AI assistants are tools (like IDEs, compilers, linters)
- CLA signature covers all work, regardless of tools used

### 2. Git History Cleanliness

**Commit history should reflect human contributors:**

- Makes `git log` and `git blame` more meaningful
- Focuses on who is accountable for changes
- Reduces noise in contributor statistics
- Simplifies legal audits and compliance reviews

### 3. Tool Neutrality

**We don't credit other development tools:**

- IDEs (VSCode, IntelliJ) don't get co-author credit
- Linters (ESLint, Prettier) don't get co-author credit
- Compilers (TypeScript, Angular) don't get co-author credit
- AI assistants should be treated the same way

## How It Works

### Automatic Enforcement (All Developers)

A **Husky git hook** runs on every commit:

```bash
# .husky/commit-msg
node scripts/strip-bot-coauthors.mjs "$1"
```

**When you commit:**

1. You write commit message (may include bot co-authors)
2. Hook runs automatically before commit is created
3. Bot co-authors are stripped
4. Human co-authors are preserved
5. Commit is created with clean message

**Example:**

```bash
# You write:
git commit -m "feat: add feature

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>
Co-authored-by: Alice Smith <alice@example.com>"

# Commit is saved as:
feat: add feature

Co-authored-by: Alice Smith <alice@example.com>
```

### Setup (For New Developers)

Hooks are automatically installed when you run:

```bash
npm install
```

The `prepare` script in `package.json` runs `husky`, which installs all hooks.

**Verify hook is installed:**

```bash
ls -l .husky/commit-msg
# Should show: node scripts/strip-bot-coauthors.mjs "$1"
```

## Testing

### Test the Hook

```bash
# Create a test file
cat > /tmp/test-msg.txt << 'EOF'
test: verify hook

Co-authored-by: claude <noreply@anthropic.com>
Co-authored-by: Human <human@example.com>
EOF

# Run the script
node scripts/strip-bot-coauthors.mjs /tmp/test-msg.txt

# Check result
cat /tmp/test-msg.txt
# Should only show Human co-author
```

### Test a Real Commit

```bash
# Make a change
echo "test" >> test.txt
git add test.txt

# Commit with bot co-author
git commit -m "test: verify bot stripping

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Check the actual commit
git log -1 --pretty=full
# Should NOT show claude co-author
```

## AI Tool Configuration

### Cursor IDE

**Disable automatic co-author trailers:**

1. Open Cursor settings (`Cmd+,` on Mac)
2. Search for "co-author"
3. Uncheck **"Add co-author to commit messages"**

This prevents Cursor from adding `Co-authored-by: cursoragent` in the first place.

### Claude Code CLI

**Remove co-author from Git config:**

Edit your Git configuration or use environment variables to prevent Claude from adding itself as co-author in workflow-generated commits.

For GitHub Actions workflows, we explicitly set:

```yaml
- name: Configure git
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
```

This prevents any co-author trailers from being added.

## Bypass (Rarely Needed)

If you NEED to keep a bot co-author (very rare):

```bash
# Skip the hook for one commit
git commit --no-verify -m "message"
```

**Warning:** This bypasses ALL git hooks, including:

- `pre-commit` (linting, formatting)
- `commit-msg` (bot stripping)
- `pre-push` (guardrails)

Only use `--no-verify` if you understand the consequences.

## Troubleshooting

### Hook Not Running

**Symptom:** Bot co-authors still appear in commits

**Fix:**

```bash
# Reinstall hooks
npm install

# Verify hook exists
cat .husky/commit-msg
# Should show: node scripts/strip-bot-coauthors.mjs "$1"

# Make hook executable
chmod +x .husky/commit-msg
```

### Hook Fails

**Symptom:** `git commit` fails with script error

**Check:**

```bash
# Test script directly
node scripts/strip-bot-coauthors.mjs /tmp/test.txt

# Check Node version (must be 20.x)
node --version

# Check script exists
ls -l scripts/strip-bot-coauthors.mjs
```

### Want to Keep Human Co-Authors

**The hook preserves ALL human co-authors automatically.**

Only bot accounts matching these patterns are removed:

- `github-actions[bot]`
- `dependabot[bot]`
- `renovate[bot]`
- `Claude` / `claude` (with `@anthropic.com`)
- `Cursor` / `cursoragent` (with `@cursor.com`)

Any other co-author (human names/emails) are kept intact.

## Related Documentation

- [CLA Configuration Guide](./cla-configuration-guide.md) - Why bots are allowlisted in CLA
- [CLA Workflow Explanation](./cla-workflow-explanation.md) - How CLA signing works
- [Git Commit Guidelines](../CONTRIBUTING.md) - General commit message standards

## Summary

**Goal:** Keep git history focused on human contributors

**Method:** Automatic git hook strips bot co-authors before commits are created

**Result:**

- ✅ All human co-authors are preserved
- ✅ All bot co-authors are removed
- ✅ Works for all developers automatically (after `npm install`)
- ✅ No manual action required

**Legal note:** Removing bot co-authors does NOT affect CLA compliance. The human developer who commits is responsible for all code, regardless of tools used.
