export interface NuxeoWorkflowModel {
  'entity-type': 'workflowModel';
  name: string;
  title: string;
  graphResource?: string;
}

export interface NuxeoWorkflowModelList {
  'entity-type': 'workflowModels';
  entries: NuxeoWorkflowModel[];
}

export interface NuxeoWorkflow {
  'entity-type': 'workflow';
  id: string;
  name: string;
  title: string;
  state: string;
  workflowModelName: string;
  initiator: string;
  attachedDocumentIds: { id: string }[];
  variables: Record<string, unknown>;
  graphResource?: string;
}

export interface NuxeoWorkflowList {
  'entity-type': 'workflows';
  entries: NuxeoWorkflow[];
}
