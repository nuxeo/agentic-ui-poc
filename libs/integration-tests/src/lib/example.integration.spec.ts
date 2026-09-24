/**
 * Example integration test using the harness.
 *
 * Demonstrates the pattern:
 * 1. setupIntegrationHarness() at top level
 * 2. Tests create documents in harness.dataRoot
 * 3. Tests query real Nuxeo
 * 4. Cleanup happens automatically
 *
 * Run with: npm run beta:integration
 */

import { describe, it, expect } from 'vitest';
import { setupIntegrationHarness, createTestDocument, waitForIndexed } from './integration-harness';

describe('Integration Test Example', () => {
  // Set up harness - runs preflight checks, creates data root, registers cleanup
  const harness = setupIntegrationHarness();

  it('has a unique runId', () => {
    // Five base-36 characters from `randomInt`, not `Math.random().toString(36)`, and not the
    // hex the previous version used. The width is part of the contract rather than incidental:
    // the timestamp only resolves to the second, so the suffix is the whole of the isolation
    // between two runs started within the same one, and `it-` plus this run ID has to stay
    // inside Nuxeo's 24-character path segment. Both bounds are argued in `integration-harness.ts`.
    expect(harness.runId).toMatch(/^\d{8}-\d{6}-[0-9a-z]{5}$/);
    expect(`it-${harness.runId}`.length).toBeLessThanOrEqual(24);
    console.log(`[example] Running with runId: ${harness.runId}`);
  });

  it('has a data root under /default-domain/workspaces', () => {
    expect(harness.dataRoot).toBe(`/default-domain/workspaces/it-${harness.runId}`);
  });

  it('can create a document in the data root', async () => {
    const doc: any = await createTestDocument(harness, {
      type: 'File',
      name: 'test-invoice',
      title: 'Test Invoice',
      properties: {
        'dc:description': 'Created by integration test example',
      },
    });

    expect(doc).toBeDefined();
    expect(doc.uid).toBeDefined();
    expect(doc.title).toBe('Test Invoice');
    expect(doc.path).toContain(harness.runId);
    console.log(`[example] Created document: ${doc.path}`);
  });

  it('can query the created document via Nuxeo API', async () => {
    // Create a document first
    const created: any = await createTestDocument(harness, {
      type: 'File',
      name: 'queryable-doc',
      title: 'Queryable Document',
    });

    // `/search/lang/NXQL/execute` is OpenSearch-backed here and lags the write by about a
    // second, so this read-back used to fail with "expected [] to have a length of 1".
    // `waitForIndexed` queries by `ecm:uuid` alone — never by the predicate the assertion
    // is about, which is how the trash-exclusion test came to pass for the wrong reason.
    await waitForIndexed(harness, created.uid);

    // Query it back via NXQL
    const url = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
    url.searchParams.set(
      'query',
      `SELECT * FROM Document WHERE ecm:path STARTSWITH '${harness.dataRoot}' AND dc:title = 'Queryable Document'`,
    );
    url.searchParams.set('pageSize', '10');

    const res = await fetch(url, {
      headers: {
        Authorization: harness.auth,
        'X-NXproperties': '*',
      },
    });

    expect(res.status).toBe(200);

    const body: any = await res.json();
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].uid).toBe(created.uid);
    expect(body.entries[0].title).toBe('Queryable Document');

    console.log(`[example] Queried document: found ${body.entries.length} result(s)`);
  });

  it('isolates test data in its own workspace', async () => {
    // Verify the data root itself exists
    const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${harness.dataRoot}`, {
      headers: { Authorization: harness.auth },
    });

    expect(res.status).toBe(200);

    const workspace: any = await res.json();
    expect(workspace.type).toBe('Workspace');
    expect(workspace.path).toBe(harness.dataRoot);
    expect(workspace.title).toContain('Integration Test');

    console.log(`[example] Data root exists: ${workspace.path}`);
  });

  // No need for explicit cleanup - harness.cleanup() runs automatically in afterAll
});
