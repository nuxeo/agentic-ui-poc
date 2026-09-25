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
 * 3. **The target host is named in an allowlist.** This suite creates and deletes documents
 *    and users, so the question that matters is *which server* it is pointed at. See
 *    `INTEGRATION_ALLOWED_HOSTS` below.
 *
 * ## Why an allowlist and not a credentials check
 *
 * Check 3 used to compare the credentials against `Administrator`/`Administrator` and refuse
 * that pair without an `ALLOW_DEFAULT_CREDENTIALS` opt-in. Reported on the pull request and
 * correct: production credentials are by definition *not* the Docker default, so any real
 * production pair took the `else` branch, was recorded as **satisfied**, and the suite went on
 * to `DELETE` and `Document.Trash` against whatever `NUXEO_URL` named. The control's own
 * message said "This prevents accidentally running against production"; what it actually
 * prevented was running against a *default-credentialled* server, which is close to the
 * opposite population.
 *
 * The replacement asks about the target instead of the credentials, and **fails closed**:
 *
 * - **Default deny.** An empty or unset `INTEGRATION_ALLOWED_HOSTS` permits nothing. There is
 *   no implicit allowlist to fall back to.
 * - **`localhost` is not special-cased.** It is named like any other host or it is refused.
 *   The old guard's flaw was treating one value as inherently safe, and a hardcoded
 *   `localhost` exemption would reproduce it: an SSH tunnel or a `/etc/hosts` entry makes
 *   `localhost` an alias for anything at all.
 * - **Environment only.** No parameter, no CLI flag, no per-suite option. The previous opt-in
 *   was reachable three ways and two of them were compiled into the specs that needed
 *   guarding.
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

/**
 * The one variable that decides which servers this suite may be pointed at.
 *
 * Named here rather than inlined at its two use sites so the reader, the refusal message and
 * the specs cannot drift onto different spellings of it.
 */
export const ALLOWED_HOSTS_ENV = 'INTEGRATION_ALLOWED_HOSTS';

export interface IntegrationTestConfig {
  /** Nuxeo base URL. Default: NUXEO_URL env, then http://localhost:8080 */
  nuxeoUrl?: string;
  /** Nuxeo username. Default: NUXEO_USER env. There is no fallback — see `resolveConnection`. */
  user?: string;
  /** Nuxeo password. Default: NUXEO_PASS env. There is no fallback — see `resolveConnection`. */
  password?: string;
}

/**
 * Split `INTEGRATION_ALLOWED_HOSTS` into entries.
 *
 * Trimmed and lower-cased because hostnames are case-insensitive and a copied-in value picks
 * up spaces after the commas. Empty entries are dropped rather than kept as a host that
 * matches nothing, so `a,,b` and a trailing comma are two hosts, not three — and crucially an
 * unset or blank variable yields `[]`, which permits nothing.
 *
 * Exported for the specs: this is half the decision, and the half that a stray `.filter` could
 * silently turn into "everything allowed".
 */
