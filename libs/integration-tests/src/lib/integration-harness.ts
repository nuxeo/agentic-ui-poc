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

  const dataRoot = `/default-domain/workspaces/it-${runId}`;

  const harness: IntegrationHarness = {
    runId,
    dataRoot,
    nuxeoUrl,
    user,
    password,
    auth,
    cleanup: async () => {
      await deleteDataRoot(nuxeoUrl, auth, dataRoot, runId);
    },
  };

  // Run preconditions and setup before all tests
  beforeAll(async () => {
    await checkIntegrationPreconditions(resolved);
    await createDataRoot(nuxeoUrl, auth, dataRoot, runId);
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
export function assertUntruncated(expected: string, actual: string | null): void {
  if (actual === null || actual === expected) return;
  const name = expected.split('/').pop() ?? expected;
  throw new Error(
    `Nuxeo created the data root at a different path than requested:\n` +
      `    requested  ${expected}\n` +
      `    created    ${actual}\n\n` +
      `  Almost certainly path-segment truncation: Nuxeo's PathSegmentServiceDefault caps a\n` +
      `  segment at ${NUXEO_PATH_SEGMENT_MAX} characters and "${name}" is ${name.length}.\n` +
      `  Left alone this does not fail — it leaks. Every read of the requested path 404s, and\n` +
      `  cleanup reads that 404 as "already deleted", so the run goes green and the workspace\n` +
      `  stays on the server. Shorten the run ID rather than raising this limit.`,
  );
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
    const res = await fetch(`${nuxeoUrl}/nuxeo/api/v1/path/default-domain/workspaces`, {
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
    assertUntruncated(dataRoot, typeof created.path === 'string' ? created.path : null);

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
async function deleteDataRoot(
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
