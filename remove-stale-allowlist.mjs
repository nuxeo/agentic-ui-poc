#!/usr/bin/env node
/**
 * Remove stale allowlist entries that are now instrumented.
 */

import { readFileSync, writeFileSync } from 'fs';

const path = '.ai/state/coverage-uninstrumented-allowlist.json';
const allowlist = JSON.parse(readFileSync(path, 'utf8'));

const staleToRemove = [
  'libs/core/src/lib/core/core.ts',
  'libs/shared/ai-client/src/lib/ai-chat.service.ts',
  'libs/shared/ai-client/src/lib/ai-error.ts',
  'libs/shared/ai-client/src/lib/ai-feature-flag.service.ts',
  'libs/shared/ai-client/src/lib/ai-gateway.service.ts',
  'libs/shared/ai-client/src/lib/ai.config.ts',
  'libs/shared/ai-client/src/index.ts',
  'libs/shared/app-config/src/lib/app-config.tokens.ts',
  'libs/shared/app-config/src/lib/app-config.service.ts',
  'libs/shared/app-config/src/lib/bootstrap-config.ts',
  'libs/shared/app-config/src/lib/runtime-manifest.ts',
];

let removedFromFiles = 0;
let removedFromNoStatements = 0;

staleToRemove.forEach((file) => {
  if (allowlist.files[file]) {
    delete allowlist.files[file];
    console.log('Removed from files:', file);
    removedFromFiles++;
  }
  if (allowlist.noStatements[file]) {
    delete allowlist.noStatements[file];
    console.log('Removed from noStatements:', file);
    removedFromNoStatements++;
  }
});

writeFileSync(path, JSON.stringify(allowlist, null, 2) + '\n', 'utf8');
console.log(
  `\n✓ Removed ${removedFromFiles + removedFromNoStatements} stale entries (${removedFromFiles} from files, ${removedFromNoStatements} from noStatements)`,
);
