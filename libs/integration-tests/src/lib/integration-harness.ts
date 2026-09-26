/**
 * Integration test harness with per-run data root and guaranteed teardown.
 *
 * ## The fixture leak problem (from audit §4.6)
 *
 * Tests that create documents and don't clean them up pollute the repository for the next run.
 * Worse: presence assertions pass on leftover data, making a test report green when it tested
 * nothing.
 *
 * ## The solution (from audit §11 Stage 4)
 *
 * Each test run gets a unique workspace under `/default-domain/workspaces/it-<runid>`. The
 * harness creates it before tests, tears it down after (even on failure), and exports the path
 * for tests to use.
 *
 * Usage:
 * ```ts
 * import { setupIntegrationHarness } from '@agentic-ui/integration-tests';
 *
 * describe('my integration test', () => {
 *   const harness = setupIntegrationHarness();
 *
 *   it('creates a document', async () => {
 *     const doc = await createDocument(harness.dataRoot, { title: 'Test' });
 *     expect(doc.path).toContain(harness.runId);
 *   });
 *
 *   // harness.cleanup() runs automatically in afterAll
 * });
 * ```
 */

import { randomInt } from 'node:crypto';
import { afterAll, beforeAll } from 'vitest';
import {
  checkIntegrationPreconditions,
  resolveConnection,
  type IntegrationTestConfig,
} from './integration-preflight';

/**
 * Nuxeo's `PathSegmentServiceDefault` truncates a path segment at this many characters.
 * Measured against the local stack, 2026-09-24: a 35-character request came back as 24.
 */
const NUXEO_PATH_SEGMENT_MAX = 24;

/**
 * The one parent every data root of this suite is a direct child of.
 *
 * Named once rather than spelled inline, because `reclaimRefusal` compares against it and
 * `createDataRoot` POSTs to it: the check and the thing it checks must not be able to drift.
 */
const DATA_ROOT_PARENT = '/default-domain/workspaces';

/** `default-domain`, `workspaces`, `it-<runid>` — the exact depth of a data root. */
const RECLAIM_MIN_SEGMENTS = 3;

/**
 * The shortest workspace name a reclaim will act on: `it-` plus the 15-character timestamp.
 *
 * A truncated name is a prefix of the requested one, so what matters is how much survived. The
 * timestamp resolves to the second and is already this run's; the five random characters after
 * it only separate two runs that started in the same second. Losing the random suffix is
 * therefore tolerable for identification; losing part of the timestamp is not.
 */
const RECLAIM_MIN_NAME_LENGTH = 'it-'.length + 15;
/** Characters of random suffix that fit once `it-` and the timestamp have been spent. */
const RUN_SUFFIX_LENGTH = 5;
/** Base-36 over `RUN_SUFFIX_LENGTH` characters: 60,466,176 distinct suffixes. */
const RUN_SUFFIX_VALUES = 36 ** RUN_SUFFIX_LENGTH;

export interface IntegrationHarness {
  /** Unique ID for this test run (timestamp-based) */
  runId: string;
  /** Full Nuxeo path to the data root for this run: /default-domain/workspaces/it-<runid> */
  dataRoot: string;
  /** Nuxeo base URL */
  nuxeoUrl: string;
  /** Nuxeo username */
  user: string;
  /** Nuxeo password */
  password: string;
  /** Authorization header value */
  auth: string;
  /** Cleanup function (called automatically in afterAll) */
  cleanup: () => Promise<void>;
}

/**
 * Set up integration test harness with data root and guaranteed cleanup.
 *
 * Call this at the top level of a describe block. It returns a harness object that provides:
 * - Unique runId
 * - Data root path under /default-domain/workspaces/it-<runid>
 * - Nuxeo connection details
 * - Automatic cleanup in afterAll
 *
 * The harness runs precondition checks before tests and creates/destroys the data root.
 */
