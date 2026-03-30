import { NuxeoPaginatedList } from './paginated.model';

export interface NuxeoTask {
  id: string;
  name: string;
  directive: string;
  workflowModelName: string;
  workflowTitle: string;
  created: string;
  dueDate: string;
  state: string;
  targetDocumentIds: { id: string }[];
  actors: { id: string }[];
  taskInfo: {
    taskActions: { name: string; label: string }[];
  };
  targetDocTitle?: string;
}

export type NuxeoTaskList = NuxeoPaginatedList<NuxeoTask>;
