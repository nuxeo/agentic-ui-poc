/**
 * Integration test preflight checks.
 *
 * Refuses to run the integration suite when preconditions are not met.
 *
 * ## Where exit 2 actually happens
 *
 * Not here. This module contains no `process.exit` and cannot: `checkIntegrationPreconditions`
 * runs inside `setupIntegrationHarness`'s `beforeAll`, and vitest intercepts `process.exit` in
 * the worker and turns it into a failing test, so the run exits 1 whatever this code asks for.
 * For a while this file's header claimed the exit-2 convention regardless, which made a
 * precondition failure and a product defect indistinguishable at the only place a caller looks.
 *
 * `src/preflight-cli.ts` is the gate that does exit 2 — it imports `runPreflightChecks` below
 * and runs as a step before vitest, the way `apps/nuxeo-ui-e2e` chains `e2e-preflight.mjs`
 * ahead of `playwright test`. The throw here remains as the backstop for anyone invoking
 * vitest directly.
 *
 * ## Preconditions (from audit §11 Stage 4)
 *
 * 1. **Nuxeo is reachable.** An absent server fails every test with timeout → reads as
 *    hundreds of product defects instead of one missing service.
 *
 * 2. **Nuxeo is not empty.** Integration tests assert repository data. An empty Nuxeo passes
 *    every presence assertion vacuously and proves nothing.
 *
 * 3. **Default credentials require opt-in.** `Administrator` / `Administrator` is the Docker
 *    default, so pointing a test at an arbitrary Nuxeo without checking destroys production
 *    data. `ALLOW_DEFAULT_CREDENTIALS=true` makes the risk explicit.
 *
 * Usage:
 *   ```ts
 *   import { checkIntegrationPreconditions } from '@agentic-ui/integration-tests';
 *
 *   beforeAll(async () => {
 *     await checkIntegrationPreconditions();   // throws; vitest reports exit 1
 *   });
 *   ```
 */

const DEFAULT_USER = 'Administrator';
const DEFAULT_PASS = 'Administrator';

export interface IntegrationTestConfig {
  /** Nuxeo base URL. Default: http://localhost:8080 */
  nuxeoUrl?: string;
  /** Nuxeo username. Default: NUXEO_USER env or 'Administrator' */
  user?: string;
  /** Nuxeo password. Default: NUXEO_PASS env or 'Administrator' */
  password?: string;
  /** Allow running against default Administrator/Administrator credentials. Default: false */
  allowDefaultCredentials?: boolean;
}

export interface PreflightResult {
  ok: boolean;
  problems: string[];
  satisfied: string[];
}

/**
 * Check integration test preconditions and throw if any fail.
 * Follows the exit-2 convention: precondition failures should fix environment, not code.
 */
export async function checkIntegrationPreconditions(
  config: IntegrationTestConfig = {},
): Promise<void> {
  const result = await runPreflightChecks(config);

  if (!result.ok) {
    const message = [
      '\nintegration-preflight: PRECONDITION NOT MET',
      `${result.problems.length} problem(s):\n`,
      ...result.problems.map(p => `  - ${p}`),
      '',
      result.satisfied.length > 0 ? `Satisfied: ${result.satisfied.join('; ')}` : '',
    ].filter(Boolean).join('\n');

    // In a test context, throw instead of process.exit
    // The test runner will report this as a setup failure
    throw new Error(message);
  }
}

/**
 * Run all preflight checks and return results.
 * Exported separately for testing the preflight itself.
 */
