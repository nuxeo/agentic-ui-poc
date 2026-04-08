import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { AuditEntry, AuditLogList } from '../models/audit.model';
import { NuxeoDocument, NuxeoDocumentList } from '../models/document.model';
import { NuxeoOAuth2Provider } from '../models/oauth.model';
import { NuxeoApiBase } from './nuxeo-api-base';

/** Common directory / vocabulary names when the server does not expose a list endpoint. */
export const FALLBACK_DIRECTORY_NAMES = [
  'continent',
  'country',
  'eventTypes',
  'eventCategories',
  'l10nsubjects',
  'l10ncoverage',
  'nature',
  'subtopic',
  'oauth2TokenTypes',
  'language',
];

@Injectable({ providedIn: 'root' })
export class AdministrationService {
  private readonly api = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);

  /**
   * NXQL search with paging and optional extra headers (e.g. file schema for size).
   */
  nxqlSearch(
    query: string,
    pageSize: number,
    currentPageIndex = 0,
    headers: Record<string, string> = { properties: 'dublincore,file' },
  ): Observable<NuxeoDocumentList> {
    const params = new HttpParams()
      .set('query', query)
      .set('pageSize', String(pageSize))
      .set('currentPageIndex', String(currentPageIndex));
    return this.http.get<NuxeoDocumentList>(
      this.api.apiUrl('/nuxeo/api/v1/search/lang/NXQL/execute'),
      {
        params,
        headers,
      },
    );
  }

  /** Total documents matching the query (uses list metadata). */
  getNxqlTotalSize(query: string): Observable<number> {
    return this.nxqlSearch(query, 1, 0).pipe(map((r) => r.totalSize ?? r.entries?.length ?? 0));
  }

  /**
   * Repository-wide audit via automation. Falls back to domain document audit if unavailable.
   */
  searchAuditLogs(params: {
    pageSize: number;
    currentPageIndex: number;
    principalName?: string;
    from?: string | null;
    to?: string | null;
    eventIds?: string[];
    category?: string;
  }): Observable<AuditLogList> {
    const named: Record<string, string | string[]> = {};
    if (params.principalName) named['principalName'] = params.principalName;
    if (params.from) named['startDate'] = params.from;
    if (params.to) named['endDate'] = params.to;
    if (params.eventIds?.length) named['eventIds'] = params.eventIds;
    if (params.category) named['eventCategory'] = params.category;

    const automationParams: Record<string, unknown> = {
      providerName: 'AUDIT_SEARCH',
      currentPageIndex: params.currentPageIndex,
      pageSize: params.pageSize,
      sortBy: 'eventDate',
      sortOrder: 'desc',
    };
    if (Object.keys(named).length > 0) {
      automationParams['namedParameters'] = named;
    }

    return this.http
      .post<unknown>(
        this.api.apiUrl('/nuxeo/api/v1/automation/Audit.QueryWithPageProvider'),
        { params: automationParams, context: {} },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .pipe(
        map((raw) => this.normalizeAuditResponse(raw)),
        catchError(() => this.auditFallback(params, named)),
      );
  }

  /**
   * Fallback: fetch audit from multiple well-known documents, merge, deduplicate,
   * apply client-side filters, and paginate.
   */
  private auditFallback(
    params: {
      pageSize: number;
      currentPageIndex: number;
      principalName?: string;
      from?: string | null;
      to?: string | null;
      eventIds?: string[];
      category?: string;
    },
    _named: Record<string, string | string[]>,
  ): Observable<AuditLogList> {
    const batchSize = 500;
    return this.http.get<NuxeoDocument>(this.api.apiUrl('/nuxeo/api/v1/path/default-domain')).pipe(
      switchMap((doc) => {
        const domainUid = doc.uid;
        const auditUrl = (uid: string) => this.api.apiUrl(`/nuxeo/api/v1/id/${uid}/@audit`);
        const auditParams = new HttpParams()
          .set('pageSize', String(batchSize))
          .set('currentPageIndex', '0');

        return forkJoin([
          this.http
            .get<unknown>(auditUrl(domainUid), { params: auditParams })
            .pipe(catchError(() => of({ entries: [] }))),
          this.nxqlSearch(
            "SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ORDER BY dc:modified DESC",
            10,
            0,
          ).pipe(
            switchMap((docs) => {
              const uids = (docs.entries ?? []).map((d) => d.uid).filter(Boolean);
              if (!uids.length) return of([] as unknown[]);
              return forkJoin(
                uids.map((uid) =>
                  this.http
                    .get<unknown>(auditUrl(uid), { params: auditParams })
                    .pipe(catchError(() => of({ entries: [] }))),
                ),
              );
            }),
            catchError(() => of([] as unknown[])),
          ),
        ]);
      }),
      map(([domainRaw, docRawList]) => {
        const domainEntries = this.normalizeAuditResponse(domainRaw).entries ?? [];
        const docEntries = (docRawList as unknown[]).flatMap(
          (raw) => this.normalizeAuditResponse(raw).entries ?? [],
        );

        const seen = new Set<number>();
        const merged: AuditEntry[] = [];
        for (const e of [...docEntries, ...domainEntries]) {
          if (!seen.has(e.id)) {
            seen.add(e.id);
            merged.push(e);
          }
        }

        let filtered = merged;
        if (params.principalName) {
          const p = params.principalName.toLowerCase();
          filtered = filtered.filter((e) => e.principalName?.toLowerCase().includes(p));
        }
        if (params.eventIds?.length) {
          const ids = new Set(params.eventIds);
          filtered = filtered.filter((e) => ids.has(e.eventId));
        }
        if (params.category) {
          filtered = filtered.filter((e) => e.category === params.category);
        }
        if (params.from) {
          const fromMs = new Date(params.from).getTime();
          filtered = filtered.filter((e) => new Date(e.eventDate).getTime() >= fromMs);
        }
        if (params.to) {
          const toMs = new Date(params.to).getTime();
          filtered = filtered.filter((e) => new Date(e.eventDate).getTime() <= toMs);
        }

        filtered.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

        const start = params.currentPageIndex * params.pageSize;
        const page = filtered.slice(start, start + params.pageSize);

        return {
          entries: page,
          totalSize: filtered.length,
          currentPageSize: page.length,
          currentPageIndex: params.currentPageIndex,
          numberOfPages: Math.ceil(filtered.length / params.pageSize),
        } as AuditLogList;
      }),
      catchError(() =>
        of({
          entries: [],
          totalSize: 0,
          currentPageSize: 0,
          currentPageIndex: 0,
          numberOfPages: 0,
        } as AuditLogList),
      ),
    );
  }

  private normalizeAuditResponse(raw: unknown): AuditLogList {
    if (raw && typeof raw === 'object' && 'entries' in raw) {
      return raw as AuditLogList;
    }
    if (raw && typeof raw === 'object' && 'value' in raw) {
      const v = (raw as { value: unknown }).value;
      if (v && typeof v === 'object' && 'entries' in (v as object)) {
        return v as AuditLogList;
      }
    }
    return {
      entries: [],
      totalSize: 0,
      currentPageSize: 0,
      currentPageIndex: 0,
      numberOfPages: 0,
    };
  }

  listOAuth2Providers(): Observable<NuxeoOAuth2Provider[]> {
    return this.http
      .get<
        NuxeoOAuth2Provider[] | { entries?: NuxeoOAuth2Provider[] }
      >(this.api.apiUrl('/nuxeo/api/v1/oauth2/provider'))
      .pipe(
        map((res) => (Array.isArray(res) ? res : (res.entries ?? []))),
        catchError(() => of([])),
      );
  }

  /**
   * Tries to discover directory names; falls back to {@link FALLBACK_DIRECTORY_NAMES}.
   */
  listDirectoryNames(): Observable<string[]> {
    return this.http
      .get<
        { directoryNames?: string[]; entries?: Array<{ name: string }> } | string[]
      >(this.api.apiUrl('/nuxeo/api/v1/config/directory'))
      .pipe(
        map((res) => {
          if (Array.isArray(res)) return res as string[];
          if (res.directoryNames?.length) return res.directoryNames;
          if (res.entries?.length) return res.entries.map((e) => e.name);
          return FALLBACK_DIRECTORY_NAMES;
        }),
        catchError(() => of([...FALLBACK_DIRECTORY_NAMES])),
      );
  }

  getDefaultDomainPath(): Observable<string> {
    return this.http
      .get<NuxeoDocument>(this.api.apiUrl('/nuxeo/api/v1/path/default-domain'))
      .pipe(map((d) => d.path ?? '/default-domain'));
  }
}
