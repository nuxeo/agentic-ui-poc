import { Injectable, signal } from '@angular/core';
import type { SearchAggregations } from '../models/search.model';

@Injectable({ providedIn: 'root' })
export class SearchAggregationService {
  readonly aggregations = signal<SearchAggregations>({});
}
