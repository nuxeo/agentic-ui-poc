import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, expand, reduce, EMPTY } from 'rxjs';

import { NuxeoApiBase } from './nuxeo-api-base';
import { DirectoryEntry, L10nDirectoryResponse, L10nDirectoryEntry } from '../models/directory.model';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  private readonly api = inject(NuxeoApiBase);
  private readonly cache = new Map<string, Observable<DirectoryEntry[]>>();
  private readonly l10nCache = new Map<string, Observable<L10nDirectoryEntry[]>>();

  getEntries(directoryName: string): Observable<DirectoryEntry[]> {
    const cached = this.cache.get(directoryName);
    if (cached) return cached;

    const result$ = this.api
      .post<DirectoryEntry[]>(
        '/nuxeo/api/v1/automation/Directory.SuggestEntries',
        {
          params: {
            directoryName,
            dbl10n: false,
            localize: true,
            lang: 'en',
            searchTerm: '',
          },
          context: {},
        },
        { 'Content-Type': 'application/json', properties: '*' },
      )
      .pipe(
        map((entries) =>
          entries
            .filter((e) => !e.obsolete)
            .sort((a, b) => a.ordering - b.ordering),
        ),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.cache.set(directoryName, result$);
    return result$;
  }

  /**
   * Fetches entries from an l10n directory (l10nsubjects, l10ncoverage)
   * using the REST directory API with pagination. Returns only top-level
   * entries (parent === '').
   */
  getL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]> {
    const cached = this.l10nCache.get(directoryName);
    if (cached) return cached;

    const fetchPage = (pageIndex: number) => {
      const params = new HttpParams()
        .set('pageSize', 50)
        .set('currentPageIndex', pageIndex);
      return this.api.get<L10nDirectoryResponse>(
        `/nuxeo/api/v1/directory/${directoryName}`,
        params,
      );
    };

    const result$ = fetchPage(0).pipe(
      expand((res) =>
        res.isNextPageAvailable ? fetchPage(res.currentPageIndex + 1) : EMPTY,
      ),
      reduce<L10nDirectoryResponse, L10nDirectoryEntry[]>(
        (acc, res) => acc.concat(res.entries),
        [],
      ),
      map((entries) =>
        entries
          .filter((e) => !e.properties.obsolete && !e.properties.parent)
          .sort((a, b) =>
            (a.properties.label_en ?? a.id).localeCompare(b.properties.label_en ?? b.id),
          ),
      ),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.l10nCache.set(directoryName, result$);
    return result$;
  }

  getEventTypes(): Observable<DirectoryEntry[]> {
    return this.getEntries('eventTypes');
  }

  getEventCategories(): Observable<DirectoryEntry[]> {
    return this.getEntries('eventCategories');
  }
}
