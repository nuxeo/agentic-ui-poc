import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { ACE } from '@hylandsoftware/hxcs-js-client';
import type { NuxeoDocument } from '@nuxeo-satori/platform/nuxeo-client';

import { NuxeoAclService, toNuxeoLocalAclWrite } from './nuxeo-acl.service';
import { NuxeoPrincipalResolver } from './nuxeo-principal-resolver.service';

/**
 * The write direction, and `sys_acl` versus `sys_effectiveAcl`.
 *
 * Upstream's permissions panel derives "local" from the difference between the two fields, so
 * `localAclFor` returning the flattened set would make every inherited grant look local and saving
 * would rewrite them onto the document.
 */
describe('toNuxeoLocalAclWrite', () => {
  const grant = (over: Partial<ACE> = {}): ACE =>
    ({
      permission: 'ReadWrite',
      granted: true,
      user: { id: 'jdoe', username: 'jdoe' },
      ...over,
    }) as ACE;

  it('translates HxPR permission names back to the Nuxeo ones', () => {
    const { grants } = toNuxeoLocalAclWrite([grant({ permission: 'CreateChild' })]);

    expect(grants).toEqual([{ principal: 'jdoe', permission: 'AddChildren' }]);
  });

  it('passes an unmapped permission through unchanged rather than dropping the grant', () => {
    const { grants } = toNuxeoLocalAclWrite([grant({ permission: 'CustomPermission' })]);

    expect(grants).toEqual([{ principal: 'jdoe', permission: 'CustomPermission' }]);
  });

  it('carries begin and end only when upstream set them', () => {
    const { grants } = toNuxeoLocalAclWrite([
      grant({ begin: '2026-01-01', end: '2026-12-31' }),
      grant({ user: { id: 'asmith', username: 'asmith' } } as Partial<ACE>),
    ]);

    expect(grants[0]).toEqual({
      principal: 'jdoe',
      permission: 'ReadWrite',
      begin: '2026-01-01',
      end: '2026-12-31',
    });
    expect(grants[1]).toEqual({ principal: 'asmith', permission: 'ReadWrite' });
  });

  it('names a group ACE by its group id', () => {
    const { grants } = toNuxeoLocalAclWrite([
      { permission: 'Read', granted: true, group: { id: 'members' } } as ACE,
    ]);

    expect(grants).toEqual([{ principal: 'members', permission: 'Read' }]);
  });

  it("prefers the user's username over its id, and accepts a bare string user", () => {
    const { grants } = toNuxeoLocalAclWrite([
      grant({ user: { id: 'internal-42', username: 'jdoe' } } as Partial<ACE>),
      { permission: 'Read', granted: true, user: 'asmith' } as unknown as ACE,
    ]);

    expect(grants.map((g) => g.principal)).toEqual(['jdoe', 'asmith']);
  });

  it('falls back to the user id when no username is present', () => {
    const { grants } = toNuxeoLocalAclWrite([
      { permission: 'Read', granted: true, user: { id: 'internal-42' } } as ACE,
    ]);

    expect(grants).toEqual([{ principal: 'internal-42', permission: 'Read' }]);
  });

  it('skips an ACE with no principal or no permission instead of writing a broken grant', () => {
    const result = toNuxeoLocalAclWrite([
      { permission: 'Read', granted: true } as ACE,
      { granted: true, user: { id: 'jdoe', username: 'jdoe' } } as ACE,
    ]);

    expect(result.grants).toEqual([]);
    expect(result.deniedPrincipals).toEqual([]);
    expect(result.blockInheritance).toBe(false);
  });

  it("reads upstream's synthesised __Everyone__ deny as blocked inheritance, not as a grant", () => {
    const result = toNuxeoLocalAclWrite([
      {
        permission: 'Everything',
        granted: false,
        user: { id: '__Everyone__', username: 'Everyone' },
      } as ACE,
    ]);

    expect(result.blockInheritance).toBe(true);
    expect(result.grants).toEqual([]);
    expect(result.deniedPrincipals).toEqual([]);
  });

  it("reads Nuxeo's own Everyone spelling as the same marker", () => {
    const result = toNuxeoLocalAclWrite([
      { permission: 'Everything', granted: false, user: 'Everyone' } as unknown as ACE,
    ]);

    expect(result.blockInheritance).toBe(true);
  });

  it('reports a deny Nuxeo cannot express instead of silently losing it', () => {
    const result = toNuxeoLocalAclWrite([
      { permission: 'ReadWrite', granted: false, user: { id: 'jdoe', username: 'jdoe' } } as ACE,
      { permission: 'Read', granted: false, group: { id: 'members' } } as ACE,
    ]);

    expect(result.deniedPrincipals).toEqual(['jdoe', 'members']);
    expect(result.grants).toEqual([]);
    expect(result.blockInheritance).toBe(false);
  });

  it('does not mistake an everyone deny of a single permission for blocked inheritance', () => {
    const result = toNuxeoLocalAclWrite([
      { permission: 'ReadWrite', granted: false, user: '__Everyone__' } as unknown as ACE,
    ]);

    expect(result.blockInheritance).toBe(false);
    expect(result.deniedPrincipals).toEqual(['__Everyone__']);
  });

  it('separates grants from the inheritance marker in one mixed ACL', () => {
    const result = toNuxeoLocalAclWrite([
      grant({ permission: 'Read' }),
      { permission: 'Everything', granted: false, user: '__Everyone__' } as unknown as ACE,
      { permission: 'Read', granted: false, group: { id: 'members' } } as ACE,
    ]);

    expect(result).toEqual({
      grants: [{ principal: 'jdoe', permission: 'Read' }],
      blockInheritance: true,
      deniedPrincipals: ['members'],
    });
  });

  it('is empty for an empty ACL', () => {
    expect(toNuxeoLocalAclWrite([])).toEqual({
      grants: [],
      blockInheritance: false,
      deniedPrincipals: [],
    });
  });
});

