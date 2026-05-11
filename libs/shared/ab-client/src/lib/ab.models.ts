export interface AbAgentSummary {
  id: string;
  name: string;
  description: string;
  agentType: string;
  modelLabel: string;
  /** ISO or display string from upstream when available */
  lastModified?: string;
}

export interface AbCreateAgentRequest {
  name: string;
  description: string;
  agentType: string;
  config: Record<string, unknown>;
}

export interface AbModelSummary {
  id?: string;
  name?: string;
  displayName?: string;
}
