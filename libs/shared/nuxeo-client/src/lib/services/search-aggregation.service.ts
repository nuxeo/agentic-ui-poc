import { Injectable, signal } from '@angular/core';
import type { SearchAggregations, SearchResultItem } from '../models/search.model';

@Injectable({ providedIn: 'root' })
export class SearchAggregationService {
  readonly aggregations = signal<SearchAggregations>({});
  readonly items = signal<SearchResultItem[]>([]);
  readonly drawerFilters = signal<Record<string, string>>({});
  readonly selectedSavedSearchId = signal('');
  readonly selectedSavedSearchTitle = signal('');
}
