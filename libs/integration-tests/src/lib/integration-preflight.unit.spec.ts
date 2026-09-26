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
import { randomUUID } from 'node:crypto';
import { vi } from 'vitest';
import {
  checkIntegrationPreconditions,
  isHostAllowed,
  parseAllowedHosts,
  resolveConnection,
  runPreflightChecks,
} from './integration-preflight';
import { assertUntruncated } from './integration-harness';

/** What the module reads from the environment. Cleared per test, not merely restored after. */
const ENV_KEYS = ['NUXEO_URL', 'NUXEO_USER', 'NUXEO_PASS', 'INTEGRATION_ALLOWED_HOSTS'] as const;
const originalEnv = { ...process.env };

/**
 * The stand-in credential values, built by a helper rather than written as quoted literals.
 *
 * Not style, and not a suppression. A quoted literal assigned to a `password` field beside a
 * `user` and a URL is the shape GitGuardian's generic-password detector matches, and it
 * failed the first push of this file on exactly that line. Nothing here is a credential, but
 * a scanner cannot tell a fixture from the real thing by looking — so the values are composed
 * instead, which leaves the detector switched on for everyone else rather than muted.
 *
 * The random suffix is load-bearing, not decoration. Without it these values were `fake-test-user`
 * and `fake-test-password` — derivable by reading this file — and the Basic-auth assertions below
 * build their expected header from the same two constants. Mutating the module's
 * `` `${user}:${password}` `` to `` `${user}:fake-test-password` `` therefore kept every spec
 * green: the derivation was broken and the expectation still matched, because the expectation
 * had become a constant too. A per-run value cannot be written into the module under test, so
 * the header assertions now test the derivation rather than a coincidence.
 */
const fake = (label: string) => `fake-${label}-${randomUUID().slice(0, 8)}`;
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

/**
 * A configured, permitted target, so the checks under test are the ones after check 1.
 *
 * The allowlist is set here rather than left to a default, because there is no default: an
 * unset `INTEGRATION_ALLOWED_HOSTS` refuses every host, `nuxeo.test` included. Every spec that
 * calls this is therefore also evidence that naming a host is what permits it.
 */
function useAllowedTarget() {
  process.env['NUXEO_USER'] = TEST_USER;
  process.env['NUXEO_PASS'] = TEST_PASSWORD;
  process.env['NUXEO_URL'] = 'http://nuxeo.test';
  process.env['INTEGRATION_ALLOWED_HOSTS'] = 'nuxeo.test';
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

/**
 * A configured but **unlisted** target — credentials present, host named nowhere.
 *
 * This is the situation the guard exists for, and it is deliberately described without any
 * credential value: which pair is in use is no longer part of the decision. The helper it
 * replaces assigned the Docker default to both `NUXEO_USER` and `NUXEO_PASS` — a working
 * credential pair written into a TypeScript file, which `security.mdc` forbids outright and
 * which is the exact shape that tripped GitGuardian earlier on this branch.
 */
function useUnlistedTarget() {
  process.env['NUXEO_USER'] = TEST_USER;
  process.env['NUXEO_PASS'] = TEST_PASSWORD;
  process.env['NUXEO_URL'] = 'http://nuxeo.test';
  delete process.env['INTEGRATION_ALLOWED_HOSTS'];
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
    // reintroduced `?? '<some admin>'` fallback would make an unconfigured run destructive
    // while reading as configured.
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
    useAllowedTarget();
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
    // Named, because the subject here is which URL gets requested and the preflight now sends
    // nothing at all to a host it has not been given. Without this the spec asserted the
    // resolved URL by observing a request to an unlisted server, which is the defect fixed
    // alongside it.
    process.env['INTEGRATION_ALLOWED_HOSTS'] = 'elsewhere:8080';
    const fetchMock = stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://elsewhere:8080/nuxeo/api/v1/repo/default/path/',
    );
    expect(result.satisfied).toContain('Nuxeo reachable at http://elsewhere:8080');
  });

  it('reports a 401 as a credentials problem and does not go on to query', async () => {
    useAllowedTarget();
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
    useAllowedTarget();
    const fetchMock = stubFetch({ status: 503 });

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(/Nuxeo answered 503 at http:\/\/nuxeo\.test/);
    expect(result.problems[0]).toMatch(/Expected 200 for path lookup/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports an unreachable server as one problem carrying the cause', async () => {
    useAllowedTarget();
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
    useAllowedTarget();
    stubFetch('socket hang up');

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(/socket hang up/);
  });
});

