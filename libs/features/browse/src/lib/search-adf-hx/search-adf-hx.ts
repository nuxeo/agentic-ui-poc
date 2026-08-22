import { Component, inject, signal } from '@angular/core';
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
import { PACKAGED_BROWSE_COLUMNS } from '@agentic-ui/shared/extensions';

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

  // ── Column schema from Layer 1 ──
  protected readonly columns = PACKAGED_BROWSE_COLUMNS as unknown as DataColumn[];

  // ── Search trigger ──
  private readonly searchTrigger = new Subject<void>();

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

  protected readonly hasNextPage = signal(true); // Simplified for now

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

  private triggerSearch(): void {
    this.searchTrigger.next();
  }
}