export function setupIntegrationHarness(config: IntegrationTestConfig = {}): IntegrationHarness {
  // Resolved once, and the *resolved* values are what the preflight checks below. The harness
  // used to resolve `NUXEO_URL` here and pass the raw `config` to the preflight, which read
  // only `config.nuxeoUrl` — so with `NUXEO_URL` set the preflight certified localhost while
  // the destructive calls went somewhere else. Credentials have no fallback; see
  // `resolveConnection`.
  const resolved = resolveConnection(config);
  const { nuxeoUrl, user, password } = resolved;
  const auth = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;

  // Generate unique run ID: timestamp + random suffix
  // Format: YYYYMMDD-HHMMSS-XXXXX (e.g., 20260921-143022-k3f9q)
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/T/, '-')
    .replace(/\..+/, '')
    .slice(0, 15); // YYYYMMDD-HHMMSS
  // A crypto source, not `Math.random`: SonarCloud reports the latter as `typescript:S2245`,
  // which is the only new-code security finding on this branch. The suffix is what keeps two
  // concurrent runs from sharing a data root, and a data root is the boundary every
  // destructive operation here is contained by, so a stronger source costs nothing and the
  // rule is right to ask.
  //
  // ## Why five base-36 characters, and not simply more bytes
  //
  // The suffix carries the *whole* of the isolation between two runs, because the timestamp
  // beside it only resolves to the second. Review was right that the previous `randomBytes(2)`
  // was too narrow at 65,536 values, and a collision does not fail loudly: both runs compute
  // the same `dataRoot`, so whichever reaches `afterAll` first deletes the other's workspace
  // mid-run — the exact isolation guarantee this harness exists to provide.
  //
  // The obvious repair, a 16-character hex suffix, is worse than the defect. Nuxeo's
  // `PathSegmentServiceDefault` truncates a path segment at **24 characters**, and `it-` plus
  // a 15-character timestamp already spends 19 of them. Measured against the local stack on
  // 2026-09-24: requesting `it-20260924-112334-3207ed6420ab7921` created
  // `it-20260924-112334-3207e`. So the widening would have cut the effective randomness to the
  // five surviving characters *anyway*, and — far worse — left `dataRoot` pointing at a path
  // the server does not have, so every read 404s and `deleteDataRoot` takes its
  // "already deleted or never created" branch and returns green while the workspace stays on
  // the server forever. One run of that during review leaked exactly one workspace.
  //
  // Five characters is therefore the budget, and base 36 rather than hex is what buys the most
  // inside it: 36^5 = 60,466,176 values against hex's 1,048,576, and 922x the 65,536 objected
  // to. `randomInt` is uniform over the range, so there is no modulo bias to argue about.
  //
  // `assertUntruncated` below is what keeps this honest. The budget is exact — 24 of 24 — so a
  // comment alone would be one careless edit away from silently leaking again.
  const random = randomInt(RUN_SUFFIX_VALUES).toString(36).padStart(RUN_SUFFIX_LENGTH, '0');
  const runId = `${timestamp}-${random}`;

  const dataRoot = `${DATA_ROOT_PARENT}/it-${runId}`;

  /**
   * What this run knows about the data root, which decides whether teardown may touch the
   * server at all.
   *
   * `afterAll` runs even when `beforeAll` rejected, and teardown used to delete unconditionally.
   * Against a host the preflight had just REFUSED, that sent `Authorization: Basic` to it
   * anyway — the same credential disclosure the allowlist exists to prevent, reached one hook
   * later. Reproduced before this was written: with the host unlisted, the refusal was printed
   * and `deleteDataRoot` still logged `Data root … not found`, a line it can only reach after
   * issuing an authenticated GET.
   *
   * Two flags, not one, because "no root exists" and "a root might exist" need different
   * answers. Skipping silently is right for the first and is exactly the silent-success shape
   * that made cleanup untrustworthy for the second.
   */
  const state = { creationAttempted: false, ownsDataRoot: false };

  const harness: IntegrationHarness = {
    runId,
    dataRoot,
    nuxeoUrl,
    user,
    password,
    auth,
    cleanup: async () => {
      await teardownDataRoot(state, nuxeoUrl, auth, dataRoot, runId);
    },
  };

  // Run preconditions and setup before all tests
  beforeAll(async () => {
    await checkIntegrationPreconditions(resolved);
    // Set BEFORE the call, not after: from here on a workspace may exist on the server even if
    // the call rejects — `createDataRoot` can POST successfully and then throw on
    // `assertUntruncated`. Teardown must know the difference between that and never having
    // asked.
    state.creationAttempted = true;
    await createDataRoot(nuxeoUrl, auth, dataRoot, runId);
    state.ownsDataRoot = true;
  }, 30000); // 30s timeout for setup

  // Guaranteed cleanup after all tests
  afterAll(async () => {
    await harness.cleanup();
  }, 30000); // 30s timeout for cleanup

  return harness;
}

