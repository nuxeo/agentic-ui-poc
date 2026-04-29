import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import {
  KD_CIC_OPERATIONS,
  KD_UPSTREAM_PATHS,
  type KdCicOperations,
  type KdUpstreamPaths,
} from './kd.config';
import type {
  KdAgentDetails,
  KdAgentSummary,
  KdAnswerResponse,
  KdFeedbackRequest,
  KdGuardrailGroup,
  KdModelInfo,
  KdQuestionHistoryItem,
  KdQuestionHistoryPage,
  KdQuestionRequest,
  KdQuestionSubmission,
  KdResponseStatus,
} from './kd.models';

type AutomationBody = { params?: Record<string, unknown>; input?: unknown };

/**
 * Standard response envelope returned by every CIC automation op.
 * `response` carries the upstream JSON (may be an object, array, or null);
 * `responseCode` is the upstream HTTP status (or -1 if the connector itself
 * failed); `responseMessage` is the upstream status message or a connector
 * error string (for responseCode -1 / non-2xx).
 */
interface CicEnvelope<T> {
  response: T;
  responseCode: number;
  responseMessage?: string;
}

/**
 * Error thrown when the upstream Discovery service returns a non-2xx
 * `responseCode` in the CIC envelope. Carries the upstream HTTP status so
 * the UI can render targeted advice (e.g. a 400 for an incompatible dynamic
 * filter vs. a 403 for a tenant-provisioning problem).
 */
export class KdDiscoveryError extends Error {
  constructor(
    public readonly responseCode: number,
    public readonly responseMessage: string,
    public readonly upstreamBody: unknown,
  ) {
    super(
      responseMessage
        ? `Knowledge Discovery error (${responseCode}): ${responseMessage}`
        : `Knowledge Discovery returned HTTP ${responseCode}.`,
    );
    this.name = 'KdDiscoveryError';
  }
}

/**
 * Talks to Knowledge Discovery through the Hyland Content Intelligence
 * Connector (CIC) installed on the Nuxeo server.
 *
 * The browser authenticates through the existing Nuxeo session (SAML cookie
 * or Basic auth) and calls Nuxeo automation endpoints. Nuxeo forwards the
 * call to the connector, which handles OAuth token issuance and the
 * `hxai-environment` header before reaching the Discovery API. No tenant
 * secrets touch the Angular bundle.
 *
 * The CIC connector is read- and invoke-only: it exposes a small first-class
 * surface (`getAllAgents`, `askQuestionAndGetAnswer`, conversation ops,
 * feedback) plus a generic `HylandKnowledgeDiscovery.Invoke` that supports
 * `GET`, `POST`, and `PUT` against the Discovery API. It does NOT expose
 * agent create/update/delete — those flows live in the Hyland Insight admin
 * UI and are intentionally not exposed by this service. The client
 * therefore sticks to agent listing/details, model and guardrail metadata,
 * question submission, question history, and feedback.
 *
 * `askQuestionAndGetAnswer` is synchronous on the server side — it polls
 * the Discovery API until the answer is ready (or until the connector's
 * `pullResultsMaxTries` runs out). We expose the classic submit-then-poll
 * contract (`submitQuestion` + `getAnswer`) for UI compatibility; the first
 * `submitQuestion` call already returns the finished answer, which is then
 * cached under a synthetic question id and served by `getAnswer`.
 */
