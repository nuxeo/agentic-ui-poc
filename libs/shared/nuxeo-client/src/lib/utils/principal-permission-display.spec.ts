import {
  principalPermissionTimeFrameLabel,
  principalPermissionToLocalRow,
} from './principal-permission-display';

describe('principal-permission-display', () => {
  it('principalPermissionTimeFrameLabel returns Permanent when no begin/end', () => {
    expect(
      principalPermissionTimeFrameLabel({
        documentUid: '1',
        documentTitle: 'Doc',
        documentPath: '/a',
        permission: 'Read',
        begin: null,
        end: null,
        grantedBy: null,
        acePrincipal: 'group:members',
      }),
    ).toBe('Permanent');
  });

  it('principalPermissionToLocalRow maps document title, path, and permission', () => {
    expect(
      principalPermissionToLocalRow({
        documentUid: '1',
        documentTitle: 'Sections',
        documentPath: '/default-domain/sections',
        permission: 'CanAskForPublishing',
        begin: null,
        end: null,
        grantedBy: null,
        acePrincipal: 'group:members',
      }),
    ).toEqual({
      on: 'Sections (/default-domain/sections)',
      right: 'CanAskForPublishing',
      timeFrame: 'Permanent',
      grantedBy: '—',
    });
  });
});
