export type KdResponseStatus = 'Submitted' | 'Complete' | 'Error' | 'Blocked' | 'Unknown';
export type KdFeedbackValue = 'Good' | 'Bad' | 'Retry';

export interface KdAgentSummary {
  id: string;
  name: string;
  description: string;
  modelName: string;
  version?: number;
}

export interface KdAgentAccessRight {
  type: string;
  id: string;
}

export type KdFilterExpression = Record<string, unknown> | null;

export interface KdGuardrail {
  name: string;
  severity?: string;
  isRecommended?: boolean;
}

export interface KdGuardrailGroup {
  displayName: string;
  description: string;
  guardrails: KdGuardrail[];
}

/**
 * Model entry as returned by `GET /agent/models` on the Knowledge Discovery
 * service. We mirror the upstream field names exactly (`modelName`,
 * `displayName`, `status`, `eolDate`, `replacementModelName`) so the UI
 * can render the catalogue verbatim, including deprecation metadata.
 */
export interface KdModelInfo {
  modelName: string;
  displayName?: string;
  /** Typically one of 'Active' | 'Deprecated' | 'Unavailable'. */
  status?: string;
  eolDate?: string | null;
  replacementModelName?: string | null;
}

export interface KdAgentDetails extends KdAgentSummary {
  instructions: string;
  sourceIds: string[];
  accessRights: KdAgentAccessRight[];
  staticFilterExpression: KdFilterExpression;
  dynamicFilterTemplate: KdFilterExpression;
  guardrails: KdGuardrail[];
  avatarUrl?: string;
  agentType?: string;
  knowledgeGraphDomainId?: string;
}

export interface KdQuestionRequest {
  agentId: string;
  question: string;
  dynamicFilter?: KdFilterExpression;
}

export interface KdQuestionSubmission {
  questionId: string;
  status: KdResponseStatus;
}

export interface KdCitation {
  objectId: string;
  referenceId?: string;
  title: string;
  excerpt?: string;
  score?: number;
}

export interface KdObjectReference {
  objectId: string;
  references: {
    referenceId?: string;
    rank?: number;
    rankScore?: number;
  }[];
}

export interface KdAnswerResponse {
  questionId: string;
  agentId: string;
  agentVersion?: number;
  question: string;
  status: KdResponseStatus;
  answer: string;
  citations: KdCitation[];
  objectReferences?: KdObjectReference[];
  feedback?: string | null;
  staticFilter?: KdFilterExpression;
  dynamicFilter?: KdFilterExpression;
  error?: string | null;
}

export interface KdFeedbackRequest {
  feedback: KdFeedbackValue;
}

export interface KdQuestionHistoryItem {
  id: string;
  question: string;
  answer: string;
  dateCreated: string;
  dateAnswered: string;
  agentVersion?: number;
  status: KdResponseStatus;
  feedback?: string | null;
  staticFilter?: KdFilterExpression;
  dynamicFilter?: KdFilterExpression;
}

export interface KdQuestionHistoryPage {
  data: KdQuestionHistoryItem[];
  pagination: Record<string, unknown>;
}
