import { InjectionToken } from '@angular/core';
export const DEFAULT_KD_CIC_OPERATIONS = {
    getAllAgents: 'HylandKnowledgeDiscovery.getAllAgents',
    askQuestionAndGetAnswer: 'HylandKnowledgeDiscovery.askQuestionAndGetAnswer',
    startConversation: 'HylandKnowledgeDiscovery.startConversation',
    continueConversation: 'HylandKnowledgeDiscovery.continueConversation',
    conversationFeedback: 'HylandKnowledgeDiscovery.conversationFeedback',
    invoke: 'HylandKnowledgeDiscovery.Invoke',
};
export const KD_CIC_OPERATIONS = new InjectionToken('KD_CIC_OPERATIONS', {
    providedIn: 'root',
    factory: () => DEFAULT_KD_CIC_OPERATIONS,
});
export const DEFAULT_KD_UPSTREAM_PATHS = {
    getAgent: (agentId) => `/agent/agents/${encodeURIComponent(agentId)}`,
    listModels: '/agent/models',
    listGuardrails: '/agent/guardrails',
    /**
     * Verified live against the QnA swagger:
     *   GET /qna/agents/{agentId}/questions/history?pageNumber=&pageSize=
     * returns `{ pagination: { totalItems, pageNumber, totalPages, pageSize },
     * data: QuestionHistoryDto[] }`.
     * The earlier `/agent/questions` path 404'd because question history is
     * served by the separate QnA service, not the Agent service.
     */
    getQuestionHistory: (agentId, pageNumber, pageSize) => `/qna/agents/${encodeURIComponent(agentId)}/questions/history` +
        `?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    getQuestionAnswer: (questionId) => `/qna/questions/${encodeURIComponent(questionId)}/answer`,
};
export const KD_UPSTREAM_PATHS = new InjectionToken('KD_UPSTREAM_PATHS', {
    providedIn: 'root',
    factory: () => DEFAULT_KD_UPSTREAM_PATHS,
});
