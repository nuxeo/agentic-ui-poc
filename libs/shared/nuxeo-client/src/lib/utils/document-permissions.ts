import { NuxeoDocument } from '../models/document.model';

/** Nuxeo compound permission required to add/edit/delete document ACL entries (Nuxeo Web UI pattern). */
export const MANAGE_DOCUMENT_PERMISSIONS = 'Everything';

export function hasDocumentPermission(
  doc: NuxeoDocument | null | undefined,
  permission: string,
): boolean {
  const permissions = doc?.contextParameters?.['permissions'];
  return Array.isArray(permissions) && permissions.includes(permission);
}

/** True when the current user can manage ACL entries on the document. */
export function canManageDocumentPermissions(doc: NuxeoDocument | null | undefined): boolean {
  return hasDocumentPermission(doc, MANAGE_DOCUMENT_PERMISSIONS);
}