/**
 * Fail loudly when Nuxeo did not create the workspace at the path this harness computed.
 *
 * The run ID's random suffix is sized to spend exactly `NUXEO_PATH_SEGMENT_MAX` characters, so
 * there is no slack: widen the suffix, lengthen the `it-` prefix, or point the suite at a
 * deployment that configures `PathSegmentServiceDefault` lower, and the name is silently
 * truncated. Nothing about that is noisy on its own. The POST still answers 2xx, `dataRoot`
 * still holds the untruncated path, every subsequent read 404s, and `deleteDataRoot` reads the
 * 404 as "already deleted or never created" and returns *successfully* — so the run reports
 * green while its workspace stays on the server for good.
 *
 * That is the same shape as the defects this branch exists to remove: a check whose failure
 * path is indistinguishable from its success path. Hence a comparison against the server's own
 * answer rather than a comment asking the next person to be careful.
 */
export function assertUntruncated(
  expected: string,
  actual: string | null,
  reclaimed: string | null = null,
): void {
  if (actual === expected) return;
  const name = expected.split('/').pop() ?? expected;

  // A response that carried no usable `path` fails CLOSED, and used to return here as though
  // it had confirmed something.
  //
  // The reasoning it replaces was that a missing `path` is "a different problem, already fatal
  // downstream". Fatal to the *tests*, yes — every read 404s. But this guard is not here to make
  // tests fail, it is here to stop the workspace being left behind, and on this path it did not:
  // `reclaimMisplacedDataRoot` is only attempted when `actual` is known, `afterAll` deletes the
  // *requested* path, that read 404s, and `deleteDataRoot` reads the 404 as "already deleted".
  // Green run, workspace still on the server — the exact leak described above, reached by the
  // one route the guard waved through.
  //
  // Nor is stopping a guess. Nuxeo's create response does carry `path` (verified against the
  // running server: `/default-domain/workspaces/<name>`), so `null` means the API shape changed
  // or the answer was not understood — which is precisely when a containment check must not
  // assume containment.
  if (actual === null) {
    throw new Error(
      `Nuxeo did not report where it created the data root:\n` +
        `    requested  ${expected}\n` +
        `    created    unknown — the creation response carried no usable \`path\`\n\n` +
        `  Containment cannot be confirmed, so this fails closed rather than assuming the\n` +
        `  workspace landed where it was asked for. If it did not, every read of the requested\n` +
        `  path 404s and cleanup reads that 404 as "already deleted", so the run would go green\n` +
        `  and leave the workspace on the server for good.\n\n` +
        `  Nothing could be reclaimed automatically, because the server did not say where to\n` +
        `  look. Check for a stray workspace near "${name}" by hand.`,
    );
  }

  throw new Error(
    `Nuxeo created the data root at a different path than requested:\n` +
      `    requested  ${expected}\n` +
      `    created    ${actual}\n` +
      `    cleanup    ${reclaimed ?? 'not attempted'}\n\n` +
      `  Almost certainly path-segment truncation: Nuxeo's PathSegmentServiceDefault caps a\n` +
      `  segment at ${NUXEO_PATH_SEGMENT_MAX} characters and "${name}" is ${name.length}.\n` +
      `  Left undetected this does not fail — it leaks. Every read of the requested path 404s,\n` +
      `  and cleanup reads that 404 as "already deleted", so the run goes green and the\n` +
      `  workspace stays on the server. Shorten the run ID rather than raising this limit.`,
  );
}

