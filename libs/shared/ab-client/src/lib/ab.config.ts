import { InjectionToken } from '@angular/core';

/**
 * Hyland Agent Builder automation operations exposed by
 * `nuxeo-labs-content-intelligence-connector` (2025.x).
 *
 * There is no `HylandAgents.Invoke` passthrough like KD’s
 * `HylandKnowledgeDiscovery.Invoke`; listing and lookup use dedicated ops.
 * Override via `AB_CIC_OPERATIONS` in `app.config.ts` if your bundle renames
 * them.
 */
export interface AbCicOperations {
  getAllAgents: string;
  lookupAgent: string;
}

export const DEFAULT_AB_CIC_OPERATIONS: AbCicOperations = {
  getAllAgents: 'HylandAgents.getAllAgents',
  lookupAgent: 'HylandAgents.LookupAgent',
};

export const AB_CIC_OPERATIONS = new InjectionToken<AbCicOperations>('AB_CIC_OPERATIONS', {
  providedIn: 'root',
  factory: () => DEFAULT_AB_CIC_OPERATIONS,
});

/**
 * Upstream Agent Builder HTTP paths (reference only). The current CIC
 * surface does not expose a generic HTTP invoke for these paths — only
 * {@link AbCicOperations.getAllAgents} and {@link AbCicOperations.lookupAgent}
 * are wired in {@link AbClientService}.
 */
export interface AbUpstreamPaths {
  listAgents: string;
  getAgent: (agentId: string) => string;
  createAgent: string;
  listModels: string;
  listGuardrails: string;
  health: string;
}

export const DEFAULT_AB_UPSTREAM_PATHS: AbUpstreamPaths = {
  listAgents: '/v1/agents',
  getAgent: (agentId) => `/v1/agents/${encodeURIComponent(agentId)}`,
  createAgent: '/v1/agents',
  listModels: '/v1/models',
  listGuardrails: '/v1/guardrails',
  health: '/v1/health',
};

export const AB_UPSTREAM_PATHS = new InjectionToken<AbUpstreamPaths>('AB_UPSTREAM_PATHS', {
  providedIn: 'root',
  factory: () => DEFAULT_AB_UPSTREAM_PATHS,
});
