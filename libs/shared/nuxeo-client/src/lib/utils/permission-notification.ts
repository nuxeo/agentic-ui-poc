import type { NuxeoAce } from '../models/acl.model';
import type { NuxeoDocument } from '../models/document.model';

/** Shown under the notify checkbox in permission dialogs. */
export const PERMISSION_NOTIFICATION_MAIL_HINT =
  'Requires outbound mail (SMTP) configured on the Nuxeo server.';

export interface PermissionWithNotificationResult {
  document: NuxeoDocument;
  notificationSent: boolean;
  notificationError?: string;
}

/** Nuxeo surfaces SMTP failures with "sending a mail" in the automation error message. */
export function isMailSendError(err: unknown): boolean {
  const raw =
    (err as { error?: { message?: string }; message?: string })?.error?.message ??
    (err as { message?: string })?.message ??
    '';
  return raw.toLowerCase().includes('sending a mail');
}

export function mailSendFailureMessage(context: 'add' | 'update' | 'send'): string {
  const action =
    context === 'add'
      ? 'Permission was added, but the notification email could not be sent.'
      : context === 'update'
        ? 'Permission was updated, but the notification email could not be sent.'
        : 'Notification email could not be sent.';
  return `${action} Configure outbound mail (SMTP) on the Nuxeo server.`;
}

export function permissionCreateMailFailureMessage(): string {
  return 'Permission could not be created. Configure outbound mail (SMTP) on the Nuxeo server.';
}

export function permissionUpdateMailFailureMessage(): string {
  return 'Permission could not be updated. Configure outbound mail (SMTP) on the Nuxeo server.';
}

/** Permission saved but local ACE id could not be resolved for a follow-up notification send. */
export function permissionNotificationAceNotFoundMessage(context: 'add' | 'update'): string {
  const action =
    context === 'add'
      ? 'Permission was added, but the notification email could not be sent because the new permission entry could not be located.'
      : 'Permission was updated, but the notification email could not be sent because the permission entry could not be located.';
  return `${action} Refresh the page and try resending from the Permissions tab.`;
}

/** Locates a granted local ACE for a user or group principal after AddPermission. */
export function findLocalAceForPrincipal(
  doc: NuxeoDocument,
  principalId: string,
): NuxeoAce | undefined {
  const localAcl = doc.contextParameters?.['acls']?.find((acl) => acl.name === 'local');
  if (!localAcl?.aces?.length) {
    return undefined;
  }
  const matches = localAcl.aces.filter((ace) => ace.granted && ace.username === principalId);
  if (!matches.length) {
    return undefined;
  }
  return matches[matches.length - 1];
}
