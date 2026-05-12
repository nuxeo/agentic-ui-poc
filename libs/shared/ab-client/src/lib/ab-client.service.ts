import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, throwError } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import { AB_CIC_OPERATIONS, type AbCicOperations } from './ab.config';
import type { AbAgentSummary, AbCreateAgentRequest, AbModelSummary } from './ab.models';

interface CicEnvelope<T> {
  response: T;
  responseCode: number;
  responseMessage?: string;
}

type AutomationBody = { params?: Record<string, unknown>; input?: unknown };

export class AbClientError extends Error {
  constructor(
    public readonly responseCode: number,
    public readonly responseMessage: string,
    public readonly upstreamBody: unknown,
  ) {
    super(
      responseMessage
        ? `Agent Builder error (${responseCode}): ${responseMessage}`
        : `Agent Builder returned HTTP ${responseCode}.`,
    );
    this.name = 'AbClientError';
  }
}

/**
 * Agent Builder (Hyland Agents) via Nuxeo CIC. Uses first-class automation ops
 * `HylandAgents.getAllAgents` and `HylandAgents.LookupAgent` — not a generic
 * `HylandAgents.Invoke` (not present on connector 2025.x).
 */
@Injectable({ providedIn: 'root' })
export class AbClientService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);
  private readonly ops = inject<AbCicOperations>(AB_CIC_OPERATIONS);

  listAgents(): Observable<AbAgentSummary[]> {
    return this.runNamed<unknown>(this.ops.getAllAgents, {}).pipe(
      map((raw) => this.normaliseAgentList(raw)),
    );
  }

  getAgent(agentId: string): Observable<unknown> {
    return this.runNamed<unknown>(this.ops.lookupAgent, { agentId });
  }

  /**
   * Not supported: CIC exposes no agent-create automation (use Hyland Insight).
   */
  createAgent(_body: AbCreateAgentRequest): Observable<unknown> {
    return throwError(
      () =>
        new AbClientError(
          501,
          'Agent creation is not exposed by the Content Intelligence Connector. Create agents in Hyland Insight.',
          null,
        ),
    );
  }

  /**
   * Models metadata is not exposed by `HylandAgents.*` ops on current CIC;
   * returns an empty list so callers can fall back to static model lists.
   */
  listModels(_agentType?: string): Observable<AbModelSummary[]> {
    return of([]);
  }

  /**
   * Guardrails are not exposed by `HylandAgents.*` ops on current CIC.
   */
  listGuardrails(): Observable<Array<{ name: string; description?: string }>> {
    return of([]);
  }

  /**
   * Uses {@link AbCicOperations.getAllAgents} as a liveness probe (no `/v1/health` op in CIC).
   */
  health(): Observable<unknown> {
    return this.runNamed<unknown>(this.ops.getAllAgents, {}).pipe(
      map(() => ({
        ok: true,
        via: this.ops.getAllAgents,
        note: 'Connector has no HylandAgents health op; getAllAgents success implies reachability.',
      })),
    );
  }

  private runNamed<T>(operation: string, params?: Record<string, unknown>): Observable<T> {
    const body: AutomationBody = { params: params ?? {} };
    return this.http
      .post<CicEnvelope<T>>(this.automationUrl(operation), body, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      .pipe(map((envelope) => this.unwrap<T>(envelope)));
  }

  private unwrap<T>(envelope: CicEnvelope<T>): T {
    if (!envelope || typeof envelope !== 'object') {
      throw new Error('Unexpected response from Agent Builder connector.');
    }
    const { response, responseCode, responseMessage } = envelope;
    if (responseCode !== undefined && (responseCode < 200 || responseCode >= 300)) {
      throw new AbClientError(responseCode, responseMessage ?? '', response);
    }
    return response;
  }

  private automationUrl(operation: string): string {
    const origin = this.apiOrigin.replace(/\/$/, '');
    return `${origin}/nuxeo/site/automation/${encodeURIComponent(operation)}`;
  }

  private normaliseAgentList(raw: unknown): AbAgentSummary[] {
    return this.coerceArray(raw).map((item) => this.toAgentSummary(item));
  }

  private coerceArray(raw: unknown): unknown[] {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      const o = raw as Record<string, unknown>;
      for (const key of ['agents', 'data', 'items', 'results']) {
        const v = o[key];
        if (Array.isArray(v)) return v;
      }
    }
    return [];
  }

  private toAgentSummary(item: unknown): AbAgentSummary {
    if (!item || typeof item !== 'object') {
      return { id: '', name: '(invalid)', description: '', agentType: '', modelLabel: '' };
    }
    const o = item as Record<string, unknown>;
    const id = String(o['id'] ?? o['agentId'] ?? '');
    const name = String(o['name'] ?? o['title'] ?? id ?? 'Agent');
    const description = String(o['description'] ?? '');
    const agentType = String(o['agentType'] ?? o['type'] ?? '');
    const cfg =
      o['config'] && typeof o['config'] === 'object'
        ? (o['config'] as Record<string, unknown>)
        : {};
    const modelLabel = String(
      o['model'] ?? o['modelId'] ?? o['llmModelId'] ?? cfg['llmModelId'] ?? '',
    );
    const lastRaw =
      o['lastModified'] ??
      o['updatedAt'] ??
      o['modifiedAt'] ??
      o['lastUpdated'] ??
      o['dc:modified'];
    const lastModified =
      typeof lastRaw === 'string' || typeof lastRaw === 'number' ? String(lastRaw) : undefined;
    return { id, name, description, agentType, modelLabel, lastModified };
  }
}
