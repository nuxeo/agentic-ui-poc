# Services — All Public Methods

Most frontend data services live in `libs/shared/nuxeo-client/src/lib/services/` and are
imported from `@agentic-ui/shared/nuxeo-client`.

Knowledge Discovery uses the dedicated shared client in `libs/shared/kd-client/src/lib/`
and is imported from `@agentic-ui/shared/kd-client`. It calls Knowledge Discovery through
Nuxeo automation operations exposed by the Hyland Content Intelligence Connector (CIC) —
there is no separate backend in this repo.

Knowledge Enrichment uses the dedicated shared client in `libs/shared/ke-client/src/lib/`
and is imported from `@agentic-ui/shared/ke-client`. It posts multipart blob requests to
Nuxeo automation operations exposed by the same CIC bundle.

Every section heading, method name and method return type below is **machine-checked** against the
real class by `checkServiceMapDocs` in `scripts/review-guardrails.mjs`, and every `@Injectable`
service in those three directories must have a section here. Run `npm run review:guardrails` after
changing a service; see `AGENTS/05-test-standards.md` for the limits of that check.

---

## DocumentDetailService (`document-detail.service.ts`)

Primary service for single-document operations.

```typescript
getFullDocument(uid: string): Observable<NuxeoDocument>
getDocumentPermissions(uid: string): Observable<NuxeoDocument>
fetchBlob(uid: string, options?: FetchBlobOptions): Observable<Blob>
  // GET @blob/file:content?clientReason=view (default) or download; fallback blobholder:0
fetchBlobByXpath(uid: string, xpath: string, options?: FetchBlobOptions): Observable<Blob>
fetchPdfRendition(uid: string): Observable<Blob>
fetchThumbnail(uid: string): Observable<Blob>
getAuditLog(uid: string, pageSize?: number, currentPageIndex?: number): Observable<AuditLogList>
getPublishedVersions(uid: string): Observable<NuxeoDocumentList>
getSectionTree(): Observable<NuxeoDocumentList>
unpublishDocument(proxyUid: string): Observable<unknown>
republishDocument(sourceUid: string, targetSectionId: string): Observable<NuxeoDocument>
lockDocument(uid: string): Observable<NuxeoDocument>
unlockDocument(uid: string): Observable<NuxeoDocument>
addToFavorites(uid: string): Observable<NuxeoDocument>     // toggles one document only
removeFromFavorites(uid: string): Observable<NuxeoDocument> // to LIST favorites use CollectionService.getFavorites
trashDocument(uid: string): Observable<NuxeoDocument>
trashDocuments(uids: string[]): Observable<NuxeoDocument[]>
restoreFromTrash(uid: string): Observable<NuxeoDocument>
permanentlyDelete(uid: string): Observable<void>
subscribe(uid: string, notifications?: string): Observable<NuxeoDocument>
unsubscribe(uid: string, notifications?: string): Observable<NuxeoDocument>
addToCollection(uid: string, collectionId: string): Observable<NuxeoDocument>
getCollections(): Observable<NuxeoDocumentList>
exportBlob(uid: string): Observable<Blob>
exportZip(uid: string, filename?: string): Observable<Blob>
bulkDownload(uids: string[], filename?: string): Observable<Blob>
exportXml(uid: string): Observable<Blob>
getRunnableWorkflows(uid: string): Observable<NuxeoWorkflowModel[]>
createCollection(title: string, description?: string): Observable<NuxeoDocument>
searchUsersGroups(searchTerm: string): Observable<UserGroupSuggestion[]>
addPermission(uid: string, params: { username?, email?, permission, notify?, comment?, begin?, end?, creator? }): Observable<NuxeoDocument>  // creator defaults to CURRENT_USERNAME
addPermissionWithNotification(uid, params): Observable<PermissionWithNotificationResult>  // add ACE then send notification separately
replacePermissionWithNotification(uid, params): Observable<PermissionWithNotificationResult>
addExternalPermissionWithNotification(uid, params): Observable<PermissionWithNotificationResult>  // saves with notify:false, then optional separate notification
addExternalPermission(uid: string, params: { email, permission, notify?, comment?, begin?, end?, creator? }): Observable<NuxeoDocument>  // delegates to addPermission; notify defaults false; creator defaults to CURRENT_USERNAME
replacePermission(uid: string, params: { id?, username?, email?, permission, notify?, comment?, begin?, end? }): Observable<NuxeoDocument>
removePermission(uid: string, params: { aceId, acl? }): Observable<NuxeoDocument>  // by ACE id only — see below
blockPermissionInheritance(uid: string): Observable<NuxeoDocument>
unblockPermissionInheritance(uid: string): Observable<NuxeoDocument>
sendNotificationEmailForPermission(uid: string, aceId: string): Observable<NuxeoDocument>
```

