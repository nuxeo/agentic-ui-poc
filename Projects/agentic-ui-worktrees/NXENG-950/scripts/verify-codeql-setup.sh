#!/bin/bash
# Verify security scanning setup (CodeQL + Dependency Review) is complete and valid

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🔍 Verifying security scanning setup..."
echo

# Check workflow file exists
if [ -f ".github/workflows/codeql.yml" ]; then
  echo "✅ CodeQL workflow file exists"
else
  echo "❌ CodeQL workflow file missing"
  exit 1
fi

# Check config file exists
if [ -f ".github/codeql-config.yml" ]; then
  echo "✅ CodeQL config file exists"
else
  echo "❌ CodeQL config file missing"
  exit 1
fi

# Validate YAML syntax (requires js-yaml or yamllint)
if command -v npx &> /dev/null; then
  if npx --yes js-yaml .github/workflows/codeql.yml > /dev/null 2>&1; then
    echo "✅ Workflow YAML is valid"
  else
    echo "❌ Workflow YAML is invalid"
    exit 1
  fi

  if npx --yes js-yaml .github/codeql-config.yml > /dev/null 2>&1; then
    echo "✅ Config YAML is valid"
  else
    echo "❌ Config YAML is invalid"
    exit 1
  fi
else
  echo "⚠️  Cannot validate YAML (npx not available)"
fi

# Check required secrets are documented
if grep -q "SATORI_GH_READONLY_TOKEN" .github/workflows/codeql.yml; then
  echo "✅ Required secrets are referenced"
else
  echo "❌ Required secrets missing"
  exit 1
fi

# Check permissions are set
if grep -q "security-events: write" .github/workflows/codeql.yml; then
  echo "✅ Security permissions configured"
else
  echo "❌ Security permissions not set"
  exit 1
fi

# Check documentation is updated
if [ -f "docs/security-scanning.md" ]; then
  echo "✅ Security scanning documentation exists"
else
  echo "⚠️  Security scanning documentation missing"
fi

if grep -q "CodeQL" AGENTS/07-security.md; then
  echo "✅ Security rules updated with CodeQL reference"
else
  echo "⚠️  Security rules not updated"
fi

# Check scanned paths match project structure
if [ -d "apps" ] && [ -d "libs" ]; then
  echo "✅ Project directories match scanned paths"
else
  echo "⚠️  Project structure doesn't match configured paths"
fi

# Check workflow triggers
if grep -q "schedule:" .github/workflows/codeql.yml; then
  echo "✅ Scheduled scanning configured"
else
  echo "⚠️  No scheduled scans configured"
fi

# Check Dependency Review workflow exists
if [ -f ".github/workflows/dependency-review.yml" ]; then
  echo "✅ Dependency Review workflow exists"
else
  echo "❌ Dependency Review workflow missing"
  exit 1
fi

# Validate Dependency Review YAML
if command -v npx &> /dev/null; then
  if npx --yes js-yaml .github/workflows/dependency-review.yml > /dev/null 2>&1; then
    echo "✅ Dependency Review YAML is valid"
  else
    echo "❌ Dependency Review YAML is invalid"
    exit 1
  fi
fi

# Check Dependency Review is configured for PRs
if grep -q "pull_request:" .github/workflows/dependency-review.yml; then
  echo "✅ Dependency Review triggers on PRs"
else
  echo "❌ Dependency Review not configured for PRs"
  exit 1
fi

# Check fail threshold is set
if grep -q "fail-on-severity:" .github/workflows/dependency-review.yml; then
  echo "✅ Dependency Review fail threshold configured"
else
  echo "⚠️  No fail threshold set for Dependency Review"
fi

echo
echo "🎉 Security scanning setup verification complete!"
echo
echo "Next steps:"
echo "1. Commit the security scanning configuration:"
echo "   git add .github/workflows/codeql.yml .github/codeql-config.yml"
echo "   git add .github/workflows/dependency-review.yml"
echo "   git add docs/security-scanning.md AGENTS/07-security.md"
echo "   git commit -m 'ci(security): add CodeQL and Dependency Review scanning'"
echo
echo "2. Push to trigger the first scan:"
echo "   git push"
echo
echo "3. View results in GitHub:"
echo "   Security tab → Code scanning alerts (CodeQL)"
echo "   PR checks → Dependency Review (on PRs with dependency changes)"
echo
echo "4. After reviewing baseline, configure fail-on-findings in CodeQL workflow"
