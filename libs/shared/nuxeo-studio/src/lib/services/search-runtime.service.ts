import { Injectable, inject, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import {
  NuxeoApiBase,
  type NuxeoDocument,
  type NuxeoDocumentList,
  type NuxeoPaginatedList,
} from '@agentic-ui/shared/nuxeo-client';

import { ConfigStorageService } from './config-storage.service';
import type { SearchConfig } from '../models/search.model';

export interface SearchRuntimeResult {
  entries: NuxeoDocument[];
  totalSize: number;
  currentPageIndex: number;
  numberOfPages: number;
}

/**
 * Executes page providers defined in Studio Designer against
 * the real Nuxeo search API. Supports both named page providers
 * and ad-hoc NXQL queries.
 */
@Injectable({ providedIn: 'root' })
export class SearchRuntimeService {
  private readonly storage = inject(ConfigStorageService);
  private readonly api = inject(NuxeoApiBase);

  private readonly _results = signal<SearchRuntimeResult | null>(null);
  readonly results = this._results.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  /**
   * Get all configured search definitions.
   */
  getSearchConfigs(): SearchConfig[] {
    return this.storage.getSearches().filter((s) => s.available);
  }

  /**
   * Get a specific search config by ID.
   */
  getSearchConfig(id: string): SearchConfig | null {
    return this.storage.getSearches().find((s) => s.id === id) ?? null;
  }

  /**
   * Execute a page provider by name (matching SearchConfig.name).
   * If a named Nuxeo page provider exists, uses that.
   * Otherwise falls back to NXQL query if defined in the config.
   */
  executeSearch(
    configId: string,
    fieldValues: Record<string, unknown> = {},
    pageIndex = 0,
    pageSize = 20,
  ): Observable<SearchRuntimeResult> {
    const config = this.getSearchConfig(configId);
    if (!config) {
      return of({ entries: [], totalSize: 0, currentPageIndex: 0, numberOfPages: 0 });
    }

    this._loading.set(true);
    this._error.set(null);

    if (config.queryPattern) {
      return this.executeNxql(
        config.queryPattern,
        fieldValues,
        pageIndex,
        pageSize ?? config.pageSize,
      );
    }

    return this.executePageProvider(
      config.name,
      fieldValues,
      pageIndex,
      pageSize ?? config.pageSize,
    );
  }

  /**
   * Execute a raw NXQL query with parameter substitution.
   */
  executeNxql(
    nxqlTemplate: string,
    fieldValues: Record<string, unknown>,
    pageIndex: number,
    pageSize: number,
  ): Observable<SearchRuntimeResult> {
    let query = nxqlTemplate;

    for (const [key, value] of Object.entries(fieldValues)) {
      const placeholder = `:${key}`;
      if (typeof value === 'string') {
        query = query.replace(placeholder, `'${value.replace(/'/g, "''")}'`);
      } else if (value !== null && value !== undefined) {
        query = query.replace(placeholder, String(value));
      }
    }

    const params = new HttpParams()
      .set('query', query)
      .set('pageSize', pageSize.toString())
      .set('currentPageIndex', pageIndex.toString());
    const headers = { properties: 'dublincore,uid' };

    return this.api
      .get<NuxeoDocumentList>('/nuxeo/api/v1/search/lang/NXQL/execute', params, headers)
      .pipe(
        map((res) => this.mapResult(res)),
        catchError((_err) => {
          this._loading.set(false);
          this._error.set('Search failed');
          return of({ entries: [], totalSize: 0, currentPageIndex: 0, numberOfPages: 0 });
        }),
      );
  }

  /**
   * Execute a named Nuxeo page provider.
   */
  executePageProvider(
    providerName: string,
    fieldValues: Record<string, unknown>,
    pageIndex: number,
    pageSize: number,
  ): Observable<SearchRuntimeResult> {
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('currentPageIndex', pageIndex.toString());

    for (const [key, value] of Object.entries(fieldValues)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }

    const headers = { properties: 'dublincore,uid' };
    const url = `/nuxeo/api/v1/search/pp/${encodeURIComponent(providerName)}/execute`;

    return this.api.get<NuxeoDocumentList>(url, params, headers).pipe(
      map((res) => this.mapResult(res)),
      catchError((_err) => {
        this._loading.set(false);
        this._error.set('Search failed');
        return of({ entries: [], totalSize: 0, currentPageIndex: 0, numberOfPages: 0 });
      }),
    );
  }

  private mapResult(res: NuxeoPaginatedList<NuxeoDocument>): SearchRuntimeResult {
    const result: SearchRuntimeResult = {
      entries: res.entries,
      totalSize: res.totalSize,
      currentPageIndex: res.currentPageIndex,
      numberOfPages: res.numberOfPages,
    };
    this._results.set(result);
    this._loading.set(false);
    return result;
  }
}
