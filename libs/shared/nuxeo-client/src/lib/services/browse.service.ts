import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  EMPTY,
  Observable,
  timer,
  switchMap,
  map,
  of,
  throwError,
  expand,
  reduce,
  forkJoin,
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { NuxeoApiBase } from './nuxeo-api-base';
import { resolveCreatableSubtypes } from '../utils/creatable-subtypes';
import { isFolderishDocument, isBrowsableNavNode } from './document-import.service';

export interface NavTreeBootstrap {
  root: NuxeoDocument;
  entries: NuxeoDocument[];
}

export interface BrowseFolderContents {
  folder: NuxeoDocument;
  entries: NuxeoDocument[];
  totalSize: number;
  /** Present when a restricted user should land on their only accessible folder. */
  redirectTo?: string;
}

/** True for Domain documents attached directly under the repository root. */
function isTopLevelDomain(doc: NuxeoDocument | null | undefined): boolean {
  if (!doc || doc.type !== 'Domain') {
    return false;
  }
  const path = (doc.path ?? '').replace(/\/+$/, '');
  const segments = path.split('/').filter(Boolean);
  // Path depth is stable across environments (local Docker uses a non-null root uid).
  if (segments.length === 1) {
    return true;
  }
  // Null-UUID parent sentinel used on some Nuxeo deployments (not universal).
  return doc.parentRef === NULL_REPOSITORY_ROOT_UID;
}

/** Parent-ref sentinel for top-level domains on deployments that use the null UUID root. */
const NULL_REPOSITORY_ROOT_UID = '00000000-0000-0000-0000-000000000000';

