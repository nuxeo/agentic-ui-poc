import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import {
  auditActivityLabel,
  canAddChildren,
  canRemoveDocument,
  canViewDocumentAuditLog,
  canWriteDocument,
  isFolderishDocument,
  isRestrictedImportParentPath,
  isDomainParentType,
  type AuditEntry,
  type DirectoryEntry,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';
import {
  AdfHxBrowseContextService,
  AdfHxBrowseFolderService,
  AdfHxBrowseMediaService,
  HxpBrowseDetailsPanelComponent,
  type HxpDetailsSubTab,
  HxpBrowseHistoryComponent,
  HxpBrowseTabsComponent,
  type HxpBrowseTabId,
  HxpBrowseToolbarComponent,
  type HxpBrowseViewMode,
  HxpDocumentCardsComponent,
  HxpColumnPickerComponent,
  HxpBrowsePagerComponent,
  type HxpPickableColumn,
  NuxeoDocumentRouterService,
  HxpDomainHintComponent,
  HxpFolderHeaderComponent,
  HxpBrowseTrashComponent,
  HxpIconComponent,
  HxpSpinnerComponent,
  ROOT_DOCUMENT,
  hxpDocTitle,
  hxpDocumentTags,
  hxpIsSubscribed,
} from '@agentic-ui/shared/adf-hx-bridge';

// The narrow entry point, deliberately. It is the only thing in this bridge that reaches
// `@alfresco/adf-hx-*`, and this route is lazily loaded — importing it from the main
// barrel instead would put adf-core in the initial bundle. See `src/providers.ts`.
import {
  ADF_HX_NUXEO_BRIDGE_PROVIDERS,
  AdfHxDocumentService,
} from '@agentic-ui/shared/adf-hx-bridge/providers';
import {
  HxpBreadcrumbComponent as UpstreamBreadcrumbComponent,
  HxpDocumentListComponent as UpstreamDocumentListComponent,
  HxpPropertiesSidebarComponent as UpstreamPropertiesSidebarComponent,
  HxpUiDocumentViewerComponent as UpstreamDocumentViewerComponent,
  ManageVersionsSidebarComponent as UpstreamManageVersionsSidebarComponent,
  PermissionsManagementPanelComponent as UpstreamPermissionsPanelComponent,
} from '@alfresco/adf-hx-content-services/ui';
import type { DataColumn } from '@alfresco/adf-core';

import {
  AppExtensionsService,
  EXTENSION_SLOTS,
  type ExtensionColumnDescriptor,
} from '@nuxeo-satori/platform/extensions';

import { toDataColumns } from '../adf-hx-columns';

/**
 * The `[parentDocument]` upstream's permissions panel gets when this document has no readable
 * parent.
 *
 * The input is not optional and the facade dereferences it — `parentDocument.sys_effectiveAcl || []`
 * — whenever inheritance is blocked, so `undefined` is a `TypeError` rather than a default. An
 * empty ACL is the honest stand-in: passing the document as its own parent would list its own ACEs
 * a second time, in the inherited column.
 */
const NO_PARENT_DOCUMENT: Document = { sys_primaryType: '', sys_effectiveAcl: [] };

@Component({
  selector: 'lib-browse-adf-hx-poc',
  standalone: true,
  templateUrl: './browse-adf-hx-poc.html',
  styleUrl: './browse-adf-hx-poc.scss',
  imports: [
    HxpFolderHeaderComponent,
    HxpDomainHintComponent,
    HxpBrowseTabsComponent,
    HxpBrowseToolbarComponent,
    UpstreamBreadcrumbComponent,
    UpstreamDocumentListComponent,
    UpstreamDocumentViewerComponent,
    UpstreamManageVersionsSidebarComponent,
    UpstreamPermissionsPanelComponent,
    UpstreamPropertiesSidebarComponent,
    HxpDocumentCardsComponent,
    HxpColumnPickerComponent,
    HxpBrowsePagerComponent,
    HxpBrowseHistoryComponent,
    HxpBrowseTrashComponent,
    HxpBrowseDetailsPanelComponent,
    HxpIconComponent,
    HxpSpinnerComponent,
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

  /**
   * Upstream's `[schema]`, translated by the shared `toDataColumns`.
   *
   * The translation used to live here inline, and the search page — which needed the
   * identical mapping — was written without it and rendered empty rows. One copy now,
   * in `adf-hx-columns.ts`, so a third surface cannot repeat that.
   *
   * `pickableColumns.key` *is* `ExtensionColumnDescriptor.field`, so the visible subset
   * is mapped straight back onto descriptor shape for the translator.
   */
  protected readonly schema = computed<DataColumn[]>(() => {
    const visible = new Set(
      this.pickableColumns()
        .filter((column) => column.visible)
        .map((column) => column.key),
    );
    return toDataColumns(this.columnDescriptors().filter((c) => visible.has(c.field)));
  });

  /** Row click, previously the local component's own `onRowClick`. */
  protected onUpstreamRowClicked(document: Document): void {
    this.documentRouter.navigateTo(document);
  }

  // ── Per-document tabs: Properties and Versions ──
  //
  // MISSING(adf-hx): M6 — deciding *which* document a per-document panel acts on. Upstream's
  // panels each take one `[document]` and are built as drawers; choosing the target from a
  // selection, and saying so when there is none, is the host's job.
  //
  // Both belong to a document, not to the folder being browsed, so they act on the row
  // **selected** in the View tab rather than on `currentDocument()`. Binding Versions to the
  // folder would have looked like a working feature: upstream always prepends a "current
  // version" entry, so a folder with no versions still renders one row.

  /** The rows checked in upstream's DataTable, from its `selectedDocuments` output. */
  private readonly selectedDocuments = signal<readonly Document[]>([]);

  /**
   * The document the per-document tabs act on, or `null` when the selection is not a single row.
   *
   * Shared by Properties and Versions: both take one `[document]`, and both are meaningless
   * without a choice of which.
   */
  protected readonly selectedDocument = computed<Document | null>(() => {
    const selection = this.selectedDocuments();
    return selection.length === 1 ? selection[0] : null;
  });

  // ── Document viewer overlay ──
  protected readonly viewerOpen = signal(false);
  protected readonly viewerDocument = signal<Document | null>(null);

  protected onSelectedDocuments(documents: Document[]): void {
    this.selectedDocuments.set(documents);
  }

  protected openViewer(): void {
    const doc = this.selectedDocument();
    if (doc && !doc.sys_isFolderish) {
      this.viewerDocument.set(doc);
      this.viewerOpen.set(true);
    }
  }

  protected closeViewer(): void {
    this.viewerOpen.set(false);
    this.viewerDocument.set(null);
  }

  /** Upstream's panel emits its own close; there is no drawer here, so fall back to View. */
  protected onCloseVersions(): void {
    this.activeTab.set('view');
  }

  /**
   * The properties panel acts on the same selection as Versions.
   *
   * It is rendered with `[editable]="false"`, which is upstream's own read-only mode rather than
   * our scope-notice path. Scope A does not write, and suppressing the edit affordance entirely
   * is more honest than offering one that always refuses.
   */
  protected onCloseProperties(): void {
    this.activeTab.set('view');
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

  // ── Sorting and paging ──
  //
  // Both were recorded bridge defects. The list emitted `(sortingClicked)` into nothing, so the
  // server was never asked to order — clicking a header reordered only the rows already loaded,
  // measured at 37 before and after with no refetch. And the fetch took a hardcoded `limit: 50`
  // with no pager, so a larger folder silently showed its first 50.

  /** Upstream's format: `"<key> <asc|desc>"`. `null` means the service's default order. */
  protected readonly sort = signal<readonly string[] | null>(null);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(50);
  protected readonly hasNextPage = signal(false);
  protected readonly totalCount = signal(-2);

  /**
   * Upstream emits one entry, `"sys_title asc"`, already in the shape the port wants.
   *
   * Resets to the first page: keeping the page index across a re-order shows page 3 of a
   * different ordering, which looks like data loss.
   */
  protected onSortingClicked(sort: string[]): void {
    this.sort.set(sort.length ? sort : null);
    this.pageIndex.set(0);
    this.loadFolder(this.browsePath());
  }

  protected onPageChange(pageIndex: number): void {
    this.pageIndex.set(pageIndex);
    this.loadFolder(this.browsePath());
  }

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

  // ── Permissions ──
  //
  // Upstream's `PermissionsManagementPanelComponent` replaced a hand-written read-only table. It
  // initialises from its two inputs in `ngOnInit` and never re-reads them, so both have to be
  // settled before it is rendered — hence `permissionsPanelReady` rather than a `[loading]` input.

  protected readonly permissionsLoading = signal(false);
  protected readonly permissionsPanelReady = signal(false);

  /**
   * The parent, for the inherited column when this document blocks inheritance.
   *
   * Upstream reads `parentDocument.sys_effectiveAcl` only in that case: with inheritance on, Nuxeo
   * already reports the inherited ACEs on the document itself. An empty document rather than the
   * real parent when there is none — passing the document as its own parent would count its own
   * ACEs twice.
   */
  protected readonly permissionsParent = signal<Document>(NO_PARENT_DOCUMENT);

  /**
   * The document the panel manages, or `null` when there is no ACL to manage.
   *
   * `sys_effectiveAcl` is absent — not empty — when the read did not carry Nuxeo's `acls` enricher,
   * and the synthetic repository root has no ACL at all. Rendering the panel then shows an empty
   * permissions table, which reads as "this document grants nobody anything".
   */
  protected readonly permissionsTarget = computed<Document | null>(() => {
    const doc = this.currentDocument();
    return doc.sys_effectiveAcl === undefined ? null : doc;
  });

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
  protected readonly isSubscribed = computed(() => hxpIsSubscribed(this.currentNuxeoDoc()));
  protected readonly canCreate = computed(() => {
    const doc = this.currentNuxeoDoc();
    if (!doc || doc.type === 'Favorites' || !canAddChildren(doc) || !this.isBrowseFolderish(doc)) {
      return false;
    }
    return !isDomainParentType(doc.type) && !isRestrictedImportParentPath(doc.path);
  });
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
        ((doc['dc_lastContributor'] as string | undefined) ?? '').toLowerCase().includes(term),
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
      // A new folder starts at page one, in the default order.
      this.pageIndex.set(0);
      this.sort.set(null);
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
      this.loadPermissionsPanel();
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
    this.permissionsLoading.set(false);
    // The panel is destroyed and rebuilt for the new folder, so its inputs must be re-resolved.
    this.permissionsPanelReady.set(false);
    this.permissionsParent.set(NO_PARENT_DOCUMENT);
    this.historyDirectoriesLoaded = false;
    this.trashLoaded = false;
    this.auditEntries.set([]);
    this.trashedDocuments.set([]);
    this.activityEntries.set([]);
    // The selection belongs to the folder that was on screen. Carrying it across a navigation
    // would leave the Versions tab pointed at a document no longer in the list.
    this.selectedDocuments.set([]);
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
    const limit = this.pageSize();
    this.documentService
      .getAllChildren(document.sys_id ?? ROOT_DOCUMENT.sys_id, {
        limit,
        // Turned into Nuxeo's `currentPageIndex` by the port, so this is a real server page
        // rather than a slice of one oversized fetch.
        offset: this.pageIndex() * limit,
        ...(this.sort() ? { sort: [...this.sort()!] } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.documents.set(result.documents);
          this.totalCount.set(result.totalCount);
          this.hasNextPage.set(result.hasNextPage === true);
          this.loading.set(false);
          this.listLoading.set(false);
          this.loadThumbnails(result.documents);
        },
        error: (err: unknown) => {
          this.documents.set([]);
          this.hasNextPage.set(false);
          this.loading.set(false);
          this.listLoading.set(false);
          // A refused sort key reaches here. Saying so beats "failed to load", because the folder
          // is fine and the fix is to sort by something else.
          const message = err instanceof Error ? err.message : '';
          this.error.set(
            message.startsWith('Cannot sort by') ? message : 'Failed to load folder contents.',
          );
        },
      });
  }

  /**
   * Resolves the parent document, then lets upstream's panel render.
   *
   * The document itself needs no fetch: `sys_acl` and `sys_effectiveAcl` already arrived with the
   * folder read, which requests Nuxeo's `acls` enricher. Only the parent is missing, and only
   * matters when this document blocks inheritance — but the panel reads both inputs once in
   * `ngOnInit`, so the parent has to be there before it is rendered rather than after.
   */
  private loadPermissionsPanel(): void {
    if (this.permissionsPanelReady() || this.permissionsLoading()) {
      return;
    }

    const parentRef = this.currentNuxeoDoc()?.parentRef;
    if (!parentRef) {
      // A document Nuxeo reports no parent for, or the synthetic root. Either way there is no
      // inherited ACL to show beyond what the document itself carries.
      this.permissionsPanelReady.set(true);
      return;
    }

    this.permissionsLoading.set(true);
    this.documentService
      .getDocumentById(parentRef)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (parent) => {
          this.permissionsParent.set(parent);
          this.permissionsLoading.set(false);
          this.permissionsPanelReady.set(true);
        },
        error: () => {
          // A parent the user cannot read is the common case, not an exception: Nuxeo grants
          // access to a folder without granting it to the folder above. Show the document's own
          // ACL rather than nothing.
          this.permissionsLoading.set(false);
          this.permissionsPanelReady.set(true);
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
