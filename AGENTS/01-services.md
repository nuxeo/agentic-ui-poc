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

---

## DocumentDetailService (`document-detail.service.ts`)

Primary service for single-document operations.

```typescript
getFullDocument(uid: string): Observable<NuxeoDocument>
getDocumentPermissions(uid: string): Observable<NuxeoDocument>
fetchBlob(uid: string): Observable<Blob>
fetchBlobByXpath(uid: string, xpath: string): Observable<Blob>
fetchPdfRendition(uid: string): Observable<Blob>
fetchThumbnail(uid: string): Observable<Blob>
getAuditLog(uid: string, pageSize?: number, currentPageIndex?: number): Observable<AuditLogList>
getPublishedVersions(uid: string): Observable<NuxeoDocumentList>
getSectionTree(): Observable<NuxeoDocumentList>
unpublishDocument(proxyUid: string): Observable<unknown>
republishDocument(sourceUid: string, targetSectionId: string): Observable<NuxeoDocument>
lockDocument(uid: string): Observable<NuxeoDocument>
unlockDocument(uid: string): Observable<NuxeoDocument>
addToFavorites(uid: string): Observable<NuxeoDocument>
removeFromFavorites(uid: string): Observable<NuxeoDocument>
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
```

---

## BrowseService (`browse.service.ts`)

```typescript
getByPath(nuxeoPath: string): Observable<NuxeoDocument>
getFolderContext(nuxeoPath: string): Observable<NuxeoDocument>  // includes @subtypes enricher
getCreatableSubtypes(nuxeoPath: string): Observable<string[]>  // parsed allowed child types
updateDocument(uid: string, properties: Record<string, unknown>): Observable<NuxeoDocument>
getTrashedChildren(parentUid: string, pageSize?: number): Observable<NuxeoDocumentList>
restoreDocument(uid: string): Observable<NuxeoDocument>
startCsvExport(parentUid: string): Observable<string>
pollAndDownloadCsv(executionId: string): Observable<Blob>
```

---

## SearchAggregationService (`search-aggregation.service.ts`)

Shared state service for search. Holds aggregation results and saved search state as signals.

```typescript
readonly aggregations: Signal<SearchAggregations>
readonly items: Signal<SearchResultItem[]>
readonly drawerFilters: Signal<Record<string, string>>
readonly selectedSavedSearchId: Signal<string>
readonly selectedSavedSearchTitle: Signal<string>
readonly savedSearchVersion: Signal<number>

markSavedSearchDirty(): void
suggest(searchTerm: string, pageSize?: number): Observable<GlobalSearchSuggestion[]>
getUserCollections(): Observable<SearchCollectionOption[]>
getSavedSearches(pageProvider?: string): Observable<SavedSearchOption[]>
getSavedSearchById(id: string): Observable<Record<string, string>>
saveSavedSearch(request: SaveSavedSearchParams): Observable<unknown>
```

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
initUploadBatch(handler?: string): Observable<string>
uploadFileToBatch(batchId: string, fileIndex: number, file: File): Observable<void>
createBlobHoldingDocument(parentPath, name, docType, properties, file): Observable<NuxeoDocument>
createDocumentWithBlob(...): Observable<NuxeoDocument>
createFileFromBatch(...): Observable<NuxeoDocument>
importFiles(parentPath, files, options?): Observable<NuxeoDocument[]>
importFromCsvText(parentPath: string, csvText: string): Observable<CsvImportResult>
isBlobHoldingDocType(docType: string): boolean
documentHasMainBlob(doc: NuxeoDocument): boolean
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

Nuxeo vocabulary / directory lookups.

```typescript
getEntries(directoryName: string): Observable<DirectoryEntry[]>
getL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>
getAllL10nEntries(directoryName: string): Observable<L10nDirectoryEntry[]>
getEventTypes(): Observable<DirectoryEntry[]>
getEventCategories(): Observable<DirectoryEntry[]>
```

---

## PrincipalPermissionsService (`principal-permissions.service.ts`)

ACL management for documents.

```typescript
// Methods for adding/blocking permissions — see file for full API
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

## AssetAggregationService (`asset-aggregation.service.ts`)

Same pattern as `SearchAggregationService` but for the DAM assets page.

---

## TrashFilterService (`trash-filter.service.ts`)

Shared state for trash filters. Uses signals.

---

## SettingsService (`settings.service.ts`)

User preferences and cloud service connections.

---

## AdministrationService (`administration.service.ts`)

Admin console operations (users, groups, system info).

---

## ArenderService (`arender.service.ts`)

```typescript
getViewerUrl(blobUrl: string): string
isAvailable(): Promise<boolean>
```

---

## NuxeoApiBase (`nuxeo-api-base.ts`)

Low-level HTTP wrapper. **Do not inject directly in features or components.**

```typescript
get<T>(path: string, options?: HttpOptions): Observable<T>
post<T>(path: string, body: unknown, options?: HttpOptions): Observable<T>
put<T>(path: string, body: unknown, options?: HttpOptions): Observable<T>
delete<T>(path: string, options?: HttpOptions): Observable<T>
```
