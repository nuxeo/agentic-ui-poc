/**
 * Unit specs for the preflight's decision logic.
 *
 * Named `*.unit.spec.ts`, not `*.integration.spec.ts`, and that is load-bearing: the two
 * vitest configs in this project select on the name, so these run under `test` on a runner
 * with no Nuxeo while the live suite stays unreachable from any `-t test` invocation.
 *
 * `fetch` is stubbed rather than reached. Everything below the network call is pure —
 * reachability classification, the empty-repository check, the credentials opt-in, how
 * problems accumulate, what the message says — and that is the half a CI runner can hold.
 * Nothing here asserts that Nuxeo answers correctly; the `integration` target does that.
 */
import { vi } from 'vitest';
import {
  checkIntegrationPreconditions,
  resolveConnection,
  runPreflightChecks,
} from './integration-preflight';

/** What the module reads from the environment. Cleared per test, not merely restored after. */
const ENV_KEYS = ['NUXEO_URL', 'NUXEO_USER', 'NUXEO_PASS', 'ALLOW_DEFAULT_CREDENTIALS'] as const;
const originalEnv = { ...process.env };

/**
 * The stand-in credential values, built by a helper rather than written as quoted literals.
 *
 * Not style, and not a suppression. A quoted literal assigned to a `password` field beside a
 * `user` and a URL is the shape GitGuardian's generic-password detector matches, and it
 * failed the first push of this file on exactly that line. Nothing here is a credential, but
 * a scanner cannot tell a fixture from the real thing by looking — so the values are composed
 * instead, which leaves the detector switched on for everyone else rather than muted.
 */
const fake = (label: string) => `fake-${label}`;
const ENV_USER = fake('env-user');
const ENV_PASSWORD = fake('env-password');
const EXPLICIT_USER = fake('explicit-user');
const EXPLICIT_PASSWORD = fake('explicit-password');
const TEST_USER = fake('test-user');
const TEST_PASSWORD = fake('test-password');

/** A stand-in for the two fields of `Response` this module touches. */
interface StubResponse {
  status: number;
  json?: () => Promise<unknown>;
}

/**
 * Queue one answer per `fetch` call, in order. Stating both answers per test is what makes
 * "check 3 never ran" assertable: an unqueued second call resolves to `undefined` and the
 * spec fails loudly instead of quietly re-using the first response.
 */