describe('NuxeoAclService.localAclFor', () => {
  let service: NuxeoAclService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoAclService, NuxeoPrincipalResolver],
    });
    service = TestBed.inject(NuxeoAclService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const ace = (over: Record<string, unknown> = {}) => ({
    id: 'x',
    username: 'Administrator',
    externalUser: false,
    permission: 'Everything',
    granted: true,
    creator: 'Administrator',
    begin: null,
    end: null,
    status: 'effective',
    ...over,
  });

  const docWith = (acls: unknown) =>
    ({
      uid: 'doc-1',
      title: 'Invoice',
      type: 'File',
      path: '/x',
      lastModified: '2026-02-01T00:00:00.000Z',
      properties: {},
      contextParameters: { acls },
    }) as unknown as NuxeoDocument;

  function resolveAsUser(name: string) {
    httpMock
      .expectOne((r) => r.url.endsWith(`/group/${name}`))
      .flush({}, { status: 404, statusText: 'Not Found' });
    httpMock
      .expectOne((r) => r.url.endsWith(`/user/${name}`))
      .flush({ 'entity-type': 'user', id: name, properties: { username: name } });
  }

  it('returns only the local ACL, so the panel can tell local from inherited', async () => {
    const doc = docWith([
      { name: 'inherited', aces: [ace({ username: 'members' })] },
      { name: 'local', aces: [ace()] },
    ]);

    const pending = firstValueFrom(service.localAclFor(doc));
    resolveAsUser('Administrator');

    const local = await pending;
    expect(local).toHaveLength(1);
    expect(local?.[0].user).toMatchObject({ id: 'Administrator' });
  });

  it('is an empty array when the document carries only inherited ACEs', async () => {
    const doc = docWith([{ name: 'inherited', aces: [ace()] }]);

    expect(await firstValueFrom(service.localAclFor(doc))).toEqual([]);
  });

  it('is undefined when the acls enricher was not requested', async () => {
    const doc = {
      uid: 'doc-1',
      title: 'Invoice',
      type: 'File',
      path: '/x',
      lastModified: '',
      properties: {},
    } as unknown as NuxeoDocument;

    expect(await firstValueFrom(service.localAclFor(doc))).toBeUndefined();
  });

  it('is undefined when the acls context parameter is not an array', async () => {
    expect(await firstValueFrom(service.localAclFor(docWith('not-an-array')))).toBeUndefined();
  });

  it("translates Nuxeo's Everyone into the id upstream recognises as the inheritance marker", async () => {
    const doc = docWith([{ name: 'local', aces: [ace({ username: 'Everyone', granted: false })] }]);

    const [first] = (await firstValueFrom(service.localAclFor(doc))) ?? [];

    expect(first.user).toEqual({ id: '__Everyone__', username: 'Everyone' });
    expect(first.granted).toBe(false);
  });

  it('round-trips a blocked-inheritance document back to blockInheritance on the write side', async () => {
    const doc = docWith([{ name: 'local', aces: [ace({ username: 'Everyone', granted: false })] }]);

    const aces = (await firstValueFrom(service.localAclFor(doc))) ?? [];

    expect(toNuxeoLocalAclWrite(aces).blockInheritance).toBe(true);
  });
});