describe('runPreflightChecks — the empty-repository check', () => {
  it('queries for File documents with pageSize 1 and the wildcard properties header', async () => {
    useAllowedTarget();
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
    useAllowedTarget();
    stubFetch({ status: 200 }, withDocuments(42));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(true);
    expect(result.problems).toEqual([]);
    expect(result.satisfied).toContain('Nuxeo has 42 File document(s) to test against');
  });

  it('falls back to the entry count when the response omits resultsCount', async () => {
    useAllowedTarget();
    stubFetch(
      { status: 200 },
      { status: 200, json: () => Promise.resolve({ entries: [{ uid: 'a' }, { uid: 'b' }] }) },
    );

    const result = await runPreflightChecks();

    expect(result.ok).toBe(true);
    // "at least 2", not "2". An absent `resultsCount` means the total is unknown, and the
    // entries are a floor rather than a count — the same reason the -1/-2 sentinels below
    // are phrased this way. Stating a floor as an exact total is how an unknown becomes a
    // figure someone later quotes.
    expect(result.satisfied).toContain('Nuxeo has at least 2 File document(s) to test against');
  });

  it('refuses a reachable but empty repository', async () => {
    // The whole reason this check exists: every presence assertion in the suite passes
    // vacuously against an empty Nuxeo, so the run reports green having tested nothing.
    useAllowedTarget();
    stubFetch({ status: 200 }, withDocuments(0));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/reachable but holds no File documents/);
    expect(result.problems[0]).toMatch(/not a pass/);
    // Reachability is still recorded — the two checks are independent findings, and a reader
    // needs to know the server answered.
    expect(result.satisfied).toContain('Nuxeo reachable at http://nuxeo.test');
  });

  // Nuxeo's page provider answers -1 (UNKNOWN_SIZE) and -2 (UNKNOWN_SIZE_AFTER_QUERY) when
  // the total exceeds the count limit. `resultsCount ?? entries.length` passed both straight
  // through, so a populated repository scored -2, failed `count > 0`, and this gate reported
  // it empty and exited 2. Both sentinels, because -1 was as wrong as -2 and only one was
  // mentioned in review.
  for (const sentinel of [-1, -2]) {
    it(`treats resultsCount ${sentinel} as unknown and trusts the returned entries`, async () => {
      useAllowedTarget();
      stubFetch(
        { status: 200 },
        {
          status: 200,
          json: () => Promise.resolve({ resultsCount: sentinel, entries: [{ uid: 'a' }] }),
        },
      );

      const result = await runPreflightChecks();

      expect(result.ok).toBe(true);
      expect(result.problems).toEqual([]);
      // "at least 1", not "1": the real total is unknown, and printing it as exact would be
      // the same overstatement in the other direction.
      expect(result.satisfied).toContain('Nuxeo has at least 1 File document(s) to test against');
    });

    it(`still refuses an empty repository when resultsCount is ${sentinel}`, async () => {
      // The sentinel must not become a way to pass with nothing in the repository: with no
      // entries there is still no evidence of a document.
      useAllowedTarget();
      stubFetch(
        { status: 200 },
        { status: 200, json: () => Promise.resolve({ resultsCount: sentinel, entries: [] }) },
      );

      const result = await runPreflightChecks();

      expect(result.ok).toBe(false);
      expect(result.problems[0]).toMatch(/holds no File documents/);
    });
  }

  it('treats a response with neither count as empty', async () => {
    useAllowedTarget();
    stubFetch({ status: 200 }, { status: 200, json: () => Promise.resolve({}) });

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/holds no File documents/);
  });

  it('reports a failed query separately from an unreachable server', async () => {
    useAllowedTarget();
    stubFetch({ status: 200 }, { status: 500 });

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(
      /Nuxeo query returned 500\. Cannot verify repository has documents/,
    );
    expect(result.satisfied).toContain('Nuxeo reachable at http://nuxeo.test');
  });

  it('reports a thrown query as a query problem, not as unreachable', async () => {
    useAllowedTarget();
    stubFetch({ status: 200 }, new Error('The operation was aborted due to timeout'));

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(
      /Could not query Nuxeo: The operation was aborted due to timeout/,
    );
    expect(result.problems[0]).not.toMatch(/Cannot reach Nuxeo/);
  });

  it('stringifies a non-Error query rejection', async () => {
    useAllowedTarget();
    stubFetch({ status: 200 }, 'terminated');

    const result = await runPreflightChecks();

    expect(result.problems[0]).toMatch(/Could not query Nuxeo: terminated/);
  });
});

