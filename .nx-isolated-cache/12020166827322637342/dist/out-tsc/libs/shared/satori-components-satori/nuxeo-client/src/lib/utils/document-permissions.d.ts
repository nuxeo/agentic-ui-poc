import type { NuxeoDocument } from '../models/document.model';
/** Nuxeo permission to add/edit/delete document ACL entries (Nuxeo Web UI pattern). */
export declare const WRITE_SECURITY = "WriteSecurity";
/** Legacy compound permission that also grants ACL management on some deployments. */
export declare const MANAGE_DOCUMENT_PERMISSIONS = "Everything";
/** Atomic permissions returned by the Nuxeo `permissions` document enricher. */
export declare const READ_DOCUMENT = "Read";
export declare const WRITE_DOCUMENT = "Write";
/** Nuxeo Web UI uses WriteProperties for note/metadata edit actions. */
export declare const WRITE_PROPERTIES = "WriteProperties";
export declare const READ_WRITE_DOCUMENT = "ReadWrite";
export declare const ADD_CHILDREN = "AddChildren";
export declare const REMOVE_DOCUMENT = "Remove";
/**
 * The catalogue KEY for the permission-denied message, not the message.
 *
 * This was the English sentence, exported and used directly at nine call sites, so every one of them
 * rendered English whatever the locale — and no gate could see it, because a bare constant is not a
 * sink. Exporting the key instead means a caller has to resolve it, which is a compile-time nudge
 * toward the resolver rather than a silent literal.
 */
export declare const PERMISSION_DENIED_KEY = "common.permission-denied";
export declare function hasDocumentPermission(doc: NuxeoDocument | null | undefined, permission: string): boolean;
/** True when the document response includes the `permissions` enricher. */
export declare function hasDocumentPermissionsEnricher(doc: NuxeoDocument | null | undefined): boolean;
/** Show write actions when permissions are unknown or Write/WriteProperties is granted. */
export declare function canShowWriteDocumentAction(doc: NuxeoDocument | null | undefined): boolean;
/** Show remove actions when permissions are unknown or Remove is granted. */
export declare function canShowRemoveDocumentAction(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can manage ACL entries on the document. */
export declare function canManageDocumentPermissions(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can edit content, create versions, lock, etc. */
export declare function canWriteDocument(doc: NuxeoDocument | null | undefined): boolean;
/**
 * Web UI's `isTaggable`: the document itself, not a proxy or a version, and the user holds Write.
 * Nuxeo accepts a tag from a reader too, but Web UI does not offer it, and only a user with Write
 * may take a tag off.
 */
export declare function canTagDocument(doc: NuxeoDocument | null | undefined): boolean;
/** The permission Nuxeo checks to create, restore and publish versions. */
export declare const WRITE_VERSION = "WriteVersion";
/**
 * Nuxeo flags a record with the `isRecord` field of the document JSON — there is no facet for it.
 * The public `NuxeoDocument` model does not declare the field, so it is read here rather than
 * added to that published type.
 */
export declare function isRecordDocument(doc: NuxeoDocument | null | undefined): boolean;
/**
 * Web UI's Create Version gate (`nuxeo-document-create-version`): the live document, not a version,
 * a publication or a record, with the `Versionable` facet, and the user holds `WriteVersion`. A
 * publication keeps its source's facet and permissions but has no versions of its own, which is
 * why Web UI shows it no versions control at all.
 */
export declare function canCreateDocumentVersion(doc: NuxeoDocument | null | undefined): boolean;
/**
 * Web UI's `isPublishable`: not a proxy, a record or in the trash, the `Publishable` facet, and
 * `WriteVersion`. A version is publishable — `Document.PublishToSection` publishes it as it is.
 * Without an `isTrashed` flag, Web UI reads the `deleted` life-cycle state as the trash.
 */
export declare function canPublishDocument(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can create child documents in a folder. */
export declare function canAddChildren(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can trash or permanently delete the document. */
export declare function canRemoveDocument(doc: NuxeoDocument | null | undefined): boolean;
/** True when the current user can view document audit/history (Classic Web UI parity). */
export declare function canViewDocumentAuditLog(doc: NuxeoDocument | null | undefined): boolean;
/** True when an HTTP error indicates the server rejected the action for lack of permission. */
export declare function isPermissionDeniedError(err: unknown): boolean;
//# sourceMappingURL=document-permissions.d.ts.map