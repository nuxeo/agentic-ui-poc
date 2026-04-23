import type { SearchResultItem } from './search.model';

export interface KnowledgeDiscoveryQueryRequest {
  query: string;
  limit?: number;
}

export interface KnowledgeDiscoverySource {
  objectId: string;
  referenceId?: string;
  title: string;
  path?: string;
  excerpt?: string;
  uri?: string;
  score?: number;
}

export type KnowledgeDiscoveryStatus = 'Complete' | 'Submitted' | 'Error' | 'Unknown';

export interface KnowledgeDiscoveryResponse {
  answer: string;
  status: KnowledgeDiscoveryStatus;
  items: SearchResultItem[];
  sources: KnowledgeDiscoverySource[];
  questionId?: string;
  agentId?: string;
  error?: string;
}
