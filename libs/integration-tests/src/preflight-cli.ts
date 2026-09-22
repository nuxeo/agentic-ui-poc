/**
 * Refuse to run the integration suite against a stack that is not there — and say so with
 * **exit 2**, the `precondition-not-met` code `scripts/beta-harness/e2e-preflight.mjs` and
 * `phase-runner.mjs` established: fix the environment, do not iterate on the code.
 *
 * ## Why this is a separate process rather than a `beforeAll`
 *
 * `checkIntegrationPreconditions()` runs inside `setupIntegrationHarness`'s `beforeAll` and
 * throws. Vitest turns that into a setup failure and exits **1** — indistinguishable from a
 * product defect, which is the whole complaint. Exit 2 cannot be produced from there:
 *
 *     beforeAll(() => { process.exit(2); })
 *     -> Error: process.exit unexpectedly called with "2"
 *        Test Files  1 failed (1)          $? = 1
 *
 * Vitest intercepts `process.exit` in the worker and converts it into a failing test, so the
 * runner still decides the code. Measured, not assumed. Hence a step that runs *before*
 * vitest, exactly as `apps/nuxeo-ui-e2e/project.json` chains `e2e-preflight.mjs` ahead of
 * `playwright test`.
 *
 * The in-test check stays where it is. This is the gate; that is the backstop for anyone who
 * runs vitest directly.
 *
 * ## One implementation, two entry points
 *
 * The checks are not reimplemented here — `runPreflightChecks()` is imported from the library
 * that already owns them. `e2e-preflight.mjs` is a plain `.mjs` because it has no TypeScript
 * to import; this one does, so it runs under `tsx` (a declared devDependency) rather than
 * being transcribed into JavaScript that would then drift.
 *
 * Usage:
 *   npm run beta:integration-preflight
 *   npm run beta:integration                  # this, then vitest
 *
 * `NUXEO_URL` selects the server, matching `setupIntegrationHarness`. The default-credentials
 * opt-in is read here, from the flag or `ALLOW_DEFAULT_CREDENTIALS=true`, and passed in
 * explicitly — the library's own resolution of it at `integration-preflight.ts:88-90` chains
 * `??` after a boolean and so can never reach its env branch. That defect is tracked
 * separately and is deliberately not touched here; reading the env in this file is what keeps
 * this entry point from depending on it.
 */

import { runPreflightChecks } from './lib/integration-preflight';

const nuxeoUrl = process.env['NUXEO_URL'] ?? 'http://localhost:8080';
const allowDefaultCredentials =
  process.argv.includes('--allow-default-credentials') ||
  process.env['ALLOW_DEFAULT_CREDENTIALS'] === 'true';

// Wrapped rather than run at the top level: the nearest `package.json` declares no
// `"type": "module"`, so `tsx` transforms this file as CJS and esbuild rejects a top-level
// `await` outright. A `.mts` extension would fix that and fall out of `tsconfig.lib.json`'s
// `src/**/*.ts` include, which is the one thing type-checking this file.
async function main(): Promise<void> {
  const result = await runPreflightChecks({ nuxeoUrl, allowDefaultCredentials });

  if (!result.ok) {
    console.error(
      `\nintegration-preflight: PRECONDITION NOT MET — ${result.problems.length} problem(s)\n`,
    );
    for (const problem of result.problems) console.error(`- ${problem}\n`);
    if (result.satisfied.length > 0) {
      console.error(`  Satisfied: ${result.satisfied.join('; ')}\n`);
    }
    // 2, not 1: fix the environment, do not iterate on the code.
    process.exit(2);
  }

  console.log(`integration-preflight: pass — ${nuxeoUrl} is ready`);
  for (const satisfied of result.satisfied) console.log(`  - ${satisfied}`);
}

main().catch((error: unknown) => {
  // Exit 1, not 2. `runPreflightChecks` handles every expected network failure itself, so
  // reaching here means the preflight is broken rather than the environment — and the whole
  // point of the two codes is that they do not get confused.
  console.error(
    `\nintegration-preflight: crashed. This is a defect in the preflight, not a precondition:\n` +
      `  ${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exit(1);
});
