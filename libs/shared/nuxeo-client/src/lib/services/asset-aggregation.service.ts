import { Injectable, signal } from '@angular/core';
import { AssetAggregations } from '../models/asset.model';

@Injectable({ providedIn: 'root' })
export class AssetAggregationService {
  readonly aggregations = signal<AssetAggregations>({});
}