/** What a run knows about its data root by the time teardown is reached. */
export interface DataRootOwnership {
  /** Whether `createDataRoot` was called at all, so a workspace may exist on the server. */
  creationAttempted: boolean;
  /** Whether it completed, so this run owns the workspace and may delete it. */
  ownsDataRoot: boolean;
}

/**
 * Tear down the data root, but only if this run created it.
 *
 * Exported for the unit tests, which assert at the **network** level — with `fetch` stubbed —
 * that a run which never created a root issues no request. The exit code could not have caught
 * the defect this replaces: the run already failed, it simply contacted the refused host on the
 * way out.
 *
 * Three cases, and the middle one is the reason this is not a single boolean:
 *
 *  - **owns it** — delete and verify, exactly as before.
 *  - **tried and did not finish** — a workspace may be on the server and this run cannot prove
 *    it owns the path, so it is NOT deleted. Reported at `console.error` naming the path,
 *    because a leak that nothing mentions is the failure mode this whole harness is about.
 *  - **never tried** — nothing can exist, and the host may be one the preflight refused, so
 *    nothing is sent and nothing is claimed. Noted at `console.log`, not `error`: this is the
 *    ordinary shape of a run that stopped on its preconditions, and crying leak here would
 *    train the reader to ignore the case above.
 */
export async function teardownDataRoot(
  state: DataRootOwnership,
  nuxeoUrl: string,
  auth: string,
  dataRoot: string,
  runId: string,
): Promise<void> {
  if (state.ownsDataRoot) {
    await deleteDataRoot(nuxeoUrl, auth, dataRoot, runId);
    return;
  }

  if (state.creationAttempted) {
    console.error(
      `[integration-harness] NOT deleting ${dataRoot} (run ${runId}): creation did not\n` +
        `  complete, so this run cannot prove the workspace at that path is its own. A\n` +
        `  workspace MAY exist there. Check it and remove it by hand — deleting a path this\n` +
        `  run does not own is the one mistake here that cannot be undone.`,
    );
    return;
  }

  console.log(
    `[integration-harness] Skipping teardown of ${dataRoot}: it was never created, so there\n` +
      `  is nothing to remove and no request is sent. A preflight refusal lands here, and the\n` +
      `  refused host must not be contacted by the teardown of the run it refused.`,
  );
}

/**
 * Why the path Nuxeo reported must NOT be deleted, or `null` if it may be.
 *
 * This function is the whole of the safety argument for the recursive DELETE below, so it is
 * exported and unit-tested against hand-built malformed responses rather than trusted.
 *
 * Until review caught it, `reclaimMisplacedDataRoot` deleted whatever path the creation
 * response reported, unchecked. Nothing but Nuxeo behaving well stood between a malformed or
 * unexpected `path` and `DELETE /nuxeo/api/v1/path/default-domain/workspaces` — recursive, and
 * against the tree every worktree on this machine shares, including other runs' live data
 * roots. The exposure needed an unusual response rather than an ordinary one, which is a reason
 * to check calmly, not a reason to leave it.
 *
 * Three independent conditions, each of which alone rules out the catastrophic case:
 *
 *  1. **Parent** — the path is a direct child of `DATA_ROOT_PARENT`. This alone rejects the
 *     workspace root, `/default-domain`, and `/`.
 *  2. **Depth floor** — at least `RECLAIM_MIN_SEGMENTS` segments, and no `.` or `..` among
 *     them. Without the traversal check, `…/workspaces/it-<runid>/../..` satisfies both the
 *     parent and marker tests and resolves to the repository root.
 *  3. **Marker** — the final segment is what the server made of the name *this run* asked for.
 *
 * The marker is a **prefix** relationship, not `includes(runId)`, and that is not a loosening:
 * truncation is the entire reason this function exists, and truncation cuts the run id. A
 * requested `it-20260924-112334-3207ed6420ab7921` was created as `it-20260924-112334-3207e`, so
 * a containment test on the full id would refuse every legitimate reclaim there is. What is
 * verifiable is that the created name is a leading substring of the requested one, and that
 * enough of it survived to still be this run's: `RECLAIM_MIN_NAME_LENGTH` keeps the whole
 * timestamp, which is already unique to the second. A name cut shorter than that is a
 * misconfigured deployment, and refusing is the right answer to it.
 */
