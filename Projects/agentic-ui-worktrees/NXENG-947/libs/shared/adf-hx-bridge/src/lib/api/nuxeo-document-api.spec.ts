import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import type { NuxeoAce, NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';
import { NuxeoDocumentApi, ROOT_DOCUMENT as ROOT_DOCUMENT_FROM_PORT } from './nuxeo-document-api';
import { NuxeoAclService } from '../services/nuxeo-acl.service';
import { NuxeoPrincipalResolver } from '../services/nuxeo-principal-resolver.service';
import { DEFAULT_REPOSITORY_ID, ROOT_DOCUMENT } from '../tokens/adf-hx-bridge.tokens';

describe('NuxeoDocumentApi', () => {
  let api: NuxeoDocumentApi;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock.verify();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoDocumentApi, NuxeoAclService, NuxeoPrincipalResolver],
    });
    api = TestBed.inject(NuxeoDocumentApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * Lets the port's own `await` continuations run.
   *
   * The methods here are `async` and issue their *second* round of requests — the ACL probes,
   * the ancestor walk — only after `await firstValueFrom(...)` resolves. `flush()` delivers the
   * first response synchronously, but the continuation is queued, so an `expectOne` placed
   * immediately after `flush()` finds nothing and the real requests are then reported as
   * unexpected by `verify()`. Yielding to the task queue is what puts them in flight.
   */
  const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

  /**
   * One complete Nuxeo ACE. Every optional-looking field on `NuxeoAce` is in fact required, so a
   * partial literal only compiles behind a cast — which is what hid an incomplete fixture here.
   */
  const nuxeoAce = (over: Partial<NuxeoAce> = {}): NuxeoAce => ({
    id: '1',
    username: 'jdoe',
    externalUser: false,
    permission: 'Read',
    granted: true,
    creator: null,
    begin: null,
    end: null,
    status: 'effective',
    ...over,
  });

  const nuxeoDoc = (over: Partial<NuxeoDocument> = {}): NuxeoDocument => ({
    uid: 'doc-1',
    title: 'Invoice',
    type: 'File',
    path: '/default-domain/workspaces/ws/Invoice',
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    ...over,
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

  it('requests the enrichers the ACL step depends on', () => {
    // `getFullDocument` asks for the `acls` enricher, and `withAcl` reads it from
    // `contextParameters`. Dropping the enricher would make every `sys_acl` silently
    // `undefined` with no error anywhere — so the request header is the assertion.
    api.getDocumentById('doc-1');

    const req = httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('enrichers.document')).toContain('acls');
    expect(req.request.headers.get('properties')).toBe('*');
    req.flush(nuxeoDoc());
  });

  it('resolves a path to a document, asking Nuxeo by path rather than by id', async () => {
    const pending = api.getDocumentByPath('/default-domain/workspaces/ws');

    const req = httpMock.expectOne(
      (r) => r.url === '/nuxeo/api/v1/path/default-domain/workspaces/ws',
    );
    expect(req.request.method).toBe('GET');
    req.flush(
      nuxeoDoc({
        uid: 'ws-1',
        title: 'Workspace',
        type: 'Workspace',
        path: '/default-domain/workspaces/ws',
      }),
    );

    const { data } = await pending;
    expect(data.sys_id).toBe('ws-1');
    expect(data.sys_isFolderish).toBe(true);
    expect(data.sys_primaryType).toBe('Workspace');
  });

  it('strips trailing slashes from a path before asking Nuxeo', async () => {
    // `/path//` would be a different URL and a 404. The normalisation is why the POC's
    // `?path=` query parameter can be passed through unedited.
    const pending = api.getDocumentByPath('/default-domain/workspaces/ws///');

    const req = httpMock.expectOne(
      (r) => r.url === '/nuxeo/api/v1/path/default-domain/workspaces/ws',
    );
    req.flush(nuxeoDoc({ uid: 'ws-1', type: 'Workspace', path: '/default-domain/workspaces/ws' }));

    expect((await pending).data.sys_id).toBe('ws-1');
  });

  it('synthesises the repository root for "/" without calling Nuxeo', async () => {
    // Nuxeo's `GET /path/` is 403 for a user with domain-only ACLs, and the root is not a
    // document anyone edits, so it is synthesised. The absence of a request is the point.
    for (const path of ['/', '//', '']) {
      const { data } = await api.getDocumentByPath(path);
      expect(data.sys_primaryType).toBe('SysRoot');
      expect(data.sys_id).toBe(ROOT_DOCUMENT.sys_id);
      expect(data.sys_path).toBe('/');
    }
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/path'));
  });

  it('carries the requested repository into the synthetic root', async () => {
    // The synthetic root is the one document this port invents, so it must not hardcode a
    // repository the caller did not ask for.
    const { data } = await api.getDocumentByPath('/', 'default');
    expect(data.sys_repository).toBe('default');
  });

  it('adds sys_acl for a single-document read, resolving users and groups separately', async () => {
    const pending = api.getDocumentById('doc-1');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1')
      .flush(
        nuxeoDoc({
          contextParameters: {
            acls: [
              {
                name: 'local',
                aces: [
                  {
                    id: 'a',
                    username: 'Administrator',
                    externalUser: false,
                    permission: 'Everything',
                    granted: true,
                    creator: 'Administrator',
                    begin: null,
                    end: null,
                    status: 'effective',
                  },
                  {
                    id: 'b',
                    username: 'members',
                    externalUser: false,
                    permission: 'Read',
                    granted: true,
                    creator: 'Administrator',
                    begin: null,
                    end: null,
                    status: 'effective',
                  },
                ],
              },
            ],
          },
        }),
      );
    await settle();

    // `Administrator`: not a group, then a user. `members`: a group on the first probe.
    httpMock
      .expectOne((r) => r.url.endsWith('/group/Administrator'))
      .flush({}, { status: 404, statusText: 'Not Found' });
    httpMock
      .expectOne((r) => r.url.endsWith('/group/members'))
      .flush({
        'entity-type': 'group',
        groupname: 'members',
        grouplabel: 'Members group',
      });
    // The user probe only exists because the group probe 404'd, so it is issued after that
    // response is delivered — another queued continuation.
    await settle();
    httpMock
      .expectOne((r) => r.url.endsWith('/user/Administrator'))
      .flush({
        'entity-type': 'user',
        id: 'Administrator',
        properties: { username: 'Administrator' },
      });

    const { data } = await pending;
    expect(data.sys_acl).toHaveLength(2);
    // The whole reason `withAcl` is async: the user/group distinction cannot be read off the
    // ACE, so getting it wrong mislabels every group in the permissions panel.
    expect(data.sys_acl?.[0].user?.username).toBe('Administrator');
    expect(data.sys_acl?.[0].group).toBeUndefined();
    expect(data.sys_acl?.[1].group?.name).toBe('Members group');
    expect(data.sys_acl?.[1].user).toBeUndefined();
  });

  it('leaves sys_acl absent when the read carried no acls enricher', async () => {
    // `undefined`, not `[]`. An empty array would assert the document has no ACL, which a read
    // that did not request the enricher cannot know.
    const pending = api.getDocumentById('doc-1');
    httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1').flush(nuxeoDoc());

    const { data } = await pending;
    expect('sys_acl' in data).toBe(false);
    expect(data.sys_acl).toBeUndefined();
  });

  it('adds sys_acl on a path read too, not only an id read', async () => {
    const pending = api.getDocumentByPath('/default-domain/workspaces/ws');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/path/default-domain/workspaces/ws')
      .flush(
        nuxeoDoc({
          uid: 'ws-1',
          type: 'Workspace',
          path: '/default-domain/workspaces/ws',
          contextParameters: { acls: [] },
        }),
      );

    // An `acls` array that is present but empty *is* knowable: the document really has no ACEs.
    expect((await pending).data.sys_acl).toEqual([]);
  });

  it('walks the ancestor paths upward, excluding the document and the root', async () => {
    const pending = api.getDocumentAncestors('doc-1');

    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1')
      .flush(nuxeoDoc({ path: '/default-domain/workspaces/ws/Invoice' }));
    await settle();

    // One request per ancestor, deepest last, and none for `/` or for the document itself.
    const expected = [
      '/nuxeo/api/v1/path/default-domain',
      '/nuxeo/api/v1/path/default-domain/workspaces',
      '/nuxeo/api/v1/path/default-domain/workspaces/ws',
    ];
    expected.forEach((url, i) => {
      httpMock
        .expectOne((r) => r.url === url)
        .flush(
          nuxeoDoc({
            uid: `anc-${i}`,
            type: i === 0 ? 'Domain' : 'Workspace',
            path: url.replace('/nuxeo/api/v1/path', ''),
          }),
        );
    });
    httpMock.expectNone((r) => r.url === '/nuxeo/api/v1/path/default-domain/workspaces/ws/Invoice');

    const { data } = await pending;
    // Order is load-bearing: the breadcrumb renders this array left to right.
    expect(data.ancestors?.map((a) => a.sys_id)).toEqual(['anc-0', 'anc-1', 'anc-2']);
    expect(data.ancestors?.map((a) => a.sys_path)).toEqual([
      '/default-domain',
      '/default-domain/workspaces',
      '/default-domain/workspaces/ws',
    ]);
  });

  it('returns no ancestors for the synthetic root, without calling Nuxeo', async () => {
    const { data } = await api.getDocumentAncestors(ROOT_DOCUMENT.sys_id);
    expect(data.ancestors).toEqual([]);
    httpMock.expectNone(() => true);
  });

  it('returns no ancestors for a document sitting at the repository root', async () => {
    // A single trip to read the document, then nothing: `/` has no ancestors, and the loop
    // starts at `i = 1` so a one-segment path yields none either.
    const pending = api.getDocumentAncestors('doc-1');
    httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1').flush(nuxeoDoc({ path: '/' }));
    await settle();

    expect((await pending).data.ancestors).toEqual([]);
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/path'));
  });

  it('returns no ancestors for a top-level document', async () => {
    const pending = api.getDocumentAncestors('doc-1');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1')
      .flush(nuxeoDoc({ path: '/default-domain' }));
    await settle();

    expect((await pending).data.ancestors).toEqual([]);
    httpMock.expectNone((r) => r.url.includes('/nuxeo/api/v1/path'));
  });

  it('rejects the whole ancestor walk if one ancestor is unreadable', async () => {
    // `Promise.all`, so one 403 rejects. The alternative — a partial breadcrumb — would show a
    // path the user could not actually navigate, which is worse than an error.
    const pending = api.getDocumentAncestors('doc-1');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1')
      .flush(nuxeoDoc({ path: '/default-domain/workspaces/ws/Invoice' }));
    await settle();

    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/path/default-domain')
      .flush({ message: 'no' }, { status: 403, statusText: 'Forbidden' });
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/path/default-domain/workspaces')
      .flush(nuxeoDoc({ uid: 'anc-1', type: 'Workspace', path: '/default-domain/workspaces' }));
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/path/default-domain/workspaces/ws')
      .flush(nuxeoDoc({ uid: 'anc-2', type: 'Workspace', path: '/default-domain/workspaces/ws' }));

    await expect(pending).rejects.toBeDefined();
  });

  it('surfaces a failure on the document read itself', async () => {
    const pending = api.getDocumentById('missing');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/missing')
      .flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    await expect(pending).rejects.toBeDefined();
  });

  it('surfaces a failure on a path read', async () => {
    const pending = api.getDocumentByPath('/default-domain/nope');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/path/default-domain/nope')
      .flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    await expect(pending).rejects.toBeDefined();
  });

  it('refuses every unimplemented write with an explicit Scope A message rather than failing obscurely', async () => {
    // The seven methods upstream's `DocumentService` will call that this port does not
    // implement. They are declared so the port satisfies the interface and construction
    // succeeds; if any silently resolved, a component would report a save that never
    // happened. Each is exercised so a removed throw is caught.
    //
    // `updateDocumentById` is deliberately NOT in this list: it is implemented for
    // `sys_acl`, so asserting it here would pass on the substring while claiming the
    // opposite of what the port does. Its real contract is the test below.
    const writes: readonly [string, () => Promise<unknown>][] = [
      ['createDocumentUnderParentById', () => api.createDocumentUnderParentById()],
      ['createDocumentUnderParentByPath', () => api.createDocumentUnderParentByPath()],
      ['deleteDocumentById', () => api.deleteDocumentById()],
      ['deleteDocumentByPath', () => api.deleteDocumentByPath()],
      ['patchDocumentById', () => api.patchDocumentById()],
      ['patchDocumentByPath', () => api.patchDocumentByPath()],
      ['updateDocumentByPath', () => api.updateDocumentByPath()],
    ];

    for (const [name, call] of writes) {
      await expect(call()).rejects.toThrow(`${name} is not implemented in Scope A`);
    }
    // And none of them reached Nuxeo on the way to throwing.
    httpMock.expectNone(() => true);
  });

  it('refuses to rewrite an ACL holding a permission the panel cannot represent', async () => {
    // Upstream ranks rows against Read/ReadWrite/Everything and drops anything else on save.
    // Combined with the clear-then-replay below, `AddChildren` was silently deleted and the call
    // returned success. Refusing before the clear is the only place the data still exists.
    const pending = api.updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, {
      sys_acl: [{ user: { id: 'jdoe' }, permission: 'Read', granted: true }],
    });

    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1')
      .flush(
        nuxeoDoc({
          contextParameters: {
            acls: [
              {
                name: 'local',
                aces: [
                  nuxeoAce({ id: '1', username: 'jdoe', permission: 'Read' }),
                  nuxeoAce({ id: '2', username: 'authors', permission: 'AddChildren' }),
                ],
              },
            ],
          },
        }),
      );

    await expect(pending).rejects.toThrow(/authors: AddChildren/);
    // The decisive part: nothing was cleared, so the ACE is still on the document.
    httpMock.expectNone((r) => r.url.includes('Document.RemoveACL'));
  });

  it('restores the previous ACL when the replay fails, and says the document is unchanged', async () => {
    // `.catch` attaches synchronously, so the rejection is never unhandled while the flushes
    // below run. Awaiting only at the end of the test made Vitest report an unhandled rejection.
    const pending = api
      .updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, {
        sys_acl: [{ user: { id: 'newcomer' }, permission: 'ReadWrite', granted: true }],
      })
      .then(() => null)
      .catch((error: unknown) => error);

    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1')
      .flush(
        nuxeoDoc({
          contextParameters: {
            acls: [
              {
                name: 'local',
                aces: [
                  nuxeoAce({ id: '1', username: 'jdoe', permission: 'Read', creator: 'admin' }),
                ],
              },
            ],
          },
        }),
      );
    await settle();

    httpMock.expectOne((r) => r.url.includes('Document.RemoveACL')).flush(nuxeoDoc());
    await settle();

    // The replay fails on the first grant.
    httpMock
      .expectOne((r) => r.url.includes('Document.AddPermission'))
      .flush('nope', { status: 500, statusText: 'Server Error' });
    await settle();

    // Compensation: clear again, then put the previous ACL back.
    httpMock.expectOne((r) => r.url.includes('Document.RemoveACL')).flush(nuxeoDoc());
    await settle();

    const restore = httpMock.expectOne((r) => r.url.includes('Document.AddPermission'));
    expect(restore.request.body.params.username).toBe('jdoe');
    expect(restore.request.body.params.permission).toBe('Read');
    // The creator travels with the restore, so "Granted by" is not re-stamped to the saver.
    expect(restore.request.body.params.creator).toBe('admin');
    restore.flush(nuxeoDoc());
    await settle();

    const message = String(await pending);
    expect(message).toMatch(/previous ACL was restored, so the document is unchanged/);
    // Names the underlying cause. String(HttpErrorResponse) is '[object Object]', which told an
    // operator nothing about whether this was a denial or an outage.
    expect(message).toContain('HTTP 500');
  });

  it('refuses a deny ACE, which Document.AddPermission cannot express', async () => {
    const pending = api.updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, {
      sys_acl: [{ group: { id: 'members' }, permission: 'ReadWrite', granted: false }],
    });

    await expect(pending).rejects.toThrow(/cannot store a deny ACE/);
    httpMock.expectNone((r) => r.url.includes('Document.RemoveACL'));
  });

  it('refuses an ACL containing an ACE it cannot read, rather than dropping it after the clear', async () => {
    const pending = api.updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, {
      // No principal Nuxeo can address: skipping this would delete it, because the write clears
      // the local ACL first.
      sys_acl: [{ permission: 'Read', granted: true }],
    });

    await expect(pending).rejects.toThrow(/cannot read/);
    httpMock.expectNone((r) => r.url.includes('Document.RemoveACL'));
  });

  it('says the document needs manual repair when the rollback also fails', async () => {
    // `.catch` attaches synchronously, so the rejection is never unhandled while the flushes
    // below run. Awaiting only at the end of the test made Vitest report an unhandled rejection.
    const pending = api
      .updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, {
        sys_acl: [{ user: { id: 'newcomer' }, permission: 'ReadWrite', granted: true }],
      })
      .then(() => null)
      .catch((error: unknown) => error);

    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1')
      .flush(
        nuxeoDoc({
          contextParameters: {
            acls: [{ name: 'local', aces: [nuxeoAce({ username: 'jdoe', permission: 'Read' })] }],
          },
        }),
      );
    await settle();

    httpMock.expectOne((r) => r.url.includes('Document.RemoveACL')).flush(nuxeoDoc());
    await settle();
    httpMock
      .expectOne((r) => r.url.includes('Document.AddPermission'))
      .flush('nope', { status: 500, statusText: 'Server Error' });
    await settle();

    // The compensating clear fails too, so nothing can be put back.
    httpMock
      .expectOne((r) => r.url.includes('Document.RemoveACL'))
      .flush('nope', { status: 500, statusText: 'Server Error' });
    await settle();

    expect(String(await pending)).toMatch(/needs manual repair/);
  });

  it('blocks inheritance after the grants, so the deny cannot shadow them', async () => {
    // Pins the ordering deliberately: Nuxeo appends the deny ACE and evaluates in order, so
    // blocking first would place a deny-Everything-to-Everyone ahead of every grant. Review
    // proposed exactly that as a way to shrink the widening window; this test is why it was not
    // taken.
    const order: string[] = [];
    const pending = api.updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, {
      sys_acl: [
        { user: { id: 'jdoe' }, permission: 'Read', granted: true },
        { user: '__Everyone__', permission: 'Everything', granted: false },
      ],
    });

    httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1').flush(nuxeoDoc());
    await settle();
    httpMock.expectOne((r) => r.url.includes('Document.RemoveACL')).flush(nuxeoDoc());
    await settle();

    const grant = httpMock.expectOne((r) => r.url.includes('Document.AddPermission'));
    order.push('grant');
    grant.flush(nuxeoDoc());
    await settle();

    const block = httpMock.expectOne((r) => r.url.includes('Document.BlockPermissionInheritance'));
    order.push('block');
    block.flush(nuxeoDoc());
    await settle();

    httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/doc-1').flush(nuxeoDoc());
    await pending;

    expect(order).toEqual(['grant', 'block']);
  });

  it('accepts only a sys_acl payload on updateDocumentById, naming the properties it refused', async () => {
    await expect(
      api.updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, { 'dc:title': 'Renamed' }),
    ).rejects.toThrow(
      'updateDocumentById is not implemented in Scope A beyond sys_acl; received dc:title',
    );

    // The refusal has to name what it dropped. A component that patched title and ACL
    // together would otherwise be told only that "something" was unsupported.
    await expect(
      api.updateDocumentById('doc-1', DEFAULT_REPOSITORY_ID, {
        'dc:title': 'Renamed',
        sys_acl: [],
      }),
    ).rejects.toThrow(/received dc:title/);

    httpMock.expectNone(() => true);
  });

  it('re-exports ROOT_DOCUMENT so a consumer need not reach into the tokens file', () => {
    // Asserted because the re-export is part of the port's surface: upstream compares against
    // its own `ROOT_DOCUMENT`, and ours has to be the same value — the same *identity*, not a
    // copy, which is the mistake the tokens file records having made once already with the
    // API tokens.
    expect(ROOT_DOCUMENT_FROM_PORT).toBe(ROOT_DOCUMENT);
    expect(ROOT_DOCUMENT_FROM_PORT.sys_id).toBe('00000000-0000-0000-0000-000000000000');
    expect(ROOT_DOCUMENT_FROM_PORT.sys_primaryType).toBe('SysRoot');
  });
});
