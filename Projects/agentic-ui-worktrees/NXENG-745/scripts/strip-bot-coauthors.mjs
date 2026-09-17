#!/usr/bin/env node
/**
 * Strip bot co-authors from commit messages
 *
 * Removes Co-authored-by lines for bot accounts to keep git history clean.
 * Runs automatically via Husky commit-msg hook.
 *
 * Bot accounts stripped:
 * - github-actions[bot]
 * - dependabot[bot]
 * - claude (AI assistant)
 * - cursoragent (Cursor AI)
 * - renovate[bot]
 */

import { readFileSync, writeFileSync } from 'node:fs';

const BOT_PATTERNS = [
  /^Co-authored-by:\s+github-actions\[bot\]\s+<.*>$/gim,
  /^Co-authored-by:\s+dependabot\[bot\]\s+<.*>$/gim,
  /^Co-authored-by:\s+renovate\[bot\]\s+<.*>$/gim,
  /^Co-authored-by:\s+Claude\s+.*<.*@anthropic\.com>$/gim,
  /^Co-authored-by:\s+Cursor\s+.*<.*@cursor\.com>$/gim,
  /^Co-authored-by:\s+cursoragent.*$/gim,
];

function stripBotCoauthors(message) {
  let cleaned = message;
  let removedAny = false;

  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(cleaned)) {
      removedAny = true;
      pattern.lastIndex = 0; // Reset regex state
      cleaned = cleaned.replace(pattern, '');
    }
  }

  // Only clean up formatting if we actually removed bot co-authors
  if (removedAny) {
    // Remove multiple consecutive blank lines left by removed trailers
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Remove trailing whitespace on lines
    cleaned = cleaned.replace(/[ \t]+$/gm, '');

    // Ensure single trailing newline
    cleaned = cleaned.trimEnd() + '\n';
  }

  return { cleaned, removedAny };
}

// Main
const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error('Usage: node strip-bot-coauthors.mjs <commit-msg-file>');
  process.exit(1);
}

try {
  const originalMessage = readFileSync(commitMsgFile, 'utf8');
  const { cleaned: cleanedMessage, removedAny } = stripBotCoauthors(originalMessage);

  if (removedAny) {
    writeFileSync(commitMsgFile, cleanedMessage, 'utf8');
    console.log('✓ Removed bot co-authors from commit message');
  }
} catch (err) {
  console.error('Error processing commit message:', err.message);
  process.exit(1);
}