`removePermission` takes an ACE id and nothing else that identifies the entry.
`Document.RemovePermission` accepts only `acl`, `id` and `user`: it has no `permission`
parameter, and identifying the ACE by `user` removes **every** ACE that principal holds on
the ACL. Carry the `id` the `acls` enricher reports (`NuxeoAce.id`,
`PrincipalPermissionRow.aceId`) through to the revoke. When no id is available the call
rejects with `REMOVE_PERMISSION_ACE_ID_REQUIRED` rather than revoking something wider than
was asked for. Until 6 August 2026 this entry read `{ user, permission, acl? }`, which was
the shape of the bug.

---

## BrowseService (`browse.service.ts`)

```typescript
getByPath(nuxeoPath: string): Observable<NuxeoDocument>
getUserWorkspace(): Observable<NuxeoDocument>  // POST automation/User.GetUserWorkspace (Web UI)
getRepositoryRoot(): Observable<NuxeoDocument>  // falls back to NXQL when GET /path/ is denied
getNavTreeBootstrap(pageSize?: number): Observable<NavTreeBootstrap>  // root + top-level folders for all permission profiles
getBrowseFolderContents(nuxeoPath: string, pageSize?: number): Observable<BrowseFolderContents>  // browse page loader with restricted-user fallbacks
getCollectionMembers(collectionUid: string, pageSize?: number): Observable<NuxeoDocumentList>  // Favorites / Collection member listing
getFolderContext(nuxeoPath: string): Observable<NuxeoDocument>  // includes @subtypes enricher
getCreatableSubtypes(nuxeoPath: string): Observable<string[]>  // parsed allowed child types
getChildren(nuxeoPath: string, pageSize?: number, currentPageIndex?: number): Observable<NuxeoDocumentList>
getTreeChildren(parentUid: string, pageSize?: number): Observable<NuxeoDocumentList>  // tree_children page provider, all pages
getNavTreeChildren(parent: NuxeoDocument, pageSize?: number): Observable<NuxeoDocumentList>  // Root/workspaces: tree_children; Domain: @children
updateDocument(uid: string, properties: Record<string, unknown>): Observable<NuxeoDocument>
copyDocuments(uids: string[], targetUid: string): Observable<NuxeoDocument[]>  // Document.Copy automation
moveDocuments(uids: string[], targetUid: string): Observable<NuxeoDocument[]>  // Document.Move automation
getTrashedChildren(parentUid: string, pageSize?: number): Observable<NuxeoDocumentList>
restoreDocument(uid: string): Observable<NuxeoDocument>
startCsvExport(parentUid: string): Observable<string>
pollAndDownloadCsv(executionId: string): Observable<Blob>
```

---

## BrowseContextService (`browse-context.service.ts`)

Tracks the Nuxeo path that drives the browse nav drawer tree (Nuxeo Web UI pattern). Updated
from browse navigation, document detail, and tree clicks.