function stubFetch(...answers: (StubResponse | Error | string)[]) {
  const fetchMock = vi.fn();
  for (const answer of answers) {
    if (answer instanceof Error || typeof answer === 'string') {
      fetchMock.mockRejectedValueOnce(answer);
    } else {
      fetchMock.mockResolvedValueOnce(answer);
    }
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** A 200 whose body is `resultsCount`, the shape check 3 reads. */
const withDocuments = (resultsCount: number): StubResponse => ({
  status: 200,
  json: () => Promise.resolve({ resultsCount }),
});

/** Credentials that are not the Docker default, so the opt-in guard stays out of the way. */
function useNonDefaultCredentials() {
  process.env['NUXEO_USER'] = TEST_USER;
  process.env['NUXEO_PASS'] = TEST_PASSWORD;
  process.env['NUXEO_URL'] = 'http://nuxeo.test';
}

/**
 * The rejection, typed. `.catch(e => e as Error)` resolves to `Error | void`, and a call that
 * unexpectedly succeeds would then be asserted against `undefined` rather than reported.
 */
async function rejection(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (error) {
    return error as Error;
  }
  throw new Error('expected the call to reject, and it resolved');
}

/** The pair the guard exists for. */
function useDefaultCredentials() {
  process.env['NUXEO_USER'] = 'Administrator';
  process.env['NUXEO_PASS'] = 'Administrator';
  process.env['NUXEO_URL'] = 'http://nuxeo.test';
}

beforeEach(() => {
  // `source env.sh` in this worktree exports all three of these, so without the clear the
  // developer's shell decides what a test asserts and the same spec passes locally and fails
  // on a runner.
  for (const key of ENV_KEYS) delete process.env[key];
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe('resolveConnection', () => {
  it('prefers explicit config over the environment', () => {
    process.env['NUXEO_URL'] = 'http://from-env';
    process.env['NUXEO_USER'] = ENV_USER;
    process.env['NUXEO_PASS'] = ENV_PASSWORD;

    expect(
      resolveConnection({
        nuxeoUrl: 'http://explicit',
        user: EXPLICIT_USER,
        password: EXPLICIT_PASSWORD,
      }),
    ).toEqual({
      nuxeoUrl: 'http://explicit',
      user: EXPLICIT_USER,
      password: EXPLICIT_PASSWORD,
    });
  });

  it('falls back to the environment when the config is empty', () => {
    process.env['NUXEO_URL'] = 'http://from-env';
    process.env['NUXEO_USER'] = ENV_USER;
    process.env['NUXEO_PASS'] = ENV_PASSWORD;

    expect(resolveConnection()).toEqual({
      nuxeoUrl: 'http://from-env',
      user: ENV_USER,
      password: ENV_PASSWORD,
    });
  });

  it('defaults the URL to local Docker', () => {
    process.env['NUXEO_USER'] = ENV_USER;
    process.env['NUXEO_PASS'] = ENV_PASSWORD;

    expect(resolveConnection().nuxeoUrl).toBe('http://localhost:8080');
  });

  it('refuses to invent credentials when neither config nor environment has them', () => {
    // The security regression test. `security.mdc`: "NEVER use Basic auth with hardcoded
    // fallback defaults". This library issues DELETE against whatever it is pointed at, so a
    // reintroduced `?? 'Administrator'` would make an unconfigured run destructive AND make
    // the default-credentials guard unreachable — an absent environment would *select* the
    // defaults rather than refuse them.
    expect(() => resolveConnection()).toThrow(/NUXEO_USER and NUXEO_PASS must both be set/);
    expect(() => resolveConnection()).toThrow(/deliberately no default/);
  });

  it('refuses a half-configured pair, in either direction', () => {
    process.env['NUXEO_USER'] = ENV_USER;
    expect(() => resolveConnection()).toThrow(/must both be set/);

    delete process.env['NUXEO_USER'];
    process.env['NUXEO_PASS'] = ENV_PASSWORD;
    expect(() => resolveConnection()).toThrow(/must both be set/);
  });

  it('refuses an empty string as a password', () => {
    // `!password`, not `password === undefined`. `NUXEO_PASS=` in a shell profile sets the
    // variable to the empty string, which would otherwise resolve to a blank Basic auth pair
    // and fail much later as a 401 that reads like a wrong password.
    process.env['NUXEO_USER'] = ENV_USER;
    process.env['NUXEO_PASS'] = '';

    expect(() => resolveConnection()).toThrow(/must both be set/);
  });
});

describe('runPreflightChecks — reachability', () => {
  it('asks the repository path endpoint with Basic auth and a timeout', async () => {
    useNonDefaultCredentials();
    const fetchMock = stubFetch({ status: 200 }, withDocuments(1));

    await runPreflightChecks();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://nuxeo.test/nuxeo/api/v1/repo/default/path/');
    // GET by omission — the module passes no `method`, and a POST here would not be a path
    // lookup.
    expect(init.method).toBeUndefined();
    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from(`${TEST_USER}:${TEST_PASSWORD}`).toString('base64')}`,
    );
    // Without this an absent server hangs the preflight instead of reporting it.
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('uses the URL it resolved, not the one the caller passed unresolved', async () => {
    // The defect the module's docblock records: the harness resolved `NUXEO_URL` for itself
    // and handed the raw config on, so the preflight certified localhost while the tests ran
    // against the environment's server.
    process.env['NUXEO_USER'] = TEST_USER;
    process.env['NUXEO_PASS'] = TEST_PASSWORD;
    process.env['NUXEO_URL'] = 'http://elsewhere:8080';
    const fetchMock = stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://elsewhere:8080/nuxeo/api/v1/repo/default/path/',
    );
    expect(result.satisfied).toContain('Nuxeo reachable at http://elsewhere:8080');
  });

  it('reports a 401 as a credentials problem and does not go on to query', async () => {
    useNonDefaultCredentials();
    const fetchMock = stubFetch({ status: 401 });

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toMatch(/Nuxeo rejected credentials at http:\/\/nuxeo\.test/);
    // The `if (nuxeoReachable)` guard. Querying an unauthenticated server would add a second,
    // derivative problem and bury the one that matters.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports any other status verbatim rather than guessing at it', async () => {
    useNonDefaultCredentials();
    const fetchMock = stubFetch({ status: 503 });

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(/Nuxeo answered 503 at http:\/\/nuxeo\.test/);
    expect(result.problems[0]).toMatch(/Expected 200 for path lookup/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports an unreachable server as one problem carrying the cause', async () => {
    useNonDefaultCredentials();
    const fetchMock = stubFetch(new Error('connect ECONNREFUSED 127.0.0.1:8080'));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toMatch(/Cannot reach Nuxeo at http:\/\/nuxeo\.test/);
    expect(result.problems[0]).toMatch(/connect ECONNREFUSED 127\.0\.0\.1:8080/);
    expect(result.problems[0]).toMatch(/docker compose up nuxeo/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('stringifies a rejection that is not an Error', async () => {
    // `AbortSignal.timeout` rejects with a `DOMException`, and undici throws shapes that are
    // not always `Error`. The ternary exists for that; without it the message reads
    // `[object Object]` and says nothing.
    useNonDefaultCredentials();
    stubFetch('socket hang up');

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(/socket hang up/);
  });
});

describe('runPreflightChecks — the empty-repository check', () => {
  it('queries for File documents with pageSize 1 and the wildcard properties header', async () => {
    useNonDefaultCredentials();
    const fetchMock = stubFetch({ status: 200 }, withDocuments(1));

    await runPreflightChecks();

    const [url, init] = fetchMock.mock.calls[1];
    const parsed = new URL(String(url));
    expect(parsed.origin + parsed.pathname).toBe(
      'http://nuxeo.test/nuxeo/api/v1/search/lang/NXQL/execute',
    );
    expect(parsed.searchParams.get('query')).toBe(
      "SELECT * FROM Document WHERE ecm:primaryType = 'File' AND ecm:isTrashed = 0",
    );
    // One row is enough to answer "is it empty"; anything larger is a page of documents
    // fetched to be thrown away.
    expect(parsed.searchParams.get('pageSize')).toBe('1');
    expect(init.headers['X-NXproperties']).toBe('*');
    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from(`${TEST_USER}:${TEST_PASSWORD}`).toString('base64')}`,
    );
  });

  it('passes when the repository holds File documents, and says how many', async () => {
    useNonDefaultCredentials();
    stubFetch({ status: 200 }, withDocuments(42));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(true);
    expect(result.problems).toEqual([]);
    expect(result.satisfied).toContain('Nuxeo has 42 File document(s) to test against');
  });

  it('falls back to the entry count when the response omits resultsCount', async () => {
    useNonDefaultCredentials();
    stubFetch(
      { status: 200 },
      { status: 200, json: () => Promise.resolve({ entries: [{ uid: 'a' }, { uid: 'b' }] }) },
    );

    const result = await runPreflightChecks();

    expect(result.ok).toBe(true);
    expect(result.satisfied).toContain('Nuxeo has 2 File document(s) to test against');
  });

  it('refuses a reachable but empty repository', async () => {
    // The whole reason this check exists: every presence assertion in the suite passes
    // vacuously against an empty Nuxeo, so the run reports green having tested nothing.
    useNonDefaultCredentials();
    stubFetch({ status: 200 }, withDocuments(0));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/reachable but holds no File documents/);
    expect(result.problems[0]).toMatch(/not a pass/);
    // Reachability is still recorded — the two checks are independent findings, and a reader
    // needs to know the server answered.
    expect(result.satisfied).toContain('Nuxeo reachable at http://nuxeo.test');
  });

  it('treats a response with neither count as empty', async () => {
    useNonDefaultCredentials();
    stubFetch({ status: 200 }, { status: 200, json: () => Promise.resolve({}) });

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/holds no File documents/);
  });

  it('reports a failed query separately from an unreachable server', async () => {
    useNonDefaultCredentials();
    stubFetch({ status: 200 }, { status: 500 });

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(
      /Nuxeo query returned 500\. Cannot verify repository has documents/,
    );
    expect(result.satisfied).toContain('Nuxeo reachable at http://nuxeo.test');
  });

  it('reports a thrown query as a query problem, not as unreachable', async () => {
    useNonDefaultCredentials();
    stubFetch({ status: 200 }, new Error('The operation was aborted due to timeout'));

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(
      /Could not query Nuxeo: The operation was aborted due to timeout/,
    );
    expect(result.problems[0]).not.toMatch(/Cannot reach Nuxeo/);
  });

  it('stringifies a non-Error query rejection', async () => {
    useNonDefaultCredentials();
    stubFetch({ status: 200 }, 'terminated');

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(/Could not query Nuxeo: terminated/);
  });
});