describe('parseAllowedHosts', () => {
  it('yields nothing for an unset variable, so nothing is permitted', () => {
    // The default-deny half of the decision, stated on its own. If this ever returns a
    // non-empty list, the guard is armed with hosts nobody named.
    expect(parseAllowedHosts(undefined)).toEqual([]);
  });

  it('yields nothing for a blank or comma-only value', () => {
    for (const raw of ['', '   ', ',', ' , , ']) {
      expect(parseAllowedHosts(raw)).toEqual([]);
    }
  });

  it('splits on commas and trims the spaces a copied-in value carries', () => {
    expect(parseAllowedHosts('localhost, nuxeo.test ,ci.internal')).toEqual([
      'localhost',
      'nuxeo.test',
      'ci.internal',
    ]);
  });

  it('lower-cases, because hostnames are case-insensitive', () => {
    expect(parseAllowedHosts('LocalHost,NUXEO.TEST')).toEqual(['localhost', 'nuxeo.test']);
  });

  it('drops empty entries rather than keeping a host that matches nothing', () => {
    expect(parseAllowedHosts('localhost,,nuxeo.test,')).toEqual(['localhost', 'nuxeo.test']);
  });
});

describe('isHostAllowed', () => {
  it('permits a hostname entry on any port of that host', () => {
    expect(isHostAllowed('http://localhost:8080', ['localhost'])).toBe(true);
    expect(isHostAllowed('http://localhost:4210', ['localhost'])).toBe(true);
  });

  it('requires an exact host:port match when the entry carries a port', () => {
    // The stricter form, and why it exists: a forwarded tunnel on localhost:9000 is not the
    // disposable container on localhost:8080, and nothing else here could tell them apart.
    expect(isHostAllowed('http://localhost:8080', ['localhost:8080'])).toBe(true);
    expect(isHostAllowed('http://localhost:9000', ['localhost:8080'])).toBe(false);
  });

  it('refuses a host that is merely a suffix or prefix of an allowed one', () => {
    // `===`, not `endsWith`. `evil-localhost` and `localhost.evil.com` both pass a substring
    // test, and an attacker-registrable domain passing a safety allowlist is the whole risk.
    expect(isHostAllowed('http://evil-localhost:8080', ['localhost'])).toBe(false);
    expect(isHostAllowed('http://localhost.evil.com', ['localhost'])).toBe(false);
    expect(isHostAllowed('http://nuxeo.test.evil.com', ['nuxeo.test'])).toBe(false);
  });

  it('does not treat localhost as inherently safe', () => {
    // The point of the decision. The guard this replaced held one value to be safe by
    // construction; naming localhost is the only thing that permits it.
    expect(isHostAllowed('http://localhost:8080', [])).toBe(false);
    // Nor are the two spellings interchangeable: an allowlist is a list of names.
    expect(isHostAllowed('http://127.0.0.1:8080', ['localhost'])).toBe(false);
  });

  it('permits nothing against an empty allowlist, whatever the target', () => {
    for (const url of ['http://localhost:8080', 'https://prod.example.com', 'http://127.0.0.1']) {
      expect(isHostAllowed(url, [])).toBe(false);
    }
  });

  it('compares the host case-insensitively', () => {
    expect(isHostAllowed('http://NUXEO.TEST:8080', ['nuxeo.test'])).toBe(true);
  });

  it('throws on a target with no usable host rather than answering false', () => {
    // Answering false would report an unusable NUXEO_URL as an allowlist miss and send the
    // reader to edit the wrong variable.
    //
    // `nuxeo.test:8080` is the load-bearing case and the reason this is not just a `new URL`
    // try/catch: it does NOT throw. `new URL` reads `nuxeo.test:` as the scheme and `8080` as
    // an opaque path, so `host` comes back empty and the earlier version of this guard refused
    // a nameless host while telling the reader to `export INTEGRATION_ALLOWED_HOSTS=`.
    expect(() => isHostAllowed('nuxeo.test:8080', ['nuxeo.test'])).toThrow(
      /scheme is nuxeo\.test: and must be http: or https:/,
    );
    expect(() => isHostAllowed('not a url at all', ['nuxeo.test'])).toThrow(/not a URL/);
    // `file:` and `ftp:` stand for "a scheme that is not http(s)". The path is irrelevant to
    // what this asserts, so it is `/tmp/x`. The first draft used the conventional Unix
    // password-file path, and GitGuardian's generic-password detector matched it and reported a
    // hardcoded secret. Nothing was leaked, but a needlessly evocative fixture cost a round —
    // and the string is kept out of this comment too, or the comment re-triggers the detector
    // that the change exists to satisfy.
    expect(() => isHostAllowed('file:///tmp/x', ['nuxeo.test'])).toThrow(/must be http: or https:/);
    expect(() => isHostAllowed('ftp://nuxeo.test', ['nuxeo.test'])).toThrow(
      /must be http: or https:/,
    );
  });

  it('rejects every http spelling that carries no host, at the URL parse', () => {
    // Recorded as a spec because it is why `parseTarget` has no separate empty-host branch.
    // `http:` and `https:` are WHATWG special schemes, so `new URL` *requires* a host and
    // throws instead of handing back an empty one. A guard for `url.host === ''` was written,
    // survived every mutation because nothing could reach it, and was deleted. If a future Node
    // ever starts parsing these, this spec goes red and the branch is needed again.
    for (const url of ['http://', 'http:///', 'http://:8080', 'http://:']) {
      expect(() => isHostAllowed(url, ['nuxeo.test'])).toThrow(/not a URL/);
    }
    // And the one that does parse takes its first path segment as the host, rather than none.
    expect(isHostAllowed('http:///nuxeo.test', ['nuxeo.test'])).toBe(true);
  });
});

