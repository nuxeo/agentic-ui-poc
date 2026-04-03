import { Injectable, computed, signal } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

export interface TrashFilters {
  fullText: string;
  path: string;
  author: string;
  sizeRanges: string[];
}

export interface TrashResultItem {
  uid: string;
  title: string;
  type: string;
}

export type TrashLayoutMode = 'filters' | 'results';

const EMPTY_FILTERS: TrashFilters = { fullText: '', path: '/', author: '', sizeRanges: [] };

@Injectable({ providedIn: 'root' })
export class TrashFilterService {
  readonly filters = signal<TrashFilters>({ ...EMPTY_FILTERS }, { equal: () => false });
  readonly layoutMode = signal<TrashLayoutMode>('filters');
  readonly results = signal<TrashResultItem[]>([]);
  readonly resultThumbnails = signal<Record<string, SafeUrl>>({});
  readonly totalResults = signal(0);
  readonly resultsLoading = signal(false);

  readonly activeSavedFilterUid = signal<string | null>(null);
  readonly activeSavedFilterTitle = signal<string | null>(null);
  readonly hasSavedFilter = computed(() => this.activeSavedFilterUid() !== null);

  reset(): void {
    this.filters.set({ ...EMPTY_FILTERS });
    this.activeSavedFilterUid.set(null);
    this.activeSavedFilterTitle.set(null);
  }

  toggleLayout(): void {
    this.layoutMode.update((m) => (m === 'filters' ? 'results' : 'filters'));
  }
}
