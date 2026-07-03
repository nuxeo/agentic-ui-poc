import { normalizeDocumentAcls, resolveAcePrincipal } from './ace-principal';
import type { NuxeoAce, NuxeoAcl } from '../models/acl.model';
import type { NuxeoDocument } from '../models/document.model';

describe('ace-principal', () => {
  it('resolveAcePrincipal returns string values unchanged', () => {
    expect(resolveAcePrincipal('members')).toBe('members');
    expect(resolveAcePrincipal('transient/guest@example.com')).toBe('transient/guest@example.com');
  });

  it('resolveAcePrincipal extracts username from enriched user entity', () => {
    expect(
      resolveAcePrincipal({
        'entity-type': 'user',
        id: 'Administrator',
        properties: { username: 'Administrator', firstName: 'Admin' },
      }),
    ).toBe('Administrator');
  });

  it('resolveAcePrincipal extracts groupname from enriched group entity', () => {
    expect(
      resolveAcePrincipal({
        'entity-type': 'group',
        id: 'members',
        groupname: 'members',
        grouplabel: 'Members',
      }),
    ).toBe('members');
  });

  it('normalizeDocumentAcls stringifies username and creator on all ACEs', () => {
    const enrichedAces = [
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
    ] as unknown as NuxeoAce[];

    const doc: NuxeoDocument = {
      uid: 'root-uid',
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '2026-07-01T00:00:00.000Z',
      properties: {},
      contextParameters: {
        acls: [{ name: 'local', aces: enrichedAces } satisfies NuxeoAcl],
      },
    };

    const normalized = normalizeDocumentAcls(doc);
    const ace = normalized.contextParameters?.['acls']?.[0]?.aces?.[0];

    expect(ace?.username).toBe('Administrator');
    expect(ace?.creator).toBe('Administrator');
  });
});
