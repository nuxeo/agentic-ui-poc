import { DestroyRef, Injectable, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { Document } from '@hylandsoftware/hxcs-js-client';

import { AdfHxBrowseMediaService } from './adf-hx-browse-media.service';

/**
 * `loadThumbnails` needs a `DestroyRef` for `takeUntilDestroyed`, which can only be obtained
 * inside an injection context. This host is the smallest thing that has one.
 */
@Injectable()
class DestroyRefHost {
  readonly destroyRef = inject(DestroyRef);
}

function hxDoc(sys_id: string | undefined): Document {
  return { sys_id } as Document;
}

/**
 * jsdom implements neither `URL.createObjectURL` nor `revokeObjectURL`, and this service is
 * built around them. Installed once for the file and never restored — `vi.spyOn` cannot stub a
 * method that does not exist, and restoring `undefined` would make a later revoke throw.
 *
 * Counters rather than bare no-ops, because create and revoke have to be asserted as a *pair*:
 * this service's whole reason to exist is owning the lifetime of the thumbnail blobs.
 */
const created: string[] = [];
const revoked: string[] = [];
let blobSeq = 0;
const urlApi: { createObjectURL(blob: Blob): string; revokeObjectURL(url: string): void } = URL;
urlApi.createObjectURL = (): string => {
  const url = `blob:thumb/${(blobSeq += 1)}`;
  created.push(url);
  return url;
};
urlApi.revokeObjectURL = (url: string): void => {
  revoked.push(url);
};

describe('AdfHxBrowseMediaService', () => {
  let service: AdfHxBrowseMediaService;
  let httpMock: HttpTestingController;
  let destroyRef: DestroyRef;

  afterEach(() => {
    httpMock.verify();
  });

  beforeEach(() => {
    created.length = 0;
    revoked.length = 0;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdfHxBrowseMediaService, DestroyRefHost],
    });
    service = TestBed.inject(AdfHxBrowseMediaService);
    destroyRef = TestBed.inject(DestroyRefHost).destroyRef;
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('loadThumbnails', () => {
    it('reports one blob URL per document, keyed by document id', () => {
      const updates: Record<string, string>[] = [];
      service.loadThumbnails([hxDoc('a'), hxDoc('b')], (m) => updates.push(m), destroyRef);

      const requests = httpMock.match((r) => r.url.includes('/@rendition/thumbnail'));
      expect(requests).toHaveLength(2);
      requests[0].flush(new Blob(['a']));
      requests[1].flush(new Blob(['b']));

      // First update is the reset, then one per document.
      expect(updates[0]).toEqual({});
      expect(Object.keys(updates[1])).toEqual(['a']);
      expect(Object.keys(updates[2])).toEqual(['b']);
      expect(updates[1]['a']).toMatch(/^blob:/);
      expect(updates[2]['b']).not.toBe(updates[1]['a']);
    });

    it('never fetches a thumbnail for a document with no id', () => {
      // `/@rendition/thumbnail` on an empty id is a request for the repository, not a
      // thumbnail, and every unmapped row would issue one.
      service.loadThumbnails([hxDoc(undefined), hxDoc('')], () => undefined, destroyRef);
      httpMock.expectNone((r) => r.url.includes('/@rendition/thumbnail'));
    });

    it('emits the reset before fetching, so stale thumbnails do not linger', () => {
      const updates: Record<string, string>[] = [];
      service.loadThumbnails([hxDoc('a')], (m) => updates.push(m), destroyRef);
      expect(updates).toEqual([{}]);
      httpMock.expectOne((r) => r.url.includes('/@rendition/thumbnail')).flush(new Blob(['a']));
      expect(updates).toHaveLength(2);
    });

    it('revokes the previous batch when it resets', () => {
      service.loadThumbnails([hxDoc('a')], () => undefined, destroyRef);
      httpMock.expectOne((r) => r.url.includes('/@rendition/thumbnail')).flush(new Blob(['a']));
      const first = created[0];

      service.loadThumbnails([hxDoc('b')], () => undefined, destroyRef);
      // The reset is what frees the previous page's blobs; without it, paging through a large
      // folder retains every thumbnail for the life of the tab.
      expect(revoked).toContain(first);

      httpMock.expectOne((r) => r.url.includes('/@rendition/thumbnail')).flush(new Blob(['b']));
    });

    it('keeps the previous batch when told not to reset', () => {
      service.loadThumbnails([hxDoc('a')], () => undefined, destroyRef);
      httpMock.expectOne((r) => r.url.includes('/@rendition/thumbnail')).flush(new Blob(['a']));

      const updates: Record<string, string>[] = [];
      service.loadThumbnails([hxDoc('b')], (m) => updates.push(m), destroyRef, false);
      // No reset emission, and nothing revoked: appending a page must not blank the rows
      // already on screen.
      expect(revoked).toEqual([]);
      httpMock.expectOne((r) => r.url.includes('/@rendition/thumbnail')).flush(new Blob(['b']));
      expect(updates).toHaveLength(1);
      expect(Object.keys(updates[0])).toEqual(['b']);
    });

    it('skips a document whose thumbnail 404s without disturbing the others', () => {
      const updates: Record<string, string>[] = [];
      service.loadThumbnails([hxDoc('a'), hxDoc('b')], (m) => updates.push(m), destroyRef);

      const requests = httpMock.match((r) => r.url.includes('/@rendition/thumbnail'));
      requests[0].flush(new Blob(['nope']), { status: 404, statusText: 'Not Found' });
      requests[1].flush(new Blob(['b']));

      // A document with no thumbnail is the normal case for a note or a folder. The reset
      // plus exactly one success — the failure contributes nothing and throws nothing.
      expect(updates).toHaveLength(2);
      expect(Object.keys(updates[1])).toEqual(['b']);
      expect(created).toHaveLength(1);
    });

    it('creates no blob URL when every thumbnail fails', () => {
      service.loadThumbnails([hxDoc('a')], () => undefined, destroyRef);
      httpMock
        .expectOne((r) => r.url.includes('/@rendition/thumbnail'))
        .flush(new Blob(['x']), { status: 500, statusText: 'Server Error' });
      expect(created).toEqual([]);
    });

    it('does nothing at all for an empty document list beyond the reset', () => {
      const updates: Record<string, string>[] = [];
      service.loadThumbnails([], (m) => updates.push(m), destroyRef);
      expect(updates).toEqual([{}]);
      httpMock.expectNone(() => true);
    });
  });

  describe('revokeThumbnails', () => {
    it('revokes every tracked URL and then has nothing left to revoke', () => {
      service.loadThumbnails([hxDoc('a'), hxDoc('b')], () => undefined, destroyRef);
      const requests = httpMock.match((r) => r.url.includes('/@rendition/thumbnail'));
      requests[0].flush(new Blob(['a']));
      requests[1].flush(new Blob(['b']));

      service.revokeThumbnails();
      expect(revoked).toEqual(created);

      // The tracking array is cleared, so a second call cannot double-revoke.
      revoked.length = 0;
      service.revokeThumbnails();
      expect(revoked).toEqual([]);
    });

    it('is safe to call before any thumbnail was loaded', () => {
      service.revokeThumbnails();
      expect(revoked).toEqual([]);
    });
  });

  describe('exportCsv', () => {
    /** A real v4 UUID: `startCsvExport` extracts the execution id by UUID pattern. */
    const EXECUTION_ID = '3f9a1c2e-4b5d-4a7f-8c1e-9d0b2a6f5e41';

    it('asks Nuxeo for a csvExport scoped to the folder, excluding trash and versions', async () => {
      const pending = firstValueFrom(service.exportCsv('ws-1'));

      const start = httpMock.expectOne((r) => r.url.includes('Bulk.RunAction'));
      expect(start.request.method).toBe('POST');
      expect(start.request.body.params.action).toBe('csvExport');
      const query: string = start.request.body.params.query;
      expect(query).toContain("ecm:parentId = 'ws-1'");
      expect(query).toContain('ecm:isTrashed = 0');
      expect(query).toContain('ecm:isVersion = 0');

      // Answered so the chain moves on rather than being left open; the poll itself is
      // behind a timer and belongs to `BrowseService`.
      start.flush('', {
        headers: {
          Location: `/nuxeo/api/v1/automation/Bulk.RunAction/@async/${EXECUTION_ID}/status`,
        },
      });
      await Promise.resolve();
      void pending.catch(() => undefined);
    });

    it('propagates a failure to start the export instead of resolving with an empty file', async () => {
      // An empty CSV downloads silently and reads as an empty folder.
      const pending = firstValueFrom(service.exportCsv('ws-1'));
      httpMock
        .expectOne((r) => r.url.includes('Bulk.RunAction'))
        .flush('', { status: 500, statusText: 'Server Error' });
      await expect(pending).rejects.toBeDefined();
    });

    it('fails loudly when Nuxeo accepted the action but named no execution', async () => {
      // Without an execution id there is nothing to poll. Resolving here would hand the user
      // a download that never arrives and no error to explain it.
      const pending = firstValueFrom(service.exportCsv('ws-1'));
      httpMock
        .expectOne((r) => r.url.includes('Bulk.RunAction'))
        .flush('accepted', {
          headers: { Location: '/nuxeo/api/v1/automation/Bulk.RunAction/@async//status' },
        });
      await expect(pending).rejects.toThrow('Could not extract execution ID');
    });
  });

  describe('exportZip', () => {
    it('requests a bulk download of exactly the folder it was given', async () => {
      const pending = firstValueFrom(service.exportZip('ws-1'));
      const req = httpMock.expectOne((r) => r.url.includes('/automation/Blob.BulkDownload'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body.input).toBe('docs:ws-1');
      req.flush(new Blob(['PK'], { type: 'application/zip' }));
      expect(await (await pending).text()).toBe('PK');
    });

    it('propagates an export failure rather than handing back an empty archive', async () => {
      const pending = firstValueFrom(service.exportZip('ws-1'));
      httpMock
        .expectOne((r) => r.url.includes('/automation/Blob.BulkDownload'))
        .flush(new Blob(['x']), { status: 403, statusText: 'Forbidden' });
      await expect(pending).rejects.toMatchObject({ status: 403 });
    });
  });
});
