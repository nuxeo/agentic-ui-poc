import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NuxeoGroupApi, NuxeoUserApi } from './nuxeo-user-group-api';

describe('NuxeoUserApi', () => {
  let api: NuxeoUserApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoUserApi],
    });
    api = TestBed.inject(NuxeoUserApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('flattens Nuxeo properties into the HxPR User shape', async () => {
    const pending = api.getUserById('jdoe');
    const req = httpMock.expectOne((r) => r.url.includes('/nuxeo/api/v1/user/jdoe'));
    req.flush({
      'entity-type': 'user',
      id: 'jdoe',
      properties: {
        username: 'jdoe',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'j@d.test',
        groups: [],
      },
    });

    const { data } = await pending;
    // The point of the mapping: Nuxeo nests these, HxPR does not.
    expect(data).toMatchObject({
      id: 'jdoe',
      username: 'jdoe',
      firstName: 'Jane',
      email: 'j@d.test',
    });
  });

  /**
   * Upstream composes every displayed user name as `` `${firstName} ${lastName}` `` with no
   * guard (`UserResolverService.getFullName`). Nuxeo's own `Administrator` has both properties
   * set to the empty string, so these two cases are the difference between a readable name and
   * a blank cell wherever a user is rendered — version creators, contributors, permissions.
   */
  it('falls back to the username when Nuxeo has no first name', async () => {
    const pending = api.getUserById('Administrator');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/user/Administrator'))
      .flush({
        'entity-type': 'user',
        id: 'Administrator',
        properties: { username: 'Administrator', firstName: '', lastName: '', groups: [] },
      });

    const { data } = await pending;
    expect(data.firstName).toBe('Administrator');
    // Not the username again: upstream joins the two with a space, and repeating it would
    // render "Administrator Administrator".
    expect(data.lastName).toBe('');
    expect(`${data.firstName} ${data.lastName}`.trim()).toBe('Administrator');
  });

  it('never leaves the composed name as "undefined undefined"', async () => {
    const pending = api.getUserById('sparse');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/user/sparse'))
      .flush({ 'entity-type': 'user', id: 'sparse', properties: { username: 'sparse' } });

    const { data } = await pending;
    expect(`${data.firstName} ${data.lastName}`).not.toContain('undefined');
  });

  it('refuses an empty search term rather than fetching the whole directory', async () => {
    await expect(api.searchUsersByName('')).rejects.toThrow('requires a search term');
  });

  it('surfaces a server error instead of resolving with an empty list', async () => {
    const pending = api.searchUsersByName('ja');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/user/search'))
      .flush({}, { status: 500, statusText: 'Server Error' });
    await expect(pending).rejects.toBeDefined();
  });

  it('refuses an empty user id before issuing a request', async () => {
    // Without the guard the URL becomes `/user/`, which Nuxeo answers with the directory
    // listing — a different and far more expensive call than the caller made.
    await expect(api.getUserById('')).rejects.toThrow('getUserById requires a user id');
    httpMock.expectNone(() => true);
  });

  it('propagates a 404 for a user that does not exist', async () => {
    const pending = api.getUserById('ghost');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/user/ghost'))
      .flush('No such user', { status: 404, statusText: 'Not Found' });
    await expect(pending).rejects.toMatchObject({ status: 404 });
  });

  it('maps every hit in a search, applying the same name fallbacks', async () => {
    const pending = api.searchUsersByName('a');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/user/search'))
      .flush({
        'entity-type': 'users',
        entries: [
          {
            'entity-type': 'user',
            id: 'jdoe',
            properties: { username: 'jdoe', firstName: 'Jane', lastName: 'Doe' },
          },
          { 'entity-type': 'user', id: 'bare', properties: {} },
        ],
      });

    const { data } = await pending;
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ id: 'jdoe', firstName: 'Jane', lastName: 'Doe' });
    // No `properties.username` at all, so the id is the only name available.
    expect(data[1]).toMatchObject({ id: 'bare', username: 'bare', firstName: 'bare' });
  });

  it('returns an empty list for a search that matched nothing', async () => {
    const pending = api.searchUsersByName('zzz');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/user/search'))
      .flush({ 'entity-type': 'users', entries: [] });
    expect((await pending).data).toEqual([]);
  });
});

describe('NuxeoGroupApi', () => {
  let api: NuxeoGroupApi;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoGroupApi],
    });
    api = TestBed.inject(NuxeoGroupApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('maps grouplabel to name and groupname to id, not the other way round', async () => {
    const pending = api.getGroupById('administrators');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/group/administrators'))
      .flush({ 'entity-type': 'group', groupname: 'administrators', grouplabel: 'Administrators' });

    const { data } = await pending;
    // Reversing these shows internal ids in a permissions dialog.
    expect(data).toEqual({ id: 'administrators', name: 'Administrators' });
  });

  it('falls back to the identifier when a group has no label', async () => {
    const pending = api.getGroupById('raw');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/group/raw'))
      .flush({ 'entity-type': 'group', groupname: 'raw', grouplabel: '' });

    expect((await pending).data.name).toBe('raw');
  });

  it('refuses an empty group id and an empty search term before requesting', async () => {
    await expect(api.getGroupById('')).rejects.toThrow('getGroupById requires a group id');
    await expect(api.searchGroups('')).rejects.toThrow('searchGroups requires a search term');
    httpMock.expectNone(() => true);
  });

  it('propagates a 404 for a group that does not exist', async () => {
    const pending = api.getGroupById('ghosts');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/group/ghosts'))
      .flush('No such group', { status: 404, statusText: 'Not Found' });
    await expect(pending).rejects.toMatchObject({ status: 404 });
  });

  it('maps every hit in a group search with the same label fallback', async () => {
    const pending = api.searchGroups('admin');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/group/search'))
      .flush({
        'entity-type': 'groups',
        entries: [
          { 'entity-type': 'group', groupname: 'administrators', grouplabel: 'Administrators' },
          { 'entity-type': 'group', groupname: 'unlabelled', grouplabel: '' },
        ],
      });

    expect((await pending).data).toEqual([
      { id: 'administrators', name: 'Administrators' },
      { id: 'unlabelled', name: 'unlabelled' },
    ]);
  });

  it('surfaces a group search failure rather than resolving with an empty list', async () => {
    const pending = api.searchGroups('admin');
    httpMock
      .expectOne((r) => r.url.includes('/nuxeo/api/v1/group/search'))
      .flush({}, { status: 503, statusText: 'Service Unavailable' });
    await expect(pending).rejects.toMatchObject({ status: 503 });
  });
});
