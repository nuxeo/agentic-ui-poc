import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import type { CopyCommand, MoveCommand } from '@hylandsoftware/hxcs-js-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';

import { NuxeoCopyApi, NuxeoMoveApi } from './nuxeo-copy-move-api';

/**
 * The `COPY` and `MOVE` ports.
 *
 * These are the two destructive operations in the port set — a wrong `target` moves a
 * document somewhere the user did not ask for, and unlike a bad read it is not
 * self-correcting on refresh. So the request body is asserted field by field rather than
 * "a POST went out": `target`, `input` and the operation name are each the difference
 * between moving the right document into the right folder and moving the wrong one.
 */

/** A Nuxeo document as `Document.Copy` / `Document.Move` return it. */
const nuxeoDoc = (over: Partial<NuxeoDocument> = {}): NuxeoDocument => ({
  uid: 'copy-1',
  title: 'Invoice',
  type: 'File',
  path: '/default-domain/workspaces/target/Invoice',
  lastModified: '2026-03-01T00:00:00.000Z',
  properties: {},
  ...over,
});

describe('NuxeoCopyApi', () => {
  let api: NuxeoCopyApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), NuxeoCopyApi],
    });
    api = TestBed.inject(NuxeoCopyApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * `name: ''` is not an arbitrary fixture choice — see the `name` spec below. It is the
   * only value of a type-valid `CopyCommand` that reaches this path at all.
   */
  const copyTo = (targetParentId: string): CopyCommand => ({ name: '', targetParentId });

  it('copies through Document.Copy with the target as a param and the doc as input', async () => {
    const pending = api.copy('doc-1', 'default', copyTo('target-9'));

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Document.Copy');
    expect(req.request.method).toBe('POST');
    // The whole body: `target` picks the destination and `input` picks what is copied, so
    // asserting one and not the other would pass while copying the wrong document.
    expect(req.request.body).toEqual({
      params: { target: 'target-9' },
      context: {},
      input: 'doc:doc-1',
    });
    // Single-document copy goes through the `doc:` form, so no `docs:` batch and no
    // per-document fallback fan-out.
    expect(req.request.body.input).not.toContain('docs:');
    req.flush(nuxeoDoc({ uid: 'copy-1', title: 'Invoice' }));

    const response = await pending;
    expect(response.data.sys_id).toBe('copy-1');
    expect(response.data.sys_title).toBe('Invoice');
    expect(response.data.sys_repository).toBe('default');
  });

  it('accepts the automation `entries` envelope as well as a bare document', async () => {
    // `BrowseService.normalizeClipboardOpResult` accepts both shapes, and Nuxeo answers
    // with either depending on the operation chain. The port reads `[0]`, so a spec that
    // only ever flushed a bare document would not show that the envelope works.
    const pending = api.copy('doc-1', 'default', copyTo('target-9'));
    httpMock.expectOne('/nuxeo/api/v1/automation/Document.Copy').flush({
      'entity-type': 'documents',
      entries: [nuxeoDoc({ uid: 'copy-from-entries' })],
    });

    expect((await pending).data.sys_id).toBe('copy-from-entries');
  });

  it('rejects a requested rename instead of silently dropping it', async () => {
    // DEFECT (reported, not changed): `CopyCommand.name` is **required** in
    // `@hylandsoftware/hxcs-js-client`, and upstream's `SingleItemCopyService` always
    // passes it — `this.copyApi.copy(id, 'default', { name, targetParentId })`. So for any
    // non-empty name this method always throws, and the only `CopyCommand` that reaches the
    // Nuxeo call is one whose required `name` is `''`.
    //
    // Asserting the actual behaviour: refusing is the deliberate and better-documented
    // choice than a silent drop, and Nuxeo's `Document.Copy` genuinely cannot rename in the
    // same call. But it makes the success path unreachable from upstream's own copy dialog,
    // and upstream collapses the error to `CopyStatus.ERROR` without a message, so the
    // reason never reaches the user. That is a real gap, not a passing test's problem.
    await expect(
      api.copy('doc-1', 'default', { name: 'Renamed.pdf', targetParentId: 't' }),
    ).rejects.toThrow('copy cannot rename in the same operation');
    // Refused *before* the request, which is the part that matters: a rejected rename must
    // not leave a copy behind under the wrong name. `httpMock.verify()` in `afterEach`
    // is what proves it, and `expectNone` states it locally.
    httpMock.expectNone('/nuxeo/api/v1/automation/Document.Copy');
  });

  it('requires a document id, a target parent and the default repository', async () => {
    await expect(api.copy('', 'default', copyTo('t'))).rejects.toThrow(
      'copy requires a document id',
    );
    await expect(api.copy('doc-1', 'other-repo', copyTo('t'))).rejects.toThrow(
      'serves only "default"',
    );
    // No `copyCommand` at all, and a command with no target: both mean "copy to nowhere",
    // which must not be resolved to a default destination.
    await expect(api.copy('doc-1')).rejects.toThrow('copy requires copyCommand.targetParentId');
    await expect(api.copy('doc-1', 'default', { name: '', targetParentId: '' })).rejects.toThrow(
      'copy requires copyCommand.targetParentId',
    );
    httpMock.expectNone('/nuxeo/api/v1/automation/Document.Copy');
  });

  it('fails loudly when Nuxeo accepts the copy but returns no document', async () => {
    // A 200 with an empty result is the case that would otherwise produce
    // `{ data: undefined }` and a component reading `.sys_id` off it later, far from here.
    const pending = api.copy('doc-1', 'default', copyTo('target-9'));
    httpMock
      .expectOne('/nuxeo/api/v1/automation/Document.Copy')
      .flush({ 'entity-type': 'documents', entries: [] });

    await expect(pending).rejects.toThrow('copy of doc-1 returned no document from Nuxeo');
  });

  it('surfaces a permission failure rather than resolving', async () => {
    const pending = api.copy('doc-1', 'default', copyTo('target-9'));
    httpMock
      .expectOne('/nuxeo/api/v1/automation/Document.Copy')
      .flush({ message: 'Privilege' }, { status: 403, statusText: 'Forbidden' });

    await expect(pending).rejects.toBeDefined();
  });
});

