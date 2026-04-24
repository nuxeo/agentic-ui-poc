import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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

/**
 * Calls Nuxeo Automation Operations backed by the Java AI package (HAIP).
 *
 * All endpoints resolve to:
 *   POST /nuxeo/api/v1/automation/<OperationId>
 *   Body: { "params": { ...params } }
 *
 * The Automation REST API returns the Blob content directly when the
 * operation returns a StringBlob with application/json mime type.
 */
@Injectable({ providedIn: 'root' })
export class AiGatewayService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AI_BACKEND_URL);

  /** Build the Automation endpoint URL for a given operation ID. */
  private op(operationId: string): string {
    const base = this.baseUrl.replace(/\/$/, '');
    return `${base}/api/v1/automation/${operationId}`;
  }

  /** Wrap params in the Nuxeo Automation request envelope. */
  private params(p: Record<string, unknown>): { params: Record<string, unknown> } {
    return { params: p };
  }

  nlToNxql(query: string): Observable<NlToNxqlResponse> {
    return this.http.post<NlToNxqlResponse>(
      this.op('AI.NlToNxql'),
      this.params({ query, suggestions: false }),
    );
  }

  nlToNxqlSuggestions(query: string): Observable<NlToNxqlSuggestionsResponse> {
    return this.http.post<NlToNxqlSuggestionsResponse>(
      this.op('AI.NlToNxql'),
      this.params({ query, suggestions: true }),
    );
  }

  summarize(docId: string): Observable<SummarizeResponse> {
    return this.http.post<SummarizeResponse>(this.op('AI.Summarize'), this.params({ docId }));
  }

  suggestTags(docId: string): Observable<SuggestTagsResponse> {
    return this.http.post<SuggestTagsResponse>(this.op('AI.SuggestTags'), this.params({ docId }));
  }

  classify(docId: string): Observable<ClassifyResponse> {
    return this.http.post<ClassifyResponse>(this.op('AI.Classify'), this.params({ docId }));
  }

  findSimilar(docId: string, limit = 5): Observable<SimilarResponse> {
    return this.http.post<SimilarResponse>(this.op('AI.Similar'), this.params({ docId, limit }));
  }

  chat(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      this.op('AI.Chat'),
      this.params({
        message: request.message,
        historyJson: JSON.stringify(request.history ?? []),
        docId: request.context?.docId ?? '',
        page: request.context?.page ?? '',
      }),
    );
  }

  analyzeSentiment(comments: Array<{ id: string; text: string }>): Observable<SentimentResponse> {
    return this.http.post<SentimentResponse>(
      this.op('AI.Sentiment'),
      this.params({ commentsJson: JSON.stringify(comments) }),
    );
  }

  getInsights(userId: string): Observable<InsightsResponse> {
    return this.http.post<InsightsResponse>(this.op('AI.Insights'), this.params({ userId }));
  }

  detectAnomalies(timeRange = '24h'): Observable<AnomaliesResponse> {
    return this.http.post<AnomaliesResponse>(this.op('AI.Anomalies'), this.params({ timeRange }));
  }

  queryPermissions(query: string): Observable<NlPermissionsResponse> {
    return this.http.post<NlPermissionsResponse>(
      this.op('AI.NlPermissions'),
      this.params({ query }),
    );
  }

  auditNlFilter(query: string): Observable<AuditFilterResponse> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.post<AuditFilterResponse>(
      this.op('AI.AuditNlFilter'),
      this.params({ query, today }),
    );
  }

  auditSummarize(entries: unknown[]): Observable<AuditSummaryResponse> {
    return this.http.post<AuditSummaryResponse>(
      this.op('AI.AuditSummarize'),
      this.params({ entriesJson: JSON.stringify(entries) }),
    );
  }
}
