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

  it('addPermissionWithNotification creates ACE then sends notification separately', async () => {
    const result$ = firstValueFrom(
      service.addPermissionWithNotification('doc-uid', {
        username: 'user-readonly01',
        permission: 'Read',
        notify: true,
        comment: 'Please review',
      }),
    );

    const addReq = httpMock.expectOne('/nuxeo/api/v1/automation/Document.AddPermission');
    expect(addReq.request.body.params.notify).toBe(false);
    expect(addReq.request.body.params.comment).toBe('Please review');
    addReq.flush(docWithLocalAce('ace-42', 'user-readonly01'));

    const notifyReq = httpMock.expectOne(
      '/nuxeo/api/v1/automation/Document.SendNotificationEmailForPermission',
    );
    expect(notifyReq.request.body).toEqual({
      params: { id: 'ace-42' },
      context: {},
      input: 'doc-uid',
    });
    notifyReq.flush({ uid: 'doc-uid' });

    await expect(result$).resolves.toEqual({
      document: { uid: 'doc-uid' },
      notificationSent: true,
    });
  });

  it('addPermissionWithNotification reports SMTP failure after permission is created', async () => {
    const result$ = firstValueFrom(
      service.addPermissionWithNotification('doc-uid', {
        username: 'user-readonly01',
        permission: 'Read',
        notify: true,
      }),
    );

    const addReq = httpMock.expectOne('/nuxeo/api/v1/automation/Document.AddPermission');
    addReq.flush(docWithLocalAce('ace-42', 'user-readonly01'));

    const notifyReq = httpMock.expectOne(
      '/nuxeo/api/v1/automation/Document.SendNotificationEmailForPermission',
    );
    notifyReq.flush(
      { message: 'An error occurred while sending a mail' },
      { status: 500, statusText: 'Server Error' },
    );

    await expect(result$).resolves.toEqual({
      document: docWithLocalAce('ace-42', 'user-readonly01'),
      notificationSent: false,
      notificationError: expect.stringContaining('SMTP'),
    });
  });
});

function docWithLocalAce(aceId: string, username: string) {
  return {
    uid: 'doc-uid',
    contextParameters: {
      acls: [
        {
          name: 'local',
          aces: [
            {
              id: aceId,
              username,
              externalUser: false,
              permission: 'Read',
              granted: true,
              creator: null,
              begin: null,
              end: null,
              status: 'effective',
            },
          ],
        },
      ],
    },
  };
}
