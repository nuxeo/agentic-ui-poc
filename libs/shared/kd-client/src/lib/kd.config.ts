import { InjectionToken } from '@angular/core';

/**
 * Names of the Knowledge Discovery automation operations exposed by the
 * Hyland Content Intelligence Connector (`nuxeo-labs-content-intelligence-
 * connector`).
 *
 * Values default to the operation IDs shipped with connector 2025.x. If your
 * Nuxeo instance renames or adds operations, override the token in
 * `app.config.ts` rather than editing this file.
 *
 * The connector exposes a small, stable first-class surface (getAllAgents,
 * askQuestionAndGetAnswer, conversation ops, feedback) plus a generic
 * `HylandKnowledgeDiscovery.Invoke` passthrough that can call any upstream
 * KD API path when the connector does not wrap it (CRUD on agents, models,
 * guardrails, history, etc.).
 */
export interface KdCicOperations {
  getAllAgents: string;
  askQuestionAndGetAnswer: string;
  startConversation: string;
  continueConversation: string;
  conversationFeedback: string;
  invoke: string;
}

export const DEFAULT_KD_CIC_OPERATIONS: KdCicOperations = {
  getAllAgents: 'HylandKnowledgeDiscovery.getAllAgents',
  askQuestionAndGetAnswer: 'HylandKnowledgeDiscovery.askQuestionAndGetAnswer',
  startConversation: 'HylandKnowledgeDiscovery.startConversation',
  continueConversation: 'HylandKnowledgeDiscovery.continueConversation',
  conversationFeedback: 'HylandKnowledgeDiscovery.conversationFeedback',
  invoke: 'HylandKnowledgeDiscovery.Invoke',
};

export const KD_CIC_OPERATIONS = new InjectionToken<KdCicOperations>('KD_CIC_OPERATIONS', {
  providedIn: 'root',
  factory: () => DEFAULT_KD_CIC_OPERATIONS,
});

/**
 * Upstream Knowledge Discovery API paths used by the client via the
 * `HylandKnowledgeDiscovery.Invoke` passthrough. These are the paths the
 * connector will call directly against the Discovery base URL configured in
 * `nuxeo.conf` (`nuxeo.hyland.cic.discovery.baseUrl`).
 *
 * Only read-only paths are exposed. Agent create/update/delete are not
 * available through the CIC connector (the Invoke op is GET/POST/PUT-only
 * and the upstream Discovery API rejects agent creation over this auth);
 * agent management is done in the Hyland Insight admin UI.
 */
export interface KdUpstreamPaths {
  getAgent: (agentId: string) => string;
  listModels: string;
  listGuardrails: string;
  getQuestionHistory: (agentId: string, pageNumber: number, pageSize: number) => string;
}

export const DEFAULT_KD_UPSTREAM_PATHS: KdUpstreamPaths = {
  getAgent: (agentId) => `/agent/agents/${encodeURIComponent(agentId)}`,
  listModels: '/agent/models',
  listGuardrails: '/agent/guardrails',
  getQuestionHistory: (agentId, pageNumber, pageSize) =>
    `/agent/questions?agentId=${encodeURIComponent(agentId)}` +
    `&pageNumber=${pageNumber}&pageSize=${pageSize}`,
};

export const KD_UPSTREAM_PATHS = new InjectionToken<KdUpstreamPaths>('KD_UPSTREAM_PATHS', {
  providedIn: 'root',
  factory: () => DEFAULT_KD_UPSTREAM_PATHS,
});
