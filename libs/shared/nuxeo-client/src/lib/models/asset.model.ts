import type { NuxeoPaginatedList } from './paginated.model';
import type { NuxeoDocument } from './document.model';

export interface AggregateBucket {
  key: string;
  docCount: number;
}

export interface AggregateResult {
  buckets: AggregateBucket[];
}

export interface AssetAggregations {
  system_primaryType_agg?: AggregateResult;
  system_mimetype_agg?: AggregateResult;
  color_profile_agg?: AggregateResult;
  color_depth_agg?: AggregateResult;
  asset_width_agg?: AggregateResult;
  asset_height_agg?: AggregateResult;
  video_duration_agg?: AggregateResult;
}

export interface AssetSearchParams {
  pageIndex?: number;
  pageSize?: number;
  ecmFulltext?: string;
  primaryTypes?: string[];
  mimeTypes?: string[];
  widths?: string[];
  heights?: string[];
  colorProfiles?: string[];
  colorDepths?: string[];
  videoDurations?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssetSearchResult extends NuxeoPaginatedList<NuxeoDocument> {
  aggregations?: AssetAggregations;
}
