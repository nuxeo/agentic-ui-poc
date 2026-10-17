import type { NuxeoDocument } from '../models/document.model';
/** Nuxeo may return a plain string or an enriched user/group entity when fetch-acls is set. */
export declare function resolveAcePrincipal(value: unknown): string;
/**
 * Prefer a non-empty enricher value from `updated`; fall back to `existing`.
 * Empty arrays are treated as absent so a PUT without enrichers (or with
 * `permissions: []`) does not wipe known permissions — including masking a
 * genuine server-side revocation until the next full fetch.
 */
export declare function preferEnricherValue<T>(updated: T | undefined, existing: T | undefined): T | undefined;
export type MergeDocumentPermissionsContextOptions = {
    /** When true, empty `permissions`/`acls` arrays are treated as absent (Note PUT merge). */
    treatEmptyEnricherAsAbsent?: boolean;
};
/**
 * Merges context enrichers from a permissions fetch or document update into an existing document.
 * Spreads enrichers from `updated`, then overlays `acls` and `permissions`.
 */
export declare function mergeDocumentPermissionsContext(existing: NuxeoDocument, updated: NuxeoDocument, options?: MergeDocumentPermissionsContextOptions): NuxeoDocument;
/** Normalizes ACL username/creator fields to strings for UI and automation calls. */
export declare function normalizeDocumentAcls(doc: NuxeoDocument): NuxeoDocument;
//# sourceMappingURL=ace-principal.d.ts.map