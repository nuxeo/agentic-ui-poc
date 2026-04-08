import { Component, DestroyRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly objectUrls = new Map<string, string>();
  private readonly inFlight = new Set<string>();

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
      const thumbnailMap = untracked(() => this.thumbnailMap());
      for (const item of queueItems) {
        if (thumbnailMap[item.id] || this.inFlight.has(item.id)) continue;
        this.inFlight.add(item.id);
        this.detailService.fetchThumbnail(item.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .pipe(catchError(() => of(null)))
          .subscribe((blob) => {
            this.inFlight.delete(item.id);
            if (!blob) return;

            const previousUrl = this.objectUrls.get(item.id);
            if (previousUrl) URL.revokeObjectURL(previousUrl);

            const url = URL.createObjectURL(blob);
            this.objectUrls.set(item.id, url);
            this.thumbnailMap.update((current) => ({
              ...current,
              [item.id]: this.sanitizer.bypassSecurityTrustUrl(url),
            }));
          });
      }
    });

    this.destroyRef.onDestroy(() => {
      for (const url of this.objectUrls.values()) {
        URL.revokeObjectURL(url);
      }
      this.objectUrls.clear();
      this.inFlight.clear();
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
