/**
 * Maps a Nuxeo permission identifier to its display label.
 *
 * The document, collection and browse permission tables each carried their own copy of this as a
 * hardcoded English `Record<string, string>`, so all three read `Manage everything` in every
 * locale. `translate` is required for the reason given on `formatPermissionTimeFrame`: a default
 * that returns the English turns every un-updated call site into a silent no-op.
 */
export declare function permissionRightLabel(permission: string, translate: (key: string) => string): string;
//# sourceMappingURL=permission-label.utils.d.ts.map