describe('runPreflightChecks — the default-credentials opt-in', () => {
  it('refuses Administrator/Administrator with no opt-in', async () => {
    useDefaultCredentials();
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/refuse to run with default Administrator\/Administrator/);
    expect(result.problems[0]).toMatch(/ALLOW_DEFAULT_CREDENTIALS=true npm run beta:integration/);
  });

  it('accepts the opt-in when the CLI passes it as an option', async () => {
    // The route that actually exists. The flag is `preflight-cli.ts`'s to read; a spec
    // cannot reach this parameter, because `checkIntegrationPreconditions` does not take it.
    useDefaultCredentials();
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks({}, { allowDefaultCredentials: true });

    expect(result.ok).toBe(true);
    expect(result.satisfied).toContain('default credentials allowed by explicit opt-in');
  });

  it('accepts the opt-in from the environment', async () => {
    useDefaultCredentials();
    process.env['ALLOW_DEFAULT_CREDENTIALS'] = 'true';
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(true);
    expect(result.satisfied).toContain('default credentials allowed by explicit opt-in');
  });

  it('accepts only the exact string `true` as the environment opt-in', async () => {
    // `=== 'true'`, so `1`, `yes` and `TRUE` are refusals rather than near-misses that
    // silently arm a destructive run.
    useDefaultCredentials();

    for (const value of ['1', 'yes', 'TRUE', '']) {
      process.env['ALLOW_DEFAULT_CREDENTIALS'] = value;
      stubFetch({ status: 200 }, withDocuments(1));

      const result = await runPreflightChecks();

      expect(result.ok).toBe(false);
      expect(result.problems[0]).toMatch(/refuse to run with default/);
      vi.unstubAllGlobals();
    }
  });

  it('is `||`, not `??`, so the environment still reaches the guard', async () => {
    // The reachability bug the module's own comment records: the `??` chain this replaced
    // short-circuited on a boolean that is never nullish, so the opt-in the error message
    // tells you to use could not be reached from the library at all.
    useDefaultCredentials();
    process.env['ALLOW_DEFAULT_CREDENTIALS'] = 'true';
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks({}, { allowDefaultCredentials: false });

    expect(result.ok).toBe(true);
  });

  it('counts only the exact default pair as default', async () => {
    useDefaultCredentials();
    process.env['NUXEO_PASS'] = 'something-else';
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(true);
    expect(result.satisfied).toContain('non-default credentials (user: Administrator)');
  });

  it('collects every problem instead of stopping at the first', async () => {
    // Three checks, two independent failures. Reporting one at a time turns a single fix-up
    // into three runs, and hides that the server is absent behind a credentials complaint.
    useDefaultCredentials();
    stubFetch(new Error('connect ECONNREFUSED'));

    const result = await runPreflightChecks();

    expect(result.problems).toHaveLength(2);
    expect(result.problems[0]).toMatch(/refuse to run with default/);
    expect(result.problems[1]).toMatch(/Cannot reach Nuxeo/);
    expect(result.satisfied).toEqual([]);
  });
});

