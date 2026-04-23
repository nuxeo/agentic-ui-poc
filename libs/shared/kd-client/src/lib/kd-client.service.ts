import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import { KD_CIC_OPERATIONS, type KdCicOperations } from './kd.config';
import type {
  KdAgentDetails,
  KdAgentSummary,
  KdAgentUpsertRequest,
  KdAnswerResponse,
  KdFeedbackRequest,
  KdGuardrailGroup,
  KdModelInfo,
  KdQuestionHistoryPage,
  KdQuestionRequest,
  KdQuestionSubmission,
} from './kd.models';

type AutomationBody = { params?: Record<string, unknown>; input?: unknown };

/**
 * Talks to Knowledge Discovery through the Hyland Content Intelligence Connector (CIC)
 * installed on the Nuxeo server.
 *
 * We POST to Nuxeo automation operations (`/nuxeo/site/automation/<OpName>`). The browser
 * authenticates through the existing Nuxeo session (SAML cookie or Basic auth), so no
 * separate backend service, token store, or client secret is required in the Angular app.
 */
@Injectable({ providedIn: 'root' })
export class KdClientService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);
  private readonly ops = inject<KdCicOperations>(KD_CIC_OPERATIONS);

  listAgents(): Observable<KdAgentSummary[]> {
    return this.invoke<KdAgentSummary[] | { agents: KdAgentSummary[] }>(this.ops.listAgents).pipe(
      map((response) => (Array.isArray(response) ? response : (response?.agents ?? []))),
    );
  }

  getAgent(agentId: string): Observable<KdAgentDetails> {
    return this.invoke<KdAgentDetails>(this.ops.getAgent, { agentId });
  }

  createAgent(request: KdAgentUpsertRequest): Observable<KdAgentDetails> {
    return this.invoke<KdAgentDetails>(this.ops.createAgent, { agent: request });
  }

  updateAgent(agentId: string, request: KdAgentUpsertRequest): Observable<KdAgentDetails> {
    return this.invoke<KdAgentDetails>(this.ops.updateAgent, { agentId, agent: request });
  }

  deleteAgent(agentId: string): Observable<void> {
    return this.invoke<void>(this.ops.deleteAgent, { agentId });
  }

  listModels(): Observable<KdModelInfo[]> {
    return this.invoke<KdModelInfo[] | { models: KdModelInfo[] }>(this.ops.listModels).pipe(
      map((response) => (Array.isArray(response) ? response : (response?.models ?? []))),
    );
  }

  listGuardrails(): Observable<{ guardrailGroups: KdGuardrailGroup[] }> {
    return this.invoke<{ guardrailGroups: KdGuardrailGroup[] }>(this.ops.listGuardrails).pipe(
      map((response) => ({ guardrailGroups: response?.guardrailGroups ?? [] })),
    );
  }

  submitQuestion(request: KdQuestionRequest): Observable<KdQuestionSubmission> {
    return this.invoke<KdQuestionSubmission>(this.ops.submitQuestion, {
      agentId: request.agentId,
      question: request.question,
      dynamicFilter: request.dynamicFilter ?? null,
    });
  }

  getAnswer(questionId: string): Observable<KdAnswerResponse> {
    return this.invoke<KdAnswerResponse>(this.ops.getAnswer, { questionId });
  }

  submitFeedback(questionId: string, request: KdFeedbackRequest): Observable<void> {
    return this.invoke<void>(this.ops.submitFeedback, {
      questionId,
      feedback: request.feedback,
    });
  }

  getQuestionHistory(
    agentId: string,
    pageNumber = 1,
    pageSize = 25,
  ): Observable<KdQuestionHistoryPage> {
    return this.invoke<KdQuestionHistoryPage>(this.ops.getQuestionHistory, {
      agentId,
      pageNumber,
      pageSize,
    }).pipe(
      map((response) => ({
        data: response?.data ?? [],
        pagination: response?.pagination ?? {},
      })),
    );
  }

  private invoke<T>(operation: string, params?: Record<string, unknown>): Observable<T> {
    const body: AutomationBody = params ? { params } : {};
    return this.http.post<T>(this.automationUrl(operation), body, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  private automationUrl(operation: string): string {
    const origin = this.apiOrigin.replace(/\/$/, '');
    return `${origin}/nuxeo/site/automation/${encodeURIComponent(operation)}`;
  }
}
