/**
 * Write operations and destructive actions integration tests.
 *
 * Stage 6 of the integration-test plan: Write paths and destructive operations.
 * Tests operations that modify or destroy repository data.
 *
 * Tests:
 * - Trash document
 * - Restore trashed document
 * - Permanent delete
 * - Bulk operations
 * - Update operations
 *
 * Acceptance criteria (from audit §11 Stage 6):
 * - Every operation verified by follow-up API query (not UI assertion)
 * - Each operation creates its own fixture and tears it down
 * - Destructive operations isolated in data root (cleanup verified)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupIntegrationHarness, createTestDocument, waitForIndexed } from './integration-harness';

describe('Write Operations Integration Tests', () => {
  const harness = setupIntegrationHarness();

  describe('Trash Operations', () => {
    it('can trash a document', async () => {
      // Create a document to trash
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-to-trash',
        title: 'Document to Trash',
      });

      expect(doc.uid).toBeDefined();
      expect(doc.isTrashed).toBeFalsy(); // Initially not trashed

      // Trash the document via Document.Trash automation
      const trashRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Trash`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
        }),
      });

      expect(trashRes.status).toBe(200);

      // Verify document is trashed via follow-up API query
      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { Authorization: harness.auth },
      });

      expect(verifyRes.status).toBe(200);
      const trashedDoc = await verifyRes.json();
      expect(trashedDoc.isTrashed).toBe(true);

      console.log(`[write-ops] Trashed document: ${doc.uid}`);
    });

    it('trashed documents do not appear in regular queries', async () => {
      // Create and trash a document
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'excluded-when-trashed',
        title: 'Should Not Appear',
      });

      // Trash it via Document.Trash automation, and read the response — an ignored 500 here
      // would leave the document untrashed and the assertion below would then be the only
      // thing standing between that and a green run.
      const trashRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Trash`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
        }),
      });
      expect(trashRes.status).toBe(200);

      // The document must be IN the index before absence means anything.
      //
      // Without this the test asserted index lag rather than trash semantics: the query ran
      // roughly 100ms after the write, the document was not indexed either way, and the
      // `AND ecm:isTrashed = 0` predicate contributed nothing. Verified by deleting the
      // predicate and running the sequence in-process five times — it stayed green 5/5,
      // while the same query after a settle found the document 5/5. It cannot be reproduced
      // with sequential curl calls; the inter-process latency exceeds the index window.
      //
      // `waitForIndexed` queries by uuid only, deliberately carrying no lifecycle predicate,
      // so what it waits for is not what the assertion is about.
      await waitForIndexed(harness, doc.uid);

      // Query for non-trashed documents in our data root
      const queryUrl = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
      queryUrl.searchParams.set(
        'query',
        `SELECT * FROM Document WHERE ecm:path STARTSWITH '${harness.dataRoot}' AND ecm:isTrashed = 0`,
      );

      const queryRes = await fetch(queryUrl, {
        headers: { Authorization: harness.auth },
      });

      expect(queryRes.status).toBe(200);
      const results: any = await queryRes.json();

      // Trashed document should not appear
      const found = results.entries?.find((d: any) => d.uid === doc.uid);
      expect(found).toBeUndefined();

      // And the index really is answering this query, rather than answering nothing. Without
      // it, an index that had dropped the whole data root would satisfy the line above.
      const unfilteredUrl = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
      unfilteredUrl.searchParams.set(
        'query',
        `SELECT * FROM Document WHERE ecm:path STARTSWITH '${harness.dataRoot}'`,
      );
      const unfilteredRes = await fetch(unfilteredUrl, {
        headers: { Authorization: harness.auth },
      });
      expect(unfilteredRes.status).toBe(200);
      const unfiltered: any = await unfilteredRes.json();
      expect(unfiltered.entries?.find((d: any) => d.uid === doc.uid)).toBeDefined();

      console.log(
        `[write-ops] Trashed ${doc.uid} is in the index and visible without the predicate, ` +
          `absent with it — the predicate is the only variable`,
      );
    });

    it('can restore a trashed document', async () => {
      // Create and trash a document
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-to-restore',
        title: 'Document to Restore',
      });

      // Trash it via Document.Trash automation
      await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Trash`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
        }),
      });

      // Verify it's trashed
      let verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { Authorization: harness.auth },
      });
      let state: any = await verifyRes.json();
      expect(state.isTrashed).toBe(true);

      // Restore it via Document.Untrash automation
      const restoreRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Untrash`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `doc:${doc.uid}`,
          }),
        },
      );

      expect(restoreRes.status).toBe(200);

      // Verify via follow-up query
      verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { Authorization: harness.auth },
      });

      state = await verifyRes.json();
      expect(state.isTrashed).toBe(false);

      console.log(`[write-ops] Restored document: ${doc.uid}`);
    });
  });

  describe('Permanent Delete', () => {
    it('can permanently delete a document', async () => {
      // Create a document to delete
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-to-delete',
        title: 'Document to Delete Permanently',
      });

      expect(doc.uid).toBeDefined();

      // Permanently delete via DELETE
      const deleteUrl = `${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`;
      const deleteRes = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { Authorization: harness.auth },
      });

      expect(deleteRes.status).toBe(204); // No Content

      // Verify via follow-up query - should get 404
      const verifyRes = await fetch(deleteUrl, {
        headers: { Authorization: harness.auth },
      });

      expect(verifyRes.status).toBe(404);

      console.log(`[write-ops] Permanently deleted document: ${doc.uid}`);
    });

    it('delete is truly permanent - document cannot be restored', async () => {
      // Create and delete
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'gone-forever',
        title: 'Cannot Be Restored',
      });

      await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'DELETE',
        headers: { Authorization: harness.auth },
      });

      // Try to restore (should fail)
      const restoreRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'PUT',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'document',
          isTrashed: false,
        }),
      });

      expect(restoreRes.status).toBe(404); // Cannot restore deleted document

      console.log(`[write-ops] Verified permanent delete is irreversible`);
    });
  });

  describe('Update Operations', () => {
    it('can update document properties', async () => {
      // Create a document
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-to-update',
        title: 'Original Title',
        properties: {
          'dc:description': 'Original description',
        },
      });

      // Update via PUT
      const updateRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'PUT',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'document',
          properties: {
            'dc:title': 'Updated Title',
            'dc:description': 'Updated description',
          },
        }),
      });

      expect(updateRes.status).toBe(200);

      // Verify via follow-up query
      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { Authorization: harness.auth, 'X-NXproperties': '*' },
      });

      const updated: any = await verifyRes.json();
      expect(updated.title).toBe('Updated Title');
      expect(updated.properties['dc:description']).toBe('Updated description');

      console.log(`[write-ops] Updated document properties: ${doc.uid}`);
    });

    it('can move a document to a different location', async () => {
      // Create source and target folders
      const sourceFolder: any = await createTestDocument(harness, {
        type: 'Folder',
        name: 'source-folder',
        title: 'Source Folder',
      });

      const targetFolder: any = await createTestDocument(harness, {
        type: 'Folder',
        name: 'target-folder',
        title: 'Target Folder',
      });

      // Create document in source folder
      const doc: any = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${sourceFolder.path}`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'document',
          type: 'File',
          name: 'moveable-doc',
          properties: {
            'dc:title': 'Document to Move',
          },
        }),
      }).then((r) => r.json());

      expect(doc.path).toContain('/source-folder');

      // Move via Document.Move automation
      const moveRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Move`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
          params: {
            target: targetFolder.uid,
          },
        }),
      });

      expect(moveRes.status).toBe(200);

      // Verify via follow-up query
      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { Authorization: harness.auth },
      });

      const moved: any = await verifyRes.json();
      expect(moved.path).toContain('/target-folder');
      expect(moved.path).not.toContain('/source-folder');

      console.log(`[write-ops] Moved document from ${doc.path} to ${moved.path}`);
    });
  });

  describe('Bulk Operations', () => {
    it('can delete multiple documents in one operation', async () => {
      // Create multiple documents
      const docs = await Promise.all([
        createTestDocument(harness, {
          type: 'File',
          name: 'bulk-delete-1',
          title: 'Bulk Delete 1',
        }),
        createTestDocument(harness, {
          type: 'File',
          name: 'bulk-delete-2',
          title: 'Bulk Delete 2',
        }),
        createTestDocument(harness, {
          type: 'File',
          name: 'bulk-delete-3',
          title: 'Bulk Delete 3',
        }),
      ]);

      const docIds = docs.map((d: any) => d.uid);

      // Bulk delete via Document.Delete automation
      const bulkDeleteRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Delete`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `docs:${docIds.join(',')}`,
          }),
        },
      );

      expect(bulkDeleteRes.status).toBe(200);

      // Verify all deleted via follow-up queries
      const verifications = await Promise.all(
        docIds.map((uid) =>
          fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${uid}`, {
            headers: { Authorization: harness.auth },
          }),
        ),
      );

      // All should be 404
      verifications.forEach((res) => {
        expect(res.status).toBe(404);
      });

      console.log(`[write-ops] Bulk deleted ${docIds.length} documents`);
    });
  });

  describe('Data Root Isolation', () => {
    it('destructive operations are isolated to data root only', async () => {
      // This test verifies that our destructive operations only affect
      // documents in the test data root, not the wider repository

      // Count total documents in repository (outside our data root).
      //
      // `ecm:path NOT STARTSWITH` was here, and it is not NXQL — Nuxeo answered HTTP 400 with
      // an exception body carrying neither `resultsCount` nor `entries`, so the `?? 0`
      // fallbacks turned a rejected query into `expect(0).toBe(0)` and the test logged
      // "0 docs outside root" against a repository holding 484 File documents. It would have
      // passed if the harness had deleted `/default-domain` wholesale. `NOT (… STARTSWITH …)`
      // negates the whole predicate, which NXQL does accept.
      const countUrl = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
      countUrl.searchParams.set(
        'query',
        "SELECT * FROM Document WHERE ecm:primaryType = 'File' AND ecm:isTrashed = 0 " +
          `AND NOT (ecm:path STARTSWITH '${harness.dataRoot}')`,
      );
      countUrl.searchParams.set('pageSize', '1000');

      // The status is asserted, and the `?? 0` fallbacks are gone. They are what converted a
      // server error into a pass, so a missing `resultsCount` must now fail the test rather
      // than be read as a count of nothing.
      const countOutsideRoot = async (): Promise<number> => {
        const res = await fetch(countUrl, { headers: { Authorization: harness.auth } });
        expect(res.status).toBe(200);
        const data: any = await res.json();
        expect(data.resultsCount).toBeTypeOf('number');
        return data.resultsCount;
      };

      const beforeCount = await countOutsideRoot();

      // Belt and braces: an empty or rejected result must not be able to satisfy this test.
      // Preflight already refuses an empty repository, so zero here means the query is wrong.
      expect(beforeCount).toBeGreaterThan(0);

      // Perform destructive operation INSIDE our data root
      const docInRoot: any = await createTestDocument(harness, {
        type: 'File',
        name: 'isolated-delete-test',
        title: 'Delete Test',
      });

      const deleteRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${docInRoot.uid}`, {
        method: 'DELETE',
        headers: { Authorization: harness.auth },
      });
      expect(deleteRes.status).toBe(204);

      // Count again - should be unchanged outside our root
      const afterCount = await countOutsideRoot();

      expect(afterCount).toBe(beforeCount);

      console.log(
        `[write-ops] Isolation verified: ${beforeCount} docs outside root before, ${afterCount} after`,
      );
    });
  });
});
