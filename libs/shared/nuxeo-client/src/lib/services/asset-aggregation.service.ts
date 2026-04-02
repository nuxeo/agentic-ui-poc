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
}