@Injectable({ providedIn: 'root' })
export class KdClientService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);
  private readonly ops = inject<KdCicOperations>(KD_CIC_OPERATIONS);
  private readonly paths = inject<KdUpstreamPaths>(KD_UPSTREAM_PATHS);
  private readonly answerCache = new Map<string, KdAnswerResponse>();

  listAgents(): Observable<KdAgentSummary[]> {
    return this.runNamed<KdAgentSummary[] | { agents: KdAgentSummary[] }>(
      this.ops.getAllAgents,
    ).pipe(map((response) => (Array.isArray(response) ? response : (response?.agents ?? []))));
  }

  getAgent(agentId: string): Observable<KdAgentDetails> {
    return this.runInvoke<KdAgentDetails>('GET', this.paths.getAgent(agentId));
  }

  listModels(): Observable<KdModelInfo[]> {
    return this.runInvoke<unknown>('GET', this.paths.listModels).pipe(
      map((response): KdModelInfo[] => {
        const raw = Array.isArray(response)
          ? response
          : ((response as { models?: unknown } | null)?.models ?? []);
        if (!Array.isArray(raw)) return [];
        return raw.flatMap((entry): KdModelInfo[] => {
          const m = entry as Partial<KdModelInfo> & { name?: string };
          const modelName = m.modelName ?? m.name;
          if (typeof modelName !== 'string' || modelName.length === 0) return [];
          return [
            {
              modelName,
              displayName: m.displayName ?? modelName,
              status: m.status,
              eolDate: m.eolDate ?? null,
              replacementModelName: m.replacementModelName ?? null,
            },
          ];
        });
      }),
    );
  }

  listGuardrails(): Observable<{ guardrailGroups: KdGuardrailGroup[] }> {
    return this.runInvoke<{ guardrailGroups: KdGuardrailGroup[] }>(
      'GET',
      this.paths.listGuardrails,
    ).pipe(map((response) => ({ guardrailGroups: response?.guardrailGroups ?? [] })));
  }

  submitQuestion(request: KdQuestionRequest): Observable<KdQuestionSubmission> {
    const params: Record<string, unknown> = {
      agentId: request.agentId,
      question: request.question,
    };
    if (request.dynamicFilter !== undefined && request.dynamicFilter !== null) {
      params['extraPayloadJsonStr'] = JSON.stringify({ dynamicFilter: request.dynamicFilter });
    }

    return this.runNamed<KdAnswerResponse>(this.ops.askQuestionAndGetAnswer, params).pipe(
      map((response) => {
        const answer = this.normalizeAnswer(response, request);
        this.answerCache.set(answer.questionId, answer);
        return {
          questionId: answer.questionId,
          status: answer.status,
        } satisfies KdQuestionSubmission;
      }),
    );
  }

  getAnswer(questionId: string): Observable<KdAnswerResponse> {
    const cached = this.answerCache.get(questionId);
    if (cached) return of(cached);
    return throwError(
      () =>
        new Error(
          `No cached answer for questionId "${questionId}". ` +
            'askQuestionAndGetAnswer returns a one-shot answer; the client caches it by id.',
        ),
    );
  }

  submitFeedback(questionId: string, request: KdFeedbackRequest): Observable<void> {
    const answer = this.answerCache.get(questionId);
    if (!answer) {
      return throwError(
        () =>
          new Error(
            `No cached answer for questionId "${questionId}". ` +
              'Feedback can only be submitted on a question produced in this session.',
          ),
      );
    }
    this.answerCache.set(questionId, { ...answer, feedback: request.feedback });
    return of(undefined);
  }

  /**
   * Hits `GET /qna/agents/{agentId}/questions/history` on the Discovery
   * QnA service via the connector's `Invoke` passthrough. The upstream
   * payload uses `responseCompleteness` rather than a `status` field, and
   * emits `feedback` as a nullable object; we normalise both so the UI can
   * treat a history item the same shape as an in-flight answer.
   */
  getQuestionHistory(
    agentId: string,
    pageNumber = 1,
    pageSize = 25,
  ): Observable<KdQuestionHistoryPage> {
    return this.runInvoke<{
      pagination?: Record<string, unknown>;
      data?: Array<Partial<KdQuestionHistoryItem> & { responseCompleteness?: string }>;
    }>('GET', this.paths.getQuestionHistory(agentId, pageNumber, pageSize)).pipe(
      map((response) => ({
        data: (response?.data ?? []).map(
          (item): KdQuestionHistoryItem => ({
            id: item.id ?? '',
            question: item.question ?? '',
            answer: item.answer ?? '',
            dateCreated: item.dateCreated ?? '',
            dateAnswered: item.dateAnswered ?? '',
            agentVersion: item.agentVersion,
            status: this.mapCompletenessToStatus(item.responseCompleteness ?? item.status),
            feedback: typeof item.feedback === 'string' ? item.feedback : (item.feedback ?? null),
            staticFilter: item.staticFilter ?? null,
            dynamicFilter: item.dynamicFilter ?? null,
          }),
        ),
        pagination: response?.pagination ?? {},
      })),
    );
  }

  private mapCompletenessToStatus(raw: string | undefined): KdResponseStatus {
    switch (raw) {
      case 'Complete':
      case 'Submitted':
      case 'Error':
      case 'Blocked':
        return raw;
      default:
        return raw ? 'Unknown' : 'Complete';
    }
  }

  private runNamed<T>(operation: string, params?: Record<string, unknown>): Observable<T> {
    const body: AutomationBody = params ? { params } : {};
    return this.http
      .post<CicEnvelope<T>>(this.automationUrl(operation), body, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .pipe(map((envelope) => this.unwrap<T>(envelope)));
  }

  /**
   * Generic passthrough to `HylandKnowledgeDiscovery.Invoke`. The CIC
   * connector intentionally only supports `GET`, `POST`, and `PUT`; any
   * `DELETE` request is rejected with
   * `Only GET, POST and PUT are supported.` Agent deletion therefore cannot
   * be performed through this connector — it must happen in the Hyland
   * Insight admin UI.
   */
  private runInvoke<T>(
    httpMethod: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    payload?: unknown,
  ): Observable<T> {
    const params: Record<string, unknown> = { httpMethod, endpoint };
    if (payload !== undefined) {
      params['jsonPayloadStr'] = JSON.stringify(payload);
    }
    return this.runNamed<T>(this.ops.invoke, params);
  }

  private unwrap<T>(envelope: CicEnvelope<T>): T {
    if (!envelope || typeof envelope !== 'object') {
      throw new Error('Unexpected response from Knowledge Discovery connector.');
    }
    const { response, responseCode, responseMessage } = envelope;
    if (responseCode !== undefined && (responseCode < 200 || responseCode >= 300)) {
      throw new KdDiscoveryError(responseCode, responseMessage ?? '', response);
    }
    return response;
  }

  private normalizeAnswer(
    raw: KdAnswerResponse | (Partial<KdAnswerResponse> & { questionId?: string }) | null,
    request: KdQuestionRequest,
  ): KdAnswerResponse {
    const answer = raw ?? {};
    const questionId =
      (answer as Partial<KdAnswerResponse>).questionId ??
      `kd-${request.agentId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      questionId,
      agentId: (answer as Partial<KdAnswerResponse>).agentId ?? request.agentId,
      agentVersion: (answer as Partial<KdAnswerResponse>).agentVersion,
      question: (answer as Partial<KdAnswerResponse>).question ?? request.question,
      status: (answer as Partial<KdAnswerResponse>).status ?? 'Complete',
      answer: (answer as Partial<KdAnswerResponse>).answer ?? '',
      citations: (answer as Partial<KdAnswerResponse>).citations ?? [],
      feedback: (answer as Partial<KdAnswerResponse>).feedback ?? null,
      staticFilter: (answer as Partial<KdAnswerResponse>).staticFilter,
      dynamicFilter:
        (answer as Partial<KdAnswerResponse>).dynamicFilter ?? request.dynamicFilter ?? null,
      error: (answer as Partial<KdAnswerResponse>).error ?? null,
    };
  }

  private automationUrl(operation: string): string {
    const origin = this.apiOrigin.replace(/\/$/, '');
    return `${origin}/nuxeo/site/automation/${encodeURIComponent(operation)}`;
  }
}
