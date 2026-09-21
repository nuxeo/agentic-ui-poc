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
import { checkIntegrationPreconditions, type IntegrationTestConfig } from './integration-preflight';

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
  const nuxeoUrl = config.nuxeoUrl ?? process.env['NUXEO_URL'] ?? 'http://localhost:8080';
  const user = config.user ?? process.env['NUXEO_USER'] ?? 'Administrator';
  const password = config.password ?? process.env['NUXEO_PASS'] ?? 'Administrator';
  const auth = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;

  // Generate unique run ID: timestamp + random suffix
  // Format: YYYYMMDD-HHMMSS-XXX (e.g., 20260921-143022-a3f)
  const now = new Date();
  const timestamp = now.toISOString()
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
    await checkIntegrationPreconditions(config);
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
        'Authorization': auth,
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
 * Delete the data root workspace and all its contents.
 * Guaranteed to run even if tests fail.
 */
async function deleteDataRoot(
  nuxeoUrl: string,
  auth: string,
  dataRoot: string,
  runId: string,
): Promise<void> {
  try {
    // First, verify the data root exists and is ours (safety check)
    const getRes = await fetch(`${nuxeoUrl}/nuxeo/api/v1/path${dataRoot}`, {
      headers: { Authorization: auth },
    });

    if (getRes.status === 404) {
      console.log(`[integration-harness] Data root ${dataRoot} not found (already deleted or never created)`);
      return;
    }

    if (!getRes.ok) {
      console.warn(`[integration-harness] Could not verify data root before deletion: ${getRes.status}`);
      // Continue anyway - better to try deletion than leave garbage
    }

    // Delete the workspace (and all its children)
    const deleteRes = await fetch(`${nuxeoUrl}/nuxeo/api/v1/path${dataRoot}`, {
      method: 'DELETE',
      headers: { Authorization: auth },
    });

    if (deleteRes.ok) {
      console.log(`[integration-harness] Deleted data root: ${dataRoot}`);
    } else if (deleteRes.status === 404) {
      console.log(`[integration-harness] Data root ${dataRoot} not found (already deleted)`);
    } else {
      const body = await deleteRes.text();
      console.warn(
        `[integration-harness] Failed to delete data root ${dataRoot}: ${deleteRes.status}\n${body}\n` +
        `  This may leave test fixtures in the repository. Clean up manually if needed.`,
      );
    }
  } catch (error) {
    // Log but don't throw - cleanup failures shouldn't fail the test run
    console.warn(
      `[integration-harness] Error during cleanup of ${dataRoot}:\n` +
      `  ${error instanceof Error ? error.message : String(error)}\n` +
      `  Test fixtures may remain in the repository.`,
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
): Promise<unknown> {
  const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${harness.dataRoot}`, {
    method: 'POST',
    headers: {
      'Authorization': harness.auth,
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
