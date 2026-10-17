/** Catalogue key for the hint shown under the notify checkbox in permission dialogs. */
export const PERMISSION_NOTIFICATION_MAIL_HINT_KEY = 'permissions.notification.mail-hint';
/** Nuxeo surfaces SMTP failures with "sending a mail" in the automation error message. */
export function isMailSendError(err) {
    const raw = err?.error?.message ??
        err?.message ??
        '';
    return raw.toLowerCase().includes('sending a mail');
}
export function mailSendFailureKey(context) {
    return context === 'add'
        ? 'permissions.notification.mail-send-failed-add'
        : context === 'update'
            ? 'permissions.notification.mail-send-failed-update'
            : 'permissions.notification.mail-send-failed-send';
}
export function mailSendFailureMessage(context, translate) {
    return translate(mailSendFailureKey(context));
}
export function permissionCreateMailFailureMessage(translate) {
    return translate('permissions.notification.create-mail-failed');
}
export function permissionUpdateMailFailureMessage(translate) {
    return translate('permissions.notification.update-mail-failed');
}
/** Permission saved but local ACE id could not be resolved for a follow-up notification send. */
export function permissionNotificationAceNotFoundKey(context) {
    return context === 'add'
        ? 'permissions.notification.ace-not-found-add'
        : 'permissions.notification.ace-not-found-update';
}
export function permissionNotificationAceNotFoundMessage(context, translate) {
    return translate(permissionNotificationAceNotFoundKey(context));
}
/** Locates a granted local ACE for a user or group principal after AddPermission. */
export function findLocalAceForPrincipal(doc, principalId) {
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
