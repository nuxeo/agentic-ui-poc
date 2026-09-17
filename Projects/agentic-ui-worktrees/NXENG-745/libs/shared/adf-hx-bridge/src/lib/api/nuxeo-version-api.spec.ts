import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NuxeoVersionApi } from './nuxeo-version-api';

/**
 * The `VERSION` port. Upstream's `VersionApi` declares one method, so the interesting cases
 * are the parameters it accepts and the failures it must not swallow.
 */
describe('NuxeoVersionApi', () => {
  let api: NuxeoVersionApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoVersionApi],
    });
    api = TestBed.inject(NuxeoVersionApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('restores a version through Document.RestoreVersion and maps the result', async () => {
    const pending = api.restoreVersion('version-7');

    // The operation and the id, not merely that a request went out: restoring the wrong
    // document is the failure that matters here.
    const req = httpMock.expectOne((r) =>
      r.url.includes('/nuxeo/api/v1/id/version-7/@op/Document.RestoreVersion'),
    );
    expect(req.request.method).toBe('POST');
    req.flush({
      uid: 'live-1',
      title: 'Invoice',
      type: 'File',
      path: '/default-domain/workspaces/ws/Invoice',
      lastModified: '2026-02-01T00:00:00.000Z',
      properties: {},
    });

    const response = await pending;
    // The restored *live* document comes back, not the version restored from.
    expect(response.data.sys_id).toBe('live-1');
    expect(response.data.sys_title).toBe('Invoice');
    expect(response.data.sys_repository).toBe('default');
  });

  it('surfaces a server error instead of resolving with an empty document', async () => {
    const pending = api.restoreVersion('version-7');
    httpMock
      .expectOne((r) => r.url.includes('Document.RestoreVersion'))
      .flush({ message: 'permission denied' }, { status: 403, statusText: 'Forbidden' });

    await expect(pending).rejects.toBeDefined();
  });

  it('rejects an empty version id rather than calling Nuxeo with one', async () => {
    await expect(api.restoreVersion('')).rejects.toThrow('requires a version id');
  });

  it('refuses a non-default repository rather than silently ignoring it', async () => {
    // The parameter is part of the upstream signature. Accepting and discarding it is the
    // defect `NuxeoQueryApi` has with its sort, so this port refuses.
    await expect(api.restoreVersion('version-7', 'other-repo')).rejects.toThrow(
      'serves only "default"',
    );
  });
});