describe('NuxeoMoveApi', () => {
  let api: NuxeoMoveApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), NuxeoMoveApi],
    });
    api = TestBed.inject(NuxeoMoveApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  const moveTo = (targetParentId: string): MoveCommand => ({ targetParentId });

  it('moves through Document.Move, not Document.Copy', async () => {
    const pending = api.move('doc-2', 'default', moveTo('target-3'));

    // The operation name is the assertion. Copy and move take an identical body, so a port
    // wired to the wrong operation would satisfy every other check in this file while
    // leaving the original document in place — or removing it when it should not.
    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Document.Move');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      params: { target: 'target-3' },
      context: {},
      input: 'doc:doc-2',
    });
    req.flush(
      nuxeoDoc({ uid: 'doc-2', title: 'Moved', path: '/default-domain/workspaces/target/Moved' }),
    );

    const response = await pending;
    expect(response.data.sys_id).toBe('doc-2');
    expect(response.data.sys_path).toBe('/default-domain/workspaces/target/Moved');
    // The mapper derives the parent path from the new location, which is the observable
    // proof the move result was mapped rather than the pre-move document echoed back.
    expect(response.data.sys_parentPath).toBe('/default-domain/workspaces/target');
  });

  it('has no rename guard, because MoveCommand carries no name', async () => {
    // Asymmetry with `copy`, and it is correct: `MoveCommand` has `targetParentId` only, so
    // there is no name to refuse. Asserted so the difference reads as deliberate.
    const pending = api.move('doc-2', 'default', moveTo('target-3'));
    httpMock.expectOne('/nuxeo/api/v1/automation/Document.Move').flush(nuxeoDoc({ uid: 'doc-2' }));
    await expect(pending).resolves.toBeDefined();
  });

  it('requires a document id, a target parent and the default repository', async () => {
    await expect(api.move('', 'default', moveTo('t'))).rejects.toThrow(
      'move requires a document id',
    );
    await expect(api.move('doc-2', 'other-repo', moveTo('t'))).rejects.toThrow(
      'serves only "default"',
    );
    await expect(api.move('doc-2')).rejects.toThrow('move requires moveCommand.targetParentId');
    httpMock.expectNone('/nuxeo/api/v1/automation/Document.Move');
  });

  it('fails loudly when Nuxeo returns no document, rather than reporting a move that may not have happened', async () => {
    const pending = api.move('doc-2', 'default', moveTo('target-3'));
    httpMock
      .expectOne('/nuxeo/api/v1/automation/Document.Move')
      .flush({ 'entity-type': 'documents', entries: [] });

    await expect(pending).rejects.toThrow('move of doc-2 returned no document from Nuxeo');
  });

  it('surfaces a server error', async () => {
    const pending = api.move('doc-2', 'default', moveTo('target-3'));
    httpMock
      .expectOne('/nuxeo/api/v1/automation/Document.Move')
      .flush({ message: 'nope' }, { status: 500, statusText: 'Server Error' });

    await expect(pending).rejects.toBeDefined();
  });
});
