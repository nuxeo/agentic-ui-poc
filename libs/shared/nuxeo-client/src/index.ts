// Models
export type { NuxeoPaginatedList } from './lib/models/paginated.model';
export type { NuxeoDocument, NuxeoDocumentList } from './lib/models/document.model';
export type { NuxeoTask, NuxeoTaskList } from './lib/models/task.model';

// Config
export { NUXEO_API_ORIGIN } from './lib/nuxeo-api.config';

// Services
export { NuxeoApiBase } from './lib/services/nuxeo-api-base';
export { DocumentService } from './lib/services/document.service';
export { TaskService } from './lib/services/task.service';
export { CollectionService } from './lib/services/collection.service';

// Queries (for advanced / custom use)
export {
  RECENTLY_EDITED_QUERY,
  RECENTLY_VIEWED_QUERY,
  FAVORITES_COLLECTION_QUERY,
} from './lib/queries/nxql-queries';
