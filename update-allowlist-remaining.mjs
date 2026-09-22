#!/usr/bin/env node
/**
 * Add remaining unlisted unmeasured files to allowlist.
 */

import { readFileSync, writeFileSync } from 'fs';

const path = '.ai/state/coverage-uninstrumented-allowlist.json';
const allowlist = JSON.parse(readFileSync(path, 'utf8'));

// Add remaining unlisted files
const additionalNoStatements = {
  'libs/shared/ai-client/src/lib/ai.models.ts': {
    reason: 'Pure TypeScript interface declarations with no executable code. Already present but ensuring it is categorized. Permanent exemption.',
  },
  'libs/features/tasks/src/index.ts': {
    reason: 'Pure export barrel with no executable statements. Tasks feature is out of Beta scope. Permanent exemption.',
  },
  'libs/features/tasks/src/lib/lib.routes.ts': {
    reason: 'Route configuration table with no executable logic. Tasks feature is out of Beta scope. Permanent exemption.',
  },
};

const additionalDatedFiles = {
  'libs/features/assets/src/lib/asset-search-results/asset-search-results.component.ts': {
    until: '2027-06-30',
    reason:
      'Untested asset search results component (995 lines). Assets feature is out of Beta scope per coverage-gate.mjs. Component sits in report with empty statement map.',
  },
  'libs/features/assets/src/lib/assets-drawer/assets-drawer.component.ts': {
    until: '2027-06-30',
    reason:
      'Untested assets drawer component (649 lines). Assets feature is out of Beta scope per coverage-gate.mjs. Component sits in report with empty statement map.',
  },
  'libs/features/tasks/src/lib/task-detail/task-detail.component.ts': {
    until: '2027-06-30',
    reason:
      'Untested task detail component (380 lines). Tasks feature (workflow) is out of Beta scope per coverage-gate.mjs and docs/adf-hx-beta-plan.md.',
  },
  'libs/features/tasks/src/lib/task-list/task-list.component.ts': {
    until: '2027-06-30',
    reason:
      'Untested task list component (83 lines). Tasks feature (workflow) is out of Beta scope per coverage-gate.mjs.',
  },
};

let addedCount = 0;

Object.entries(additionalNoStatements).forEach(([file, entry]) => {
  if (!allowlist.noStatements[file]) {
    allowlist.noStatements[file] = entry;
    console.log('Added noStatements:', file);
    addedCount++;
  }
});

Object.entries(additionalDatedFiles).forEach(([file, entry]) => {
  if (!allowlist.files[file]) {
    allowlist.files[file] = entry;
    console.log('Added dated file:', file);
    addedCount++;
  }
});

writeFileSync(path, JSON.stringify(allowlist, null, 2) + '\n', 'utf8');
console.log(`\n✓ Added ${addedCount} remaining entries to allowlist`);