```typescript
readonly contextPath: Signal<string>  // normalized repository path, default '/'
readonly treeRefreshTick: Signal<number>  // incremented when browse nav tree should reload
readonly contentRefreshTick: Signal<number>  // incremented when browse folder listing should reload
readonly clipboardPasteTick: Signal<number>  // incremented when clipboard copy/move completes

setFromRouterUrl(routerUrl: string): void
setFromDocument(doc: NuxeoDocument): void  // folderish → doc.path; leaf → parent folder
setFromNuxeoPath(nuxeoPath: string): void
requestTreeRefresh(): void  // invalidate/reload browse nav drawer tree (e.g. after domain creation)
requestContentRefresh(): void  // reload browse main view children (e.g. after domain creation)
notifyClipboardPasteComplete(event: ClipboardPasteEvent): void  // optimistic listing merge + reload
consumeClipboardPasteEvent(): ClipboardPasteEvent | null
resetContext(): void  // restore repository root path (e.g. on sign-out)
```

Path helpers: `libs/shared/nuxeo-client/src/lib/utils/browse-path.utils.ts`
(`parseBrowseNuxeoPathFromRouterUrl`, `cumulativeNuxeoPathPrefixes`, `topLevelNuxeoFolderPath`,
`nuxeoPathsEqualFlexible`, …).

---

## ClipboardTargetService (`clipboard-target.service.ts`)

Tracks the current browse folder used as the paste target for clipboard Copy/Move (Web UI `target-document`).

```typescript
readonly target: Signal<NuxeoDocument | null>
setTarget(doc: NuxeoDocument | null): void
clear(): void
```

---

## SearchAggregationService (`search-aggregation.service.ts`)

Shared **state** service for search, and nothing else: signals only, no HTTP.

```typescript
readonly aggregations: Signal<SearchAggregations>
readonly items: Signal<SearchResultItem[]>
readonly drawerFilters: Signal<Record<string, string>>
readonly selectedSavedSearchId: Signal<string>
readonly selectedSavedSearchTitle: Signal<string>
readonly savedSearchVersion: Signal<number>

markSavedSearchDirty(): void
```

Until 6 August 2026 this section also listed `suggest`, `getUserCollections`,
`getSavedSearches`, `getSavedSearchById` and `saveSavedSearch`. None of them are on this
class — they are on `SearchService` below.

---

## SearchService (`search.service.ts`)

Full-text and page-provider search, suggestions, and saved searches.

```typescript
suggest(searchTerm: string, pageSize?: number): Observable<GlobalSearchSuggestion[]>
getUserCollections(): Observable<SearchCollectionOption[]>
getSavedSearches(pageProvider?: string): Observable<SavedSearchOption[]>
getSavedSearchById(id: string): Observable<Record<string, string>>
saveSavedSearch(request: SaveSavedSearchParams): Observable<unknown>
```

---

## SavedPageService (`saved-page.service.ts`)

Persistence for the pages authored in the page builder. Follows the saved-search pattern
from `SearchService` above: a page is a Nuxeo document whose `page:config` property holds
the `PageConfig` JSON, so sharing rides on ordinary document ACLs rather than a mechanism
of its own.

```typescript
getSavedPages(): Observable<SavedPageListEntry[]>
  // GET /nuxeo/api/v1/saved-pages; sorted by modified descending, [] on error
getSavedPageById(id: string): Observable<SavedPageDocument>
  // Same path + /:id with the acls enricher — the shape the builder and viewer read
saveSavedPage(request: SaveSavedPageRequest): Observable<{ id: string }>
updateSavedPage(id: string, request: SaveSavedPageRequest): Observable<unknown>
deleteSavedPage(id: string): Observable<unknown>
addPagePermission(pageId: string, username: string, permission: string): Observable<unknown>
  // POST Document.AddPermission against the page document
removePagePermission(pageId: string, aceId: string): Observable<unknown>
  // POST Document.RemovePermission; aceId comes from the permissions array of getSavedPageById
```

**`/nuxeo/api/v1/saved-pages` is an assumed endpoint.** It mirrors the saved-search
precedent, but no server contribution for a `SavedPage` doctype ships in this repo, and the
storage decision is still open — see the class comment before relying on any of this
against a real server.

The two permission methods are a page-scoped shorthand. `DocumentDetailService.addPermission`
remains the richer entry point everywhere else, and is the one to reach for when a grant
needs dates, a comment, notification or inheritance blocking.

---

## KdClientService (`kd-client.service.ts`)

