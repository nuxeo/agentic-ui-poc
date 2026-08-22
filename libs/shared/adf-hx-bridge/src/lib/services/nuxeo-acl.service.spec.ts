import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import { NuxeoAclService } from './nuxeo-acl.service';
import { NuxeoPrincipalResolver } from './nuxeo-principal-resolver.service';

/**
 * `sys_acl`, and the principal resolution it cannot be built without.
 *
 * The behaviour under test exists because Nuxeo's ACE carries **users and groups in the same
 * `username` field with no type marker** — verified against real ACLs, where `administrators` and
 * `members` sit beside `Administrator` in exactly the same shape. HxPR's `ACE` has separate `user`
 * and `group` fields, so the type has to be asked for.
 */
describe('NuxeoAclService', () => {
  let service: NuxeoAclService;
  let httpMock: HttpTestingController;

  afterEach(() => httpMock.verify());

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NuxeoAclService, NuxeoPrincipalResolver],
    });
    service = TestBed.inject(NuxeoAclService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  const ace = (over: Partial<Record<string, unknown>> = {}) => ({
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
      ...(acls === undefined ? {} : { contextParameters: { acls } }),
    }) as unknown as NuxeoDocument;

  /** Answers the group probe with 404 and the user probe with a user. */
  function resolveAsUser(name: string, props: Record<string, unknown> = {}) {
    httpMock
      .expectOne((r) => r.url.endsWith(`/group/${name}`))
      .flush({}, { status: 404, statusText: 'Not Found' });
    httpMock
      .expectOne((r) => r.url.endsWith(`/user/${name}`))
      .flush({
        'entity-type': 'user',
        id: name,
        properties: { username: name, ...props },
      });
  }

  it('puts a group in ACE.group and a user in ACE.user', async () => {
    const pending = firstValueFrom(
      service.aclFor(docWith([{ name: 'local', aces: [ace(), ace({ username: 'members' })] }])),
    );
    resolveAsUser('Administrator', { firstName: 'Ada', lastName: 'Lovelace' });
    httpMock
      .expectOne((r) => r.url.endsWith('/group/members'))
      .flush({
        'entity-type': 'group',
        groupname: 'members',
        grouplabel: 'Members group',
      });

    const acl = await pending;
    // The whole reason this service exists: without the lookup both would land in `user`, and every
    // group in the permissions panel would be mislabelled as a person.
    expect(acl?.[0].user).toMatchObject({ id: 'Administrator', firstName: 'Ada' });
    expect(acl?.[0].group).toBeUndefined();
    expect(acl?.[1].group).toEqual({ id: 'members', name: 'Members group' });
    expect(acl?.[1].user).toBeUndefined();
  });

  it('resolves each distinct principal once, however many ACEs name it', async () => {
    // The fixture's own inherited ACL repeats `Administrator` three times in four entries. Without
    // the cache this would be one request per entry.
    const pending = firstValueFrom(
      service.aclFor(
        docWith([
          {
            name: 'inherited',
            aces: [ace(), ace({ permission: 'Read' }), ace({ permission: 'Write' })],
          },
        ]),
      ),
    );
    resolveAsUser('Administrator');
    // `httpMock.verify()` in afterEach fails if a fourth request was made.
    expect((await pending)?.length).toBe(3);
  });

  it('flattens every named ACL, because HxPR sys_acl has no equivalent of the names', async () => {
    const pending = firstValueFrom(
      service.aclFor(
        docWith([
          { name: 'inherited', aces: [ace()] },
          { name: 'local', aces: [ace({ username: 'members' })] },
        ]),
      ),
    );
    resolveAsUser('Administrator');
    httpMock
      .expectOne((r) => r.url.endsWith('/group/members'))
      .flush({ 'entity-type': 'group', groupname: 'members', grouplabel: 'Members' });

    // Two ACEs from two ACLs, and no field records which ACL each came from. That loss is real and
    // is why the POC keeps its own permissions tab, which reads Nuxeo's ACLs directly.
    expect((await pending)?.length).toBe(2);
  });

  it('translates the permission name and uppercases the status', async () => {
    const pending = firstValueFrom(
      service.aclFor(
        docWith([{ name: 'local', aces: [ace({ permission: 'AddChildren', status: 'pending' })] }]),
      ),
    );
    resolveAsUser('Administrator');

    const [first] = (await pending) ?? [];
    expect(first.permission).toBe('CreateChild');
    expect(first.status).toBe('PENDING');
  });

  it('leaves an unrecognised status undefined rather than defaulting it to EFFECTIVE', async () => {
    // Claiming an ACE is in force when Nuxeo said something else is the worst available default.
    const pending = firstValueFrom(
      service.aclFor(docWith([{ name: 'local', aces: [ace({ status: 'something-else' })] }])),
    );
    resolveAsUser('Administrator');
    expect((await pending)?.[0].status).toBeUndefined();
  });

  it('converts Nuxeo nulls to undefined so presence checks are meaningful', async () => {
    const pending = firstValueFrom(
      service.aclFor(docWith([{ name: 'local', aces: [ace({ creator: null, begin: null })] }])),
    );
    resolveAsUser('Administrator');

    const [first] = (await pending) ?? [];
    expect(first.creator).toBeUndefined();
    expect(first.begin).toBeUndefined();
  });

  it('keeps an ACE whose principal no longer exists, carrying the bare name', async () => {
    // Nuxeo keeps the ACE when a principal is deleted. Dropping it would understate the document's
    // permissions; inventing a display name would be worse.
    const pending = firstValueFrom(
      service.aclFor(docWith([{ name: 'local', aces: [ace({ username: 'ghost' })] }])),
    );
    httpMock
      .expectOne((r) => r.url.endsWith('/group/ghost'))
      .flush({}, { status: 404, statusText: 'Not Found' });
    httpMock
      .expectOne((r) => r.url.endsWith('/user/ghost'))
      .flush({}, { status: 404, statusText: 'Not Found' });

    const [first] = (await pending) ?? [];
    expect(first.user).toEqual({ id: 'ghost', username: 'ghost' });
  });

  it('is undefined when the acls enricher was not requested, not an empty array', async () => {
    // Same distinction as `sys_effectivePermissions`: `[]` asserts the document has no ACL, and a
    // read that did not ask cannot know that.
    expect(await firstValueFrom(service.aclFor(docWith(undefined)))).toBeUndefined();
  });

  it('is an empty array when Nuxeo genuinely reported no entries', async () => {
    expect(await firstValueFrom(service.aclFor(docWith([{ name: 'local', aces: [] }])))).toEqual(
      [],
    );
  });

  it("accepts the @acl adapter's `ace` key as well as the enricher's `aces`", async () => {
    const pending = firstValueFrom(service.aclFor(docWith([{ name: 'local', ace: [ace()] }])));
    resolveAsUser('Administrator');
    expect((await pending)?.length).toBe(1);
  });
});
