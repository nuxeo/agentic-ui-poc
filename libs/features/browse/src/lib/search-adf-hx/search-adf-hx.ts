import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import type { Document, QueryResult } from '@hylandsoftware/hxcs-js-client';
import { SearchService } from '@alfresco/adf-hx-content-services/services';
import { HxpDocumentListComponent } from '@alfresco/adf-hx-content-services/ui';
import type { DataColumn } from '@alfresco/adf-core';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, Subject } from 'rxjs';
import { PACKAGED_BROWSE_COLUMNS } from '@nuxeo-satori/platform/extensions';

import { toDataColumns } from '../adf-hx-columns';

@Component({
  selector: 'lib-search-adf-hx',
  standalone: true,
  imports: [
    FormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    HxpDocumentListComponent,
  ],
  templateUrl: './search-adf-hx.html',
  styleUrls: ['./search-adf-hx.scss'],
})
export class SearchAdfHxComponent {
  private readonly searchService = inject(SearchService);

  // ── Search state ──
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly results = signal<Document[]>([]);
  protected readonly totalCount = signal<number>(-1);
  protected readonly searchTerm = signal('');

  // ── Pagination ──
  protected readonly pageSize = signal(50);
  protected readonly currentPage = signal(0);

  /**
   * Column schema from Layer 1, **translated** rather than cast.
   *
   * This was `PACKAGED_BROWSE_COLUMNS as unknown as DataColumn[]`. `DataColumn` requires
   * `key` and `type`; our descriptors carry `field` and `label`. So every cell resolved
   * `undefined` and the page rendered eight empty rows for a query matching eight
   * documents — headers correct, content blank. The double cast is what let it compile.
   *
   * Hidden-by-default columns are dropped: nine of the twelve ship hidden, and this
   * page has no column picker to switch them on, so including them would render nine
   * permanently empty columns.
   */
  protected readonly columns: DataColumn[] = toDataColumns(
    PACKAGED_BROWSE_COLUMNS.filter((column) => !column.hiddenByDefault),
  );

  /**
   * Carries a **query key**, not `void`.
   *
   * It was `Subject<void>`, and the pipe below applies `distinctUntilChanged()`. Every
   * emission on a `Subject<void>` is `undefined`, so `undefined === undefined` made
   * the operator drop every emission after the first: the constructor's initial search
   * ran, and then typing a term, clicking Next and clicking Previous all did nothing.
   * The page showed the unfiltered initial result set — 135 documents — with the
   * search box appearing to work because the input still echoed what was typed.
   *
   * Nothing caught it. The port's NXQL generation is unit-tested at the wire and was
   * correct; the failure was that no request was ever made. It took driving the page
   * in a browser, which is what the phase record said had never been done.
   *
   * The key is `term::page`, so `distinctUntilChanged()` now does what it was meant to
   * — suppress a genuinely identical query — instead of suppressing all of them.
   */
  private readonly searchTrigger = new Subject<string>();

  constructor() {
    // Execute search when term or pagination changes
    this.searchTrigger
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          this.loading.set(true);
          this.error.set(null);

          const term = this.searchTerm().trim();
          const offset = this.currentPage() * this.pageSize();

          // Build HXQL query
          const query = term
            ? `SELECT * FROM SysContent WHERE sys_fulltext = '${term}*' ORDER BY sys_modified DESC`
            : `SELECT * FROM SysContent ORDER BY sys_modified DESC`;

          return this.searchService.getDocumentsByQuery(query, {
            pagination: {
              maxItems: this.pageSize(),
              skipCount: offset,
            },
          });
        }),
        catchError((err) => {
          this.error.set(err.message ?? 'Search failed');
          return of<QueryResult>({ documents: [], count: 0, limit: 0, offset: 0, totalCount: 0 });
        }),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.results.set(result.documents ?? []);
        this.totalCount.set(result.totalCount ?? -1);
        this.loading.set(false);
      });

    // Trigger initial search
    this.triggerSearch();
  }

  protected onSearchTermChange(): void {
    this.currentPage.set(0);
    this.triggerSearch();
  }

  // ── Pagination ──

  /**
   * Derived from the reported total rather than hardcoded.
   *
   * This was `signal(true)` with the comment "Simplified for now", so Next stayed
   * enabled on the last page and clicking it fetched an empty page — which reads as a
   * broken search rather than the end of the results. `totalCount` is `-1` until the
   * first result lands, and in that state offering Next is the tolerant choice.
   */
  protected readonly hasNextPage = computed<boolean>(() => {
    const total = this.totalCount();
    if (total < 0) return true;
    return (this.currentPage() + 1) * this.pageSize() < total;
  });

  protected readonly hasPreviousPage = () => this.currentPage() > 0;

  protected nextPage(): void {
    this.currentPage.update((p) => p + 1);
    this.triggerSearch();
  }

  protected previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update((p) => p - 1);
      this.triggerSearch();
    }
  }

  /**
   * The key must include every input the query is built from — the term and the page —
   * or `distinctUntilChanged()` would swallow a page change made without editing the
   * term, which is precisely how paging was broken.
   */
  private triggerSearch(): void {
    this.searchTrigger.next(`${this.searchTerm().trim()}::${this.currentPage()}`);
  }
}