export function reclaimRefusal(actual: string, runId: string): string | null {
  const path = actual.replace(/\/+$/, '');
  const segments = path.split('/').filter((segment) => segment !== '');

  if (!path.startsWith(`${DATA_ROOT_PARENT}/`)) {
    return `it is not under ${DATA_ROOT_PARENT}`;
  }
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    return 'it contains a relative segment, so the path it names is not the path it reads as';
  }
  if (segments.length < RECLAIM_MIN_SEGMENTS) {
    return `it has ${segments.length} segment(s), fewer than the ${RECLAIM_MIN_SEGMENTS} a data root has`;
  }
  if (segments.length > RECLAIM_MIN_SEGMENTS) {
    return `it is nested below a data root (${segments.length} segments), so it is not one`;
  }

  const requestedName = `it-${runId}`;
  const actualName = segments[segments.length - 1];
  if (!requestedName.startsWith(actualName)) {
    return `its name "${actualName}" is not what this run asked for ("${requestedName}")`;
  }
  if (actualName.length < RECLAIM_MIN_NAME_LENGTH) {
    return (
      `its name "${actualName}" is shorter than ${RECLAIM_MIN_NAME_LENGTH} characters, so too ` +
      `little of this run's id survived to identify it`
    );
  }
  return null;
}

/**
 * Delete a workspace Nuxeo created somewhere other than where we asked, and say what happened.
 *
 * Throwing on the mismatch without this leaves the leak in place and merely makes it audible:
 * `afterAll` deletes `dataRoot`, that read 404s because the workspace is at `actual`, and
 * `deleteDataRoot` reads the 404 as "already deleted or never created" and returns
 * successfully. The stray workspace then outlives the run exactly as it did before the guard
 * existed. Review caught that, and it is the same mistake one level up from the one the guard
 * was added for.
 *
 * Validated by `reclaimRefusal` before anything is sent. A refusal returns without issuing the
 * DELETE and names the path loudly: the caller embeds this string in the `assertUntruncated`
 * failure, so the run stops as a precondition failure with the stray path on the screen for a
 * human to deal with. Deleting an unverified path is the one outcome that cannot be undone, so
 * it is the one this function will not reach for.
 *
 * Best effort otherwise, and it reports rather than throws: the caller is already about to
 * fail with a better message, and a cleanup error thrown from here would replace the
 * explanation of *why* the run is failing with an explanation of a secondary symptom. The
 * outcome string is quoted in that message so an unremoved workspace is never silent.
 *
 * @returns a human-readable outcome for the failure message
 */