export async function runPreflightChecks(
  config: IntegrationTestConfig = {},
): Promise<PreflightResult> {
  const nuxeoUrl = config.nuxeoUrl ?? 'http://localhost:8080';
  const user = config.user ?? process.env['NUXEO_USER'] ?? DEFAULT_USER;
  const password = config.password ?? process.env['NUXEO_PASS'] ?? DEFAULT_PASS;
  const allowDefault = config.allowDefaultCredentials ??
    process.argv.includes('--allow-default-credentials') ??
    process.env['ALLOW_DEFAULT_CREDENTIALS'] === 'true';

  const problems: string[] = [];
  const satisfied: string[] = [];

  // Check 1: Refuse default credentials without explicit opt-in
  // This is the §5.4 fix: pointing a test at an arbitrary Nuxeo with default credentials
  // can destroy production data if someone misconfigures NUXEO_URL.
  const isDefaultCreds = user === DEFAULT_USER && password === DEFAULT_PASS;
  if (isDefaultCreds && !allowDefault) {
    problems.push(
      `Integration tests refuse to run with default Administrator/Administrator credentials\n` +
      `  without explicit opt-in. This prevents accidentally running against production.\n\n` +
      `  If you are CERTAIN this is a disposable Docker instance:\n` +
      `    ALLOW_DEFAULT_CREDENTIALS=true npm run beta:integration\n\n` +
      `  The env var, not \`-- --allow-default-credentials\`: npm appends extra arguments to\n` +
      `  the END of the script, and this script is a two-command chain, so the flag lands on\n` +
      `  vitest instead of the preflight and the message you are reading repeats forever.\n\n` +
      `  Or set non-default credentials:\n` +
      `    export NUXEO_USER=testuser\n` +
      `    export NUXEO_PASS=testpass`,
    );
  } else if (isDefaultCreds) {
    satisfied.push('default credentials allowed by explicit opt-in');
  } else {
    satisfied.push(`non-default credentials (user: ${user})`);
  }

  // Check 2: Nuxeo is reachable
  let nuxeoReachable = false;
  try {
    const auth = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
    const res = await fetch(`${nuxeoUrl}/nuxeo/api/v1/repo/default/path/`, {
      headers: { Authorization: auth },
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 200) {
      satisfied.push(`Nuxeo reachable at ${nuxeoUrl}`);
      nuxeoReachable = true;
    } else if (res.status === 401) {
      problems.push(
        `Nuxeo rejected credentials at ${nuxeoUrl} (401 Unauthorized).\n` +
        `  Check NUXEO_USER and NUXEO_PASS are correct.`,
      );
    } else {
      problems.push(
        `Nuxeo answered ${res.status} at ${nuxeoUrl}.\n` +
        `  Expected 200 for path lookup.`,
      );
    }
  } catch (error) {
    problems.push(
      `Cannot reach Nuxeo at ${nuxeoUrl}:\n` +
      `  ${error instanceof Error ? error.message : String(error)}\n\n` +
      `  Start Nuxeo with: docker compose up nuxeo`,
    );
  }

  // Check 3: Nuxeo is not empty (only if reachable)
  // An empty repository passes every presence assertion vacuously.
  if (nuxeoReachable) {
    try {
      const auth = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
      const url = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', nuxeoUrl);
      url.searchParams.set(
        'query',
        "SELECT * FROM Document WHERE ecm:primaryType = 'File' AND ecm:isTrashed = 0",
      );
      url.searchParams.set('pageSize', '1');

      const res = await fetch(url, {
        headers: { Authorization: auth, 'X-NXproperties': '*' },
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 200) {
        const body = await res.json();
        const count = body.resultsCount ?? body.entries?.length ?? 0;
        if (count > 0) {
          satisfied.push(`Nuxeo has ${count} File document(s) to test against`);
        } else {
          problems.push(
            'Nuxeo is reachable but holds no File documents.\n' +
            '  Integration tests assert repository data. An empty repository is not a pass —\n' +
            '  it is a run that tested nothing. Import a document first.',
          );
        }
      } else {
        problems.push(
          `Nuxeo query returned ${res.status}. Cannot verify repository has documents.`,
        );
      }
    } catch (error) {
      problems.push(
        `Could not query Nuxeo: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    ok: problems.length === 0,
    problems,
    satisfied,
  };
}
