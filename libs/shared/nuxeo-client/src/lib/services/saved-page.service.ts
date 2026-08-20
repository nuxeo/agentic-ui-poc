import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { NuxeoApiBase } from './nuxeo-api-base';
import type { PageConfig } from '@agentic-ui/shared/agent-client';

/**
 * SavedPageService: CRUD operations for user-authored pages.
 *
 * Follows the saved-search pattern from SearchService (§3.2 of the analysis).
 * Pages are stored as Nuxeo documents with ACL-based sharing, enabling:
 * - User-owned pages (created as the caller)
 * - Shared pages via Nuxeo's permission machinery
 * - Organization defaults (admin-controlled)
 *
 * ## Storage model
 *
 * Until A6 settles the thread doctype (ADR 001:1286), saved pages use a
 * temporary schema stored in document properties. The final approach will be:
 * - **Option A**: Custom doctype `SavedPage` with dedicated schema (requires
 *   server-side contribution, see §3.2 "open question")
 * - **Option B**: Reuse A6's thread doctype with a `type` discriminator
 *   (marginal cost if A6 ships first)
 *
 * This implementation uses the saved-search endpoint as a reference pattern,
 * storing page config as JSON in document properties. Migration path:
 * 1. Read from both old and new schemas during transition
 * 2. Write to new schema only after cutover
 * 3. Bulk-migrate old pages via Automation operation
 *
 * ## Endpoint assumption
 *
 * The current implementation assumes `/nuxeo/api/v1/saved-pages` exists,
 * following the saved-search precedent. If this endpoint is unavailable:
 * - Fallback: Use generic document API with a dedicated workspace
 * - Create under `/default-domain/UserWorkspaces/<username>/SavedPages/`
 * - Set doctype to `File` with custom facet (requires server contribution)
 *
 * See `docs/saved-page-storage.md` for the migration plan.
 *
 * ## ACL enforcement
 *
 * Pages inherit Nuxeo's document-level ACLs. When a page is shared:
 * - The viewer's session re-fetches all referenced documents
 * - Tiles show fewer rows if the viewer lacks read access (§5, "what is free")
 * - The page config itself (titles, queries) is visible to all viewers
 *   (§5, "the new surface" - authored content leak)
 *
 * ## External sharing
 *
 * Saved searches support external sharing via email invitation
 * (ShareSavedSearchDialogComponent). Pages inherit this capability once
 * they ride the same document type.
 */

/**
 * A saved page list entry returned by getSavedPages().
 * Minimal metadata for rendering the page list in the builder UI.
 */
export interface SavedPageListEntry {
  /** Document UID (Nuxeo native identifier) */
  readonly id: string;
  /** Page title (user-provided, max 128 chars) */
  readonly title: string;
  /** ISO 8601 last modified timestamp */
  readonly modified: string;
  /** Creator username */
  readonly creator: string;
  /** Number of tiles on the page (derived from config.tiles.length) */
  readonly tileCount: number;
}

/**
 * A complete saved page document with full config.
 * Returned by getSavedPageById(), used for rendering and editing.
 */
export interface SavedPageDocument {
  /** Document UID */
  readonly id: string;
  /** Page title */
  readonly title: string;
  /** ISO 8601 last modified timestamp */
  readonly modified: string;
  /** Creator username */
  readonly creator: string;
  /** Full page configuration (tiles, layout) */
  readonly config: PageConfig;
  /** ACL entries (for sharing UI) */
  readonly permissions?: Array<{
    username: string;
    permission: string;
    granted: boolean;
  }>;
}

/**
 * Request payload for creating or updating a saved page.
 */
export interface SaveSavedPageRequest {
  /** Page title (required, 1-128 chars) */
  readonly title: string;
  /** Page configuration with tiles and layout */
  readonly config: PageConfig;
  /** Optional description for search/discovery */
  readonly description?: string;
}

@Injectable({ providedIn: 'root' })
export class SavedPageService {
  private readonly api = inject(NuxeoApiBase);

