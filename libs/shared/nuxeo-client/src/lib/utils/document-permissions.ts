import type { NuxeoDocument } from '../models/document.model';

/** Nuxeo permission to add/edit/delete document ACL entries (Nuxeo Web UI pattern). */
export const WRITE_SECURITY = 'WriteSecurity';

/** Legacy compound permission that also grants ACL management on some deployments. */
export const MANAGE_DOCUMENT_PERMISSIONS = 'Everything';

/** Atomic permissions returned by the Nuxeo `permissions` document enricher. */
export const WRITE_DOCUMENT = 'Write';
export const ADD_CHILDREN = 'AddChildren';
export const REMOVE_DOCUMENT = 'Remove';

export const PERMISSION_DENIED_MESSAGE = 'You do not have permission to perform this action';

export function hasDocumentPermission(
  doc: NuxeoDocument | null | undefined,
  permission: string,
): boolean {
  const permissions = doc?.contextParameters?.['permissions'];
  return Array.isArray(permissions) && permissions.includes(permission);
}

/** True when the current user can manage ACL entries on the document. */
export function canManageDocumentPermissions(doc: NuxeoDocument | null | undefined): boolean {
  return (
    hasDocumentPermission(doc, WRITE_SECURITY) ||
    hasDocumentPermission(doc, MANAGE_DOCUMENT_PERMISSIONS)
  );
}

/** True when the current user can edit content, create versions, lock, etc. */
export function canWriteDocument(doc: NuxeoDocument | null | undefined): boolean {
  return hasDocumentPermission(doc, WRITE_DOCUMENT);
}

/** True when the current user can create child documents in a folder. */
export function canAddChildren(doc: NuxeoDocument | null | undefined): boolean {
  return hasDocumentPermission(doc, ADD_CHILDREN);
}

/** True when the current user can trash or permanently delete the document. */
export function canRemoveDocument(doc: NuxeoDocument | null | undefined): boolean {
  return hasDocumentPermission(doc, REMOVE_DOCUMENT);
}

/** True when an HTTP error indicates the server rejected the action for lack of permission. */
export function isPermissionDeniedError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 401 || status === 403;
}
