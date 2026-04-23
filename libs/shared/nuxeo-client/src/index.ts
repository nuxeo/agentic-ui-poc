// Models
export type { NuxeoPaginatedList } from './lib/models/paginated.model';
export type {
  AggregateBucket,
  AggregateResult,
  AssetAggregations,
  AssetSearchParams,
  AssetSearchResult,
} from './lib/models/asset.model';
export type { NuxeoDocument, NuxeoDocumentList } from './lib/models/document.model';
export type { NuxeoTask, NuxeoTaskList } from './lib/models/task.model';
export type { AuditEntry, AuditLogList } from './lib/models/audit.model';
export type { DirectoryEntry, L10nDirectoryEntry } from './lib/models/directory.model';
export type { NuxeoAce, NuxeoAcl } from './lib/models/acl.model';
export type {
  SearchQueryParams,
  GlobalSearchSuggestion,
  SavedSearchOption,
} from './lib/services/search.service';
export type {
  SearchAggregations,
  SearchResponse,
  SearchResultItem,
} from './lib/models/search.model';
export type {
  KnowledgeDiscoveryQueryRequest,
  KnowledgeDiscoveryResponse,
  KnowledgeDiscoverySource,
  KnowledgeDiscoveryStatus,
} from './lib/models/knowledge-discovery.model';
export type {
  AuthorizedApplication,
  ConnectedAccount,
  NuxeoOAuth2ServiceProvider,
  NuxeoOAuth2ServiceProviderList,
  NuxeoOAuth2Token,
  NuxeoOAuth2TokenList,
} from './lib/models/oauth2.model';
export type {
  NuxeoWorkflow,
  NuxeoWorkflowList,
  NuxeoWorkflowModel,
  NuxeoWorkflowModelList,
} from './lib/models/workflow.model';
export type { NuxeoUser, NuxeoUserList, NuxeoGroup, NuxeoGroupList } from './lib/models/user.model';
export type {
  PrincipalPermissionRow,
  PrincipalPermissionPage,
} from './lib/models/principal-permissions.model';
export type { NuxeoOAuth2Provider } from './lib/models/oauth.model';

// Config
export { NUXEO_API_ORIGIN, NUXEO_SERVER_URL } from './lib/nuxeo-api.config';
export { CURRENT_USERNAME } from './lib/current-user.token';
export type { NuxeoSamlLoginEndpoint } from './lib/saml-login.config';
export {
  NUXEO_SAML_LOGIN_ENDPOINTS,
  NUXEO_SSO_POST_LOGIN_PATH,
  NUXEO_SSO_RETURN_QUERY_PARAM,
} from './lib/saml-login.config';

// Services
export { NuxeoApiBase } from './lib/services/nuxeo-api-base';
export { AssetService } from './lib/services/asset.service';
export {
  AssetAggregationService,
  type AssetQueueItem,
} from './lib/services/asset-aggregation.service';
export { DocumentService } from './lib/services/document.service';
export {
  DocumentImportService,
  isFolderishDocument,
  sanitizeDocumentName,
  type CsvImportResult,
  type ImportFilesOptions,
} from './lib/services/document-import.service';
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
export { SearchService } from './lib/services/search.service';
export { SearchAggregationService } from './lib/services/search-aggregation.service';
export { KnowledgeDiscoveryService } from './lib/services/knowledge-discovery.service';
export { SelectionService } from './lib/services/selection.service';
export { WorkflowService } from './lib/services/workflow.service';
export { UserService } from './lib/services/user.service';
export { TagService } from './lib/services/tag.service';
export { NuxeoDriveService } from './lib/services/nuxeo-drive.service';
export { ARenderService } from './lib/services/arender.service';
export { ARENDER_CONFIG, type ARenderConfig } from './lib/arender.config';
export {
  SettingsService,
  type LocalPermissionRow,
  type SynchronizationRootRow,
} from './lib/services/settings.service';
export {
  AdministrationService,
  FALLBACK_DIRECTORY_NAMES,
} from './lib/services/administration.service';
export { PrincipalPermissionsService } from './lib/services/principal-permissions.service';
export {
  TrashService,
  type TrashSearchParams,
  type SavedSearch,
} from './lib/services/trash.service';
export {
  TrashFilterService,
  type TrashFilters,
  type TrashLayoutMode,
  type TrashResultItem,
} from './lib/services/trash-filter.service';

// Constants
export { DOC_TYPE_ICONS, docTypeIcon } from './lib/constants/doc-type-icons';
export { avatarColor } from './lib/constants/avatar-colors';
export { FOLDERISH_TYPES } from './lib/constants/folderish-types';
export { NON_CONTENT_DOCUMENT_TYPES } from './lib/constants/non-content-document-types';

// Queries (for advanced / custom use)
export {
  RECENTLY_EDITED_QUERY,
  RECENTLY_VIEWED_QUERY,
  EXPIRED_DOCUMENTS_QUERY,
  FAVORITES_COLLECTION_QUERY,
} from './lib/queries/nxql-queries';