Frontend client for Knowledge Discovery. Talks to the Hyland Content
Intelligence Connector (`nuxeo-labs-content-intelligence-connector`) via
Nuxeo automation endpoints (`/nuxeo/site/automation/<OpName>`). Uses the
connector's first-class ops (`HylandKnowledgeDiscovery.getAllAgents`,
`askQuestionAndGetAnswer`) where available and its generic
`HylandKnowledgeDiscovery.Invoke` passthrough for read-only metadata. Op
names and upstream paths are overridable via the `KD_CIC_OPERATIONS` and
`KD_UPSTREAM_PATHS` tokens.

Agent create/update/delete are **not** exposed: the CIC connector has
no write-side ops for agents, its `Invoke` passthrough rejects `DELETE`
with `Only GET, POST and PUT are supported.`, and the upstream Discovery
service returns `400 Bad Request` for `POST /agent/agents` through this
auth surface. Agent management is done in the Hyland Insight admin UI;
new agents appear here automatically through `listAgents`.

```typescript
listAgents(): Observable<KdAgentSummary[]>
getAgent(agentId: string): Observable<KdAgentDetails>
listModels(): Observable<KdModelInfo[]>
listGuardrails(): Observable<{ guardrailGroups: KdGuardrailGroup[] }>
submitQuestion(request: KdQuestionRequest): Observable<KdQuestionSubmission>
getAnswer(questionId: string): Observable<KdAnswerResponse>
submitFeedback(questionId: string, request: KdFeedbackRequest): Observable<void>
getQuestionHistory(agentId: string, pageNumber?: number, pageSize?: number): Observable<KdQuestionHistoryPage>
```

---

## KeClientService (`ke-client.service.ts`)

Frontend client for Knowledge Enrichment. Talks to the Hyland Content
Intelligence Connector (`nuxeo-labs-content-intelligence-connector`) via the
`HylandKnowledgeEnrichment.Enrich` automation op. Unlike KD, KE uses a
multipart request with a JSON `request` part and a blob `input` part.

The client normalizes the Context API response fields (`textClassification`,
`textSummary`, `namedEntityText`, `imageDescription`, `namedEntityImage`) and
also tolerates the connector's generic `{ response, responseCode,
responseMessage }` envelope when present.

```typescript
enrich(blob: Blob, request: KeEnrichRequest): Observable<KeEnrichmentResult>
```

---

## ContentLakeIngestService (`content-lake-ingest.service.ts`)

Triggers HxAI Content Lake ingestion for existing Nuxeo documents via the
`nuxeo-hxai-connector` bulk `ingest` action. Used by the Knowledge Discovery
upload panel after `DocumentImportService` creates File documents in Nuxeo.

```typescript
startIngest(documentUids: string[]): Observable<ContentLakeIngestCommand>
getStatus(commandId: string): Observable<ContentLakeIngestStatus>
waitUntilComplete(commandId: string, pollIntervalMs?: number): Observable<ContentLakeIngestStatus>
findDuplicates(files: File[], sourceIds?: string[]): Observable<ContentLakeDuplicate[]>
checkIngested(documentUid: string, sourceIds?: string[]): Observable<boolean>
backfillIngestMarkerIfNeeded(doc: NuxeoDocument, sourceIds?: string[]): Observable<ContentLakeBackfillResult>
markIngested(documentUids: string[]): Observable<NuxeoDocument[]>
```

---

## CollectionService (`collection.service.ts`)

```typescript
getById(uid: string): Observable<NuxeoDocument>
getAll(pageSize?: number): Observable<NuxeoDocumentList>
getFavorites(userId: string, pageSize?: number): Observable<NuxeoDocumentList>
getCollectionMembers(collectionUid: string, pageSize?: number): Observable<NuxeoDocumentList>
updateProperties(uid: string, properties: Record<string, unknown>): Observable<NuxeoDocument>
bulkDownload(collectionUid: string, filename?: string): Observable<Blob>
```

**Favorites live here.** Nuxeo models the favorites list as a collection, so reading it is
`CollectionService.getFavorites(userId, pageSize)`. `DocumentDetailService` only toggles a
single document in and out of it (`addToFavorites` / `removeFromFavorites`) and cannot list
them.

---

## TaskService (`task.service.ts`)

```typescript
notifyTasksChanged(): void
getUserTasks(userId: string, pageSize?: number): Observable<NuxeoTask[]>
getTask(taskId: string): Observable<NuxeoTask>
getDocumentTasks(docId: string, userId?: string): Observable<NuxeoTask[]>
```

---

## UserService (`user.service.ts`)

```typescript
searchUsers(query: string): Observable<NuxeoUser[]>
searchUsersPaged(query: string, pageSize?: number, currentPageIndex?: number): Observable<NuxeoUserList>
getRecentlyCreatedUsersAndGroups(pageSize?: number, currentPageIndex?: number): Observable<NuxeoDocumentList>
  // GET /nuxeo/api/v1/search/pp/LATEST_CREATED_USERS_OR_GROUPS_PROVIDER/execute
