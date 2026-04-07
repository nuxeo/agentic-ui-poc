import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  DocumentDetailService,
  SearchAggregationService,
  type SearchResultItem,
} from '@agentic-ui/shared/nuxeo-client';
import { catchError, of } from 'rxjs';

interface ActiveFilter {
  label: string;
  value: string;
  selected: boolean;
}

@Component({
  selector: 'lib-search-queue',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './search-queue.component.html',
  styleUrl: './search-queue.component.scss',
})
export class SearchQueueComponent {
  private readonly searchAggregationService = inject(SearchAggregationService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly items = computed(() => this.searchAggregationService.items());
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});
  readonly selectedItemId = input<string>('');
  readonly activeFilters = input<ActiveFilter[]>([]);
  readonly switchToFilter = output<void>();
  readonly quickFilterToggled = output<string>();
  readonly itemSelected = output<SearchResultItem>();

  constructor() {
    effect(() => {
      const queueItems = this.items();
      for (const item of queueItems) {
        if (this.thumbnailMap()[item.id]) continue;
        this.detailService.fetchThumbnail(item.id)
          .pipe(catchError(() => of(null)))
          .subscribe((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            this.thumbnailMap.update((current) => ({
              ...current,
              [item.id]: this.sanitizer.bypassSecurityTrustUrl(url),
            }));
          });
      }
    });
  }

  onSwitchToFilter(): void {
    this.switchToFilter.emit();
  }

  onItemClick(item: SearchResultItem): void {
    this.itemSelected.emit(item);
  }

  onQuickFilterClick(value: string): void {
    this.quickFilterToggled.emit(value);
  }

  thumbnailFor(id: string): SafeUrl | null {
    return this.thumbnailMap()[id] ?? null;
  }
}
