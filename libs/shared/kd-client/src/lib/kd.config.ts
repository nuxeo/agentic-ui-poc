import { InjectionToken } from '@angular/core';

/**
 * Names of Nuxeo automation operations exposed by the Hyland Content Intelligence
 * Connector (CIC) for Knowledge Discovery.
 *
 * These names are connector-version dependent. Override this token in `app.config.ts`
 * to match whatever operations your Nuxeo instance actually exposes without touching
 * `KdClientService`.
 */
export interface KdCicOperations {
  listAgents: string;
  getAgent: string;
  createAgent: string;
  updateAgent: string;
  deleteAgent: string;
  listModels: string;
  listGuardrails: string;
  submitQuestion: string;
  getAnswer: string;
  submitFeedback: string;
  getQuestionHistory: string;
}

export const DEFAULT_KD_CIC_OPERATIONS: KdCicOperations = {
  listAgents: 'HylandCIC.KnowledgeDiscovery.ListAgents',
  getAgent: 'HylandCIC.KnowledgeDiscovery.GetAgent',
  createAgent: 'HylandCIC.KnowledgeDiscovery.CreateAgent',
  updateAgent: 'HylandCIC.KnowledgeDiscovery.UpdateAgent',
  deleteAgent: 'HylandCIC.KnowledgeDiscovery.DeleteAgent',
  listModels: 'HylandCIC.KnowledgeDiscovery.ListModels',
  listGuardrails: 'HylandCIC.KnowledgeDiscovery.ListGuardrails',
  submitQuestion: 'HylandCIC.KnowledgeDiscovery.SubmitQuestion',
  getAnswer: 'HylandCIC.KnowledgeDiscovery.GetAnswer',
  submitFeedback: 'HylandCIC.KnowledgeDiscovery.SubmitFeedback',
  getQuestionHistory: 'HylandCIC.KnowledgeDiscovery.GetQuestionHistory',
};

export const KD_CIC_OPERATIONS = new InjectionToken<KdCicOperations>('KD_CIC_OPERATIONS', {
  providedIn: 'root',
  factory: () => DEFAULT_KD_CIC_OPERATIONS,
});