export function parseAllowedHosts(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

/**
 * The target's `host` and `hostname`, lower-cased, or a thrown explanation.
 *
 * `new URL` throwing is **not** a sufficient test, which is the whole reason this exists as its
 * own function. `new URL('nuxeo.test:8080')` — a `NUXEO_URL` with the scheme left off, the most
 * likely way to get this wrong — does not throw: it parses `nuxeo.test:` as the *scheme* and
 * `8080` as an opaque path, leaving `host` the empty string. Relying on the throw therefore
 * produced a refusal that named no host and printed
 * `export INTEGRATION_ALLOWED_HOSTS=` with nothing after it, which is a guard telling the
 * reader to set a variable to nothing. Observed, not anticipated: two specs below caught it.
 *
 * So both facts are checked. An http(s) scheme, because that is what a Nuxeo server speaks and
 * it is also what rules out the missing-scheme shape; and a non-empty host, because a host is
 * the thing being compared.
 */
function parseTarget(nuxeoUrl: string): { host: string; hostname: string } {
  let url: URL;
  try {
    url = new URL(nuxeoUrl);
  } catch {
    throw new Error(`not a URL: ${nuxeoUrl}`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`scheme is ${url.protocol} and must be http: or https:`);
  }
  if (url.host === '') {
    throw new Error(`names no host: ${nuxeoUrl}`);
  }

  return { host: url.host.toLowerCase(), hostname: url.hostname.toLowerCase() };
}

/**
 * Whether `nuxeoUrl`'s host is named in `allowed`.
 *
 * Two shapes of entry, because both questions are legitimate:
 *
 * - `localhost:8080` contains a colon and must match **host and port** exactly.
 * - `localhost` has no colon and matches **any port** on that hostname.
 *
 * The port-bearing form exists so a run can be pinned when the port is what distinguishes a
 * disposable stack from something that matters — a forwarded tunnel on `localhost:9000` is not
 * the Docker container on `localhost:8080`, and nothing else in this file could tell them
 * apart.
 *
 * Matching is `===` against a whole host, never a substring: `endsWith('localhost')` admits
 * `evil-localhost`, and a registrable domain passing a safety allowlist is the entire risk.
 *
 * Throws, via `parseTarget`, on a target with no usable host. The caller reports that as its
 * own problem rather than swallowing it: answering `false` would file an unparseable
 * `NUXEO_URL` as an allowlist miss and send the reader to edit the wrong variable.
 */
export function isHostAllowed(nuxeoUrl: string, allowed: string[]): boolean {
  const { host, hostname } = parseTarget(nuxeoUrl);

  return allowed.some((entry) => (entry.includes(':') ? entry === host : entry === hostname));
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
        '  against whatever server it is pointed at, so a fallback pair would be both a\n' +
        '  credential in the repository and a guess that is silently wrong on every instance\n' +
        '  but one.\n\n' +
        '  Set both from your own environment, then name the target host:\n\n' +
        `    export ${ALLOWED_HOSTS_ENV}=<host>\n` +
        '    npm run beta:integration',
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
  // There is no options argument to forward, and that is deliberate rather than incidental:
  // the allowlist is read from the environment inside `runPreflightChecks`, so no spec in this
  // library can name a host for itself.
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
): Promise<PreflightResult> {
  const { nuxeoUrl, user, password } = resolveConnection(config);

  const problems: string[] = [];
  const satisfied: string[] = [];

  // Check 1: the target host is named in the allowlist.
  //
  // Read from the environment and nowhere else — no parameter, no flag, no per-suite option.
  // The guard this replaces could be switched off three ways, and all six suites in this
  // library switched it off, so it had never fired in any code path that existed.
  const rawAllowedHosts = process.env[ALLOWED_HOSTS_ENV];
  const allowedHosts = parseAllowedHosts(rawAllowedHosts);

  // `targetHost` is only set when the URL yielded one, so the refusal below can always name a
  // real host. The alternative — reaching for `new URL(nuxeoUrl).host` again at the message —
  // is what printed `export INTEGRATION_ALLOWED_HOSTS=` with an empty value.
  let targetHost: string | null = null;
  let hostAllowed = false;
  try {
    targetHost = parseTarget(nuxeoUrl).host;
    hostAllowed = isHostAllowed(nuxeoUrl, allowedHosts);
  } catch (error) {
    // A target with no usable host has nothing to compare. Reported as its own problem rather
    // than as an allowlist miss, which would send the reader to edit the wrong variable.
    problems.push(
      `NUXEO_URL is not a usable Nuxeo address — ${
        error instanceof Error ? error.message : String(error)
      }\n` + `  Expected something like http://localhost:8080, scheme included.`,
    );
  }

  if (targetHost !== null && !hostAllowed) {
    problems.push(
      `Integration tests refuse to run against ${targetHost} — it is not named in ` +
        `${ALLOWED_HOSTS_ENV}.\n\n` +
        `  This suite CREATES AND DELETES documents and users on whatever server NUXEO_URL\n` +
        `  names. There is no default allowlist and no host is implicitly safe, localhost\n` +
        `  included: the target is named explicitly or the run is refused.\n\n` +
        `  To allow this run:\n` +
        `    export ${ALLOWED_HOSTS_ENV}=${targetHost}\n\n` +
        `  Comma-separated for several hosts. An entry carrying a port must match host and\n` +
        `  port exactly; an entry without one matches any port on that hostname.\n\n` +
        `  ${ALLOWED_HOSTS_ENV} is currently ` +
        (rawAllowedHosts === undefined
          ? 'unset'
          : allowedHosts.length === 0
            ? `set but names no host (${JSON.stringify(rawAllowedHosts)})`
            : `naming: ${allowedHosts.join(', ')}`) +
        `.`,
    );
  } else if (hostAllowed) {
    satisfied.push(`${targetHost} is named in ${ALLOWED_HOSTS_ENV}`);
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
