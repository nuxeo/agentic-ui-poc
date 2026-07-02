import { describe, expect, it } from 'vitest';

import type { NuxeoDocument } from '../models/document.model';
import {
  findLocalAceForPrincipal,
  isMailSendError,
  mailSendFailureMessage,
  permissionNotificationAceNotFoundMessage,
} from './permission-notification';

function docWithLocalAces(
  aces: Array<{ id: string; username: string; granted?: boolean }>,
): NuxeoDocument {
  return {
    uid: 'doc-1',
    title: 'Doc',
    type: 'File',
    path: '/doc',
    lastModified: '',
    properties: {},
    contextParameters: {
      acls: [
        {
          name: 'local',
          aces: aces.map((ace) => ({
            id: ace.id,
            username: ace.username,
            externalUser: ace.username.startsWith('transient/'),
            permission: 'Read',
            granted: ace.granted ?? true,
            creator: null,
            begin: null,
            end: null,
            status: 'effective' as const,
          })),
        },
      ],
    },
  };
}

describe('permission-notification', () => {
  it('isMailSendError detects Nuxeo SMTP automation failures', () => {
    expect(
      isMailSendError({ error: { message: 'Failed: An error occurred while sending a mail' } }),
    ).toBe(true);
    expect(isMailSendError({ message: 'Network error' })).toBe(false);
  });

  it('mailSendFailureMessage includes SMTP guidance', () => {
    expect(mailSendFailureMessage('add')).toContain('SMTP');
    expect(mailSendFailureMessage('send')).toContain('Notification email could not be sent');
  });

  it('permissionNotificationAceNotFoundMessage does not blame SMTP', () => {
    expect(permissionNotificationAceNotFoundMessage('add')).toContain('could not be located');
    expect(permissionNotificationAceNotFoundMessage('add')).not.toContain('SMTP');
  });

  it('findLocalAceForPrincipal returns the latest matching local ACE', () => {
    const doc = docWithLocalAces([
      { id: 'ace-1', username: 'members' },
      { id: 'ace-2', username: 'user-readonly01' },
    ]);
    expect(findLocalAceForPrincipal(doc, 'user-readonly01')?.id).toBe('ace-2');
    expect(findLocalAceForPrincipal(doc, 'missing')).toBeUndefined();
  });

  it('findLocalAceForPrincipal matches transient external principals', () => {
    const doc = docWithLocalAces([{ id: 'ace-ext', username: 'transient/guest@example.com' }]);
    expect(findLocalAceForPrincipal(doc, 'transient/guest@example.com')?.id).toBe('ace-ext');
  });
});
