import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NUXEO_API_ORIGIN, type NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';
import type { ContentError } from '@agentic-ui/shared/content-ports';

import { NuxeoPermissionsAdapter } from './nuxeo-permissions.adapter';

function docWithAce(overrides: Record<string, unknown> = {}, aclName = 'local'): NuxeoDocument {
  return {
    uid: 'uid-1',
    title: 'Report',
    type: 'File',
    path: '/report',
    lastModified: '2026-02-01T10:00:00.000Z',
    properties: {},
    contextParameters: {
      acls: [
        {
          name: aclName,
          aces: [
            {
              id: 'ace-1',
              username: 'alice',
              externalUser: false,
              permission: 'Read',
              granted: true,
              creator: 'admin',
              begin: null,
              end: null,
              status: 'effective',
              ...overrides,
            },
          ],
        },
      ],
    },
  };
}

describe('NuxeoPermissionsAdapter', () => {
  let adapter: NuxeoPermissionsAdapter;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });
    adapter = TestBed.inject(NuxeoPermissionsAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists neutral permissions for a node', () => {
    let ids: string[] = [];
    adapter.list({ id: 'uid-1' }).subscribe((permissions) => {
      ids = permissions.map((permission) => permission.id);
    });

    httpMock.expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/uid-1')).flush(docWithAce());
    expect(ids).toEqual(['ace-1']);
  });

  it('refuses to write a deny ACE rather than silently granting', () => {
    let captured: ContentError | undefined;
    adapter
      .grant({ id: 'uid-1' }, { principal: { id: 'alice' }, permission: 'Read', granted: false })
      .subscribe({ error: (error: ContentError) => (captured = error) });

    expect(captured?.kind).toBe('UnsupportedField');
  });

  it('revokes by the ACE id it read back, never by principal', () => {
    // The contract does not promise Permission.id is a durable backend handle, so the
    // adapter reads the ACL first. This asserts that extra hop happens, and that the
    // removal names the ACE — revoking by `user` would drop every ACE alice holds.
    adapter.revoke({ id: 'uid-1' }, 'ace-1').subscribe();

    httpMock.expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/uid-1')).flush(docWithAce());

    const removal = httpMock.expectOne((r) => r.url.includes('Document.RemovePermission'));
    expect(removal.request.body.params).toEqual({ id: 'ace-1', acl: 'local' });
    removal.flush(docWithAce());
  });

  it('revokes against the ACL the ACE came from', () => {
    adapter.revoke({ id: 'uid-1' }, 'ace-1').subscribe();

    httpMock
      .expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/uid-1'))
      .flush(docWithAce({}, 'inherited'));

    const removal = httpMock.expectOne((r) => r.url.includes('Document.RemovePermission'));
    expect(removal.request.body.params).toEqual({ id: 'ace-1', acl: 'inherited' });
    removal.flush(docWithAce({}, 'inherited'));
  });

  it('reports NotFound when the permission id is not on the node', () => {
    let captured: ContentError | undefined;
    adapter
      .revoke({ id: 'uid-1' }, 'ace-missing')
      .subscribe({ error: (error: ContentError) => (captured = error) });

    httpMock.expectOne((r) => r.url.endsWith('/nuxeo/api/v1/id/uid-1')).flush(docWithAce());
    expect(captured?.kind).toBe('NotFound');
  });

  it('declares that Nuxeo honours every optional permission field', () => {
    expect(adapter.capabilities().honours).toEqual({
      begin: true,
      end: true,
      deny: true,
      blockInheritance: true,
    });
  });
});