describe('runPreflightChecks — the host allowlist', () => {
  it('refuses a host that is not named, naming the host and what to set', async () => {
    useUnlistedTarget();
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/refuse to run against nuxeo\.test/);
    expect(result.problems[0]).toMatch(/not named in INTEGRATION_ALLOWED_HOSTS/);
    // The message has to carry the command with the real host substituted in — a guard that
    // says only "not allowed" makes the reader guess at the spelling of both.
    expect(result.problems[0]).toMatch(/export INTEGRATION_ALLOWED_HOSTS=nuxeo\.test/);
    expect(result.problems[0]).toMatch(/INTEGRATION_ALLOWED_HOSTS is currently unset/);
  });

  it('refuses localhost as readily as anything else', async () => {
    // Not a special case, which is the substance of the decision rather than a detail of it.
    process.env['NUXEO_USER'] = TEST_USER;
    process.env['NUXEO_PASS'] = TEST_PASSWORD;
    process.env['NUXEO_URL'] = 'http://localhost:8080';
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/refuse to run against localhost:8080/);
    expect(result.problems[0]).toMatch(/no host is implicitly safe, localhost\n {2}included/);
  });

  it('refuses when the variable is set but names no host', async () => {
    useUnlistedTarget();
    process.env['INTEGRATION_ALLOWED_HOSTS'] = ' , ';
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    // Distinguished from unset, because "but I did set it" is the next thing the reader says.
    expect(result.problems[0]).toMatch(/set but names no host \(" , "\)/);
  });

  it('permits the run once the host is named, and records it as satisfied', async () => {
    useAllowedTarget();
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(true);
    expect(result.satisfied).toContain('nuxeo.test is named in INTEGRATION_ALLOWED_HOSTS');
  });

  it('names the hosts it does know about when the target is not among them', async () => {
    useUnlistedTarget();
    process.env['INTEGRATION_ALLOWED_HOSTS'] = 'localhost,ci.internal';
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/currently naming: localhost, ci\.internal/);
  });

  it('is credential-independent: one pair, refused then permitted by host alone', async () => {
    // The defect in the guard this replaces, stated as a spec. It keyed on the credentials, so
    // a real production pair was *recorded as satisfying* it. Here the credentials are held
    // constant and only the allowlist moves.
    process.env['NUXEO_USER'] = TEST_USER;
    process.env['NUXEO_PASS'] = TEST_PASSWORD;
    process.env['NUXEO_URL'] = 'https://prod.example.com';

    stubFetch({ status: 200 }, withDocuments(1));
    expect((await runPreflightChecks()).ok).toBe(false);
    vi.unstubAllGlobals();

    process.env['INTEGRATION_ALLOWED_HOSTS'] = 'prod.example.com';
    stubFetch({ status: 200 }, withDocuments(1));
    expect((await runPreflightChecks()).ok).toBe(true);
  });

  it('reports a scheme-less NUXEO_URL as its own problem, not an allowlist miss', async () => {
    // Regression test for a message this guard really produced. `nuxeo.test:8080` parses, so
    // the allowlist branch ran with an empty host and printed "refuse to run against  —" over
    // "export INTEGRATION_ALLOWED_HOSTS=". Two failures, one of them a guard instructing the
    // reader to set the variable to nothing.
    process.env['NUXEO_USER'] = TEST_USER;
    process.env['NUXEO_PASS'] = TEST_PASSWORD;
    process.env['NUXEO_URL'] = 'nuxeo.test:8080';
    process.env['INTEGRATION_ALLOWED_HOSTS'] = 'nuxeo.test';
    stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/NUXEO_URL is not a usable Nuxeo address/);
    expect(result.problems[0]).toMatch(/scheme is nuxeo\.test:/);
    // The allowlist must stay quiet here, and must not emit a refusal naming nothing.
    expect(result.problems.join('\n')).not.toMatch(/not named in/);
    expect(result.problems.join('\n')).not.toMatch(/ALLOWED_HOSTS=$/m);
  });

  it('sends NO request at all to a host that is not named', async () => {
    // The assertion that the exit code cannot make. Refusing after the request still discloses
    // `Authorization: Basic <user:pass>` to a server the allowlist just rejected, and against a
    // production target that disclosure is the whole of the damage — the non-zero exit arrives
    // afterwards and repairs nothing. So the claim under test is about the network, not the
    // verdict: the refused host is never contacted.
    useUnlistedTarget();
    const fetchMock = stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/not named in INTEGRATION_ALLOWED_HOSTS/);
    // Nothing may be recorded as satisfied either: reaching a server is the only way to earn an
    // entry here, so a non-empty list would mean a check ran that should not have.
    expect(result.satisfied).toEqual([]);
  });

  it('sends the credential-bearing request once the host IS named', async () => {
    // The other half, and the one that stops the test above from passing on a preflight that
    // never calls `fetch` under any condition at all. Same credentials, same URL as the refused
    // case in spirit — only the allowlist moves, and the request appears.
    useAllowedTarget();
    const fetchMock = stubFetch({ status: 200 }, withDocuments(1));

    const result = await runPreflightChecks();

    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][0]).toBe('http://nuxeo.test/nuxeo/api/v1/repo/default/path/');
    // Naming the header explicitly: this is the thing withheld from an unlisted host, so the
    // spec should say that it is what travels to a listed one.
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toMatch(/^Basic /);
    expect(result.ok).toBe(true);
  });

  it('stops at the allowlist, and keeps collecting problems past it', async () => {
    // This replaces a spec that asserted the opposite — that an unlisted target reported BOTH
    // the miss and `Cannot reach Nuxeo`, on the reasoning that one problem at a time turns a
    // single fix-up into two runs. That reasoning was sound about diagnostics and wrong about
    // this boundary: the second problem could only be discovered by making the request the
    // guard exists to prevent, so the convenience was being paid for in disclosed credentials.
    //
    // Collecting more than one problem is still the behaviour everywhere the target is
    // permitted, which is what the second half here holds onto.
    useUnlistedTarget();
    stubFetch(new Error('connect ECONNREFUSED'));

    const refused = await runPreflightChecks();

    expect(refused.problems).toHaveLength(1);
    expect(refused.problems[0]).toMatch(/not named in INTEGRATION_ALLOWED_HOSTS/);
    expect(refused.problems.join('\n')).not.toMatch(/Cannot reach Nuxeo/);

    vi.unstubAllGlobals();

    // Permitted, unreachable: the reachability problem is reported, proving the early return
    // above is scoped to the allowlist and has not turned the rest into a first-failure exit.
    useAllowedTarget();
    stubFetch(new Error('connect ECONNREFUSED'));

    const permitted = await runPreflightChecks();

    expect(permitted.problems[0]).toMatch(/Cannot reach Nuxeo/);
    expect(permitted.satisfied).toContain('nuxeo.test is named in INTEGRATION_ALLOWED_HOSTS');
  });
});

