import type { NuxeoAce, NuxeoAcl } from '@agentic-ui/shared/nuxeo-client';

import { toPermission, toPermissions } from './permission.mapper';

function ace(overrides: Partial<NuxeoAce> = {}): NuxeoAce {
  return {
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
  };
}

describe('toPermission', () => {
  it('maps an ACE onto the neutral shape', () => {
    const permission = toPermission(ace(), 'local');

    expect(permission).toMatchObject({
      id: 'ace-1',
      principal: { id: 'alice' },
      permission: 'Read',
      granted: true,
      effective: true,
    });
  });

  it('collapses the tri-state status onto effective but keeps it in source', () => {
    expect(toPermission(ace({ status: 'pending' }), 'local').effective).toBe(false);
    expect(toPermission(ace({ status: 'archived' }), 'local').effective).toBe(false);

    // The distinction between "not yet effective" and "expired" is preserved
    // because the neutral boolean cannot carry it.
    expect(toPermission(ace({ status: 'pending' }), 'local').source).toBe('local:pending');
    expect(toPermission(ace({ status: 'archived' }), 'local').source).toBe('local:archived');
  });

  it('normalises null temporal bounds to undefined', () => {
    const permission = toPermission(ace({ begin: '2026-01-01', end: null }), 'local');
    expect(permission.begin).toBe('2026-01-01');
    expect(permission.end).toBeUndefined();
  });
});

describe('toPermissions', () => {
  it('flattens every ACL into one list', () => {
    const acls: NuxeoAcl[] = [
      { name: 'inherited', aces: [ace({ id: 'ace-0', username: 'admin' })] },
      { name: 'local', aces: [ace()] },
    ];

    const permissions = toPermissions(acls);
    expect(permissions.map((p) => p.id)).toEqual(['ace-0', 'ace-1']);
    expect(permissions[0].source).toBe('inherited:effective');
  });

  it('returns an empty list when there are no ACLs', () => {
    expect(toPermissions(undefined)).toEqual([]);
    expect(toPermissions([])).toEqual([]);
  });
});
