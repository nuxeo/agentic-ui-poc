import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CURRENT_USERNAME, UserService } from '@nuxeo-satori/platform/nuxeo-client';

import { NuxeoIdentityUserService } from './nuxeo-identity-user.service';

/**
 * Upstream's `PermissionsParserService` cannot be constructed without this token, and
 * `permissionsManagementRowsToAcl` stamps `getCurrentUserInfo().id` onto every edited ACE's
 * `creator`. A fabricated name there misattributes a permission change, so the empty-session case
 * is asserted as hard as the happy path.
 */
describe('NuxeoIdentityUserService', () => {
  let httpMock: HttpTestingController;
  let username: string | null;

  function configure(): NuxeoIdentityUserService {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NuxeoIdentityUserService,
        UserService,
        { provide: CURRENT_USERNAME, useValue: () => username },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(NuxeoIdentityUserService);
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    username = 'jdoe';
  });

  afterEach(() => httpMock.verify());

  it('reports the signed-in username as both id and username', () => {
    const service = configure();

    expect(service.getCurrentUserInfo()).toEqual({ id: 'jdoe', username: 'jdoe' });
  });

  it('reports an empty identity rather than a placeholder when there is no session', () => {
    username = null;
    const service = configure();

    expect(service.getCurrentUserInfo()).toEqual({ id: '', username: '' });
  });

  it('tracks the session, so a later sign-in is reflected without reconstruction', () => {
    const service = configure();
    username = 'someone-else';

    expect(service.getCurrentUserInfo().id).toBe('someone-else');
  });

  it('does not reach Nuxeo for an empty search term', async () => {
    const service = configure();

    await expect(service.search()).resolves.toEqual([]);
    await expect(service.search('')).resolves.toEqual([]);
  });

  it('maps a Nuxeo user search result onto the upstream identity shape', async () => {
    const service = configure();

    const pending = service.search('ada');

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/user/search'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('ada');
    req.flush({
      'entity-type': 'users',
      entries: [
        {
          'entity-type': 'user',
          id: 'alovelace',
          properties: {
            username: 'alovelace',
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada@example.test',
            groups: ['members'],
          },
        },
      ],
    });

    await expect(pending).resolves.toEqual([
      {
        id: 'alovelace',
        username: 'alovelace',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.test',
      },
    ]);
  });

  it('returns an empty list when Nuxeo matched nobody', async () => {
    const service = configure();

    const pending = service.search('nobody');
    httpMock
      .expectOne((r) => r.url.endsWith('/api/v1/user/search'))
      .flush({ 'entity-type': 'users', entries: [] });

    await expect(pending).resolves.toEqual([]);
  });

  it('rejects when the user directory is unavailable, rather than answering an empty list', async () => {
    const service = configure();

    const pending = service.search('ada');
    httpMock
      .expectOne((r) => r.url.endsWith('/api/v1/user/search'))
      .flush('boom', { status: 500, statusText: 'Server Error' });

    await expect(pending).rejects.toMatchObject({ status: 500 });
  });
});
