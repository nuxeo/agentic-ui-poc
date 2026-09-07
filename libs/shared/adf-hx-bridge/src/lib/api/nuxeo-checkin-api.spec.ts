import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import type { CopyCommand } from '@hylandsoftware/hxcs-js-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';

import { NuxeoCheckInApi } from './nuxeo-checkin-api';
import { NuxeoCopyApi } from './nuxeo-copy-move-api';

/**
 * The `CHECKIN` port.
 *
 * Two things are worth a test here and neither is the happy path being "a POST happened".
 * The first is the `minor` boolean, which Nuxeo takes as the string `'minor' | 'major'` —
 * a mistranslation silently creates the wrong version number, and the document still comes
 * back looking fine. The second is `copy`, which the generated `CheckInApi` also declares
 * and which this class delegates rather than duplicating; delegation is only worth having if
 * it actually reaches the `COPY` port, so that is asserted through the real HTTP call.
 */

const nuxeoDoc = (over: Partial<NuxeoDocument> = {}): NuxeoDocument => ({
  uid: 'doc-1',
  title: 'Invoice',
  type: 'File',
  path: '/default-domain/workspaces/ws/Invoice',
  lastModified: '2026-03-02T00:00:00.000Z',
  properties: {},
  ...over,
});

describe('NuxeoCheckInApi', () => {
  let api: NuxeoCheckInApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NuxeoCheckInApi,
        // The real `COPY` port, not a stub: the point of the `copy` test below is that the
        // delegation reaches Nuxeo's `Document.Copy`, and a stub would assert only that a
        // spy was called.
        NuxeoCopyApi,
      ],
    });
    api = TestBed.inject(NuxeoCheckInApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("defaults to a minor increment, sent as Nuxeo's string form", async () => {
    const pending = api.checkin('doc-1');

    const req = httpMock.expectOne('/nuxeo/api/v1/id/doc-1/@op/Document.CheckIn');
    expect(req.request.method).toBe('POST');
    // `version: 'minor'`, not `minor: true`. Nuxeo would ignore an unknown parameter and
    // apply its own default, so a wrong key here produces a *plausible* result and no error.
    expect(req.request.body).toEqual({ params: { version: 'minor' }, context: {} });
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(nuxeoDoc({ uid: 'doc-1', title: 'Invoice' }));

    const response = await pending;
    expect(response.data.sys_id).toBe('doc-1');
    expect(response.data.sys_title).toBe('Invoice');
    expect(response.data.sys_repository).toBe('default');
  });

  it('translates minor=false to a major increment', async () => {
    const pending = api.checkin('doc-1', false);

    const req = httpMock.expectOne('/nuxeo/api/v1/id/doc-1/@op/Document.CheckIn');
    expect(req.request.body).toEqual({ params: { version: 'major' }, context: {} });
    req.flush(nuxeoDoc());

    await expect(pending).resolves.toBeDefined();
  });

  it('maps the checked-in document rather than returning Nuxeo shape', async () => {
    // Field by field on the fields a consumer reads, because a mapper failure here emits a
    // wrong-but-valid object: `{ uid, title }` passed straight through would satisfy any
    // truthiness check while every `sys_*` read came back undefined.
    const pending = api.checkin('doc-1');
    httpMock.expectOne('/nuxeo/api/v1/id/doc-1/@op/Document.CheckIn').flush(
      nuxeoDoc({
        uid: 'v-1',
        title: 'Invoice',
        type: 'File',
        path: '/default-domain/workspaces/ws/Invoice',
      }),
    );

    const { data } = await pending;
    expect(data.sys_id).toBe('v-1');
    expect(data.sys_primaryType).toBe('File');
    expect(data.sys_path).toBe('/default-domain/workspaces/ws/Invoice');
    expect(data.sys_isFolderish).toBe(false);
    expect(data['uid']).toBeUndefined();
    expect(data['title']).toBeUndefined();
  });

  it('rejects an empty document id and a non-default repository before calling Nuxeo', async () => {
    await expect(api.checkin('')).rejects.toThrow('checkin requires a document id');
    await expect(api.checkin('doc-1', true, 'other-repo')).rejects.toThrow('serves only "default"');
    httpMock.expectNone((r) => r.url.includes('Document.CheckIn'));
  });

  it('surfaces a server error instead of resolving with an unmapped document', async () => {
    const pending = api.checkin('doc-1');
    httpMock
      .expectOne('/nuxeo/api/v1/id/doc-1/@op/Document.CheckIn')
      .flush({ message: 'locked' }, { status: 409, statusText: 'Conflict' });

    await expect(pending).rejects.toBeDefined();
  });

  it('delegates copy to the COPY port, reaching Document.Copy and not Document.CheckIn', async () => {
    // `name: ''` because `CopyCommand.name` is required by the upstream type and any
    // non-empty value is refused by `NuxeoCopyApi` — see the note in
    // `nuxeo-copy-move-api.spec.ts`.
    const command: CopyCommand = { name: '', targetParentId: 'target-4' };
    const pending = api.copy('doc-1', 'default', command);

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Document.Copy');
    expect(req.request.body).toEqual({
      params: { target: 'target-4' },
      context: {},
      input: 'doc:doc-1',
    });
    req.flush(nuxeoDoc({ uid: 'copied-1' }));

    expect((await pending).data.sys_id).toBe('copied-1');
  });

  it("propagates the COPY port's own refusals through the delegation", async () => {
    // The delegation must not soften the contract it forwards to. If it caught or defaulted,
    // `checkin`'s `copy` would accept a rename the `COPY` port refuses.
    await expect(
      api.copy('doc-1', 'default', { name: 'New.pdf', targetParentId: 't' }),
    ).rejects.toThrow('copy cannot rename in the same operation');
    await expect(api.copy('doc-1')).rejects.toThrow('copy requires copyCommand.targetParentId');
    httpMock.expectNone('/nuxeo/api/v1/automation/Document.Copy');
  });
});
