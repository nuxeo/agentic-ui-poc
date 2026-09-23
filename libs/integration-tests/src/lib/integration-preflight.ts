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
  /** Nuxeo base URL. Default: NUXEO_URL env, then http://localhost:8080 */
  nuxeoUrl?: string;
  /** Nuxeo username. Default: NUXEO_USER env. There is no fallback — see `resolveConnection`. */
  user?: string;
  /** Nuxeo password. Default: NUXEO_PASS env. There is no fallback — see `resolveConnection`. */
  password?: string;
}

/**
 * The opt-in that lets the suite run against `Administrator`/`Administrator`.
 *
 * **Not** part of `IntegrationTestConfig`, and that is the point. It used to be, and all six
 * suites in this library set it to `true`, so the guard below never fired in any code path
 * that existed — a control two status documents recorded as implemented. A per-suite knob is
 * a constant compiled into the spec; the decision belongs at the point of invocation, where
 * whoever is pointing the run at a server is the one making it.
 *
 * So the suites cannot reach it: `setupIntegrationHarness` reads `ALLOW_DEFAULT_CREDENTIALS`
 * from the environment and nothing else, and this parameter exists for `preflight-cli.ts`,
 * which is a CLI and can legitimately take a flag.
 */
export interface PreflightOptions {
  allowDefaultCredentials?: boolean;
}

export interface PreflightResult {
  ok: boolean;
  problems: string[];
  satisfied: string[];
}

/** Nuxeo connection values, resolved once so every consumer uses the same ones. */
export interface ResolvedConnection {
  nuxeoUrl: string;
  user: string;
  password: string;
}

/**
 * Resolve the Nuxeo connection from explicit config, then the environment. Credentials have
 * **no** fallback, and the URL is resolved here rather than by each caller.
 *
 * Two defects this closes, both reported on the pull request.
 *
 * `.cursor/rules/security.mdc`: "NEVER use Basic auth with hardcoded fallback defaults". The
 * harness carried `?? 'Administrator'` on both the user and the password, which is a working
 * credential pair compiled into a library whose job is to issue `DELETE` against a live
 * repository. It also made the guard below unreachable from the other direction: an absent
 * environment *selected* the default credentials rather than refusing, so "default
 * credentials require an opt-in" was enforced only against someone who had typed them out.
 * `apps/nuxeo-ui-e2e/src/fixtures.ts` throws for exactly this reason, and this library should
 * not make the opposite trade against a more dangerous surface.
 *
 * The URL is resolved once because the harness used to resolve `NUXEO_URL` for itself and
 * then hand the *raw* config to the preflight, which resolved only `config.nuxeoUrl`. With
 * `NUXEO_URL` set and no explicit config — every suite here — the preflight certified
 * `localhost:8080` and the tests then ran destructively against the environment's server.
 */
export function resolveConnection(config: IntegrationTestConfig = {}): ResolvedConnection {
  const user = config.user ?? process.env['NUXEO_USER'];
  const password = config.password ?? process.env['NUXEO_PASS'];

  if (!user || !password) {
    throw new Error(
      'NUXEO_USER and NUXEO_PASS must both be set to run the integration suite.\n\n' +
        '  There is deliberately no default. This library issues DELETE and Document.Trash\n' +
        '  against whatever server it is pointed at, and a hardcoded Administrator pair is\n' +
        '  both a credential in the repository and a default that is silently wrong on every\n' +
        '  instance but a local Docker one.\n\n' +
        '    export NUXEO_USER=Administrator NUXEO_PASS=Administrator\n' +
        '    ALLOW_DEFAULT_CREDENTIALS=true npm run beta:integration',
    );
  }

  return {
    nuxeoUrl: config.nuxeoUrl ?? process.env['NUXEO_URL'] ?? 'http://localhost:8080',
    user,
    password,
  };
}

/**
 * Check integration test preconditions and throw if any fail.
 * Follows the exit-2 convention: precondition failures should fix environment, not code.
 */
export async function checkIntegrationPreconditions(
  config: IntegrationTestConfig = {},
): Promise<void> {
  // No `PreflightOptions` argument on purpose: the in-test path takes its opt-in from the
  // environment only, so no spec can switch the default-credentials guard off.
  const result = await runPreflightChecks(config);

  if (!result.ok) {
    const message = [
      '\nintegration-preflight: PRECONDITION NOT MET',
      `${result.problems.length} problem(s):\n`,
      ...result.problems.map((p) => `  - ${p}`),
      '',
      result.satisfied.length > 0 ? `Satisfied: ${result.satisfied.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

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
  options: PreflightOptions = {},
): Promise<PreflightResult> {
  const { nuxeoUrl, user, password } = resolveConnection(config);
  // `||`, not `??`. `Array.prototype.includes` returns a boolean and is never nullish, so the
  // `??` chain this replaces could never reach its `ALLOW_DEFAULT_CREDENTIALS` branch — the
  // opt-in the guard's own message tells you to use was unreachable from the library. The
  // flag is read by `preflight-cli.ts` and arrives here through `options`; it is not read
  // from `process.argv` here, because inside a vitest worker that argv belongs to vitest.
  const allowDefault =
    options.allowDefaultCredentials === true || process.env['ALLOW_DEFAULT_CREDENTIALS'] === 'true';

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
        `Nuxeo answered ${res.status} at ${nuxeoUrl}.\n` + `  Expected 200 for path lookup.`,
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
        // `resultsCount` is only a count when it is not negative. Nuxeo's page provider
        // returns -1 (UNKNOWN_SIZE) and -2 (UNKNOWN_SIZE_AFTER_QUERY) when the total exceeds
        // the count limit, and `??` passes both straight through because they are neither
        // null nor undefined. A populated repository then scored `count = -2`, failed
        // `count > 0`, and this gate reported "holds no File documents" and exited 2 —
        // inverting its answer on exactly the large repositories it is least able to doubt.
        //
        // The entries are the evidence in any case: the query asks for `pageSize=1`, so one
        // returned row IS the proof that the repository has something to test against. The
        // total is only ever the nicer number to print.
        const entries = Array.isArray(body.entries) ? body.entries.length : 0;
        const total =
          typeof body.resultsCount === 'number' && body.resultsCount >= 0
            ? body.resultsCount
            : null;
        if (total !== null ? total > 0 : entries > 0) {
          satisfied.push(
            `Nuxeo has ${total ?? `at least ${entries}`} File document(s) to test against`,
          );
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
