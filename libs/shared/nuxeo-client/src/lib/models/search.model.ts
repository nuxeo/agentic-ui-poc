import type { AggregateResult } from './asset.model';

export interface SearchAggregations {
  dc_modified_agg?: AggregateResult;
  dc_creator_agg?: AggregateResult;
  collection_agg?: AggregateResult;
  dc_nature_agg?: AggregateResult;
  dc_coverage_agg?: AggregateResult;
  dc_subjects_agg?: AggregateResult;
  common_size_agg?: AggregateResult;
}

export interface SearchResponse {
  items: SearchResultItem[];
  aggregations: SearchAggregations;
}

export interface SearchResultItem {
  id: string;
  title: string;
  type: string;
  modifiedDate: string;
  sizeInBytes?: number;
  lastContributor: string;
  createdDate?: string;
  author: string;
  authorKey: string;
  state?: string;
  version?: string;
  nature?: string;
  coverage?: string;
  subjects?: string;
  flags?: string;
  collection: string;
  collectionKey: string;
  tags: string[];
  icon: string;
}
