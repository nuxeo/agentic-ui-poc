import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const createInput = {
    username: 'jdoe',
    firstName: 'Jane',
    lastName: 'Doe',
    company: 'Hyland',
    email: 'jdoe@example.com',
    groups: ['members'],
  };

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

  it('creates a user with password via REST POST /user', async () => {
    const user$ = firstValueFrom(service.createUser({ ...createInput, password: 'Secret123' }));

    const req = httpMock.expectOne('/nuxeo/api/v1/user');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      'entity-type': 'user',
      id: 'jdoe',
      properties: {
        username: 'jdoe',
        firstName: 'Jane',
        lastName: 'Doe',
        company: 'Hyland',
        email: 'jdoe@example.com',
        password: 'Secret123',
        groups: ['members'],
      },
    });
    req.flush({ 'entity-type': 'user', id: 'jdoe', properties: createInput });

    const user = await user$;
    expect(user.id).toBe('jdoe');
  });

  it('invites a user without password via User.Invite automation', async () => {
    const user$ = firstValueFrom(service.createUser(createInput));

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/User.Invite');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      input: {
        'entity-type': 'user',
        id: '',
        properties: {
          username: 'jdoe',
          firstName: 'Jane',
          lastName: 'Doe',
          company: 'Hyland',
          email: 'jdoe@example.com',
          groups: ['members'],
        },
      },
      params: {},
      context: {},
    });
    req.flush('registration-request-id');

    const user = await user$;
    expect(user.id).toBe('jdoe');
    expect(user.properties.email).toBe('jdoe@example.com');
  });

  it('treats blank password as invitation flow', async () => {
    const user$ = firstValueFrom(service.createUser({ ...createInput, password: '   ' }));

    const req = httpMock.expectOne('/nuxeo/api/v1/automation/User.Invite');
    req.flush('registration-request-id');

    await user$;
  });
});