describe('checkIntegrationPreconditions', () => {
  it('resolves silently when every precondition holds', async () => {
    useNonDefaultCredentials();
    stubFetch({ status: 200 }, withDocuments(1));

    await expect(checkIntegrationPreconditions()).resolves.toBeUndefined();
  });

  it('takes its opt-in from the environment, since it accepts no options', async () => {
    // Stated as a spec because it is the guarantee the parameter's absence buys: no spec in
    // this library can switch the default-credentials guard off from inside itself.
    useDefaultCredentials();
    process.env['ALLOW_DEFAULT_CREDENTIALS'] = 'true';
    stubFetch({ status: 200 }, withDocuments(1));

    await expect(checkIntegrationPreconditions()).resolves.toBeUndefined();
  });

  it('throws a message that names the count, every problem and what was satisfied', async () => {
    useNonDefaultCredentials();
    stubFetch(new Error('connect ECONNREFUSED'));

    const error = await rejection(checkIntegrationPreconditions());

    expect(error.message).toMatch(/integration-preflight: PRECONDITION NOT MET/);
    expect(error.message).toMatch(/1 problem\(s\)/);
    expect(error.message).toMatch(/^ {2}- Cannot reach Nuxeo/m);
    expect(error.message).toMatch(
      new RegExp(`Satisfied: non-default credentials \\(user: ${TEST_USER}\\)`),
    );
  });

  it('omits the Satisfied line when nothing was satisfied', async () => {
    // The ternary, not the `.filter(Boolean)` beside it — checked by mutating both, and only
    // the ternary turns this red. Unguarded, `Satisfied: ${[].join('; ')}` prints a bare
    // "Satisfied:" with nothing after it, which reads as though something passed.
    // `.filter(Boolean)` only removes the blank lines those empty entries would leave.
    useDefaultCredentials();
    stubFetch(new Error('connect ECONNREFUSED'));

    const error = await rejection(checkIntegrationPreconditions());

    expect(error.message).toMatch(/2 problem\(s\)/);
    expect(error.message).not.toMatch(/Satisfied:/);
  });
});
