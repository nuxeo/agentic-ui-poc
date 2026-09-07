import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { NuxeoDownloadApi } from './nuxeo-download-api';

/**
 * The `DOWNLOAD` port.
 *
 * Three things are load-bearing here:
 *
 * 1. **The xpath split.** Upstream passes `propertyXPathAndFilename` — `file:content/invoice.pdf`
 *    — and Nuxeo's `@blob` adapter takes the xpath alone. Getting the split wrong requests
 *    `@blob/file:content/invoice.pdf`, which Nuxeo answers with a 404 rather than an error a
 *    reader would trace back to here.
 * 2. **The refusals.** `inline`, `downloadInfoByIdAndXPath` and `downloadUrlByIdAndXPath` all
 *    throw on purpose. A throw that is never exercised is indistinguishable from a throw
 *    someone removed.
 * 3. **That no object URL is created.** This repo has had nine security defects involving
 *    blob-URL lifecycles, so the fact that this port returns the `Blob` itself and creates no
 *    URL is a property worth asserting rather than assuming — it is what makes the lifecycle
 *    the caller's, and it is what a future "convenience" refactor would break silently.
 */
describe('NuxeoDownloadApi', () => {
  let api: NuxeoDownloadApi;
  let httpMock: HttpTestingController;

  /**
   * Counters, in matched pairs, rather than spies asserted independently. A leak is
   * `created > revoked`, which a `toHaveBeenCalled()` on either one alone cannot see.
   *
   * jsdom implements neither function. Installed **once** at describe scope and never
   * restored in `afterEach`: TestBed cleanup runs after `afterEach` and would throw if the
   * stubs were gone while a component was still tearing down.
   */
  const created: string[] = [];
  const revoked: string[] = [];

  beforeAll(() => {
    const urlApi: { createObjectURL(blob: Blob): string; revokeObjectURL(url: string): void } = URL;
    urlApi.createObjectURL = (blob: Blob): string => {
      const url = `blob:nuxeo/${created.length}-${blob.size}`;
      created.push(url);
      return url;
    };
    urlApi.revokeObjectURL = (url: string): void => {
      revoked.push(url);
    };
  });

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    created.length = 0;
    revoked.length = 0;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), NuxeoDownloadApi],
    });
    api = TestBed.inject(NuxeoDownloadApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('requests the @blob adapter with the xpath only, dropping the filename half', async () => {
    const pending = api.downloadByIdAndXPath('doc-1', 'file:content/invoice.pdf');

    const req = httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1/@blob/file:content');
    expect(req.request.method).toBe('GET');
    // The filename never reaches the URL. Nuxeo names the file from the blob, so appending
    // it would address a property path that does not exist.
    expect(req.request.url).not.toContain('invoice.pdf');
    expect(req.request.responseType).toBe('blob');
    // The client-reason param the blob endpoints carry for Nuxeo's download audit.
    expect(req.request.params.get('clientReason')).toBe('view');

    const blob = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
    req.flush(blob);

    const response = await pending;
    // The Blob itself comes back — not a string URL, and not a wrapper.
    expect(response.data).toBeInstanceOf(Blob);
    expect(response.data.type).toBe('application/pdf');
  });

  it('hands the caller a Blob and creates no object URL to leak', async () => {
    const pending = api.downloadByIdAndXPath('doc-1', 'file:content/invoice.pdf');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1/@blob/file:content')
      .flush(new Blob(['x'], { type: 'application/pdf' }));
    await pending;

    // Presence first: the download really happened, so the absence below is meaningful
    // rather than the absence of any work at all.
    expect(created).toEqual([]);
    expect(revoked).toEqual([]);
    // The pair invariant, stated as the invariant rather than as two facts: whatever this
    // port does in future, it must not create more URLs than it revokes.
    expect(created.length).toBe(revoked.length);
  });

  it('accepts a bare xpath with no filename', async () => {
    const pending = api.downloadByIdAndXPath('doc-1', 'blobholder:0');

    const req = httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1/@blob/blobholder:0');
    // A colon is not a separator here. `blobholder:0` split on `:` would request
    // `@blob/blobholder`, which is a different (absent) property.
    expect(req.request.url).toContain('blobholder:0');
    req.flush(new Blob(['x']));

    await expect(pending).resolves.toBeDefined();
  });

  it('refuses inline=true rather than ignoring it and serving an attachment', async () => {
    // The parameter is in upstream's signature. Silently ignoring it would render a preview
    // request as a file download, which looks like a UI bug several layers away.
    await expect(
      api.downloadByIdAndXPath('doc-1', 'file:content/invoice.pdf', true),
    ).rejects.toThrow('cannot honour inline=true');
    httpMock.expectNone((r) => r.url.includes('@blob'));
  });

  it('treats inline=false and inline=undefined as an ordinary download', async () => {
    // The guard is `if (inline)`, so `false` must go through. Asserted because a stricter
    // `inline !== undefined` check would break upstream's explicit `false`.
    for (const inline of [false, undefined]) {
      const pending = api.downloadByIdAndXPath('doc-1', 'file:content', inline);
      httpMock
        .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1/@blob/file:content')
        .flush(new Blob(['x']));
      await expect(pending).resolves.toBeDefined();
    }
  });

  it('requires a document id and an xpath, and refuses another repository', async () => {
    await expect(api.downloadByIdAndXPath('', 'file:content')).rejects.toThrow(
      'downloadByIdAndXPath requires a document id',
    );
    await expect(api.downloadByIdAndXPath('doc-1', '')).rejects.toThrow(
      'downloadByIdAndXPath requires a property xpath',
    );
    await expect(
      api.downloadByIdAndXPath('doc-1', 'file:content', false, 'other-repo'),
    ).rejects.toThrow('serves only "default"');
    httpMock.expectNone((r) => r.url.includes('@blob'));
  });

  it('checks the id and the repository before the xpath', async () => {
    // Ordering matters for the message the caller sees. `parseXPath` runs inside the
    // `firstValueFrom` argument, after both guards, so an empty id with an empty xpath
    // reports the id — the first thing actually wrong.
    await expect(api.downloadByIdAndXPath('', '')).rejects.toThrow('requires a document id');
  });

  it('surfaces a 404 from the blob endpoint instead of resolving with an empty Blob', async () => {
    const pending = api.downloadByIdAndXPath('doc-1', 'file:content');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1/@blob/file:content')
      .flush(null, { status: 404, statusText: 'Not Found' });

    // Resolving with an empty Blob is the failure mode that matters: the browser would save
    // a zero-byte file and the user would think the document was empty.
    await expect(pending).rejects.toBeDefined();
    expect(created).toEqual([]);
  });

  it('does not fall back to blobholder:0 when the requested xpath 404s', async () => {
    // `fetchBlob` has that fallback; `fetchBlobByXpath` deliberately does not, because the
    // caller named a property. Asserted so the difference is not read as an oversight.
    const pending = api.downloadByIdAndXPath('doc-1', 'file:content');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1/@blob/file:content')
      .flush(null, { status: 404, statusText: 'Not Found' });
    await expect(pending).rejects.toBeDefined();

    httpMock.expectNone((r) => r.url.includes('blobholder:0'));
  });

  it('refuses to describe a blob rather than fetching it to answer', async () => {
    await expect(api.downloadInfoByIdAndXPath()).rejects.toThrow(
      'downloadInfoByIdAndXPath is not implemented',
    );
    // The whole point of the refusal: an "info" call must not cost a download.
    httpMock.expectNone((r) => r.url.includes('@blob'));
  });

  it('refuses to hand out a Nuxeo @blob URL as if it were pre-signed', async () => {
    // Returning one would be a link that never expires and works only for an authenticated
    // session — a shareable URL that is neither shareable nor expiring.
    await expect(api.downloadUrlByIdAndXPath()).rejects.toThrow(
      'downloadUrlByIdAndXPath is not implemented',
    );
    httpMock.expectNone((r) => r.url.includes('@blob'));
  });
});
