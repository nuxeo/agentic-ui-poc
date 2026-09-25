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
      // `toBe(false)`, not `toBeFalsy()`: `isTrashed` is optional on the entity, so `toBeFalsy`
      // was also satisfied by the field being absent — the precondition passed whether or not
      // the server had said anything about the trash state. Nuxeo does return it on create,
      // so requiring the literal `false` asserts the state instead of tolerating silence.
      expect(doc.isTrashed).toBe(false);

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
    it('recursive cleanup removes the root it is given and nothing beside it', async () => {
      // Three rewrites of this test, so the reasoning for the shape is worth stating.
      //
      // It began as "count the File documents outside the data root, delete something inside
      // it, count again, assert equal". That could not detect damage, for two independent
      // reasons, and neither was visible while it was passing.
      //
      // 1. `/search/lang/NXQL/execute` is OpenSearch-backed and lags the repository by
      //    seconds, so a wholesale deletion outside the root left both counts identical
      //    simply because neither had reached the index yet.
      // 2. Worse, and what the previous fix missed: the population it counted was not
      //    stable. Every other suite in this library has its own data root, so their
      //    documents are "outside" this one's, and they create and delete throughout the
      //    run. Adding a seventh spec file to the project was enough to expose it —
      //    `expected 1097 to be 1099`, a legitimate difference caused by another suite's
      //    `afterAll` and nothing to do with isolation. Waiting for the index made the
      //    measurement current without making it *mine*.
      //
      // So there is no counting here at all. A canary this suite owns, outside the root, read
      // back by UID; a throwaway root it also owns, deleted by the same recursive path the
      // harness's cleanup uses. Every read is `/nuxeo/api/v1/id/:uid`, which goes to the
      // repository rather than the index — no lag to wait out — and every document involved is
      // this run's, so no concurrently running suite can move the result either way.
      const unique = `iso-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const workspaces = '/default-domain/workspaces';

      /** Create a document by path, returning the server's entity. */
      const createAt = async (parentPath: string, name: string, type: string) => {
        const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${parentPath}`, {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'entity-type': 'document',
            name,
            type,
            properties: { 'dc:title': name },
          }),
        });
        expect(res.status).toBe(201);
        return (await res.json()) as any;
      };

      /** The status of a direct repository read. 404 means gone, 200 means present. */
      const readStatus = async (uid: string): Promise<number> => {
        const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${uid}`, {
          headers: { Authorization: harness.auth },
        });
        return res.status;
      };

      // The canary: outside the data root, a sibling of it, owned by this run.
      const canary = await createAt(workspaces, `${unique}-canary`, 'File');

      // The throwaway root, and a child inside it. The child is what makes the deletion's
      // recursiveness observable: a DELETE that removed only the workspace and orphaned its
      // contents would still leave the root 404, and this test would not notice.
      //
      // `throwaway.path` comes from the server and is used verbatim below rather than rebuilt
      // from `unique` — the lesson `assertUntruncated` in the harness was written for.
      // Nuxeo's `PathSegmentServiceDefault` caps a segment at 24 characters, and it bit during
      // this test's own development: a canary asked for as `…-canary` was created as `…-canar`.
      // Reads here go by UID so truncation cannot mislead them, but the DELETE goes by path,
      // and a reconstructed path would have 404'd on a workspace that existed.
      const throwaway = await createAt(workspaces, `${unique}-root`, 'Workspace');
      const inside = await createAt(throwaway.path, 'child', 'File');

      // Everything is really there before the destructive step, or the assertions afterwards
      // are satisfied by documents that never existed.
      expect(await readStatus(canary.uid)).toBe(200);
      expect(await readStatus(throwaway.uid)).toBe(200);
      expect(await readStatus(inside.uid)).toBe(200);

      // The destructive operation under test: the same `DELETE /api/v1/path<root>` that
      // `deleteDataRoot` issues in the harness's `afterAll`, against a root of the same shape
      // in the same parent. Exercising the real cleanup function would have to run inside this
      // suite's own `afterAll` and would take the rest of the suite's fixtures with it.
      const deleteRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/path${throwaway.path}`, {
        method: 'DELETE',
        headers: { Authorization: harness.auth },
      });
      expect(deleteRes.ok).toBe(true);

      // The root is gone, and so is its child — so the delete was recursive.
      expect(await readStatus(throwaway.uid)).toBe(404);
      expect(await readStatus(inside.uid)).toBe(404);

      // The point of the test: the sibling outside the deleted root is untouched. This is the
      // assertion that fails if a cleanup ever deletes a parent rather than its own root, and
      // it cannot be satisfied by index lag, because it is a repository read.
      expect(await readStatus(canary.uid)).toBe(200);

      // Leave nothing behind. Deliberately after the assertions, so a failure above leaves the
      // evidence on the server to look at.
      const canaryDelete = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${canary.uid}`, {
        method: 'DELETE',
        headers: { Authorization: harness.auth },
      });
      expect(canaryDelete.ok).toBe(true);
      expect(await readStatus(canary.uid)).toBe(404);

      console.log(
        `[write-ops] Isolation verified by repository read: ${throwaway.path} and its child removed, canary survived`,
      );
    });
  });
});