export async function reclaimMisplacedDataRoot(
  nuxeoUrl: string,
  auth: string,
  actual: string,
  runId: string,
): Promise<string> {
  const refusal = reclaimRefusal(actual, runId);
  if (refusal !== null) {
    return (
      `REFUSED to delete ${actual} — ${refusal}.\n` +
      `    Nothing was sent. This is a recursive DELETE against the tree every run on this\n` +
      `    machine shares, so an unverified path is not deleted on the strength of the server\n` +
      `    having reported it. Inspect ${actual} by hand and remove it if it is this run's.`
    );
  }

  const url = `${nuxeoUrl}/nuxeo/api/v1/path${actual}`;
  try {
    const del = await fetch(url, { method: 'DELETE', headers: { Authorization: auth } });
    if (!del.ok && del.status !== 404) {
      return `FAILED — DELETE ${actual} answered ${del.status}; remove it by hand`;
    }
    // Same reasoning as `deleteDataRoot`: a 2xx is Nuxeo accepting the call, not evidence.
    const confirm = await fetch(url, { headers: { Authorization: auth } });
    return confirm.status === 404
      ? `removed ${actual} (confirmed absent)`
      : `FAILED — ${actual} still readable after DELETE (HTTP ${confirm.status}); remove it by hand`;
  } catch (error) {
    return `FAILED — ${error instanceof Error ? error.message : String(error)}; remove ${actual} by hand`;
  }
}

/**
 * Create the data root workspace for this test run.
 */
