/**
 * Upload and download integration tests.
 *
 * Deferred from Stage 6 due to complexity - requires file handling (Blob, FormData).
 * Tests complete upload and download workflows against live Nuxeo.
 *
 * Tests:
 * - Upload file to batch
 * - Attach batch to document
 * - Download file blob
 * - Download with proper content-type
 * - Multiple file uploads
 *
 * Acceptance criteria:
 * - uploadFileToBatch tested end-to-end
 * - Download verified with actual file content
 * - File content-type preserved
 */

import { afterAll, describe, it, expect } from 'vitest';
import { setupIntegrationHarness, createTestDocument } from './integration-harness';

describe('Upload and Download Integration Tests', () => {
  const harness = setupIntegrationHarness();

  /**
   * Every batch this file creates, so teardown can remove them.
   *
   * Upload batches live outside the data root, so the harness's workspace delete cannot
   * reach them. Each test used to send `X-Batch-No-Drop: true`, which stops Nuxeo dropping
   * the batch after an `execute` — and nothing then deleted it, so every run leaked one
   * batch per test onto the shared instance. The header is gone (the drop is the cleanup
   * for the attach flows) and the rest are deleted here.
   */
  const batches: string[] = [];

  async function createBatch(): Promise<string> {
    const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/upload`, {
      method: 'POST',
      headers: { Authorization: harness.auth },
    });
    expect(res.status).toBe(201);
    const batch: { batchId?: string } = await res.json();
    expect(batch.batchId).toBeTruthy();
    batches.push(batch.batchId as string);
    return batch.batchId as string;
  }

  afterAll(async () => {
    const stuck: string[] = [];
    for (const batchId of batches) {
      const res = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}`, {
        method: 'DELETE',
        headers: { Authorization: harness.auth },
      });
      // 404 means the batch is already gone — Nuxeo drops a batch once an `execute` has
      // consumed it, which is the normal path for the attach tests.
      if (!res.ok && res.status !== 404) stuck.push(`${batchId} (HTTP ${res.status})`);
    }
    if (stuck.length > 0) {
      throw new Error(
        `[upload-download] ${stuck.length} upload batch(es) could not be deleted and are ` +
          `leaked on ${harness.nuxeoUrl}:\n  ${stuck.join('\n  ')}`,
      );
    }
  });

  describe('File Upload', () => {
    it('can create an upload batch', async () => {
      const batchId = await createBatch();

      console.log(`[upload-download] Created upload batch: ${batchId}`);
    });

    it('can upload a file to a batch', async () => {
      const batchId = await createBatch();

      // Create a test file (simple text content)
      const testContent = `Integration test file created at ${new Date().toISOString()}`;
      const testBlob = new Blob([testContent], { type: 'text/plain' });

      // Upload file to batch
      const uploadRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/0`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'X-File-Name': 'test-file.txt',
          'X-File-Type': 'text/plain',
          'X-File-Size': testBlob.size.toString(),
          'Content-Type': 'application/octet-stream',
        },
        body: testBlob,
      });

      expect(uploadRes.status).toBe(201);

      // Nuxeo answers with strings here, not JSON booleans and numbers:
      //   {"uploaded":"true","fileIdx":"0","uploadType":"normal","uploadedSize":"5",…}
      // `expect(upload.uploaded).toBe(true)` was therefore comparing `'true'` to `true` and
      // failing — one of the two honest failures this file already had.
      const upload: any = await uploadRes.json();
      expect(upload.uploaded).toBe('true');
      expect(upload.fileIdx).toBe('0');
      expect(upload.uploadedSize).toBe(String(testBlob.size));

      console.log(`[upload-download] Uploaded file to batch ${batchId}`);
    });

    it('can attach uploaded batch to a document', async () => {
      const batchId = await createBatch();

      const testContent = 'Test file content for attachment';
      const testBlob = new Blob([testContent], { type: 'text/plain' });

      const uploadRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/0`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'X-File-Name': 'attachment-test.txt',
          'X-File-Type': 'text/plain',
          'X-File-Size': testBlob.size.toString(),
          'Content-Type': 'application/octet-stream',
        },
        body: testBlob,
      });
      expect(uploadRes.status).toBe(201);

      // Create a document
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'doc-with-file',
        title: 'Document with File',
      });

      // Attach batch to document via Blob.AttachOnDocument
      const attachRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/0/execute/Blob.AttachOnDocument`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            params: {
              document: doc.uid,
              xpath: 'file:content',
            },
          }),
        },
      );

      // Unconditional. A non-200 used to log and pass, so this test could never detect a
      // broken `Blob.AttachOnDocument` — it asserted that the request had been made.
      expect(attachRes.status).toBe(200);

      // Verify document now has file content
      const verifyRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}`, {
        headers: {
          Authorization: harness.auth,
          'X-NXproperties': '*',
        },
      });
      expect(verifyRes.status).toBe(200);

      const updated: any = await verifyRes.json();
      const content = updated.properties?.['file:content'];
      expect(content).toBeTruthy();
      expect(content.name).toBe('attachment-test.txt');
      expect(Number(content.length)).toBe(testBlob.size);

      console.log(`[upload-download] Attached batch to document ${doc.uid}`);
    });
  });

  describe('File Download', () => {
    /** Create a document, attach `content` to it, and return its UID. */
    async function docWithContent(name: string, content: string): Promise<string> {
      const batchId = await createBatch();
      const blob = new Blob([content], { type: 'text/plain' });

      const uploadRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/0`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'X-File-Name': `${name}.txt`,
          'X-File-Type': 'text/plain',
          'X-File-Size': blob.size.toString(),
          'Content-Type': 'application/octet-stream',
        },
        body: blob,
      });
      expect(uploadRes.status).toBe(201);

      const doc: any = await createTestDocument(harness, { type: 'File', name, title: name });

      const attachRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/0/execute/Blob.AttachOnDocument`,
        {
          method: 'POST',
          headers: { Authorization: harness.auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ params: { document: doc.uid, xpath: 'file:content' } }),
        },
      );
      expect(attachRes.status).toBe(200);

      return doc.uid;
    }

    // Both tests below used to create an *empty* File document and then branch on the
    // download status. Neither could fail: the 200 arm never ran, the 404 arm asserted the
    // status it had just read, and the third arm only logged. They were named for a
    // download they never performed.
    //
    // Each now attaches content first, so the download under test has something to return.

    it('can download file blob from document', async () => {
      const content = 'Document for download testing';
      const uid = await docWithContent('download-test-doc', content);

      const downloadRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/id/${uid}/@blob/file:content`,
        {
          headers: {
            Authorization: harness.auth,
          },
        },
      );

      expect(downloadRes.status).toBe(200);
      expect(await downloadRes.text()).toBe(content);

      console.log(`[upload-download] Downloaded ${content.length} bytes from ${uid}`);
    });

    it('a document with no blob answers 404 rather than an empty body', async () => {
      // The other half, and the reason the original test could sit in its 404 branch
      // believing it had tested something: an empty `File` has no `file:content`, so the
      // adapter 404s. Worth asserting — an empty 200 would make every download assertion
      // above vacuous — but it is a *different* claim from "can download", and naming it
      // separately is what stops one standing in for the other.
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'no-blob-doc',
        title: 'Document With No Blob',
      });

      const downloadRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}/@blob/file:content`,
        { headers: { Authorization: harness.auth } },
      );

      expect(downloadRes.status).toBe(404);
    });

    it('verifies content-type on download', async () => {
      const uid = await docWithContent('content-type-test', 'content-type probe');

      const downloadRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/id/${uid}/@blob/file:content`,
        {
          headers: {
            Authorization: harness.auth,
          },
        },
      );

      expect(downloadRes.status).toBe(200);
      // `toBeDefined()` would have passed on `application/octet-stream`, which is the
      // failure this test exists to catch: the type the upload declared must survive.
      expect(downloadRes.headers.get('Content-Type')).toContain('text/plain');

      console.log(`[upload-download] Content-Type: ${downloadRes.headers.get('Content-Type')}`);
    });
  });

  describe('End-to-End Upload and Download', () => {
    it('can upload a file and download it back', async () => {
      // 1. Create batch
      const batchId = await createBatch();

      // 2. Upload file to batch
      const originalContent = `Test content ${Date.now()}`;
      const testBlob = new Blob([originalContent], { type: 'text/plain' });

      const uploadRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/0`, {
        method: 'POST',
        headers: {
          Authorization: harness.auth,
          'X-File-Name': 'round-trip-test.txt',
          'X-File-Type': 'text/plain',
          'X-File-Size': testBlob.size.toString(),
          'Content-Type': 'application/octet-stream',
        },
        body: testBlob,
      });
      expect(uploadRes.status).toBe(201);

      // 3. Create document
      const doc: any = await createTestDocument(harness, {
        type: 'File',
        name: 'round-trip-doc',
        title: 'Round Trip Test Document',
      });

      // 4. Attach batch to document
      const attachRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/0/execute/Blob.AttachOnDocument`,
        {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            params: {
              document: doc.uid,
              xpath: 'file:content',
            },
          }),
        },
      );

      // The whole round trip used to sit inside `if (attachRes.status === 200)`, so a
      // broken attach skipped the download and the content comparison and the test still
      // passed — the round trip this test is named for never happened.
      expect(attachRes.status).toBe(200);

      // 5. Download file back
      const downloadRes = await fetch(
        `${harness.nuxeoUrl}/nuxeo/api/v1/id/${doc.uid}/@blob/file:content`,
        {
          headers: {
            Authorization: harness.auth,
          },
        },
      );

      expect(downloadRes.status).toBe(200);
      expect(await downloadRes.text()).toBe(originalContent);

      console.log(`[upload-download] Round trip: uploaded and downloaded content matches`);
    });
  });

  describe('Multiple File Upload', () => {
    it('can upload multiple files to same batch', async () => {
      const batchId = await createBatch();

      // Upload 3 files to same batch
      const files = [
        { name: 'file1.txt', content: 'First file content' },
        { name: 'file2.txt', content: 'Second file content' },
        { name: 'file3.txt', content: 'Third file content' },
      ];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = new Blob([file.content], { type: 'text/plain' });

        const uploadRes = await fetch(`${harness.nuxeoUrl}/nuxeo/api/v1/upload/${batchId}/${i}`, {
          method: 'POST',
          headers: {
            Authorization: harness.auth,
            'X-File-Name': file.name,
            'X-File-Type': 'text/plain',
            'X-File-Size': blob.size.toString(),
            'Content-Type': 'application/octet-stream',
          },
          body: blob,
        });

        expect(uploadRes.status).toBe(201);

        // Strings, not a boolean and a number — see the single-file upload test above.
        const upload: any = await uploadRes.json();
        expect(upload.uploaded).toBe('true');
        expect(upload.fileIdx).toBe(String(i));
      }

      console.log(`[upload-download] Uploaded ${files.length} files to batch ${batchId}`);
    });
  });
});
