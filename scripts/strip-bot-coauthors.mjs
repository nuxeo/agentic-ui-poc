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
  /^Co-authored-by:\s+github-actions\[bot\]\s+<.*>$/im,
  /^Co-authored-by:\s+dependabot\[bot\]\s+<.*>$/im,
  /^Co-authored-by:\s+renovate\[bot\]\s+<.*>$/im,
  /^Co-authored-by:\s+Claude\s+.*<.*@anthropic\.com>$/im,
  /^Co-authored-by:\s+Cursor\s+.*<.*@cursor\.com>$/im,
  /^Co-authored-by:\s+cursoragent.*$/im,
];

function stripBotCoauthors(message) {
  let cleaned = message;

  for (const pattern of BOT_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove multiple consecutive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remove trailing whitespace
  cleaned = cleaned.replace(/[ \t]+$/gm, '');

  // Ensure single trailing newline
  cleaned = cleaned.trimEnd() + '\n';

  return cleaned;
}

// Main
const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error('Usage: node strip-bot-coauthors.mjs <commit-msg-file>');
  process.exit(1);
}

try {
  const originalMessage = readFileSync(commitMsgFile, 'utf8');
  const cleanedMessage = stripBotCoauthors(originalMessage);

  if (originalMessage !== cleanedMessage) {
    writeFileSync(commitMsgFile, cleanedMessage, 'utf8');
    console.log('✓ Removed bot co-authors from commit message');
  }
} catch (err) {
  console.error('Error processing commit message:', err.message);
  process.exit(1);
}