@Injectable({ providedIn: 'root' })
export class BrowseService {
  private readonly api = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);

  private static readonly ACCESSIBLE_DOMAINS_NXQL =
    'SELECT * FROM Domain WHERE ecm:isTrashed = 0 ORDER BY dc:title';

  private static readonly ACCESSIBLE_NAV_NODES_NXQL = [
    'SELECT * FROM Document',
    "WHERE ecm:mixinType != 'HiddenInNavigation'",
    'AND ecm:isTrashed = 0',
    "AND ecm:primaryType IN ('Domain', 'Workspace', 'Folder', 'OrderedFolder')",
    'ORDER BY ecm:path',
  ].join(' ');

  getByPath(nuxeoPath: string): Observable<NuxeoDocument> {
    const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
    return this.api.get<NuxeoDocument>(`/nuxeo/api/v1/path${safePath}`, undefined, {
      properties: '*',
      'enrichers.document': 'acls,permissions,favorites,subscribedNotifications',
    });
  }

  /** Current user's personal workspace (Web UI: `User.GetUserWorkspace` automation). */
  getUserWorkspace(): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>('/nuxeo/api/v1/automation/User.GetUserWorkspace', {
      params: {},
      context: {},
    });
  }

  /**
   * Repository root for the browse nav tree. Users with domain-only ACLs may receive 403 on
   * `GET /path/` but can still resolve the root uid from an accessible Domain via NXQL.
   */
  getRepositoryRoot(): Observable<NuxeoDocument> {
    return this.getByPath('/').pipe(catchError(() => this.resolveRepositoryRootFromDomains()));
  }

  /**
   * Loads the browse nav tree root plus top-level folder entries. Handles administrators,
   * domain-scoped users, and read-only users who only have workspace/folder ACLs.
   */
  getNavTreeBootstrap(pageSize = 50): Observable<NavTreeBootstrap> {
    return this.getRepositoryRoot().pipe(
      catchError(() => of(this.syntheticRepositoryRoot())),
      switchMap((root) => this.loadNavTreeBootstrapEntries(root, pageSize)),
      catchError(() =>
        this.getAccessibleTopLevelNavNodes(pageSize).pipe(
          map((entries) => ({
            root: this.syntheticRepositoryRoot(entries),
            entries,
          })),
        ),
      ),
    );
  }

  /**
   * Loads the current browse folder and its children. When repository root is not readable,
   * falls back to accessible top-level folders (User Workspaces, domain-scoped ACLs, etc.).
   */
  getBrowseFolderContents(nuxeoPath: string, pageSize = 50): Observable<BrowseFolderContents> {
    const safePath = nuxeoPath.replace(/\/+$/, '') || '/';

    return this.getByPath(safePath).pipe(
      switchMap((folder) =>
        this.listBrowseFolderEntries(folder, safePath, pageSize).pipe(
          map(({ entries, totalSize }) => ({ folder, entries, totalSize })),
        ),
      ),
      catchError(() => {
        if (safePath !== '/') {
          return throwError(() => new Error(`Unable to load folder at ${safePath}`));
        }
        return this.getNavTreeBootstrap(pageSize).pipe(
          map(({ root, entries }) => ({
            folder: root,
            entries,
            totalSize: entries.length,
            redirectTo: entries.length === 1 ? entries[0].path : undefined,
          })),
        );
      }),
    );
  }

  private listBrowseFolderEntries(
    folder: NuxeoDocument,
    safePath: string,
    pageSize: number,
  ): Observable<{ entries: NuxeoDocument[]; totalSize: number }> {
    if (folder.type === 'Root' || folder.type === 'Domain') {
      return this.getNavTreeChildren(folder, pageSize).pipe(
        map((list) => this.toBrowseEntryList(list)),
      );
    }
    if (folder.type === 'Favorites' || folder.type === 'Collection') {
      return this.getCollectionMembers(folder.uid, pageSize).pipe(
        map((list) => this.toBrowseEntryList(list)),
      );
    }
    return this.getChildren(safePath, pageSize).pipe(map((list) => this.toBrowseEntryList(list)));
  }

  /** Collection / Favorites members (Nuxeo Web UI uses default_content_collection, not @children). */
  getCollectionMembers(collectionUid: string, pageSize = 50): Observable<NuxeoDocumentList> {
    const params = new HttpParams().set('queryParams', collectionUid).set('pageSize', pageSize);

    return this.api.get<NuxeoDocumentList>(
      '/nuxeo/api/v1/search/pp/default_content_collection/execute',
      params,
      { properties: '*' },
    );
  }

  private toBrowseEntryList(list: NuxeoDocumentList): {
    entries: NuxeoDocument[];
    totalSize: number;
  } {
    return {
      entries: list.entries ?? [],
      totalSize: list.totalSize ?? list.entries?.length ?? 0,
    };
  }

  private resolveRepositoryRootFromDomains(): Observable<NuxeoDocument> {
    return this.api.nxqlSearch(BrowseService.ACCESSIBLE_DOMAINS_NXQL, 50, { properties: '*' }).pipe(
      switchMap((list) => {
        const topLevelDomain = (list.entries ?? []).find((entry) => isTopLevelDomain(entry));
        if (!topLevelDomain?.parentRef) {
          return throwError(() => new Error('Unable to resolve repository root for browse tree'));
        }
        return of({
          uid: topLevelDomain.parentRef,
          title: 'Root',
          type: 'Root',
          path: '/',
          lastModified: topLevelDomain.lastModified ?? '',
          properties: {},
        });
      }),
    );
  }

  private loadNavTreeBootstrapEntries(
    root: NuxeoDocument,
    pageSize: number,
  ): Observable<NavTreeBootstrap> {
    return this.getNavTreeChildren(root, pageSize).pipe(
      map((list) => list.entries ?? []),
      switchMap((entries) =>
        entries.length > 0
          ? of({ root, entries })
          : this.getAccessibleTopLevelNavNodes(pageSize).pipe(
              map((fallback) => ({ root, entries: fallback })),
            ),
      ),
    );
  }

  private getAccessibleTopLevelNavNodes(pageSize: number): Observable<NuxeoDocument[]> {
    return this.api
      .nxqlSearch(BrowseService.ACCESSIBLE_NAV_NODES_NXQL, pageSize, { properties: '*' })
      .pipe(map((list) => this.filterTopLevelNavNodes(list.entries ?? [])));
  }

  private filterTopLevelNavNodes(entries: NuxeoDocument[]): NuxeoDocument[] {
    const folderish = entries.filter((doc) => isBrowsableNavNode(doc));
    const accessible = new Set(folderish.map((doc) => doc.uid));
    return folderish.filter((doc) => !doc.parentRef || !accessible.has(doc.parentRef));
  }

  private syntheticRepositoryRoot(entries: NuxeoDocument[] = []): NuxeoDocument {
    const topLevel = entries.find((entry) => isTopLevelDomain(entry));
    const rootUid =
      topLevel?.parentRef ?? entries.find((entry) => entry.parentRef)?.parentRef ?? 'virtual-root';
    return {
      uid: rootUid,
      title: 'Root',
      type: 'Root',
      path: '/',
      lastModified: '',
      properties: {},
    };
  }

  /** Folder metadata plus allowed child document types (`@subtypes` enricher). */
  getFolderContext(nuxeoPath: string): Observable<NuxeoDocument> {
    const safePath = nuxeoPath.replace(/\/+$/, '') || '/';
    return this.api.get<NuxeoDocument>(`/nuxeo/api/v1/path${safePath}`, undefined, {
      properties: '*',
      'enrichers.document': 'subtypes',
    });
  }

  /**
   * Allowed child document types for `nuxeoPath`, from the Nuxeo `subtypes` enricher.
   * @see https://doc.nuxeo.com/rest-api/1/document-enrichers/#subtypes
   */
  getCreatableSubtypes(nuxeoPath: string): Observable<string[]> {
    return this.getFolderContext(nuxeoPath).pipe(map((doc) => resolveCreatableSubtypes(doc)));
  }

  /**
   * Folder children for the nav drawer tree. Repository root uses `tree_children`
   * so every accessible domain is listed; domains use `@children` so structural
   * containers (SectionRoot / TemplateRoot / WorkspaceRoot) are always listed.
   */
  getNavTreeChildren(parent: NuxeoDocument, pageSize = 50): Observable<NuxeoDocumentList> {
    if (parent.type === 'Root') {
      return this.getTreeChildren(parent.uid, pageSize);
    }
    if (parent.type === 'Domain') {
      const safePath = parent.path?.replace(/\/+$/, '') ?? '';
      return this.getChildren(safePath, pageSize).pipe(
        map((list) => ({
          ...list,
          entries: (list.entries ?? []).filter((doc) => isFolderishDocument(doc)),
        })),
      );
    }
    return this.getTreeChildrenWithPathFallback(parent, pageSize);
  }

  private getTreeChildrenWithPathFallback(
    parent: NuxeoDocument,
    pageSize: number,
  ): Observable<NuxeoDocumentList> {
    return this.getTreeChildren(parent.uid, pageSize).pipe(
      switchMap((list) => {
        if ((list.entries?.length ?? 0) > 0) {
          return of(list);
        }
        const safePath = parent.path?.replace(/\/+$/, '') ?? '';
        if (!safePath || safePath === '/') {
          return of(list);
        }
        return this.getChildren(safePath, pageSize).pipe(
          map((children) => ({
            ...children,
            entries: (children.entries ?? []).filter((doc) => isBrowsableNavNode(doc)),
          })),
          catchError(() => of(list)),
        );
      }),
    );
  }

  getChildren(
    nuxeoPath: string,
    pageSize = 50,
    currentPageIndex = 0,
  ): Observable<NuxeoDocumentList> {
    const safePath = nuxeoPath.replace(/\/+$/, '');
    const params = new HttpParams()
      .set('pageSize', pageSize)
      .set('currentPageIndex', currentPageIndex);

    return this.api.get<NuxeoDocumentList>(`/nuxeo/api/v1/path${safePath}/@children`, params, {
      properties: '*',
    });
  }

  /**
   * Folder children for the browse tree via Nuxeo's `tree_children` page provider
   * (same query Nuxeo Web UI uses: Folderish, not trashed, not hidden in navigation).
   * Fetches all pages when the provider marks additional pages available.
   */
  getTreeChildren(parentUid: string, pageSize = 50): Observable<NuxeoDocumentList> {
    type TreeChildrenPage = NuxeoDocumentList & { isNextPageAvailable?: boolean };

    const fetchPage = (pageIndex: number) => {
      const params = new HttpParams()
        .set('queryParams', parentUid)
        .set('pageSize', pageSize)
        .set('currentPageIndex', pageIndex);

      return this.api.get<TreeChildrenPage>(
        '/nuxeo/api/v1/search/pp/tree_children/execute',
        params,
        { properties: '*' },
      );
    };

    const emptyList: NuxeoDocumentList = {
      entries: [],
      totalSize: 0,
      currentPageSize: 0,
      currentPageIndex: 0,
      numberOfPages: 1,
    };

    return fetchPage(0).pipe(
      expand((res) => (res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY)),
      reduce<TreeChildrenPage, NuxeoDocumentList>((acc, res) => {
        const entries = [...acc.entries, ...(res.entries ?? [])];
        return {
          entries,
          totalSize: res.totalSize ?? entries.length,
          currentPageSize: entries.length,
          currentPageIndex: 0,
          numberOfPages: 1,
        };
      }, emptyList),
    );
  }

  updateDocument(uid: string, properties: Record<string, unknown>): Observable<NuxeoDocument> {
    return this.api.put<NuxeoDocument>(
      `/nuxeo/api/v1/id/${uid}`,
      { 'entity-type': 'document', properties },
      {
        'Content-Type': 'application/json',
        properties: '*',
        'enrichers.document': 'permissions',
      },
    );
  }

  /** Copy clipboard items into `targetUid` (Web UI: `Document.Copy`). */
  copyDocuments(uids: string[], targetUid: string): Observable<NuxeoDocument[]> {
    return this.runClipboardDocumentsOp('Document.Copy', uids, targetUid);
  }

  /** Move clipboard items into `targetUid` (Web UI: `Document.Move`). */
  moveDocuments(uids: string[], targetUid: string): Observable<NuxeoDocument[]> {
    return this.runClipboardDocumentsOp('Document.Move', uids, targetUid);
  }

  private runClipboardDocumentsOp(
    operation: 'Document.Copy' | 'Document.Move',
    uids: string[],
    targetUid: string,
  ): Observable<NuxeoDocument[]> {
    if (uids.length === 0) {
      return of([]);
    }

    if (uids.length === 1) {
      return this.api
        .post<NuxeoDocument | NuxeoDocumentList>(`/nuxeo/api/v1/automation/${operation}`, {
          params: { target: targetUid },
          context: {},
          input: `doc:${uids[0]}`,
        })
        .pipe(map((res) => this.normalizeClipboardOpResult(res)));
    }

    const input = `docs:${uids.join(',')}`;
    return this.api
      .post<NuxeoDocument | NuxeoDocumentList>(`/nuxeo/api/v1/automation/${operation}`, {
        params: { target: targetUid },
        context: {},
        input,
      })
      .pipe(
        map((res) => this.normalizeClipboardOpResult(res)),
        catchError(() =>
          forkJoin(
            uids.map((uid) =>
              this.api
                .post<NuxeoDocument>(`/nuxeo/api/v1/automation/${operation}`, {
                  params: { target: targetUid },
                  context: {},
                  input: `doc:${uid}`,
                })
                .pipe(catchError(() => of(null))),
            ),
          ).pipe(
            map((results) => results.filter((doc): doc is NuxeoDocument => doc !== null)),
            switchMap((results) =>
              results.length === 0
                ? throwError(() => new Error('All clipboard documents failed'))
                : of(results),
            ),
          ),
        ),
      );
  }

  private normalizeClipboardOpResult(res: NuxeoDocument | NuxeoDocumentList): NuxeoDocument[] {
    if (res && typeof res === 'object' && 'entries' in res && Array.isArray(res.entries)) {
      return res.entries;
    }
    if (res && typeof res === 'object' && 'uid' in res) {
      return [res as NuxeoDocument];
    }
    return [];
  }

  getTrashedChildren(parentUid: string, pageSize = 50): Observable<NuxeoDocumentList> {
    const query =
      `SELECT * FROM Document WHERE ecm:parentId = '${parentUid}' ` +
      `AND ecm:isTrashed = 1 ORDER BY dc:modified DESC`;
    const params = new HttpParams().set('query', query).set('pageSize', pageSize);
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      { params, headers: { properties: 'dublincore' } },
    );
  }

  restoreDocument(uid: string): Observable<NuxeoDocument> {
    return this.api.post<NuxeoDocument>(`/nuxeo/api/v1/id/${uid}/@op/Document.Untrash`, {
      params: {},
      context: {},
    });
  }

  /**
   * Triggers an async CSV export via Nuxeo Bulk.RunAction.
   *
   * POST /@async returns 202 with Location header containing the execution ID:
   *   Location: .../Bulk.RunAction/@async/{executionId}/status
   */
  startCsvExport(parentUid: string): Observable<string> {
    const query =
      `SELECT * FROM Document WHERE ecm:parentId = '${parentUid}' ` +
      `AND ecm:mixinType != 'HiddenInNavigation' ` +
      `AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0`;
    return this.http
      .post(
        this.api.apiUrl('/nuxeo/api/v1/automation/Bulk.RunAction/@async'),
        {
          params: { action: 'csvExport', query },
          context: {},
        },
        {
          headers: { 'Content-Type': 'application/json' },
          observe: 'response',
          responseType: 'text',
        },
      )
      .pipe(
        map((resp) => {
          const location = resp.headers.get('Location') ?? '';
          const uuidMatch = location.match(
            /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
          );
          if (uuidMatch) return uuidMatch[1];
          const bodyMatch = (resp.body ?? '').match(
            /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
          );
          if (bodyMatch) return bodyMatch[1];
          throw new Error('Could not extract execution ID from response');
        }),
      );
  }

  /**
   * Polls /@async/{executionId}/status until done, then downloads the CSV.
   *
   * Native flow: GET /status → 202 (running) or 303 (done, redirects).
   * The 303 redirect goes cross-origin (proxy→Nuxeo), so the browser
   * drops the auth header causing a 401. We catch that 401 as the
   * "completed" signal, then fetch the result with a separate
   * authenticated request through the proxy.
   */
  pollAndDownloadCsv(executionId: string): Observable<Blob> {
    const statusUrl = this.api.apiUrl(
      `/nuxeo/site/api/v1/automation/Bulk.RunAction/@async/${executionId}/status`,
    );
    const resultUrl = this.api.apiUrl(
      `/nuxeo/site/api/v1/automation/Bulk.RunAction/@async/${executionId}`,
    );

    const fetchResult = (): Observable<Blob> =>
      this.http.get<{ url: string }>(resultUrl).pipe(
        switchMap((result) => {
          const blobPath = new URL(result.url).pathname;
          return this.http.get(this.api.apiUrl(blobPath), {
            responseType: 'blob',
          });
        }),
      );

    const poll = (): Observable<Blob> =>
      this.http.get(statusUrl, { observe: 'response', responseType: 'text' }).pipe(
        switchMap((resp) => {
          if (resp.status === 200 && resp.body) {
            try {
              const result = JSON.parse(resp.body) as { url: string };
              const blobPath = new URL(result.url).pathname;
              return this.http.get(this.api.apiUrl(blobPath), {
                responseType: 'blob',
              });
            } catch {
              return of(new Blob([resp.body], { type: 'text/csv' }));
            }
          }
          return timer(1500).pipe(switchMap(() => poll()));
        }),
        catchError((err) => {
          if (err.status === 401 || err.status === 0) {
            return fetchResult();
          }
          return throwError(() => err);
        }),
      );

    return timer(1000).pipe(switchMap(() => poll()));
  }
}
