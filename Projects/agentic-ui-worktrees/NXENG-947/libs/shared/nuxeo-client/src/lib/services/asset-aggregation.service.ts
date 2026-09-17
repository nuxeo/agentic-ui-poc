import { Injectable, signal } from '@angular/core';
import { AssetAggregations } from '../models/asset.model';

export interface AssetQueueItem {
  id: string;
  title: string;
  type: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class AssetAggregationService {
  readonly aggregations = signal<AssetAggregations>({});
  readonly items = signal<AssetQueueItem[]>([]);
  readonly selectedSavedSearchId = signal('');
  readonly selectedSavedSearchTitle = signal('');
  readonly savedSearchVersion = signal(0);

  markSavedSearchDirty(): void {
    this.savedSearchVersion.update((v) => v + 1);
  }
}
