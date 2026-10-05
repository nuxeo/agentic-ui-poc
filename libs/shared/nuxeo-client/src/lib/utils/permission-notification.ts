import type { NuxeoAce } from '../models/acl.model';
import type { NuxeoDocument } from '../models/document.model';

/** Catalogue key for the hint shown under the notify checkbox in permission dialogs. */
export const PERMISSION_NOTIFICATION_MAIL_HINT_KEY = 'permissions.notification.mail-hint';

/**
 * Resolves a catalogue key. Passed in rather than injected so this module stays free of Angular
 * DI — the same contract as `permissionRightLabel`.
 */
export type PermissionMessageTranslate = (key: string) => string;

export interface PermissionWithNotificationResult {
  document: NuxeoDocument;
  notificationSent: boolean;
  /**
   * Catalogue key of the message explaining why the notification was not sent. A key rather than
   * text so the service needs no translation dependency; the dialog showing it resolves it.
   */
  notificationErrorKey?: string;
}

/** Nuxeo surfaces SMTP failures with "sending a mail" in the automation error message. */
export function isMailSendError(err: unknown): boolean {
  const raw =
    (err as { error?: { message?: string }; message?: string })?.error?.message ??
    (err as { message?: string })?.message ??
    '';
  return raw.toLowerCase().includes('sending a mail');
}

export function mailSendFailureKey(context: 'add' | 'update' | 'send'): string {
  return context === 'add'
    ? 'permissions.notification.mail-send-failed-add'
    : context === 'update'
      ? 'permissions.notification.mail-send-failed-update'
      : 'permissions.notification.mail-send-failed-send';
}

export function mailSendFailureMessage(
  context: 'add' | 'update' | 'send',
  translate: PermissionMessageTranslate,
): string {
  return translate(mailSendFailureKey(context));
}

export function permissionCreateMailFailureMessage(translate: PermissionMessageTranslate): string {
  return translate('permissions.notification.create-mail-failed');
}

export function permissionUpdateMailFailureMessage(translate: PermissionMessageTranslate): string {
  return translate('permissions.notification.update-mail-failed');
}

/** Permission saved but local ACE id could not be resolved for a follow-up notification send. */
export function permissionNotificationAceNotFoundKey(context: 'add' | 'update'): string {
  return context === 'add'
    ? 'permissions.notification.ace-not-found-add'
    : 'permissions.notification.ace-not-found-update';
}

export function permissionNotificationAceNotFoundMessage(
  context: 'add' | 'update',
  translate: PermissionMessageTranslate,
): string {
  return translate(permissionNotificationAceNotFoundKey(context));
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
