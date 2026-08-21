import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import {
  auditActivityLabel,
  canAddChildren,
  canManageDocumentPermissions,
  canRemoveDocument,
  canViewDocumentAuditLog,
  canWriteDocument,
  isFolderishDocument,
  isRestrictedImportParentPath,
  isDomainParentType,
  mergeDocumentPermissionsContext,
  type AuditEntry,
  type DirectoryEntry,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';
import {
  AdfHxBrowseContextService,
  AdfHxBrowseFolderService,
  AdfHxBrowseMediaService,
  AdfHxDocumentService,
  HxpBrowseDetailsPanelComponent,
  type HxpDetailsSubTab,
  HxpBrowseHistoryComponent,
  HxpBrowsePermissionsComponent,
  HxpBrowseTabsComponent,
  type HxpBrowseTabId,
  HxpBrowseToolbarComponent,
  type HxpBrowseViewMode,
  HxpDocumentCardsComponent,
  HxpColumnPickerComponent,
  type HxpPickableColumn,
  NuxeoDocumentRouterService,
  HxpBreadcrumbComponent,
  HxpDomainHintComponent,
  HxpFolderHeaderComponent,
  HxpBrowseTrashComponent,
  HxpIconComponent,
  ROOT_DOCUMENT,
  hxpDocTitle,
  hxpDocumentTags,
  hxpExternalAces,
  hxpInheritedAces,
  hxpIsInheritanceBlocked,
  hxpIsSubscribed,
  hxpLocalAces,
} from '@agentic-ui/shared/adf-hx-bridge';

// The narrow entry point, deliberately. It is the only thing in this bridge that reaches
// `@alfresco/adf-hx-*`, and this route is lazily loaded — importing it from the main
// barrel instead would put adf-core in the initial bundle. See `src/providers.ts`.
import { ADF_HX_NUXEO_BRIDGE_PROVIDERS } from '@agentic-ui/shared/adf-hx-bridge/providers';
import { HxpDocumentListComponent as UpstreamDocumentListComponent } from '@alfresco/adf-hx-content-services/ui';
import type { DataColumn } from '@alfresco/adf-core';

import {
  AppExtensionsService,
  EXTENSION_SLOTS,
  type ExtensionColumnDescriptor,
} from '@agentic-ui/shared/extensions';

/**
 * Layer 1 column `field` -> HxPR `Document` property.
 *
 * Only the columns the packaged set switches on by default are mapped, because those are
 * the ones with a known HxPR equivalent. An unmapped field passes through unchanged, which
 * renders an empty column rather than throwing — visibly wrong at a glance, and better
 * than inventing a property name that silently resolves to nothing.
 *
 * The gaps are real: HxPR has no `lastContributor`, so it maps to `sys_name` as the
 * nearest honest stand-in is **not** available and the column would otherwise be blank.
 * Left unmapped deliberately — see the note in the phase-3 evidence.
 */
const HXP_FIELD_BY_COLUMN: Readonly<Record<string, string>> = {
  title: 'sys_title',
  type: 'sys_typeLabel',
  modified: 'sys_modified',
  created: 'sys_created',
  state: 'sys_primaryType',
};

@Component({
  selector: 'lib-browse-adf-hx-poc',
  standalone: true,
  templateUrl: './browse-adf-hx-poc.html',
  styleUrl: './browse-adf-hx-poc.scss',
  imports: [
    HxpFolderHeaderComponent,
    HxpBreadcrumbComponent,
    HxpDomainHintComponent,
    HxpBrowseTabsComponent,
    HxpBrowseToolbarComponent,
    UpstreamDocumentListComponent,
    HxpDocumentCardsComponent,
    HxpColumnPickerComponent,
    HxpBrowsePermissionsComponent,
    HxpBrowseHistoryComponent,
    HxpBrowseTrashComponent,
    HxpBrowseDetailsPanelComponent,
    HxpIconComponent,
    TranslatePipe,
  ],
  providers: [...ADF_HX_NUXEO_BRIDGE_PROVIDERS],
})
export class BrowseAdfHxPocComponent {
  /**
   * Upstream's `[schema]`, derived from the same Layer 1 descriptors that drive
   * production browse's columns. This is the payoff from Phase 2: a customer's manifest
   * edit reaches the real adf-core DataTable without a second column list.
   */
  // ── Columns ──
  //
  // Three layers, narrowest last: the Layer 1 descriptors, then the user's own choice.
  // Upstream's DataTable has no picker, so the host owns one — see `hxp-column-picker`.

  /**
   * A storage key of this route's own.
   *
   * `hxp-browse-columns.utils.ts` used `browse_column_settings`, the *same* key production
   * browse writes, so choosing columns on either surface silently overwrote the other.
   * That was one of the five recorded bridge defects; deleting those utils with the
   * hand-written list and namespacing the key here fixes it by construction.
   */
  private static readonly COLUMN_STORAGE_KEY = 'adf_hx_poc_column_settings';

  /** Keys the user switched on, or `null` if they never chose. */
  private readonly userColumnKeys = signal<readonly string[] | null>(
    BrowseAdfHxPocComponent.loadColumnKeys(),
  );

  protected readonly columnPickerOpen = signal(false);

  private readonly columnDescriptors = computed<readonly ExtensionColumnDescriptor[]>(() =>
    this.extensions.resolve<ExtensionColumnDescriptor>(EXTENSION_SLOTS.documentList),
  );

  /** Every column the picker offers, with its current state. */
  protected readonly pickableColumns = computed<readonly HxpPickableColumn[]>(() => {
    const chosen = this.userColumnKeys();
    return this.columnDescriptors().map((column) => ({
      key: column.field,
      label: column.label,
      visible: chosen ? chosen.includes(column.field) : !column.hiddenByDefault,
    }));
  });

  /** What `Reset` returns to: the descriptors' defaults, so a manifest is not discarded. */
  protected readonly defaultColumnKeys = computed<readonly string[]>(() =>
    this.columnDescriptors()
      .filter((c) => !c.hiddenByDefault)
      .map((c) => c.field),
  );

  protected openColumnPicker(): void {
    this.columnPickerOpen.set(true);
  }

  protected closeColumnPicker(): void {
    this.columnPickerOpen.set(false);
  }

  protected applyColumns(keys: readonly string[]): void {
    this.userColumnKeys.set([...keys]);
    try {
      localStorage.setItem(BrowseAdfHxPocComponent.COLUMN_STORAGE_KEY, JSON.stringify([...keys]));
    } catch {
      /* a full or blocked storage must not break the picker */
    }
    this.columnPickerOpen.set(false);
  }

  private static loadColumnKeys(): readonly string[] | null {
    try {
      const stored = localStorage.getItem(BrowseAdfHxPocComponent.COLUMN_STORAGE_KEY);
      if (stored === null) return null;
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((k): k is string => typeof k === 'string')
        : null;
    } catch {
      return null;
    }
  }

  protected readonly schema = computed<DataColumn[]>(
    () =>
      this.pickableColumns()
        .filter((column) => column.visible)
        .map((column) => ({
          // adf-core's DataTable reads `row.obj[key]`, so `key` has to be an HxPR
          // `Document` property. `ExtensionColumnDescriptor.field` holds the browse
          // view-model key instead — `title`, `modified` — which is what
          // `packaged-columns.ts` says it holds and why it warns that migrating to real
          // property paths is Phase 3's job. Without this translation the table renders
          // the right headers over empty rows, which is exactly what it did.
          key: HXP_FIELD_BY_COLUMN[column.key] ?? column.key,
          type: 'text',
          title: column.label,
          sortable: true,
        })) as DataColumn[],
  );

  /** Row click, previously the local component's own `onRowClick`. */
  protected onUpstreamRowClicked(document: Document): void {
    this.documentRouter.navigateTo(document);
  }

  private readonly route = inject(ActivatedRoute);
  private readonly documentService = inject(AdfHxDocumentService);
  private readonly folderService = inject(AdfHxBrowseFolderService);
  private readonly mediaService = inject(AdfHxBrowseMediaService);
  private readonly adfHxBrowseContext = inject(AdfHxBrowseContextService);
  private readonly extensions = inject(AppExtensionsService);
  private readonly documentRouter = inject(NuxeoDocumentRouterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tagSearch$ = new Subject<string>();

  protected readonly loading = signal(true);
  protected readonly listLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly currentDocument = signal<Document>(ROOT_DOCUMENT);
  protected readonly currentNuxeoDoc = signal<NuxeoDocument | null>(null);
  protected readonly documents = signal<Document[]>([]);
  protected readonly thumbnails = signal<Record<string, string>>({});
  protected readonly trashThumbnails = signal<Record<string, string>>({});
  protected readonly csvExporting = signal(false);
  protected readonly viewMode = signal<HxpBrowseViewMode>('list');
  protected readonly scopeNotice = signal<string | null>(null);

  protected readonly activeTab = signal<HxpBrowseTabId>('view');
  protected readonly panelOpen = signal(false);
  protected readonly panelSubTab = signal<HxpDetailsSubTab>('info');

  protected readonly permissionsLoaded = signal(false);
  protected readonly permissionsLoading = signal(false);
  protected readonly actionInProgress = signal<string | null>(null);

  protected readonly auditEntries = signal<AuditEntry[]>([]);
  protected readonly auditLoading = signal(false);
  protected readonly auditTotalSize = signal(0);
  protected readonly auditPageSize = signal(10);
  protected readonly auditPageIndex = signal(0);
  protected readonly availableActions = signal<DirectoryEntry[]>([]);
  protected readonly availableCategories = signal<DirectoryEntry[]>([]);
  protected readonly eventTypeLabelMap = signal<Record<string, string>>({});
  protected readonly eventCategoryLabelMap = signal<Record<string, string>>({});
  protected readonly historyFilterUsername = signal('');
  protected readonly historyFilterDateFrom = signal('');
  protected readonly historyFilterDateTo = signal('');
  protected readonly historyFilterAction = signal('');
  protected readonly historyFilterCategory = signal('');
  protected readonly historySortActive = signal<keyof AuditEntry>('eventDate');
  protected readonly historySortDirection = signal<'asc' | 'desc'>('desc');
  private historyDirectoriesLoaded = false;

  protected readonly trashedDocuments = signal<Document[]>([]);
  protected readonly trashLoading = signal(false);
  private trashLoaded = false;

  protected readonly activityEntries = signal<AuditEntry[]>([]);
  protected readonly activityLoading = signal(false);
  protected readonly tagInput = signal('');
  protected readonly tagSearchResults = signal<string[]>([]);
  protected readonly showCreateTagOption = signal(false);

  protected readonly filterText = signal('');
  protected readonly filterType = signal('');
  protected readonly filterModifiedFrom = signal('');
  protected readonly filterModifiedTo = signal('');
  protected readonly filterContributor = signal('');

  protected readonly browsePath = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('path') ?? '/')),
    { initialValue: '/' },
  );

  protected readonly canWrite = computed(() => canWriteDocument(this.currentNuxeoDoc()));
  protected readonly canRemove = computed(() => canRemoveDocument(this.currentNuxeoDoc()));
  protected readonly canManagePermissions = computed(() =>
    canManageDocumentPermissions(this.currentNuxeoDoc()),
  );
  protected readonly isSubscribed = computed(() => hxpIsSubscribed(this.currentNuxeoDoc()));
  protected readonly canCreate = computed(() => {
    const doc = this.currentNuxeoDoc();
    if (!doc || doc.type === 'Favorites' || !canAddChildren(doc) || !this.isBrowseFolderish(doc)) {
      return false;
    }
    return !isDomainParentType(doc.type) && !isRestrictedImportParentPath(doc.path);
  });
  protected readonly localAces = computed(() => hxpLocalAces(this.currentNuxeoDoc()));
  protected readonly inheritedAces = computed(() => hxpInheritedAces(this.currentNuxeoDoc()));
  protected readonly externalAces = computed(() => hxpExternalAces(this.currentNuxeoDoc()));
  protected readonly inheritanceBlocked = computed(() =>
    hxpIsInheritanceBlocked(this.currentNuxeoDoc()),
  );
  protected readonly tags = computed(() => hxpDocumentTags(this.currentNuxeoDoc()));
  protected readonly docState = computed(
    () => (this.currentNuxeoDoc()?.properties?.['dc:nature'] as string | undefined) ?? 'Project',
  );

  protected readonly filteredAuditEntries = computed(() =>
    this.folderService.filterAuditEntries(
      this.auditEntries(),
      {
        username: this.historyFilterUsername(),
        dateFrom: this.parseDateInput(this.historyFilterDateFrom()),
        dateTo: this.parseDateInput(this.historyFilterDateTo()),
        action: this.historyFilterAction(),
        category: this.historyFilterCategory(),
      },
      {
        active: this.historySortActive(),
        direction: this.historySortDirection(),
      },
    ),
  );

  protected readonly activityLabelFn = computed(
    () => (entry: AuditEntry) => auditActivityLabel(entry, this.eventTypeLabelMap()),
  );

  protected readonly distinctTypes = computed(() => {
    const types = new Set(
      this.documents()
        .map((doc) => doc['sys_typeLabel'] ?? doc.sys_primaryType ?? '')
        .filter((type) => type.length > 0),
    );
    return Array.from(types).sort();
  });

  protected readonly filteredDocuments = computed(() => {
    let docs = this.documents();
    const text = this.filterText();
    const type = this.filterType();
    const modFrom = this.filterModifiedFrom();
    const modTo = this.filterModifiedTo();
    const contributor = this.filterContributor();

    if (text) {
      const term = text.toLowerCase();
      docs = docs.filter((doc) => hxpDocTitle(doc).toLowerCase().includes(term));
    }
    if (type) {
      docs = docs.filter((doc) => (doc['sys_typeLabel'] ?? doc.sys_primaryType) === type);
    }
    if (modFrom) {
      const from = new Date(modFrom).getTime();
      docs = docs.filter((doc) => doc.sys_modified && new Date(doc.sys_modified).getTime() >= from);
    }
    if (modTo) {
      const to = new Date(modTo).getTime() + 86_400_000;
      docs = docs.filter((doc) => doc.sys_modified && new Date(doc.sys_modified).getTime() < to);
    }
    if (contributor) {
      const term = contributor.toLowerCase();
      docs = docs.filter((doc) =>
        ((doc['hx:lastContributor'] as string | undefined) ?? '').toLowerCase().includes(term),
      );
    }
    return docs;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.mediaService.revokeThumbnails();
    });

    this.tagSearch$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => {
        const trimmed = term.trim();
        if (trimmed.length < 1) {
          this.tagSearchResults.set([]);
          this.showCreateTagOption.set(false);
          return;
        }
        this.folderService.searchTags(trimmed).subscribe({
          next: (results) => {
            const existing = new Set(this.tags().map((tag) => tag.toLowerCase()));
            const filtered = results.filter((label) => !existing.has(label.toLowerCase()));
            this.tagSearchResults.set(filtered);
            this.showCreateTagOption.set(
              trimmed.length > 0 &&
                !existing.has(trimmed.toLowerCase()) &&
                !filtered.includes(trimmed),
            );
          },
          error: () => {
            this.tagSearchResults.set([]);
            this.showCreateTagOption.set(trimmed.length > 0);
          },
        });
      });

    effect(() => {
      const path = this.browsePath();
      this.adfHxBrowseContext.setFromNuxeoPath(path);
      this.resetTabState();
      this.filterText.set('');
      this.filterType.set('');
      this.filterModifiedFrom.set('');
      this.filterModifiedTo.set('');
      this.filterContributor.set('');
      this.scopeNotice.set(null);
      this.loadFolder(path);
    });

    effect(() => {
      const refreshTick = this.adfHxBrowseContext.treeRefreshTick();
      if (refreshTick === 0) {
        return;
      }
      this.loadFolder(this.browsePath());
    });

    effect(() => {
      const doc = this.currentNuxeoDoc();
      const uid = doc?.uid;
      if (this.panelOpen() && uid && this.panelSubTab() === 'activity') {
        this.loadActivity(uid);
      }
    });
  }

  protected reload(): void {
    this.loadFolder(this.browsePath());
  }

  protected onTabChange(tab: HxpBrowseTabId): void {
    this.activeTab.set(tab);
    if (tab === 'permissions') {
      this.loadPermissions();
    }
    if (tab === 'history') {
      if (!this.historyDirectoriesLoaded) {
        this.loadHistoryDirectories();
      }
      this.loadAuditLog();
    }
    if (tab === 'trash' && !this.trashLoaded) {
      this.loadTrash();
    }
  }

  protected togglePanel(): void {
    this.panelOpen.update((open) => !open);
    const doc = this.currentNuxeoDoc();
    if (this.panelOpen() && doc?.uid) {
      this.loadActivity(doc.uid);
    }
  }

  protected closePanel(): void {
    this.panelOpen.set(false);
  }

  protected onPanelSubTabChange(tab: HxpDetailsSubTab): void {
    this.panelSubTab.set(tab);
    const doc = this.currentNuxeoDoc();
    if (tab === 'activity' && doc?.uid) {
      this.loadActivity(doc.uid);
    }
  }

  protected onTagInputChange(value: string): void {
    this.tagInput.set(value);
    this.tagSearch$.next(value);
  }

  protected onTagSelect(label: string): void {
    this.showScopeNotice(`Add tag "${label}"`);
    this.tagInput.set('');
    this.tagSearchResults.set([]);
    this.showCreateTagOption.set(false);
  }

  protected onTagRemove(label: string): void {
    this.showScopeNotice(`Remove tag "${label}"`);
  }

  protected onHistoryPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.auditPageIndex.set(event.pageIndex);
    this.auditPageSize.set(event.pageSize);
    this.loadAuditLog();
  }

  protected onHistorySortChange(event: {
    active: keyof AuditEntry;
    direction: 'asc' | 'desc';
  }): void {
    this.historySortActive.set(event.active);
    this.historySortDirection.set(event.direction);
  }

  protected onRestoreTrash(doc: Document): void {
    this.showScopeNotice(`Restore "${hxpDocTitle(doc)}"`);
  }

  protected onPermissionAction(action: string): void {
    this.showScopeNotice(action);
  }

  protected exportCsv(): void {
    const doc = this.currentDocument();
    const uid = doc.sys_id;
    if (!uid || this.csvExporting()) {
      return;
    }

    this.csvExporting.set(true);
    this.mediaService
      .exportCsv(uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${hxpDocTitle(doc)}.csv`;
          anchor.click();
          URL.revokeObjectURL(url);
          this.csvExporting.set(false);
        },
        error: () => {
          this.csvExporting.set(false);
          this.scopeNotice.set('CSV export failed.');
        },
      });
  }

  protected downloadAll(): void {
    const doc = this.currentDocument();
    const uid = doc.sys_id;
    if (!uid) {
      return;
    }

    this.mediaService
      .exportZip(uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${hxpDocTitle(doc)}.zip`;
          anchor.click();
          URL.revokeObjectURL(url);
        },
        error: () => this.scopeNotice.set('Download failed.'),
      });
  }

  protected showScopeNotice(action: string): void {
    this.scopeNotice.set(`${action} is not available in Scope A (read-only POC).`);
  }

  private resetTabState(): void {
    this.activeTab.set('view');
    this.permissionsLoaded.set(false);
    this.permissionsLoading.set(false);
    this.historyDirectoriesLoaded = false;
    this.trashLoaded = false;
    this.auditEntries.set([]);
    this.trashedDocuments.set([]);
    this.activityEntries.set([]);
  }

  private loadFolder(path: string): void {
    this.loading.set(true);
    this.listLoading.set(true);
    this.error.set(null);
    this.mediaService.revokeThumbnails();
    this.thumbnails.set({});
    this.currentNuxeoDoc.set(null);

    const load$ =
      path === '/'
        ? this.documentService.getDocumentById(ROOT_DOCUMENT.sys_id)
        : this.documentService.getDocumentByPath(path);

    load$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (document) => {
        this.currentDocument.set(document);
        this.documentService.notifyDocumentLoaded(document);
        this.loadNuxeoContext(document);
        this.loadChildren(document);
      },
      error: () => {
        this.loading.set(false);
        this.listLoading.set(false);
        this.error.set('Failed to load folder contents.');
      },
    });
  }

  private loadNuxeoContext(document: Document): void {
    const uid = document.sys_id;
    if (!uid || uid === ROOT_DOCUMENT.sys_id) {
      this.currentNuxeoDoc.set(null);
      return;
    }

    this.folderService
      .getFullDocument(uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nuxeoDoc) => this.currentNuxeoDoc.set(nuxeoDoc),
        error: () => this.currentNuxeoDoc.set(null),
      });
  }

  private loadChildren(document: Document): void {
    this.documentService
      .getAllChildren(document.sys_id ?? ROOT_DOCUMENT.sys_id, { limit: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.documents.set(result.documents);
          this.loading.set(false);
          this.listLoading.set(false);
          this.loadThumbnails(result.documents);
        },
        error: () => {
          this.documents.set([]);
          this.loading.set(false);
          this.listLoading.set(false);
          this.error.set('Failed to load folder contents.');
        },
      });
  }

  private loadPermissions(force = false): void {
    const doc = this.currentNuxeoDoc();
    if (!doc?.uid || this.permissionsLoading()) {
      return;
    }
    if (this.permissionsLoaded() && !force) {
      return;
    }

    this.permissionsLoading.set(true);
    this.folderService
      .getDocumentPermissions(doc.uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          const existing = this.currentNuxeoDoc();
          this.currentNuxeoDoc.set(
            existing ? mergeDocumentPermissionsContext(existing, updated) : updated,
          );
          this.permissionsLoaded.set(true);
          this.permissionsLoading.set(false);
        },
        error: () => {
          this.permissionsLoading.set(false);
          this.scopeNotice.set('Failed to load permissions.');
        },
      });
  }

  private loadHistoryDirectories(): void {
    this.folderService
      .getAuditDirectoryLabels()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (labels) => {
          this.availableActions.set(labels.eventTypes);
          this.availableCategories.set(labels.eventCategories);
          this.eventTypeLabelMap.set(labels.eventTypeLabelMap);
          this.eventCategoryLabelMap.set(labels.eventCategoryLabelMap);
          this.historyDirectoriesLoaded = true;
        },
      });
  }

  private loadAuditLog(): void {
    const doc = this.currentNuxeoDoc();
    if (!doc?.uid) {
      return;
    }

    if (!canViewDocumentAuditLog(doc)) {
      this.auditEntries.set([]);
      this.auditTotalSize.set(0);
      this.auditLoading.set(false);
      return;
    }

    this.auditLoading.set(true);
    this.folderService
      .getAuditLog(doc.uid, this.auditPageSize(), this.auditPageIndex())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.auditEntries.set(res.entries);
          this.auditTotalSize.set(res.resultsCount ?? res.totalSize ?? res.entries.length);
          this.auditLoading.set(false);
        },
        error: () => this.auditLoading.set(false),
      });
  }

  private loadTrash(): void {
    const doc = this.currentNuxeoDoc();
    if (!doc?.uid) {
      return;
    }

    this.trashLoading.set(true);
    this.folderService
      .getTrashedChildren(doc.uid, 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const hxDocs = this.folderService.mapTrashedToHx(res.entries);
          this.trashedDocuments.set(hxDocs);
          this.trashLoading.set(false);
          this.trashLoaded = true;
          this.loadTrashThumbnails(hxDocs);
        },
        error: () => this.trashLoading.set(false),
      });
  }

  private loadActivity(uid: string): void {
    const doc = this.currentNuxeoDoc();
    if (!doc || !canViewDocumentAuditLog(doc)) {
      this.activityEntries.set([]);
      this.activityLoading.set(false);
      return;
    }

    this.activityLoading.set(true);
    this.folderService
      .getAuditLog(uid, 5, 0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.activityEntries.set(res.entries);
          this.activityLoading.set(false);
        },
        error: () => this.activityLoading.set(false),
      });
  }

  private loadThumbnails(documents: Document[]): void {
    this.mediaService.loadThumbnails(
      documents,
      (partial) => this.thumbnails.update((current) => ({ ...current, ...partial })),
      this.destroyRef,
      false,
    );
  }

  private loadTrashThumbnails(documents: Document[]): void {
    this.mediaService.loadThumbnails(
      documents,
      (partial) => this.trashThumbnails.update((current) => ({ ...current, ...partial })),
      this.destroyRef,
      true,
    );
  }

  private isBrowseFolderish(doc: NuxeoDocument): boolean {
    return doc.type === 'Favorites' || isFolderishDocument(doc);
  }

  private parseDateInput(value: string): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
