import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AI_BACKEND_URL } from './ai.config';
import type {
  NlToNxqlResponse,
  NlToNxqlSuggestionsResponse,
  SummarizeResponse,
  SuggestTagsResponse,
  ClassifyResponse,
  SimilarResponse,
  ChatRequest,
  ChatResponse,
  SentimentResponse,
  InsightsResponse,
  AnomaliesResponse,
  NlPermissionsResponse,
  AuditFilterResponse,
  AuditSummaryResponse,
} from './ai.models';

@Injectable({ providedIn: 'root' })
export class AiGatewayService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AI_BACKEND_URL);

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}/ai${path}`;
  }

  nlToNxql(query: string): Observable<NlToNxqlResponse> {
    return this.http.post<NlToNxqlResponse>(this.url('/nl-to-nxql'), { query });
  }

  nlToNxqlSuggestions(query: string): Observable<NlToNxqlSuggestionsResponse> {
    return this.http.post<NlToNxqlSuggestionsResponse>(this.url('/nl-to-nxql'), {
      query,
      suggestions: true,
    });
  }

  summarize(docId: string): Observable<SummarizeResponse> {
    return this.http.post<SummarizeResponse>(this.url('/summarize'), { docId });
  }

  suggestTags(docId: string): Observable<SuggestTagsResponse> {
    return this.http.post<SuggestTagsResponse>(this.url('/suggest-tags'), { docId });
  }

  classify(docId: string): Observable<ClassifyResponse> {
    return this.http.post<ClassifyResponse>(this.url('/classify'), { docId });
  }

  findSimilar(docId: string, limit = 5): Observable<SimilarResponse> {
    return this.http.post<SimilarResponse>(this.url('/similar'), { docId, limit });
  }

  chat(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.url('/chat'), { ...request, stream: false });
  }

  analyzeSentiment(comments: Array<{ id: string; text: string }>): Observable<SentimentResponse> {
    return this.http.post<SentimentResponse>(this.url('/sentiment'), { comments });
  }

  getInsights(userId: string): Observable<InsightsResponse> {
    return this.http.post<InsightsResponse>(this.url('/insights'), { userId });
  }

  detectAnomalies(timeRange = '24h'): Observable<AnomaliesResponse> {
    return this.http.post<AnomaliesResponse>(this.url('/anomalies'), { timeRange });
  }

  queryPermissions(query: string): Observable<NlPermissionsResponse> {
    return this.http.post<NlPermissionsResponse>(this.url('/nl-permissions'), { query });
  }

  auditNlFilter(query: string): Observable<AuditFilterResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.post<AuditFilterResponse>(this.url('/audit/nl-filter'), { query, today });
  }

  auditSummarize(entries: unknown[]): Observable<AuditSummaryResponse> {
    return this.http.post<AuditSummaryResponse>(this.url('/audit/summarize'), { entries });
  }
}