async function createDataRoot(
  nuxeoUrl: string,
  auth: string,
  dataRoot: string,
  runId: string,
): Promise<void> {
  try {
    const res = await fetch(`${nuxeoUrl}/nuxeo/api/v1/path${DATA_ROOT_PARENT}`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'entity-type': 'document',
        type: 'Workspace',
        name: `it-${runId}`,
        properties: {
          'dc:title': `Integration Test ${runId}`,
          'dc:description': 'Temporary workspace for integration tests. Auto-deleted after run.',
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Failed to create data root ${dataRoot}: ${res.status} ${res.statusText}\n${body}`,
      );
    }

    // The server's own answer for where it put the workspace, compared against where this
    // harness is about to tell every test and every DELETE to look. See `assertUntruncated`.
    const created = (await res.json()) as { path?: unknown };
    const actual = typeof created.path === 'string' ? created.path : null;

    // Throwing alone would fail loudly and still leak: `dataRoot` is what `afterAll` deletes,
    // that read 404s, and `deleteDataRoot` treats a 404 as "already deleted". So the workspace
    // the server really made has to be removed here, while its path is still in hand.
    const reclaimed =
      actual !== null && actual !== dataRoot
        ? await reclaimMisplacedDataRoot(nuxeoUrl, auth, actual, runId)
        : null;

    assertUntruncated(dataRoot, actual, reclaimed);

    console.log(`[integration-harness] Created data root: ${dataRoot}`);
  } catch (error) {
    throw new Error(
      `Failed to create integration test data root:\n` +
        `  ${error instanceof Error ? error.message : String(error)}\n\n` +
        `  This prevents the test run. Fix Nuxeo connectivity or permissions.`,
    );
  }
}

/**
 * Delete the data root workspace and all its contents, and **verify it is gone**.
 *
 * Every path through the previous version was a `console.warn`: a 404 on the pre-delete read
 * returned early, a non-OK read continued, a failed `DELETE` warned, and the whole body sat
 * inside a `try`/`catch` that warned and returned. So `afterAll` always resolved, and a run
 * that leaked its workspace onto a shared instance reported green — while a status document
 * recorded "Test creates documents -> none remain (cleanup confirmed)".
 *
 * Fixture leakage is the problem this harness exists to prevent, and it compounds: the next
 * run's presence assertions can pass on the leftovers. A cleanup failure is therefore the
 * loudest thing in the file, not the quietest. The re-read afterwards is the part that makes
 * it a verification rather than a request — a `DELETE` answering 2xx is Nuxeo accepting the
 * call, not evidence the workspace is gone.
 */
export async function deleteDataRoot(
  nuxeoUrl: string,
  auth: string,
  dataRoot: string,
  runId: string,
): Promise<void> {
  const url = `${nuxeoUrl}/nuxeo/api/v1/path${dataRoot}`;
  const leaked = (detail: string) =>
    new Error(
      `[integration-harness] Cleanup of ${dataRoot} (run ${runId}) failed: ${detail}\n` +
        `  The workspace may still be on ${nuxeoUrl}. Delete it before the next run: a later\n` +
        `  presence assertion can pass on these leftovers, which is the failure this harness\n` +
        `  exists to prevent.`,
    );

  const getRes = await fetch(url, { headers: { Authorization: auth } });

  // Nothing to delete. The usual cause is a `beforeAll` that failed before creating it.
  if (getRes.status === 404) {
    console.log(
      `[integration-harness] Data root ${dataRoot} not found (already deleted or never created)`,
    );
    return;
  }
  if (!getRes.ok) {
    throw leaked(`could not read it back before deleting (HTTP ${getRes.status})`);
  }

  const deleteRes = await fetch(url, { method: 'DELETE', headers: { Authorization: auth } });
  if (!deleteRes.ok && deleteRes.status !== 404) {
    throw leaked(`DELETE answered ${deleteRes.status}\n  ${await deleteRes.text()}`);
  }

  // The verification. Nuxeo answering the DELETE is not the same as the workspace being gone.
  const confirmRes = await fetch(url, { headers: { Authorization: auth } });
  if (confirmRes.status !== 404) {
    throw leaked(`it is still readable after the DELETE (HTTP ${confirmRes.status})`);
  }

  console.log(`[integration-harness] Deleted data root: ${dataRoot} (confirmed absent)`);
}

/**
 * Block until a document is visible to `/search/lang/NXQL/execute`, or throw.
 *
 * A `waitForDeindexed` mirror of this used to sit below, added so that a
 * count-outside-the-data-root isolation test could take its second count against a current
 * index. That test has been replaced: counting a population other suites also write to was
 * unstable regardless of how current the index was, and the check now reads a canary by UID
 * straight from the repository, where there is no lag to wait out. Nothing called the mirror
 * afterwards, so it is gone rather than left as an exported helper with no caller and no test.
 *
 * `/search/lang/NXQL/execute` is OpenSearch-backed on this deployment and lags a write by
 * roughly a second. Every index-backed read-back in this library is exposed to that, and the
 * two failure modes are not equally visible: a test asserting the document is **present**
 * fails honestly, while a test asserting it is **absent** passes for a reason that has nothing
 * to do with what it claims. The trash-exclusion test above was the second kind — it asserted
 * `AND ecm:isTrashed = 0` excluded a just-trashed document, and stayed green with the
 * predicate deleted, because at that moment the document was not in the index either way.
 *
 * So the wait deliberately queries by `ecm:uuid` **alone**. Adding any lifecycle predicate
 * would reintroduce the problem: the wait would return once the document matched the same
 * filter the assertion is about, and the assertion would again be testing nothing.
 *
 * A direct `/nuxeo/api/v1/id/:uid` read does not need this — it goes to the repository, not
 * the index, which is why the seven genuine write-operation tests here do not use it.
 */
export async function waitForIndexed(
  harness: IntegrationHarness,
  uid: string,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const intervalMs = options.intervalMs ?? 250;
  const deadline = Date.now() + timeoutMs;

  const url = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
  url.searchParams.set('query', `SELECT * FROM Document WHERE ecm:uuid = '${uid}'`);

  let lastStatus = 0;
  while (Date.now() < deadline) {
    const res = await fetch(url, { headers: { Authorization: harness.auth } });
    lastStatus = res.status;
    if (res.status === 200) {
      const body = await res.json();
      if ((body.entries ?? []).some((entry: { uid?: string }) => entry.uid === uid)) return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `waitForIndexed: ${uid} did not appear in the search index within ${timeoutMs}ms ` +
      `(last HTTP ${lastStatus}).\n` +
      `  This is a precondition failure, not the assertion under test — an absence assertion\n` +
      `  that ran anyway would have passed for the wrong reason.`,
  );
}

/**
 * The fields of Nuxeo's document entity that the fixtures here actually read.
 *
 * `createTestDocument` returned `unknown`, so every call site widened it to `any` to reach
 * `uid` — and a test that reads `uid` off `any` cannot be told by the typechecker that the
 * creation returned an error body instead. Narrow, not exhaustive: add a field when a test
 * needs it.
 */
export interface CreatedTestDocument {
  uid: string;
  path: string;
  type: string;
  title?: string;
  properties?: Record<string, unknown>;
}

/**
 * Block until a document matches an arbitrary NXQL query, or throw.
 *
 * `waitForIndexed` deliberately queries by `ecm:uuid` alone, because a wait that shares the
 * assertion's own filter makes the assertion test nothing. This one exists for the cases
 * where the *precondition* is a property other than existence — a tag, for instance, which
 * `Services.TagDocument` writes through a relation the index picks up separately from the
 * document itself, so `waitForIndexed` returning is not evidence the tag is searchable.
 *
 * The caller owns the distinction: pass a query that establishes the precondition, never the
 * one the test is about. The `what` argument is quoted in the failure so a timeout reads as
 * the precondition it is rather than as the assertion.
 */
export async function waitForNxqlMatch(
  harness: IntegrationHarness,
  nxql: string,
  uid: string,
  what: string,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const intervalMs = options.intervalMs ?? 250;
  const deadline = Date.now() + timeoutMs;

  const url = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
  url.searchParams.set('query', nxql);
  url.searchParams.set('pageSize', '100');

  let lastStatus = 0;
  while (Date.now() < deadline) {
    const res = await fetch(url, { headers: { Authorization: harness.auth } });
    lastStatus = res.status;
    if (res.status === 200) {
      const body = await res.json();
      if ((body.entries ?? []).some((entry: { uid?: string }) => entry.uid === uid)) return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `waitForNxqlMatch: ${uid} did not satisfy "${what}" within ${timeoutMs}ms ` +
      `(last HTTP ${lastStatus}).\n  Query: ${nxql}\n` +
      `  This is a precondition failure, not the assertion under test.`,
  );
}

/**
 * Apply a Nuxeo tag to a document, and throw if the server refused.
 *
 * Tags are not `dc:subjects`. `SearchService.search({ tag })` sets the `ecm_tags` page-provider
 * parameter, which filters on the tag *relation* — so a test that writes `dc:subjects` and then
 * filters by `tag` is filtering on something it never set, and gets an empty result it cannot
 * tell apart from a broken filter. That is exactly how the tag-filter test here came to pass
 * while proving nothing.
 *
 * `Services.TagDocument` is the automation operation, not `/@tag`: the tag adapter is not
 * exposed on this deployment (`GET /api/v1/id/<uid>/@tag` answers HTTP 404 "Service tag not
 * found"), measured 2026-09-23.
 */
export async function tagDocument(
  harness: IntegrationHarness,
  uid: string,
  label: string,
): Promise<void> {
  const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${uid}/@op/Services.TagDocument`, {
    method: 'POST',
    headers: {
      Authorization: harness.auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ params: { tags: label }, input: `doc:${uid}` }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to tag ${uid} with '${label}': ${res.status} ${res.statusText}\n${await res.text()}`,
    );
  }
}

/**
 * Helper: Create a document in the test's data root.
 *
 * Convenience wrapper that ensures documents are created in the right place.
 */
export async function createTestDocument(
  harness: IntegrationHarness,
  doc: {
    type: string;
    name: string;
    title?: string;
    properties?: Record<string, unknown>;
  },
): Promise<CreatedTestDocument> {
  const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${harness.dataRoot}`, {
    method: 'POST',
    headers: {
      Authorization: harness.auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'entity-type': 'document',
      type: doc.type,
      name: doc.name,
      properties: {
        'dc:title': doc.title ?? doc.name,
        ...(doc.properties ?? {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create test document: ${res.status} ${res.statusText}\n${body}`);
  }

  return (await res.json()) as CreatedTestDocument;
}
