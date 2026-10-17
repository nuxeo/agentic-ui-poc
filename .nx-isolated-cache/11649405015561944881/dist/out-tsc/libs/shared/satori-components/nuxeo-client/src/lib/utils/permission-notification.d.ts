import type { NuxeoAce } from '../models/acl.model';
import type { NuxeoDocument } from '../models/document.model';
/** Catalogue key for the hint shown under the notify checkbox in permission dialogs. */
export declare const PERMISSION_NOTIFICATION_MAIL_HINT_KEY = "permissions.notification.mail-hint";
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
export declare function isMailSendError(err: unknown): boolean;
export declare function mailSendFailureKey(context: 'add' | 'update' | 'send'): string;
export declare function mailSendFailureMessage(context: 'add' | 'update' | 'send', translate: PermissionMessageTranslate): string;
export declare function permissionCreateMailFailureMessage(translate: PermissionMessageTranslate): string;
export declare function permissionUpdateMailFailureMessage(translate: PermissionMessageTranslate): string;
/** Permission saved but local ACE id could not be resolved for a follow-up notification send. */
export declare function permissionNotificationAceNotFoundKey(context: 'add' | 'update'): string;
export declare function permissionNotificationAceNotFoundMessage(context: 'add' | 'update', translate: PermissionMessageTranslate): string;
/** Locates a granted local ACE for a user or group principal after AddPermission. */
export declare function findLocalAceForPrincipal(doc: NuxeoDocument, principalId: string): NuxeoAce | undefined;
//# sourceMappingURL=permission-notification.d.ts.map