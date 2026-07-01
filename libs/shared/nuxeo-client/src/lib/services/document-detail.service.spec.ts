import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { CURRENT_USERNAME } from '../current-user.token';
import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { DocumentDetailService } from './document-detail.service';

describe('DocumentDetailService permissions', () => {
  let service: DocumentDetailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
        { provide: CURRENT_USERNAME, useValue: () => 'satori-admin' },
      ],
    });

    service = TestBed.inject(DocumentDetailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('addPermission sends creator from CURRENT_USERNAME', async () => {
    const doc$ = firstValueFrom(
      service.addPermission('doc-uid', {
        username: 'user-readonly01',
        permission: 'Read',
      }),
    );

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Document.AddPermission');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      params: {
        username: 'user-readonly01',
        permission: 'Read',
        begin: null,
        end: null,
        notify: false,
        comment: '',
        creator: 'satori-admin',
      },
      context: {},
      input: 'doc-uid',
    });
    req.flush({ uid: 'doc-uid' });

    await expect(doc$).resolves.toEqual({ uid: 'doc-uid' });
  });

  it('addPermission prefers explicit creator override', async () => {
    const doc$ = firstValueFrom(
      service.addPermission('doc-uid', {
        username: 'user-readonly01',
        permission: 'Read',
        creator: 'custom-grantor',
      }),
    );

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Document.AddPermission');
    expect(req.request.body.params.creator).toBe('custom-grantor');
    req.flush({ uid: 'doc-uid' });

    await doc$;
  });

  it('addPermission omits creator when no user is available', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
        { provide: CURRENT_USERNAME, useValue: () => null },
      ],
    });
    service = TestBed.inject(DocumentDetailService);
    httpMock = TestBed.inject(HttpTestingController);

    const doc$ = firstValueFrom(
      service.addPermission('doc-uid', {
        username: 'user-readonly01',
        permission: 'Read',
      }),
    );

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Document.AddPermission');
    expect(req.request.body.params).not.toHaveProperty('creator');
    req.flush({ uid: 'doc-uid' });

    await doc$;
  });

  it('getDocumentPermissions normalizes enriched username and creator entities', async () => {
    const doc$ = firstValueFrom(service.getDocumentPermissions('root-uid'));

    const req = httpMock.expectOne('/nuxeo/api/v1/id/root-uid');
    expect(req.request.headers.get('fetch-acls')).toBe('username,creator,extended');
    req.flush({
      uid: 'root-uid',
      contextParameters: {
        acls: [
          {
            name: 'local',
            aces: [
              {
                id: 'ace-1',
                username: {
                  'entity-type': 'user',
                  id: 'Administrator',
                  properties: { username: 'Administrator' },
                },
                externalUser: false,
                permission: 'Everything',
                granted: true,
                creator: {
                  'entity-type': 'user',
                  id: 'Administrator',
                  properties: { username: 'Administrator' },
                },
                begin: null,
                end: null,
                status: 'effective',
              },
            ],
          },
        ],
      },
    });

    const doc = await doc$;
    const ace = doc.contextParameters?.['acls']?.[0]?.aces?.[0];
    expect(ace?.username).toBe('Administrator');
    expect(ace?.creator).toBe('Administrator');
  });

  it('addExternalPermission sends creator from CURRENT_USERNAME', async () => {
    const doc$ = firstValueFrom(
      service.addExternalPermission('doc-uid', {
        email: 'guest@example.com',
        permission: 'Read',
      }),
    );

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/Document.AddPermission');
    expect(req.request.body).toEqual({
      params: {
        email: 'guest@example.com',
        permission: 'Read',
        begin: null,
        end: undefined,
        notify: true,
        comment: '',
        creator: 'satori-admin',
      },
      context: {},
      input: 'doc-uid',
    });
    req.flush({ uid: 'doc-uid' });

    await doc$;
  });
});
