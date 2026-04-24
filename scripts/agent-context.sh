#!/bin/bash
# agent-context.sh — Universal context loader for any LLM CLI tool
#
# Usage:
#   ./scripts/agent-context.sh                    # print full context to stdout
#   ./scripts/agent-context.sh | llm "your task"  # pipe into any LLM CLI
#   ./scripts/agent-context.sh > /tmp/ctx.txt      # save to file
#
# This concatenates AGENTS.md + all AGENTS/ files into a single context block
# that can be passed to any AI tool as a system prompt or context document.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "# Nuxeo Agentic UI — Full Codebase Context"
echo ""
echo "IMPORTANT: Read and internalize this entire context before responding."
echo "This is the complete knowledge base for the Angular 19 + Nx monorepo."
echo ""
echo "---"
echo ""

# AGENTS.md summary
cat "$REPO_ROOT/AGENTS.md"
echo ""
echo "---"
echo ""

# All AGENTS/ knowledge files in order
for f in "$REPO_ROOT"/AGENTS/*.md; do
  echo ""
  echo "---"
  echo ""
  cat "$f"
done

echo ""
echo "---"
echo "END OF CONTEXT"