searchGroups(query: string): Observable<NuxeoGroup[]>
searchGroupsPaged(query: string, pageSize?: number, currentPageIndex?: number): Observable<NuxeoGroupList>
getUser(userId: string): Observable<NuxeoUser>
getGroup(groupId: string): Observable<NuxeoGroup>
createUser(input: { username, firstName, lastName, company?, email, password?, groups? }): Observable<NuxeoUser>
  // With password → POST /nuxeo/api/v1/user
  // Without password → User.Invite automation (invitation email flow)
updateUser(userId: string, updates: { firstName?, lastName?, company?, email?, password?, groups? }): Observable<NuxeoUser>
deleteUser(userId: string): Observable<void>
createGroup(input: { groupname, grouplabel, memberUsers?, memberGroups? }): Observable<NuxeoGroup>
updateGroup(groupname: string, updates: { grouplabel?, memberUsers?, memberGroups? }): Observable<NuxeoGroup>
deleteGroup(groupname: string): Observable<void>
```

---

## TagService (`tag.service.ts`)

```typescript
addTag(uid: string, label: string): Observable<unknown>
removeTag(uid: string, label: string): Observable<unknown>
searchTags(term: string): Observable<string[]>
```

---

## WorkflowService (`workflow.service.ts`)

```typescript
getWorkflowModels(): Observable<NuxeoWorkflowModel[]>
getDocumentWorkflows(docId: string): Observable<NuxeoWorkflow[]>
getMyWorkflows(): Observable<NuxeoWorkflow[]>
getWorkflow(workflowId: string): Observable<NuxeoWorkflow>
cancelWorkflow(workflowInstanceId: string): Observable<void>
getWorkflowGraph(workflowInstanceId: string): Observable<unknown>
getWorkflowModel(modelName: string): Observable<NuxeoWorkflowModel>
getWorkflowModelGraph(modelName: string): Observable<unknown>
```

---

## DocumentService (`document.service.ts`)

General document utilities.

```typescript
getRecentlyEdited(pageSize?: number): Observable<NuxeoDocumentList>
getRecentlyViewed(userId: string, pageSize?: number): Observable<NuxeoDocumentList>
getExpiredDocuments(pageSize?: number): Observable<NuxeoDocumentList>
getById(docId: string): Observable<NuxeoDocument>
```

---

## DocumentImportService (`document-import.service.ts`)

```typescript
getDefaultImportParentPath(): Observable<string>
getEmptyDocumentWithDefaults(parentPath: string, docType: string): Observable<NuxeoCreateDocumentTemplate>
createChildDocument(parentPath, name, docType, properties): Observable<NuxeoDocument>
initUploadBatch(handler?: string): Observable<string>
uploadFileToBatch(batchId: string, fileIndex: number, file: File): Observable<void>
createBlobHoldingDocument(parentPath, name, docType, properties, file, options?): Observable<NuxeoDocument>
createBlobHoldingDocumentReliable(parentPath, name, docType, properties, file, stagedBatch?, options?): Observable<NuxeoDocument>
createBlobHoldingDocumentFromBatch(parentPath, name, docType, properties, batchId, fileIndex, options?): Observable<NuxeoDocument>
stageFileInBatch(file, options?): Observable<StagedBatchFile>
createDocumentWithBlob(...): Observable<NuxeoDocument>
createFileFromBatch(...): Observable<NuxeoDocument>
importFiles(parentPath, files, options?): Observable<NuxeoDocument[]>
importFilesWithProperties(parentPath, entries: ImportFileEntry[], options?): Observable<NuxeoDocument[]>
importCsvFile(options: CsvServerImportOptions): Observable<string>
importFromCsvText(parentPath: string, csvText: string): Observable<CsvImportResult>
```

Exported helpers from the same module (not class methods):

```typescript
isBlobHoldingDocType(docType: string): boolean
inferBlobDocTypeFromFile(file: File): string
resolveImportBlobDocType(file: File, allowedTypes: readonly string[]): string
titleFromFileName(fileName: string): string
sanitizeDocumentCreateName(name: string): string
mergeCreateDocumentBody(template, docType, nameFallback, overrides): Record<string, unknown>
documentHasMainBlob(doc: NuxeoDocument): boolean
BLOB_HOLDING_DOC_TYPES: ReadonlySet<string>
```

Types exported from the same module:

```typescript
ImportProgress;
ImportFilesOptions;
CreateBlobHoldingDocumentOptions;
```

---

## SelectionService (`selection.service.ts`)

Manages multi-select state in browse/search. Uses signals.

```typescript
toggle(id: string, label?: string, preview?: SelectionPreview): void
clear(): void
deleteSelected(): Observable<NuxeoDocument[]>
```

---

## DirectoryService (`directory.service.ts`)

Nuxeo vocabulary / directory lookups and admin CRUD. Picker methods (`getEntries`, `getL10nEntries`, `getAllL10nEntries`) query the server on every call (Nuxeo Web UI parity).

```typescript
getEntries(directoryName: string): Observable<DirectoryEntry[]>
getAdminEntries(directoryName: string): Observable<ManagedDirectoryEntry[]>
getDirectoryCatalog(): Observable<Map<string, DirectoryMetadata>>
createEntry(directoryName: string, values: VocabularyEntryFormValues): Observable<ManagedDirectoryEntry>
updateEntry(directoryName: string, entryId: string, values: VocabularyEntryFormValues): Observable<ManagedDirectoryEntry>
deleteEntry(directoryName: string, entryId: string): Observable<void>
getL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>
getAllL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>
getEventTypes(): Observable<DirectoryEntry[]>
getEventCategories(): Observable<DirectoryEntry[]>
```

---

## PrincipalPermissionsService (`principal-permissions.service.ts`)

Reads the local ACL rows a user or group holds across the repository, for the administration
and profile permission tables. It only reads: granting, replacing and revoking permissions are
`DocumentDetailService.addPermission` / `replacePermission` / `removePermission`.

```typescript
listLocalPermissionRows(logicalPrincipal: string, pageSize: number, currentPageIndex: number): Observable<PrincipalPermissionPage>
  // paging applies to the NXQL document set; one document can contribute several ACE rows
