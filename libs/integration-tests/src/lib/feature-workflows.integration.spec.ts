/**
 * Feature-level workflow integration tests.
 *
 * Stage 8 of the integration-test plan: Feature-level workflows.
 * Tests complete feature workflows against live Nuxeo.
 *
 * Tests:
 * - Collections membership (add/remove documents)
 * - Notes (create/read/update/delete)
 * - CSV export
 * - Document versions
 * - Basic workflow operations
 *
 * Acceptance criteria (from audit §11 Stage 8):
 * - Each workflow tested end-to-end with API verification
 * - Features that modify repository state verified with follow-up queries
 */

import { describe, it, expect } from 'vitest';
import { setupIntegrationHarness, createTestDocument } from './integration-harness';

describe('Feature Workflows Integration Tests', () => {
  const harness = setupIntegrationHarness();

  describe('Collections', () => {
    it('can create a collection', async () => {
      // Create collection via Automation
      const createRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Collection.Create`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `doc:${harness.dataRoot}`,
            params: {
              name: `test-collection-${harness.runId}`,
              description: 'Integration Test Collection',
            },
          }),
        },
      );

      expect(createRes.status).toBe(200);

      const collection: any = await createRes.json();
      expect(collection.type).toBe('Collection');
      expect(collection.title).toContain('test-collection');

      console.log(`[feature-workflows] Created collection: ${collection.uid}`);
    });

    it('can add document to collection', async () => {
      // Create a collection
      const collectionRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Collection.Create`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `doc:${harness.dataRoot}`,
            params: {
              name: `collection-with-docs-${harness.runId}`,
            },
          }),
        },
      );

      const collection: any = await collectionRes.json();

      // Create a document
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-for-collection',
        title: 'Document for Collection',
      });

      // Add document to collection via Automation
      const addRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.AddToCollection`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: `doc:${doc.uid}`,
            params: {
              collection: collection.uid,
            },
          }),
        },
      );

      expect(addRes.status).toBe(200);

      // A 200 is Nuxeo accepting the operation, not evidence that membership changed, and
      // this file's own header requires repository modifications to be verified by a
      // follow-up read. `collectionMember:collectionIds` is on the document itself, so this
      // is a direct `/id/:uid` read — the repository, not the index, and therefore not
      // exposed to the lag that hollowed out the trash-exclusion test.
      const memberRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: { Authorization: harness.auth, 'X-NXproperties': '*' },
      });
      expect(memberRes.status).toBe(200);
      const member: any = await memberRes.json();
      expect(member.properties['collectionMember:collectionIds']).toContain(collection.uid);

      console.log(`[feature-workflows] Added document ${doc.uid} to collection ${collection.uid}`);
    });
  });

  // The three tests below each used to read `if (status === 200) { assert } else { log }`,
  // which turns a missing or broken capability into a pass — a test that claims it can
  // create a note, and reports green when the server says it cannot.
  //
  // That was not hypothetical here. Probing this Nuxeo directly showed the reason those
  // branches existed: two of the three endpoints do not exist at all.
  //
  //   POST /api/v1/automation/Comment.CreateComment       -> 404, no such operation
  //   GET  /api/v1/id/<uid>/@comment                      -> 200
  //   GET  /api/v1/id/<uid>/@workflows                    -> 404, the adapter is @workflow
  //   POST /api/v1/automation/ResultSet.PageProviderToCsv -> 404, no such operation
  //
  // So the `else` branch was not tolerating an optional capability; it was hiding three
  // wrong endpoint names. Each test now uses the endpoint the product actually uses and
  // asserts the status unconditionally.
  describe('Notes and Annotations', () => {
    it('can create a note on a document', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-with-note',
        title: 'Document with Note',
      });

      // The `@comment` adapter, not `Comment.CreateComment` — that operation is not in this
      // Nuxeo's automation registry, and never was.
      const noteRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}/@comment`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'comment',
          parentId: doc.uid,
          text: 'This is a test note from integration tests',
        }),
      });

      expect(noteRes.status).toBe(201);
      const note: any = await noteRes.json();
      expect(note.text).toBe('This is a test note from integration tests');

      // Read it back, so the assertion is about the repository and not about the response
      // body the write echoed.
      const readRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}/@comment`, {
        headers: { Authorization: harness.auth },
      });
      expect(readRes.status).toBe(200);
      const comments: any = await readRes.json();
      expect(comments.entries.map((c: any) => c.id)).toContain(note.id);

      console.log(`[feature-workflows] Created and read back note ${note.id} on ${doc.uid}`);
    });

    it('can query comments on a document', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-with-comments',
        title: 'Document with Comments',
      });

      const commentsRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}/@comment`, {
        headers: {
          Authorization: harness.auth,
        },
      });

      expect(commentsRes.status).toBe(200);
      const comments: any = await commentsRes.json();
      // A fresh document has no comments. `toBeDefined()` would have passed on an error body.
      expect(comments['entity-type']).toBe('comments');
      expect(comments.entries).toEqual([]);

      console.log(`[feature-workflows] Queried comments on ${doc.uid}`);
    });
  });

  describe('Document Versions', () => {
    it('can create a new version of a document', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'versioned-doc',
        title: 'Versioned Document',
        properties: {
          'dc:description': 'Initial version',
        },
      });

      // Create a version via Document.CreateVersion automation
      const versionRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.CreateVersion`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
            // Without this the response carries no `uid` properties at all and the assertions
            // below cannot distinguish a failed version from an unrequested schema.
            'X-NXproperties': 'uid',
          },
          body: JSON.stringify({
            input: `doc:${doc.uid}`,
            params: {
              increment: 'Minor',
            },
          }),
        },
      );

      expect(versionRes.status).toBe(200);

      // The version label is not a top-level field on the document entity — Nuxeo carries it in
      // the `uid` schema, and only when that schema is asked for. `versioned.versionLabel` was
      // therefore `undefined` no matter how well the version had been created, so the assertion
      // failed on a working operation. Read the parts and check them.
      const versioned: any = await versionRes.json();
      const major = versioned.properties?.['uid:major_version'];
      const minor = versioned.properties?.['uid:minor_version'];
      expect(major).toBeDefined();
      expect(minor).toBeDefined();
      // `increment: 'Minor'` on a document that has never been versioned gives 0.1 exactly.
      // Asserting the value rather than its mere presence is what makes this a test of the
      // increment rather than of the response having fields.
      expect(`${major}.${minor}`).toBe('0.1');

      console.log(`[feature-workflows] Created version ${major}.${minor} of ${doc.uid}`);
    });

    it('can retrieve version history', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-with-history',
        title: 'Document with History',
      });

      // Create a version
      await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.CreateVersion`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: `doc:${doc.uid}`,
          params: {
            increment: 'Minor',
          },
        }),
      });

      // `Document.GetVersions`, not the `@versions` adapter. There is no such adapter on this
      // server — it answered 404 `"Service versions not found for object"` regardless of how
      // many versions the document had, so the test failed on a working repository.
      //
      // The operation is also repository-backed rather than index-backed, which matters here:
      // the version was created moments ago, and the equivalent NXQL
      // (`ecm:versionVersionableId = …`) still counted 0 at this point because OpenSearch had
      // not caught up. Querying the index would have swapped a permanent failure for an
      // intermittent one.
      const historyRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Document.GetVersions`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: `doc:${doc.uid}` }),
        },
      );

      expect(historyRes.status).toBe(200);

      const history: any = await historyRes.json();
      expect(Array.isArray(history.entries)).toBe(true);
      // Exactly the one version created above. `toBeGreaterThan(0)` would also have been
      // satisfied by a response listing every version in the repository.
      expect(history.entries.length).toBe(1);

      console.log(
        `[feature-workflows] Retrieved ${history.entries.length} version(s) for ${doc.uid}`,
      );
    });
  });

  describe('CSV Export', () => {
    it('can export search results to CSV', async () => {
      // Create a few documents
      await Promise.all([
        createTestDocument(harness, {
          type: 'File',
          name: 'export-doc-1',
          title: 'Export Document 1',
        }),
        createTestDocument(harness, {
          type: 'File',
          name: 'export-doc-2',
          title: 'Export Document 2',
        }),
      ]);

      // `Bulk.RunAction` with `action: csvExport` — the path `BrowseService.startCsvExport`
      // uses. `ResultSet.PageProviderToCsv`, which this test called before, is not in this
      // Nuxeo's automation registry; the `else` branch below is why that never showed up.
      //
      // Only the *start* of the export is asserted. Completing it means polling
      // `/@async/<id>/status` and downloading the blob, which is a longer test than this
      // file should carry — recorded as a limitation rather than implied by a green tick.
      const exportRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/automation/Bulk.RunAction/@async`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            params: {
              action: 'csvExport',
              query: `SELECT * FROM Document WHERE ecm:path STARTSWITH '${harness.dataRoot}'`,
            },
            context: {},
          }),
        },
      );

      expect(exportRes.status).toBe(202);

      // The execution ID comes back in `Location`, and `startCsvExport` depends on it being
      // there — an accepted request with no ID to poll is a failure, not a success.
      const location = exportRes.headers.get('Location') ?? '';
      expect(location).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);

      console.log(`[feature-workflows] Started CSV export: ${location}`);
    });
  });

  describe('Workflow Operations', () => {
    it('can query available workflows', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'workflow-doc',
        title: 'Workflow Document',
      });

      // `@workflow`, singular. The plural spelling answers 404 "Service workflows not
      // found", which the `else` branch below reported as "adapter not available".
      const workflowsRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}/@workflow`, {
        headers: {
          Authorization: harness.auth,
        },
      });

      expect(workflowsRes.status).toBe(200);
      const workflows: any = await workflowsRes.json();
      expect(workflows['entity-type']).toBe('workflows');
      // A document nobody has started a workflow on has none running.
      expect(workflows.entries).toEqual([]);

      console.log(`[feature-workflows] Queried workflows for ${doc.uid}`);
    });
  });

  describe('Document Properties', () => {
    it('can update document metadata', async () => {
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'metadata-doc',
        title: 'Metadata Document',
        properties: {
          'dc:description': 'Initial description',
          'dc:source': 'Integration Test',
        },
      });

      // Update metadata
      const updateRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        method: 'PUT',
        headers: {
          Authorization: harness.auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'entity-type': 'document',
          properties: {
            'dc:description': 'Updated description via integration test',
            // `dc:subjects`, not `dc:subject`: the latter is not in the dublincore schema, and
            // Nuxeo drops an unknown property without complaining, so the write "succeeded"
            // with a 200 and the read-back never matched. The values have to be real
            // `l10nsubjects` vocabulary entries for the same reason — arbitrary strings are
            // dropped just as quietly, so `['test', 'integration']` would have swapped one
            // silent no-op for another. Both behaviours measured against the local stack.
            'dc:subjects': ['art/cinema', 'art/culture'],
          },
        }),
      });

      expect(updateRes.status).toBe(200);

      // Verify via follow-up query
      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: {
          Authorization: harness.auth,
          'X-NXproperties': '*',
        },
      });

      const updated: any = await verifyRes.json();
      expect(updated.properties['dc:description']).toBe('Updated description via integration test');
      expect(updated.properties['dc:subjects']).toEqual(['art/cinema', 'art/culture']);

      console.log(`[feature-workflows] Updated metadata for ${doc.uid}`);
    });
  });
});
