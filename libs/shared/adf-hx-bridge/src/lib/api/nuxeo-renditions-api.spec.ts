import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NuxeoRenditionsApi } from './nuxeo-renditions-api';

describe('NuxeoRenditionsApi', () => {
  let api: NuxeoRenditionsApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoRenditionsApi],
    });
    api = TestBed.inject(NuxeoRenditionsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('serves the thumbnail rendition from the Nuxeo @rendition adapter', async () => {
    const pending = api.getRendition('doc-1', 'thumbnail');
    const req = httpMock.expectOne((r) =>
      r.url.includes('/nuxeo/api/v1/id/doc-1/@rendition/thumbnail'),
    );
    req.flush(new Blob(['x']));
    expect((await pending).data).toBeInstanceOf(Blob);
  });

  it('refuses a rendition it cannot serve instead of returning an empty blob', async () => {
    await expect(api.getRendition('doc-1', 'video-preview')).rejects.toThrow('serves only');
  });

  it('reports the fixed servable set, which is not a discovery call', async () => {
    // Asserted as an exact list: this is a narrower answer than upstream's contract
    // implies, and a future change that silently widens or empties it should fail here.
    const { data } = await api.getRenditions('doc-1');
    expect(data.map((r) => r.sysrendition_id)).toEqual(['thumbnail', 'pdf']);
  });

  it('refuses to create a rendition rather than pretending one is queued', async () => {
    await expect(api.createRendition()).rejects.toThrow('generates renditions server-side');
  });

  it('refuses a non-default repository', async () => {
    await expect(api.getRenditions('doc-1', 'other')).rejects.toThrow('serves only "default"');
  });
});
