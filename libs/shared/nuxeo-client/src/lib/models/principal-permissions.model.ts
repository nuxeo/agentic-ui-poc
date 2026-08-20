/** One row in Administration “Local permissions” tables (user or group principal). */
export interface PrincipalPermissionRow {
  documentUid: string;
  documentTitle: string;
  documentPath: string;
  permission: string;
  begin: string | null;
  end: string | null;
  grantedBy: string | null;
  /** Exact ACE username field, as reported by the `acls` enricher. */
  acePrincipal: string;
  /**
   * ACE id from the `acls` enricher — the only handle `Document.RemovePermission` can use
   * to revoke a single entry. Empty when the enricher omitted it, in which case revoking
   * is refused rather than falling back to `user`, which would remove every ACE for that
   * principal on the ACL.
   */
  aceId: string;
}

export interface PrincipalPermissionPage {
  rows: PrincipalPermissionRow[];
  totalDocuments: number;
  numberOfPages: number;
  currentPageIndex: number;
  currentPageSize: number;
}
