import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { NuxeoDocumentApi } from './nuxeo-document-api';
import { ROOT_DOCUMENT } from '../tokens/adf-hx-bridge.tokens';

describe('NuxeoDocumentApi', () => {
  let api: NuxeoDocumentApi;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoDocumentApi],
    });
    api = TestBed.inject(NuxeoDocumentApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('returns synthetic repository root for root id', async () => {
    const response = await api.getDocumentById(ROOT_DOCUMENT.sys_id);
    expect(response.data.sys_primaryType).toBe('SysRoot');
    expect(response.data.sys_id).toBe(ROOT_DOCUMENT.sys_id);
  });

  it('maps Nuxeo document by uid', async () => {
    const pending = api.getDocumentById('doc-1');
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/id/doc-1'));
    req.flush({
      uid: 'doc-1',
      title: 'Invoice',
      type: 'File',
      path: '/default-domain/workspaces/ws/Invoice',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    });

    const response = await pending;
    expect(response.data.sys_id).toBe('doc-1');
    expect(response.data.sys_title).toBe('Invoice');
    // The Nuxeo doctype: `sys_primaryType` keys into `Model.primaryTypes`.
    expect(response.data.sys_primaryType).toBe('File');
  });
});
