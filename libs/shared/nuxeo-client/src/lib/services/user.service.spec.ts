import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests group members via fetch.group enricher header (NXSAT-153)', async () => {
    const group$ = firstValueFrom(service.getGroup('administrators'));
    const req = httpMock.expectOne('/nuxeo/api/v1/group/administrators');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('fetch.group')).toBe('memberUsers,memberGroups');
    req.flush({
      'entity-type': 'group',
      groupname: 'administrators',
      grouplabel: 'Administrators',
      memberUsers: ['Administrator', 'demoUserSatori'],
      memberGroups: [],
    });

    await expect(group$).resolves.toMatchObject({
      groupname: 'administrators',
      memberUsers: ['Administrator', 'demoUserSatori'],
      memberGroups: [],
    });
  });

  it('encodes special characters in group id', () => {
    service.getGroup('group/with space').subscribe();
    const req = httpMock.expectOne('/nuxeo/api/v1/group/group%2Fwith%20space');
    expect(req.request.headers.get('fetch.group')).toBe('memberUsers,memberGroups');
    req.flush({ 'entity-type': 'group', groupname: 'group/with space' });
  });
});
