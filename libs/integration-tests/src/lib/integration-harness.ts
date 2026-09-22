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

import { afterAll, beforeAll } from 'vitest';
import {
  checkIntegrationPreconditions,
  resolveConnection,
  type IntegrationTestConfig,
} from './integration-preflight';

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
  // Format: YYYYMMDD-HHMMSS-XXX (e.g., 20260921-143022-a3f)
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/T/, '-')
    .replace(/\..+/, '')
    .slice(0, 15); // YYYYMMDD-HHMMSS
  const random = Math.random().toString(36).slice(2, 5); // 3 chars
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
): Promise<unknown> {
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

  return res.json();
}
