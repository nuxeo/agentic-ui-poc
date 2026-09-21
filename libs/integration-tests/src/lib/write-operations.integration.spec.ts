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
import { setupIntegrationHarness, createTestDocument } from './integration-harness';

describe('Write Operations Integration Tests', () => {
  const harness = setupIntegrationHarness({
    allowDefaultCredentials: true, // For local Docker testing
  });

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
          'Authorization': harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
        }),
      });

      expect(trashRes.status).toBe(200);

      // Verify document is trashed via follow-up API query
      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { 'Authorization': harness.auth },
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

      // Trash it via Document.Trash automation
      await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Trash`, {
        method: 'POST',
        headers: {
          'Authorization': harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
        }),
      });

      // Query for non-trashed documents in our data root
      const queryUrl = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
      queryUrl.searchParams.set(
        'query',
        `SELECT * FROM Document WHERE ecm:path STARTSWITH '${harness.dataRoot}' AND ecm:isTrashed = 0`,
      );

      const queryRes = await fetch(queryUrl, {
        headers: { 'Authorization': harness.auth },
      });

      expect(queryRes.status).toBe(200);
      const results: any = await queryRes.json();

      // Trashed document should not appear
      const found = results.entries?.find((d: any) => d.uid === doc.uid);
      expect(found).toBeUndefined();

      console.log(`[write-ops] Verified trashed document excluded from queries`);
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
          'Authorization': harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
        }),
      });

      // Verify it's trashed
      let verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { 'Authorization': harness.auth },
      });
      let state: any = await verifyRes.json();
      expect(state.isTrashed).toBe(true);

      // Restore it via Document.Untrash automation
      const restoreRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Untrash`, {
        method: 'POST',
        headers: {
          'Authorization': harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
        }),
      });

      expect(restoreRes.status).toBe(200);

      // Verify via follow-up query
      verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { 'Authorization': harness.auth },
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
        headers: { 'Authorization': harness.auth },
      });

      expect(deleteRes.status).toBe(204); // No Content

      // Verify via follow-up query - should get 404
      const verifyRes = await fetch(deleteUrl, {
        headers: { 'Authorization': harness.auth },
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
        headers: { 'Authorization': harness.auth },
      });

      // Try to restore (should fail)
      const restoreRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'PUT',
        headers: {
          'Authorization': harness.auth,
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
          'Authorization': harness.auth,
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
        headers: { 'Authorization': harness.auth, 'X-NXproperties': '*' },
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
          'Authorization': harness.auth,
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
      }).then(r => r.json());

      expect(doc.path).toContain('/source-folder');

      // Move via Document.Move automation
      const moveRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Move`, {
        method: 'POST',
        headers: {
          'Authorization': harness.auth,
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
        headers: { 'Authorization': harness.auth },
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
      const bulkDeleteRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.Delete`, {
        method: 'POST',
        headers: {
          'Authorization': harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `docs:${docIds.join(',')}`,
        }),
      });

      expect(bulkDeleteRes.status).toBe(200);

      // Verify all deleted via follow-up queries
      const verifications = await Promise.all(
        docIds.map(uid =>
          fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${uid}`, {
            headers: { 'Authorization': harness.auth },
          })
        )
      );

      // All should be 404
      verifications.forEach(res => {
        expect(res.status).toBe(404);
      });

      console.log(`[write-ops] Bulk deleted ${docIds.length} documents`);
    });
  });

  describe('Data Root Isolation', () => {
    it('destructive operations are isolated to data root only', async () => {
      // This test verifies that our destructive operations only affect
      // documents in the test data root, not the wider repository

      // Count total documents in repository (outside our data root)
      const beforeUrl = new URL('/nuxeo/api/v1/search/lang/NXQL/execute', harness.nuxeoUrl);
      beforeUrl.searchParams.set(
        'query',
        "SELECT * FROM Document WHERE ecm:primaryType = 'File' AND ecm:isTrashed = 0 " +
        `AND ecm:path NOT STARTSWITH '${harness.dataRoot}'`,
      );
      beforeUrl.searchParams.set('pageSize', '1000');

      const beforeRes = await fetch(beforeUrl, {
        headers: { 'Authorization': harness.auth },
      });
      const beforeData: any = await beforeRes.json();
      const beforeCount = beforeData.resultsCount ?? beforeData.entries?.length ?? 0;

      // Perform destructive operation INSIDE our data root
      const docInRoot: any = await createTestDocument(harness, {
        type: 'File',
        name: 'isolated-delete-test',
        title: 'Delete Test',
      });

      await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${docInRoot.uid}`, {
        method: 'DELETE',
        headers: { 'Authorization': harness.auth },
      });

      // Count again - should be unchanged outside our root
      const afterRes = await fetch(beforeUrl, {
        headers: { 'Authorization': harness.auth },
      });
      const afterData: any = await afterRes.json();
      const afterCount = afterData.resultsCount ?? afterData.entries?.length ?? 0;

      expect(afterCount).toBe(beforeCount);

      console.log(`[write-ops] Isolation verified: ${beforeCount} docs outside root before, ${afterCount} after`);
    });
  });
});