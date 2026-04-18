# Services — All Public Methods

All services live in `libs/shared/nuxeo-client/src/lib/services/`.
Import path: `@agentic-ui/shared/nuxeo-client`.

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
searchGroups(query: string): Observable<NuxeoGroup[]>
getUser(userId: string): Observable<NuxeoUser>
getGroup(groupId: string): Observable<NuxeoGroup>
deleteUser(userId: string): Observable<void>
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
initUploadBatch(): Observable<string>
uploadFileToBatch(batchId: string, fileIndex: number, file: File): Observable<void>
importFromCsvText(parentPath: string, csvText: string): Observable<CsvImportResult>
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

---

## Nuxeo Studio Services (`libs/shared/nuxeo-studio/`)

Import path: `@agentic-ui/shared/nuxeo-studio`

These services power the Layout Engine — dynamic form rendering based on Nuxeo document type/schema metadata.

### SchemaRegistryService (`schema-registry.service.ts`)

```typescript
getType(docType: string): Observable<NuxeoTypeDefinition>
getSchema(schemaName: string): Observable<NuxeoSchemaDefinition>
getAllTypeNames(): Observable<string[]>
getFieldsForType(docType: string): Observable<NuxeoFieldDef[]>
getField(docType: string, xpath: string): Observable<NuxeoFieldDef | undefined>
getFieldsForFacets(facets: string[], existingSchemas: string[]): Observable<NuxeoFieldDef[]>
getFieldsForTypeWithFacets(docType: string): Observable<NuxeoFieldDef[]>
clearCache(): void
```

### LayoutRegistryService (`layout-registry.service.ts`)

Resolution order: (1) explicit registration, (2) Studio Designer Polymer layout, (3) auto-generated from schema.

```typescript
registerLayout(config: LayoutConfig): void
registerLayouts(configs: LayoutConfig[]): void
removeLayout(docType: string, mode: LayoutMode): void
hasExplicitLayout(docType: string, mode: LayoutMode): boolean
resolveLayout(docType: string, mode: LayoutMode): Observable<LayoutConfig>
```

### StudioLayoutService (`studio-layout.service.ts`)

Fetches Polymer HTML layout files deployed by Nuxeo Studio Designer from `/nuxeo/ui/document/{type}/`. Caches results; returns null on 404.

```typescript
fetchStudioLayout(docType: string, mode: LayoutMode): Observable<string | null>
hasStudioLayout(docType: string, mode: LayoutMode): Observable<boolean>
clearCache(): void
```

### PolymerLayoutParser (`polymer-layout-parser.ts`)

Stateless utility that parses Polymer HTML into LayoutConfig. Maps `<nuxeo-input>`, `<nuxeo-directory-suggestion>`, `<nuxeo-date-picker>`, etc. to Angular widget types.

```typescript
parsePolymerLayout(html: string, docType: string, mode: LayoutMode): LayoutConfig | null
```

### WidgetRegistryService (`widget-registry.service.ts`)

```typescript
register(descriptor: WidgetDescriptor): void
registerAll(descriptors: WidgetDescriptor[]): void
getDescriptor(widgetType: WidgetType): WidgetDescriptor | undefined
getComponent(widgetType: WidgetType): Type<unknown> | undefined
resolveComponent(widgetType?: WidgetType, fieldType?: NuxeoFieldType): Type<unknown> | undefined
has(widgetType: WidgetType): boolean
getRegisteredTypes(): WidgetType[]
getAll(): WidgetDescriptor[]
getCompatibleWidgets(fieldType: NuxeoFieldType): WidgetDescriptor[]
```

### ValidationService (`validation.service.ts`)

```typescript
registerCustomValidator(name: string, fn: CustomValidatorFn): void
removeCustomValidator(name: string): void
validateField(field: FieldWidgetConfig, value: unknown, allValues: Record<string, unknown>): ValidationResult
validateAll(fields: FieldWidgetConfig[], allValues: Record<string, unknown>, getFieldValue: (xpath: string) => unknown): Map<string, string[]>
```

### SlotRegistryService (`slot-registry.service.ts`)

```typescript
register(registration: SlotRegistration): void
registerAll(registrations: SlotRegistration[]): void
getSlotComponents(slotName: string, docType?: string): Type<unknown>[]
has(slotName: string): boolean
getSlotNames(): string[]
remove(slotName: string, component: Type<unknown>): void
```

### LayoutBlockRegistryService (`layout-block-registry.service.ts`)

```typescript
register(block: LayoutBlock): void
registerAll(blocks: LayoutBlock[]): void
get(name: string): LayoutBlock | undefined
has(name: string): boolean
remove(name: string): void
getAll(): LayoutBlock[]
resolveFields(blockName: string): FieldWidgetConfig[]
```