```

---

## NuxeoDriveService (`nuxeo-drive.service.ts`)

```typescript
hasDriveToken(): Observable<boolean>
buildEditUrl(docUid: string, blobUrl: string, filename: string): string
buildDirectTransferUrl(folderPath: string): string
openDriveUrl(url: string): void
```

---

## AssetService (`asset.service.ts`)

Runs the DAM assets page search through the `assets_search` page provider. Aggregation facets
(type, mime type, width, height, colour profile, colour depth, video duration) are passed as
JSON-encoded aggregate parameters.

```typescript
searchAssets(params?: AssetSearchParams): Observable<AssetSearchResult>
```

---

## AssetAggregationService (`asset-aggregation.service.ts`)

Shared **state** for the DAM assets page: signals only, no HTTP. Same pattern as
`SearchAggregationService` — for the search itself use `AssetService`.

```typescript
readonly aggregations: Signal<AssetAggregations>
readonly items: Signal<AssetQueueItem[]>
readonly selectedSavedSearchId: Signal<string>
readonly selectedSavedSearchTitle: Signal<string>
readonly savedSearchVersion: Signal<number>

markSavedSearchDirty(): void
```

---

## TrashService (`trash.service.ts`)

Trash listing, restore, permanent delete and the trash saved searches
(`default_trash_search` page provider).

```typescript
searchTrash(params?: TrashSearchParams): Observable<NuxeoDocumentList>
getPathSuggestions(parentPath: string): Observable<NuxeoDocumentList>
restoreDocument(uid: string): Observable<NuxeoDocument>  // Document.Untrash
permanentlyDelete(uid: string): Observable<void>
saveSearch(title: string, params: Record<string, unknown>): Observable<SavedSearch>
updateSearch(uid: string, title: string, params: Record<string, unknown>): Observable<SavedSearch>
getSavedSearches(): Observable<SavedSearch[]>
```

`BrowseService` and `DocumentDetailService` also expose restore/delete for a single document
in a browse or document-detail context; this service is the trash page's own client.

---

## TrashFilterService (`trash-filter.service.ts`)

Shared **state** for the trash page filters and results: signals only, no HTTP.

```typescript
readonly filters: Signal<TrashFilters>
readonly layoutMode: Signal<TrashLayoutMode>
readonly results: Signal<TrashResultItem[]>
readonly resultThumbnails: Signal<Record<string, SafeUrl>>
readonly totalResults: Signal<number>
readonly resultsLoading: Signal<boolean>
readonly savedSearchVersion: Signal<number>
readonly activeSavedFilterUid: Signal<string | null>
readonly activeSavedFilterTitle: Signal<string | null>
readonly hasSavedFilter: Signal<boolean>

