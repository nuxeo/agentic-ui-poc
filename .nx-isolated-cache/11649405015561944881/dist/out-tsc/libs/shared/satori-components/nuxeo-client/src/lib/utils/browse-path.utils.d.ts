import type { NuxeoDocument } from '../models/document.model';
/** Decode a single URL-encoded browse path segment (e.g. `Domain%201` → `Domain 1`). */
export declare function decodeNuxeoPathSegment(segment: string): string;
/** True when the router URL is a browse main-view route. */
export declare function isBrowseRouterUrl(routerUrl: string): boolean;
/** Parse the Nuxeo repository path from a router URL (e.g. `/#/browse/default-domain/foo` → `/default-domain/foo`). */
export declare function parseBrowseNuxeoPathFromRouterUrl(routerUrl: string): string;
/** Normalize a Nuxeo path for stable comparisons. */
export declare function normalizeNuxeoPath(path: string): string;
/** Case-insensitive Nuxeo path equality (Nuxeo may vary segment casing per server). */
export declare function nuxeoPathsEqual(a: string, b: string): boolean;
/** Slugify a single path segment for flexible matching (`Domain 1` ≈ `domain-1`). */
export declare function slugifyNuxeoPathSegment(segment: string): string;
/** Segment-wise path comparison tolerating spaces vs hyphens and casing. */
export declare function nuxeoPathSegments(path: string): string[];
export declare function nuxeoPathsEqualFlexible(a: string, b: string): boolean;
/** Build an app browse route from a repository path. */
export declare function toBrowseRouterUrl(nuxeoPath: string): string;
/** Parent folder path for a document path (e.g. `/a/b/file.pdf` → `/a/b`). */
export declare function parentNuxeoFolderPath(docPath: string): string;
/**
 * Nuxeo Web UI browse-tree context: folderish containers use their path;
 * leaf documents highlight their containing folder in the tree.
 */
export declare function browseTreeContextPath(doc: NuxeoDocument): string;
/**
 * Cumulative path prefixes for tree expansion, e.g.
 * `/default-domain/workspaces` → [`/default-domain`, `/default-domain/workspaces`].
 */
export declare function cumulativeNuxeoPathPrefixes(nuxeoPath: string): string[];
/** First path segment as a folder path (e.g. `/Domain-5/workspaces` → `/Domain-5`). */
export declare function topLevelNuxeoFolderPath(nuxeoPath: string): string | null;
/** Prefixes that must be expanded to reveal the active folder (all but the last segment). */
export declare function expandableNuxeoPathPrefixes(nuxeoPath: string): string[];
/** True when `path` is under a `UserWorkspaces` segment (personal workspace tree). */
export declare function isUserWorkspacePath(nuxeoPath: string): boolean;
/** Owner username from a personal workspace path, e.g. `/…/UserWorkspaces/jdoe/…` → `jdoe`. */
export declare function userWorkspaceOwnerFromPath(nuxeoPath: string): string | null;
/** Personal workspace root path, e.g. `/default-domain/UserWorkspaces/jdoe`. */
export declare function userWorkspaceRootFromPath(nuxeoPath: string): string | null;
/**
 * Web UI: non-admins viewing another user's personal workspace do not get breadcrumbs.
 * Admins and the workspace owner always see them.
 */
export declare function shouldShowUserWorkspaceBreadcrumbs(nuxeoPath: string, currentUsername: string | null, isAdministrator: boolean): boolean;
/** Browse route to open after trashing a document under UserWorkspaces (workspace root). */
export declare function userWorkspaceBrowseRouterUrl(nuxeoPath: string): string | null;
/** Fallback browse route after trash: parent folder, else workspace root, else repository root. */
export declare function postTrashBrowseRouterUrl(deletedDocPath: string): string;
/** True when the document is a user collection (type or facet; optional create-time type hint). */
export declare function isCollectionDocument(doc: Pick<NuxeoDocument, 'type' | 'facets'> | null | undefined, docTypeHint?: string): boolean;
/**
 * Web UI parity: Collection documents open the collection view; folderish containers open
 * browse; everything else opens document detail.
 */
export declare function documentNavigationUrl(doc: Pick<NuxeoDocument, 'uid' | 'type' | 'path' | 'facets'>, docTypeHint?: string): string;
//# sourceMappingURL=browse-path.utils.d.ts.map