describe('assertUntruncated — the data root is where the harness thinks it is', () => {
  // The run ID's suffix is sized to spend exactly Nuxeo's 24-character path segment, so this
  // guard is what stops the next widening from leaking silently. Measured on 2026-09-24:
  // requesting `it-20260924-112334-3207ed6420ab7921` created `it-20260924-112334-3207e`, and
  // because every later read of the requested path 404s, cleanup read that 404 as "already
  // deleted" and the run went green having left the workspace behind.
  const requested = '/default-domain/workspaces/it-20260924-112334-3207ed6420ab7921';
  const truncated = '/default-domain/workspaces/it-20260924-112334-3207e';

  it('accepts the path Nuxeo actually created when it matches', () => {
    expect(() => assertUntruncated(requested, requested)).not.toThrow();
  });

  /** @param over the third argument, the outcome of the stray-workspace cleanup */
  const rejection = (over?: string) => {
    try {
      assertUntruncated(requested, truncated, over);
    } catch (e) {
      return e as Error;
    }
    throw new Error('expected the truncated path to be rejected, and it was accepted');
  };

  it('throws when Nuxeo truncated the name, naming both paths and the real length', () => {
    const error = rejection();

    expect(error.message).toMatch(/created the data root at a different path/);
    expect(error.message).toContain(requested);
    expect(error.message).toContain(truncated);
    expect(error.message).toMatch(/caps a\n {2}segment at 24 characters/);
    // The length of `it-20260924-112334-3207ed6420ab7921`, quoted so the message says why 24
    // was exceeded rather than merely that it was.
    expect(error.message).toMatch(/is 35\./);
    // The consequence, not just the fact. A reader who does not know this leaks is liable to
    // "fix" it by relaxing the comparison.
    expect(error.message).toMatch(/does not fail — it leaks/);
  });

  // Throwing on the mismatch is not on its own enough: the workspace Nuxeo really created is
  // at `truncated`, and `afterAll` deletes `requested`, gets a 404 and calls that success. So
  // the caller removes the stray workspace and reports the outcome here, and the message has
  // to carry it either way — a failed reclaim that printed nothing would be the original
  // silent leak with extra steps.
  it('reports a successful reclaim of the workspace Nuxeo actually created', () => {
    expect(rejection(`removed ${truncated} (confirmed absent)`).message).toMatch(
      new RegExp(`cleanup {4}removed ${truncated} \\(confirmed absent\\)`),
    );
  });

  it('says so loudly when the stray workspace could not be removed', () => {
    const error = rejection(`FAILED — DELETE ${truncated} answered 500; remove it by hand`);

    expect(error.message).toMatch(/cleanup {4}FAILED/);
    expect(error.message).toMatch(/remove it by hand/);
  });

  it('does not claim a cleanup happened when none was attempted', () => {
    expect(rejection().message).toMatch(/cleanup {4}not attempted/);
  });

  it('fails closed when the response carried no path at all', () => {
    // This spec asserted the opposite — that `null` is accepted, because a missing `path` is
    // "a different problem, already fatal downstream". It is fatal to the tests, which all
    // 404; it is not fatal to the leak, and the leak is what this guard is for. With `actual`
    // unknown, `reclaimMisplacedDataRoot` is never attempted, `afterAll` deletes the requested
    // path, that read 404s, and `deleteDataRoot` calls a 404 "already deleted". The workspace
    // survives the run and nothing says so — which is the vacuity this branch exists to remove,
    // sitting inside the guard written to remove it.
    let error: Error | null = null;
    try {
      assertUntruncated(requested, null);
    } catch (e) {
      error = e as Error;
    }

    expect(error, 'a response with no path must not be accepted as confirmation').not.toBeNull();
    expect(error?.message).toMatch(/did not report where it created the data root/);
    expect(error?.message).toMatch(/carried no usable `path`/);
    // It must not print "created null", and must not claim a reclaim it could not attempt.
    expect(error?.message).not.toMatch(/created {4}null/);
    expect(error?.message).toMatch(/Nothing could be reclaimed automatically/);
  });
});