reset(): void
toggleLayout(): void
markSavedSearchDirty(): void
```

---

## SettingsService (`settings.service.ts`)

The current user's own settings page: local permissions, connected cloud accounts, authorized
OAuth2 applications, Drive synchronization roots and password change.

```typescript
getLocalPermissions(username: string, pageSize?: number): Observable<LocalPermissionRow[]>
getConnectedAccounts(): Observable<ConnectedAccount[]>
getAuthorizedApplications(): Observable<AuthorizedApplication[]>
getSynchronizationRoots(): Observable<SynchronizationRootRow[]>
setSynchronizationRoot(rootId: string, enable: boolean): Observable<unknown>
changePassword(oldPassword: string, newPassword: string): Observable<void>
```

---

## AdministrationService (`administration.service.ts`)

Admin console queries: raw NXQL paging, repository-wide audit, OAuth2 providers and directory
names. User and group management is `UserService`, not this service.

```typescript
nxqlSearch(query: string, pageSize: number, currentPageIndex?: number, headers?: Record<string, string>): Observable<NuxeoDocumentList>
getNxqlTotalSize(query: string): Observable<number>
searchAuditLogs(params: { pageSize, currentPageIndex, principalName?, from?, to?, eventIds?, category? }): Observable<AuditLogList>
listOAuth2Providers(): Observable<NuxeoOAuth2Provider[]>
listDirectoryNames(): Observable<string[]>
getDefaultDomainPath(): Observable<string>
```

---

## ARenderService (`arender.service.ts`)

```typescript
getPreviewerUrl(docUid: string, blobXPath?: string): Observable<string>
getDiffUrl(leftDocUid: string, rightDocUid: string): Observable<string>
isAvailable(): Observable<boolean>
```

Until 6 August 2026 this section named the class `ArenderService` and listed a
`getViewerUrl(blobUrl): string` that does not exist, with `isAvailable` returning a
`Promise`. All three URLs are Observables because the viewer URL needs the session.

---

## NuxeoApiBase (`nuxeo-api-base.ts`)

Low-level HTTP wrapper. **Do not inject directly in features or components.**

```typescript
get<T>(path: string, options?: HttpOptions): Observable<T>
post<T>(path: string, body: unknown, options?: HttpOptions): Observable<T>
put<T>(path: string, body: unknown, options?: HttpOptions): Observable<T>
delete<T>(path: string, options?: HttpOptions): Observable<T>
```
