export interface NlToNxqlRequest {
  query: string;
  suggestions?: boolean;
}

export interface NlToNxqlResponse {
  nxql: string;
  explanation: string;
}

export interface NlToNxqlSuggestionsResponse {
  suggestions: string[];
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  wordCount: number;
}

export interface SuggestedTag {
  label: string;
  confidence: number;
}

export interface SuggestTagsResponse {
  tags: SuggestedTag[];
}

export interface ClassifyResponse {
  description: string;
  nature: string;
  subjects: string[];
  suggestedType: string;
  confidence: number;
  suggestedWorkflow: string;
  workflowReason: string;
}

export interface DocRef {
  uid: string;
  title: string;
  path: string;
  type?: string;
}

export interface SimilarDoc extends DocRef {
  type: string;
  score: number;
}

export interface SimilarResponse {
  documents: SimilarDoc[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: { docId?: string; page?: string };
  stream?: boolean;
}

export interface ChatResponse {
  reply: string;
  sources: DocRef[];
}

export interface SentimentItem {
  id: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  summary?: string;
}

export interface SentimentResponse {
  sentiments: SentimentItem[];
  threadSummary: string;
}

export interface Insight {
  text: string;
  icon: 'task' | 'document' | 'warning' | 'info' | 'workflow';
  link: string;
  priority: 'high' | 'medium' | 'low';
}

export interface InsightsResponse {
  insights: Insight[];
}

export interface AuditAnomaly {
  description: string;
  severity: 'high' | 'medium' | 'low';
  events: string[];
  timestamp: string;
}

export interface AnomaliesResponse {
  anomalies: AuditAnomaly[];
  summary: string;
}

export interface PermissionResult {
  principal: string;
  permission: string;
  path: string;
}

export interface NlPermissionsResponse {
  answer: string;
  results: PermissionResult[];
}

export interface AuditFilterResponse {
  principalName?: string;
  eventId?: string;
  category?: string;
  from?: string;
  to?: string;
  explanation: string;
}

export interface AuditSummaryStat {
  label: string;
  value: string;
  icon: string;
}

export interface AuditSummaryUser {
  name: string;
  count: number;
}

export interface AuditSummaryResponse {
  summary: string;
  stats: AuditSummaryStat[];
  topUsers: AuditSummaryUser[];
  highlights: string[];
}