  /**
   * Lists all saved pages the caller can read.
   *
   * Returns pages created by the user plus any shared with them via ACLs.
   * Sorted by modified date descending (most recent first).
   *
   * @returns Observable of page list entries, or empty array on error
   */
  getSavedPages(): Observable<SavedPageListEntry[]> {
    return this.api
      .get<{ entries: Array<Record<string, unknown>> }>('/nuxeo/api/v1/saved-pages', undefined, {
        properties: '*',
        'enrichers.document': 'permissions',
      })
      .pipe(
        map((res) =>
          (res.entries ?? [])
            .map((doc) => {
              const id = this.asString(doc['uid']) ?? this.asString(doc['id']) ?? '';
              const title = this.asString(doc['title']) ?? 'Untitled Page';
              const modified = this.asString(doc['modified']) ?? new Date().toISOString();
              const creator = this.asString(doc['creator']) ?? 'unknown';

              const props = (doc['properties'] as Record<string, unknown>) ?? {};
              const configJson = this.asString(props['page:config']) ?? '{}';
              let tileCount = 0;
              try {
                const config = JSON.parse(configJson) as PageConfig;
                tileCount = config.tiles?.length ?? 0;
              } catch {
                // Invalid JSON or missing tiles array - count as 0
              }

              return { id, title, modified, creator, tileCount } satisfies SavedPageListEntry;
            })
            .filter((item) => item.id.length > 0)
            .sort((a, b) => b.modified.localeCompare(a.modified)),
        ),
        catchError(() => of<SavedPageListEntry[]>([])),
      );
  }

  /**
   * Fetches a single saved page by UID, with full config and permissions.
   *
   * Used when:
   * - Opening a page for editing in the builder
   * - Rendering a shared page in the viewer
   * - Loading a page from a bookmark
   *
   * @param id Document UID
   * @returns Observable of complete page document, or throws on error
   */
  getSavedPageById(id: string): Observable<SavedPageDocument> {
    const encodedId = encodeURIComponent(id);

    return this.api
      .get<Record<string, unknown>>(`/nuxeo/api/v1/saved-pages/${encodedId}`, undefined, {
        properties: '*',
        'enrichers.document': 'permissions,acls',
      })
      .pipe(
        map((doc) => {
          const uid = this.asString(doc['uid']) ?? this.asString(doc['id']) ?? id;
          const title = this.asString(doc['title']) ?? 'Untitled Page';
          const modified = this.asString(doc['modified']) ?? new Date().toISOString();
          const creator = this.asString(doc['creator']) ?? 'unknown';

          const props = (doc['properties'] as Record<string, unknown>) ?? {};
          const configJson = this.asString(props['page:config']) ?? '{}';
          let config: PageConfig;
          try {
            config = JSON.parse(configJson) as PageConfig;
          } catch {
            // Invalid JSON - return empty page
            config = { tiles: [] };
          }

          // Extract permissions for sharing UI
          const contextParams = doc['contextParameters'] as Record<string, unknown>;
          const acls = contextParams?.['acls'] as Array<Record<string, unknown>>;
          const permissions = acls
            ?.flatMap((acl) => {
              const aces = acl['aces'] as Array<Record<string, unknown>>;
              return (
                aces?.map((ace) => ({
                  username: this.asString(ace['username']) ?? '',
                  permission: this.asString(ace['permission']) ?? '',
                  granted: ace['granted'] === true,
                })) ?? []
              );
            })
            .filter((p) => p.username.length > 0);

          return { id: uid, title, modified, creator, config, permissions };
        }),
      );
  }