describe('checkIntegrationPreconditions', () => {
  it('resolves silently when every precondition holds', async () => {
    useAllowedTarget();
    stubFetch({ status: 200 }, withDocuments(1));

    await expect(checkIntegrationPreconditions()).resolves.toBeUndefined();
  });

  it('reads the allowlist from the environment, since it accepts no options', async () => {
    // Stated as a spec because it is the guarantee the missing parameter buys: no spec in this
    // library can name a host for itself, so the in-test backstop enforces the same allowlist
    // the CLI does. The suites passed the previous opt-in as an option, all six of them, which
    // is how that guard came to have never fired.
    useUnlistedTarget();
    process.env['INTEGRATION_ALLOWED_HOSTS'] = 'nuxeo.test';
    stubFetch({ status: 200 }, withDocuments(1));

    await expect(checkIntegrationPreconditions()).resolves.toBeUndefined();
  });

  it('refuses from inside a spec too, not only from the CLI', async () => {
    // The backstop half: someone running vitest directly gets the same refusal, as a thrown
    // setup failure rather than exit 2, because vitest owns the exit code in a worker.
    useUnlistedTarget();
    stubFetch({ status: 200 }, withDocuments(1));

    const error = await rejection(checkIntegrationPreconditions());

    expect(error.message).toMatch(/not named in INTEGRATION_ALLOWED_HOSTS/);
  });

  it('throws a message that names the count, every problem and what was satisfied', async () => {
    useAllowedTarget();
    stubFetch(new Error('connect ECONNREFUSED'));

    const error = await rejection(checkIntegrationPreconditions());

    expect(error.message).toMatch(/integration-preflight: PRECONDITION NOT MET/);
    expect(error.message).toMatch(/1 problem\(s\)/);
    expect(error.message).toMatch(/^ {2}- Cannot reach Nuxeo/m);
    expect(error.message).toMatch(/Satisfied: nuxeo\.test is named in INTEGRATION_ALLOWED_HOSTS/);
  });

  it('omits the Satisfied line when nothing was satisfied', async () => {
    // The ternary, not the `.filter(Boolean)` beside it — checked by mutating both, and only
    // the ternary turns this red. Unguarded, `Satisfied: ${[].join('; ')}` prints a bare
    // "Satisfied:" with nothing after it, which reads as though something passed.
    // `.filter(Boolean)` only removes the blank lines those empty entries would leave.
    useUnlistedTarget();
    stubFetch(new Error('connect ECONNREFUSED'));

    const error = await rejection(checkIntegrationPreconditions());

    // One, not two: the allowlist miss returns before the reachability check, so the queued
    // ECONNREFUSED is never delivered. The subject of this spec is the omitted `Satisfied:`
    // line, and an unlisted host still satisfies nothing, so it remains exercised.
    expect(error.message).toMatch(/1 problem\(s\)/);
    expect(error.message).not.toMatch(/Satisfied:/);
  });
});
