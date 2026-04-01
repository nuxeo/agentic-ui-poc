// Models
export type { NuxeoPaginatedList } from './lib/models/paginated.model';
export type { NuxeoDocument, NuxeoDocumentList } from './lib/models/document.model';
export type { NuxeoTask, NuxeoTaskList } from './lib/models/task.model';
export type { AuditEntry, AuditLogList } from './lib/models/audit.model';
export type { DirectoryEntry, L10nDirectoryEntry } from './lib/models/directory.model';
export type { NuxeoAce, NuxeoAcl } from './lib/models/acl.model';
export type {
  NuxeoWorkflow,
  NuxeoWorkflowList,
  NuxeoWorkflowModel,
  NuxeoWorkflowModelList,
} from './lib/models/workflow.model';
export type { NuxeoUser, NuxeoUserList, NuxeoGroup, NuxeoGroupList } from './lib/models/user.model';

// Config
export { NUXEO_API_ORIGIN } from './lib/nuxeo-api.config';
export { CURRENT_USERNAME } from './lib/current-user.token';

// Services
export { NuxeoApiBase } from './lib/services/nuxeo-api-base';
export { DocumentService } from './lib/services/document.service';
export { TaskService } from './lib/services/task.service';
export { CollectionService } from './lib/services/collection.service';
export { BrowseService } from './lib/services/browse.service';
export {
  DocumentDetailService,
  type UserGroupSuggestion,
  type NuxeoComment,
  type NuxeoCommentList,
} from './lib/services/document-detail.service';
export { DirectoryService } from './lib/services/directory.service';
export { WorkflowService } from './lib/services/workflow.service';
export { UserService } from './lib/services/user.service';

// Constants
export { DOC_TYPE_ICONS, docTypeIcon } from './lib/constants/doc-type-icons';

// Queries (for advanced / custom use)
export {
  RECENTLY_EDITED_QUERY,
  RECENTLY_VIEWED_QUERY,
  EXPIRED_DOCUMENTS_QUERY,
  FAVORITES_COLLECTION_QUERY,
} from './lib/queries/nxql-queries';