  /**
   * Creates a new saved page.
   *
   * The page is created as the caller and owned by them. Initial ACL grants
   * full control to the creator only. Use addPagePermission() to share.
   *
   * @param request Page title and config
   * @returns Observable of created document (with generated UID)
   */
  saveSavedPage(request: SaveSavedPageRequest): Observable<{ id: string }> {
    const { title, config, description } = request;

    return this.api
      .post<Record<string, unknown>>(
        '/nuxeo/api/v1/saved-pages',
        {
          'entity-type': 'document',
          type: 'SavedPage', // Assumes SavedPage doctype exists; fallback to 'File'
          title,
          properties: {
            'page:config': JSON.stringify(config),
            'dc:description': description ?? '',
          },
        },
        {
          'Content-Type': 'application/json',
          accept: 'application/json',
          properties: '*',
        },
      )
      .pipe(
        map((doc) => ({
          id: this.asString(doc['uid']) ?? this.asString(doc['id']) ?? '',
        })),
      );
  }

  /**
   * Updates an existing saved page.
   *
   * Requires Write permission on the document. Preserves ACLs (sharing does
   * not change on update). Updates `dc:modified` automatically.
   *
   * @param id Document UID
   * @param request New title and/or config
   * @returns Observable completing on success
   */
  updateSavedPage(id: string, request: SaveSavedPageRequest): Observable<unknown> {
    const encodedId = encodeURIComponent(id);
    const { title, config, description } = request;

    return this.api.put<unknown>(
      `/nuxeo/api/v1/saved-pages/${encodedId}`,
      {
        'entity-type': 'document',
        uid: id,
        title,
        properties: {
          'page:config': JSON.stringify(config),
          'dc:description': description ?? '',
        },
      },
      {
        'Content-Type': 'application/json',
        accept: 'application/json',
        properties: '*',
      },
    );
  }

  /**
   * Deletes a saved page permanently.
   *
   * Requires Remove permission (typically only the creator or an admin).
   * The document moves to trash first (soft delete), then is purged.
   *
   * @param id Document UID
   * @returns Observable completing on success
   */
  deleteSavedPage(id: string): Observable<unknown> {
    const encodedId = encodeURIComponent(id);
    return this.api.delete(`/nuxeo/api/v1/saved-pages/${encodedId}`);
  }

  /**
   * Grants a permission to a user or group for a saved page.
   *
   * Delegates to DocumentDetailService.addPermission(), which handles:
   * - ACE creation on the page document
   * - Email notification (if enabled)
   * - External sharing token generation
   *
   * Common permissions:
   * - 'Read': View the page and its tiles
   * - 'Write': Edit the page configuration
   * - 'Everything': Full control (equivalent to owner)
   *
   * See DocumentDetailService.addPermission() for the full signature.
   *
   * @param pageId Document UID
   * @param username Username or group name (e.g., 'john.doe' or 'group:editors')
   * @param permission Permission name (e.g., 'Read', 'Write', 'Everything')
   * @returns Observable completing on success
   */
  addPagePermission(pageId: string, username: string, permission: string): Observable<unknown> {
    // TODO: delegate to DocumentDetailService.addPermission once the page doctype is
    // settled. Until then the ACL operation is called directly.
    return this.api.post<unknown>(
      `/nuxeo/api/v1/id/${encodeURIComponent(pageId)}/@op/Document.AddPermission`,
      {
        params: {
          username,
          permission,
          begin: null,
          end: null,
          creator: null,
          blockInheritance: false,
          comment: null,
          notify: false,
        },
      },
      {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    );
  }

  /**
   * Removes a permission from a saved page.
   *
   * Requires Write permission on the document. Revokes the ACE matching the
   * given username and permission.
   *
   * @param pageId Document UID
   * @param aceId ACE identifier (from the permissions array in getSavedPageById)
   * @returns Observable completing on success
   */
  removePagePermission(pageId: string, aceId: string): Observable<unknown> {
    return this.api.post<unknown>(
      `/nuxeo/api/v1/id/${encodeURIComponent(pageId)}/@op/Document.RemovePermission`,
      {
        params: {
          id: aceId,
        },
      },
      {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    );
  }

  // Utility methods copied from SearchService pattern

  private asString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
  }
}
