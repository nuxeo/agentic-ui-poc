import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
} from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';

import {
  NuxeoDocument,
  NuxeoAcl,
  NuxeoAce,
  AuditEntry,
  DirectoryEntry,
  BrowseService,
  DocumentDetailService,
  DirectoryService,
  SelectionService,
  TagService,
  docTypeIcon,
  avatarColor,
  isFolderishDocument,
  canAddChildren,
  canManageDocumentPermissions,
  mergeDocumentPermissionsContext,
  canWriteDocument,
  canRemoveDocument,
  canViewDocumentAuditLog,
  DOMAIN_CONTAINER_GUIDANCE,
  isDomainParentType,
  isRepositoryRootPath,
  isRestrictedImportParentPath,
  PERMISSION_DENIED_MESSAGE,
  isMailSendError,
  mailSendFailureMessage,
  resolveAcePrincipal,
} from '@agentic-ui/shared/nuxeo-client';

import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { SatBreadcrumbsComponent, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';

import {
  ShareDialogComponent,
  ShareDialogData,
  ExportDialogComponent,
  ExportDialogData,
  ExportType,
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@agentic-ui/shared/ui';

import {
  AddPermissionDialogComponent,
  AddPermissionDialogData,
  UpdatePermissionDialogComponent,
  UpdatePermissionDialogData,
  DeletePermissionDialogComponent,
  DeletePermissionDialogData,
  ShareExternalDialogComponent,
  ShareExternalDialogData,
} from '@agentic-ui/feature-collections';

import {
  BrowseDriveDialogComponent,
  type BrowseDriveDialogData,
} from '../drive-dialog/drive-dialog';

import {
  ALL_COLUMNS,
  ColumnDef,
  loadColumnSettings,
  saveColumnSettings,
} from '../column-settings-dialog/column-settings-dialog';
import {
  EditMetadataDialogComponent,
  EditMetadataDialogData,
} from '../edit-metadata-dialog/edit-metadata-dialog';
import { CreateImportDialogComponent } from '../create-import/create-import-dialog.component';

@Component({
  selector: 'lib-browse',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    SatAvatarModule,
    SatTagModule,
    SatBreadcrumbsComponent,
  ],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
})
export class BrowseComponent {
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('columnPanel')
  private columnPanel?: ElementRef<HTMLElement>;

  private readonly router = inject(Router);
  private readonly browseService = inject(BrowseService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly directoryService = inject(DirectoryService);
  private readonly tagService = inject(TagService);
  readonly selectionService = inject(SelectionService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Core state
  readonly entries = signal<NuxeoDocument[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentDoc = signal<NuxeoDocument | null>(null);
  readonly totalSize = signal(0);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});
  private currentNuxeoPath = '/';
  readonly browsePath = signal('/');
  private readonly linkableBrowsePaths = signal<Set<string>>(new Set());
  private readonly browsePath$ = new Subject<string>();

  // Details side panel
  readonly panelOpen = signal(false);
  readonly panelSubTab = signal<'info' | 'tags' | 'activity'>('info');
  readonly tags = computed<string[]>(() => {
    const doc = this.currentDoc();
    if (!doc) return [];
    const raw = doc.properties?.['nxtag:tags'] as Array<{ label: string } | string> | undefined;
    if (!raw) return [];
    return raw.map((t) => (typeof t === 'string' ? t : t.label));
  });
  readonly activityEntries = signal<AuditEntry[]>([]);
  readonly activityLoading = signal(false);

  // Tag autocomplete
  tagInput = '';
  readonly tagSearchResults = signal<string[]>([]);
  readonly showCreateOption = signal(false);
  private readonly tagSearch$ = new Subject<string>();

  // Tabs
  readonly activeTabIndex = signal(0);

  // Permissions tab
  readonly permissionsLoaded = signal(false);
  readonly permissionsLoading = signal(false);
  readonly localAces = computed<NuxeoAce[]>(() => {
    const doc = this.currentDoc();
    const acls = doc?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    const local = acls.find((a) => a.name === 'local');
    return local?.aces.filter((ace) => ace.granted && !ace.externalUser) ?? [];
  });
  readonly inheritedAces = computed<NuxeoAce[]>(() => {
    const doc = this.currentDoc();
    const acls = doc?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    const inherited = acls.find((a) => a.name === 'inherited');
    return inherited?.aces.filter((ace) => ace.granted) ?? [];
  });
  readonly externalAces = computed<NuxeoAce[]>(() => {
    const doc = this.currentDoc();
    const acls = doc?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    return acls.flatMap((a) => a.aces).filter((ace) => ace.externalUser && ace.granted);
  });
  readonly isInheritanceBlocked = computed<boolean>(() => {
    const doc = this.currentDoc();
    const acls = doc?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return false;
    return !acls.some((a) => a.name === 'inherited');
  });
  readonly canWriteCurrentDoc = computed(() => canWriteDocument(this.currentDoc()));
  readonly isDomainBrowse = computed(() => isDomainParentType(this.currentDoc()?.type));
  readonly isRepositoryRootBrowse = computed(() => isRepositoryRootPath(this.browsePath()));
  readonly domainContainerGuidance = DOMAIN_CONTAINER_GUIDANCE;
  readonly canCreateContentHere = computed(() => {
    const doc = this.currentDoc();
    if (!doc || doc.type === 'Favorites' || !canAddChildren(doc) || !this.isBrowseFolderish(doc)) {
      return false;
    }
    return !isDomainParentType(doc.type) && !isRestrictedImportParentPath(doc.path);
  });
  readonly canRemoveCurrentDoc = computed(() => canRemoveDocument(this.currentDoc()));
  readonly canManageCurrentPermissions = computed(() =>
    canManageDocumentPermissions(this.currentDoc()),
  );
  readonly actionInProgress = signal<string | null>(null);

  // History tab
  readonly auditEntries = signal<AuditEntry[]>([]);
  readonly auditLoading = signal(false);
  readonly auditTotalSize = signal(0);
  readonly auditPageSize = signal(10);
  readonly auditPageIndex = signal(0);
  private historyLoaded = false;
  filterUsername = '';
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  filterAction = '';
  filterCategory = '';
  readonly availableActions = signal<DirectoryEntry[]>([]);
  readonly availableCategories = signal<DirectoryEntry[]>([]);
  readonly eventTypeLabelMap = signal<Record<string, string>>({});
  readonly eventCategoryLabelMap = signal<Record<string, string>>({});
  sortActive = 'eventDate';
  sortDirection: 'asc' | 'desc' | '' = 'desc';

  readonly filteredAuditEntries = computed(() => {
    let entries = this.auditEntries();
    if (this.filterUsername) {
      const term = this.filterUsername.toLowerCase();
      entries = entries.filter((e) => e.principalName?.toLowerCase().includes(term));
    }
    if (this.filterDateFrom) {
      const from = this.filterDateFrom.getTime();
      entries = entries.filter((e) => new Date(e.eventDate).getTime() >= from);
    }
    if (this.filterDateTo) {
      const to = this.filterDateTo.getTime() + 86_400_000;
      entries = entries.filter((e) => new Date(e.eventDate).getTime() < to);
    }
    if (this.filterAction) {
      entries = entries.filter((e) => e.eventId === this.filterAction);
    }
    if (this.filterCategory) {
      entries = entries.filter((e) => e.category === this.filterCategory);
    }
    if (this.sortActive && this.sortDirection) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      const key = this.sortActive as keyof AuditEntry;
      entries = [...entries].sort((a, b) => {
        const va = String(a[key] ?? '');
        const vb = String(b[key] ?? '');
        return va.localeCompare(vb) * dir;
      });
    }
    return entries;
  });

  // Trash tab
  readonly trashedDocs = signal<NuxeoDocument[]>([]);
  readonly trashLoading = signal(false);
  private trashLoaded = false;

  // View toggle
  readonly viewMode = signal<'list' | 'card'>('list');
  readonly csvExporting = signal(false);

  // Column sorting
  readonly browseSortKey = signal<string>('');
  readonly browseSortDir = signal<'asc' | 'desc'>('asc');

  // Column settings
  readonly columns = signal<ColumnDef[]>(loadColumnSettings());
  readonly visibleColumns = computed(() => this.columns().filter((c) => c.visible));
  readonly columnPanelOpen = signal(false);
  readonly pendingColumns = signal<ColumnDef[]>([]);

  // Filters
  readonly filterText = signal('');
  readonly filterType = signal('');
  readonly filterModifiedFrom = signal<Date | null>(null);
  readonly filterModifiedTo = signal<Date | null>(null);
  readonly filterContributor = signal('');

  readonly distinctTypes = computed(() => {
    const types = new Set(this.entries().map((e) => e.type));
    return Array.from(types).sort();
  });

  readonly filteredEntries = computed(() => {
    let docs = this.entries();
    const text = this.filterText();
    const type = this.filterType();
    const modFrom = this.filterModifiedFrom();
    const modTo = this.filterModifiedTo();
    const contributor = this.filterContributor();

    if (text) {
      const term = text.toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(term));
    }
    if (type) {
      docs = docs.filter((d) => d.type === type);
    }
    if (modFrom) {
      const from = modFrom.getTime();
      docs = docs.filter((d) => new Date(d.lastModified).getTime() >= from);
    }
    if (modTo) {
      const to = modTo.getTime() + 86_400_000;
      docs = docs.filter((d) => new Date(d.lastModified).getTime() < to);
    }
    if (contributor) {
      const term = contributor.toLowerCase();
      docs = docs.filter((d) =>
        ((d.properties?.['dc:lastContributor'] as string) ?? '').toLowerCase().includes(term),
      );
    }

    const key = this.browseSortKey();
    const dir = this.browseSortDir();
    if (key) {
      const mult = dir === 'asc' ? 1 : -1;
      docs = [...docs].sort((a, b) => {
        let va: string, vb: string;
        if (key === 'title') {
          va = a.title.toLowerCase();
          vb = b.title.toLowerCase();
        } else if (key === 'modified') {
          va = a.lastModified ?? '';
          vb = b.lastModified ?? '';
        } else if (key === 'lastContributor') {
          va = ((a.properties?.['dc:lastContributor'] as string) ?? '').toLowerCase();
          vb = ((b.properties?.['dc:lastContributor'] as string) ?? '').toLowerCase();
        } else {
          va = String(this.getCellValue(a, key)).toLowerCase();
          vb = String(this.getCellValue(b, key)).toLowerCase();
        }
        return va < vb ? -mult : va > vb ? mult : 0;
      });
    }

    return docs;
  });

  toggleBrowseSort(colKey: string): void {
    if (this.browseSortKey() === colKey) {
      this.browseSortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.browseSortKey.set(colKey);
      this.browseSortDir.set('asc');
    }
  }

  // Subscription state
  readonly isSubscribed = computed(() => {
    const doc = this.currentDoc();
    const notifs = doc?.contextParameters?.['subscribedNotifications'] as string[] | undefined;
    return notifs && notifs.length > 0;
  });

  readonly breadcrumbs = computed<SatBreadcrumbsItem[]>(() => {
    const doc = this.currentDoc();
    const crumbs: SatBreadcrumbsItem[] = [{ label: 'Root', href: '/browse' }];
    if (!doc || doc.path === '/') return crumbs;
    const linkable = this.linkableBrowsePaths();
    const parts = doc.path.split('/').filter(Boolean);
    let accumulated = '';
    for (const part of parts) {
      accumulated += `/${part}`;
      const label = decodeURIComponent(part);
      const isCurrent = accumulated === doc.path;
      if (isCurrent) {
        crumbs.push({ label });
      } else if (linkable.has(accumulated)) {
        crumbs.push({ label, href: `/browse${accumulated}` });
      } else {
        crumbs.push({ label });
      }
    }
    return crumbs;
  });

  onBreadcrumbClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (href) {
      event.preventDefault();
      this.router.navigateByUrl(href);
    }
  }

  constructor() {
    const initialPath = this.parseBrowseNuxeoPath(this.router.url);
    this.currentNuxeoPath = initialPath;
    this.browsePath.set(initialPath);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.parseBrowseNuxeoPath(this.router.url)),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((nuxeoPath) => {
        this.resetBrowseTabState();
        this.currentNuxeoPath = nuxeoPath;
        this.browsePath.set(nuxeoPath);
        this.browsePath$.next(nuxeoPath);
      });

    this.browsePath$
      .pipe(
        switchMap((nuxeoPath) => {
          this.loading.set(true);
          this.error.set(null);
          return this.browseService.getBrowseFolderContents(nuxeoPath, 50).pipe(
            map((result) => ({ nuxeoPath, result })),
            catchError(() => of({ nuxeoPath, error: true as const })),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((payload) => {
        if (payload.nuxeoPath !== this.currentNuxeoPath) return;
        if ('error' in payload) {
          this.error.set('Failed to load folder contents.');
          this.loading.set(false);
          return;
        }
        const { folder, entries, totalSize, redirectTo } = payload.result;
        if (redirectTo) {
          this.loading.set(false);
          void this.router.navigateByUrl(`/browse${redirectTo}`, { replaceUrl: true });
          return;
        }
        this.linkableBrowsePaths.update((paths) => {
          const next = new Set(paths);
          next.add(folder.path);
          return next;
        });
        this.currentDoc.set(folder);
        this.entries.set(entries);
        this.totalSize.set(totalSize);
        this.loading.set(false);
        this.loadThumbnails(entries);
        if (folder.uid && folder.uid !== 'virtual-root') {
          this.loadActivity(folder.uid);
        }
      });

    this.browsePath$.next(initialPath);

    this.tagSearch$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) =>
          term.length > 0
            ? this.tagService.searchTags(term).pipe(catchError(() => of([])))
            : of([]),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((results) => {
        const existing = this.tags();
        const filtered = results.filter((r) => !existing.includes(r));
        this.tagSearchResults.set(filtered);
        const exactMatch = results.some((r) => r.toLowerCase() === this.tagInput.toLowerCase());
        this.showCreateOption.set(this.tagInput.trim().length > 0 && !exactMatch);
      });
  }

  // ── Content loading ──

  private resetBrowseTabState(): void {
    this.historyLoaded = false;
    this.trashLoaded = false;
    this.permissionsLoaded.set(false);
    this.permissionsLoading.set(false);
    this.activeTabIndex.set(0);
  }

  private parseBrowseNuxeoPath(routerUrl: string): string {
    const withoutQuery = routerUrl.split('?')[0];
    const path = (withoutQuery.includes('#') ? withoutQuery.split('#').pop() : withoutQuery) ?? '/';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const prefix = '/browse';
    if (normalized === prefix || normalized === `${prefix}/`) return '/';
    if (!normalized.startsWith(`${prefix}/`)) return '/';
    const remainder = normalized.slice(prefix.length);
    return remainder.replace(/\/+$/, '') || '/';
  }

  loadContent(): void {
    this.browsePath$.next(this.currentNuxeoPath);
  }

  private loadThumbnails(docs: NuxeoDocument[], reset = true): void {
    if (reset) this.thumbnailMap.set({});
    for (const doc of docs) {
      this.detailService
        .fetchThumbnail(doc.uid)
        .pipe(catchError(() => of(null)))
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          this.thumbnailMap.update((m) => ({
            ...m,
            [doc.uid]: this.sanitizer.bypassSecurityTrustUrl(url),
          }));
        });
    }
  }

  // ── Details side panel ──

  togglePanel(): void {
    this.panelOpen.update((v) => !v);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  switchPanelSubTab(tab: 'info' | 'tags' | 'activity'): void {
    this.panelSubTab.set(tab);
  }

  private loadActivity(uid: string): void {
    if (!this.currentDoc()) {
      this.activityLoading.set(false);
      return;
    }

    if (!canViewDocumentAuditLog(this.currentDoc())) {
      this.activityEntries.set([]);
      this.activityLoading.set(false);
      return;
    }

    this.activityLoading.set(true);
    this.detailService
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

  onTagSearch(term: string): void {
    this.tagSearch$.next(term);
  }

  selectTag(label: string): void {
    this.applyTag(label);
  }

  createTag(): void {
    const label = this.tagInput.trim();
    if (label) this.applyTag(label);
  }

  private applyTag(label: string): void {
    const doc = this.currentDoc();
    if (!doc) return;
    this.tagService.addTag(doc.uid, label).subscribe({
      next: () => {
        this.tagInput = '';
        this.tagSearchResults.set([]);
        this.showCreateOption.set(false);
        this.browseService.getByPath(this.currentNuxeoPath).subscribe({
          next: (d) => this.currentDoc.set(d),
        });
        this.snackBar.open(`Tag "${label}" added`, 'OK', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to add tag', 'OK', { duration: 3000 }),
    });
  }

  removeTag(label: string): void {
    const doc = this.currentDoc();
    if (!doc) return;
    this.tagService.removeTag(doc.uid, label).subscribe({
      next: () => {
        this.browseService.getByPath(this.currentNuxeoPath).subscribe({
          next: (d) => this.currentDoc.set(d),
        });
      },
      error: () => this.snackBar.open('Failed to remove tag', 'OK', { duration: 3000 }),
    });
  }

  // ── Tab changes ──

  onTabChange(index: number): void {
    this.activeTabIndex.set(index);
    if (index === 1) {
      this.loadPermissions();
    }
    if (index === 2 && !this.historyLoaded) {
      this.loadDirectoryEntries();
      this.loadAuditLog();
    }
    if (index === 3 && !this.trashLoaded) {
      this.loadTrash();
    }
  }

  // ── History tab ──

  private loadDirectoryEntries(): void {
    forkJoin([
      this.directoryService.getEventTypes(),
      this.directoryService.getEventCategories(),
    ]).subscribe({
      next: ([types, cats]) => {
        this.availableActions.set(types);
        this.availableCategories.set(cats);
        const typeMap: Record<string, string> = {};
        for (const t of types) typeMap[t.id] = t.label;
        this.eventTypeLabelMap.set(typeMap);
        const catMap: Record<string, string> = {};
        for (const c of cats) catMap[c.id] = c.label;
        this.eventCategoryLabelMap.set(catMap);
      },
    });
  }

  loadAuditLog(): void {
    const doc = this.currentDoc();
    if (!doc) return;

    if (!canViewDocumentAuditLog(doc)) {
      this.auditEntries.set([]);
      this.auditTotalSize.set(0);
      this.auditLoading.set(false);
      this.historyLoaded = true;
      return;
    }

    this.auditLoading.set(true);
    this.detailService
      .getAuditLog(doc.uid, this.auditPageSize(), this.auditPageIndex())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.auditEntries.set(res.entries);
          this.auditTotalSize.set(res.resultsCount ?? res.totalSize ?? res.entries.length);
          this.auditLoading.set(false);
          this.historyLoaded = true;
        },
        error: () => this.auditLoading.set(false),
      });
  }

  onAuditPageChange(event: PageEvent): void {
    this.auditPageSize.set(event.pageSize);
    this.auditPageIndex.set(event.pageIndex);
    this.loadAuditLog();
  }

  onAuditSort(sort: Sort): void {
    this.sortActive = sort.active;
    this.sortDirection = sort.direction;
  }

  eventLabel(eventId: string): string {
    return this.eventTypeLabelMap()[eventId] ?? eventId;
  }

  categoryLabel(category: string): string {
    return this.eventCategoryLabelMap()[category] ?? category;
  }

  avatarColor = avatarColor;

  // ── Trash tab ──

  private loadTrash(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    this.trashLoading.set(true);
    this.browseService.getTrashedChildren(doc.uid, 50).subscribe({
      next: (res) => {
        this.trashedDocs.set(res.entries);
        this.trashLoading.set(false);
        this.trashLoaded = true;
        this.loadThumbnails(res.entries, false);
      },
      error: () => this.trashLoading.set(false),
    });
  }

  restoreDocument(doc: NuxeoDocument): void {
    this.browseService.restoreDocument(doc.uid).subscribe({
      next: () => {
        this.snackBar.open(`"${doc.title}" restored`, 'OK', { duration: 3000 });
        this.loadTrash();
        this.loadContent();
      },
      error: () => this.snackBar.open('Failed to restore document', 'OK', { duration: 3000 }),
    });
  }

  // ── View toggle ──

  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode.set(mode);
  }

  // ── Column settings ──

  openColumnPanel(): void {
    this.pendingColumns.set(this.columns().map((c) => ({ ...c })));
    this.columnPanelOpen.set(true);
    queueMicrotask(() => this.columnPanel?.nativeElement.focus());
  }

  closeColumnPanel(): void {
    this.columnPanelOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.columnPanelOpen()) {
      this.closeColumnPanel();
    }
  }

  isPendingColumn(key: string): boolean {
    return this.pendingColumns().find((c) => c.key === key)?.visible ?? false;
  }

  togglePendingColumn(key: string): void {
    if (key === 'title') return;
    this.pendingColumns.update((cols) =>
      cols.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)),
    );
  }

  resetColumns(): void {
    this.pendingColumns.set(ALL_COLUMNS.map((c) => ({ ...c })));
  }

  applyColumns(): void {
    const updated = this.pendingColumns();
    this.columns.set(updated);
    saveColumnSettings(updated);
    this.columnPanelOpen.set(false);
  }

  // ── Filters ──

  clearFilters(): void {
    this.filterText.set('');
    this.filterType.set('');
    this.filterModifiedFrom.set(null);
    this.filterModifiedTo.set(null);
    this.filterContributor.set('');
  }

  // ── CSV export (server-side via Nuxeo Bulk Action) ──

  exportCsv(): void {
    const doc = this.currentDoc();
    if (!doc || this.csvExporting()) return;

    this.csvExporting.set(true);
    this.snackBar.open('Starting CSV export...', undefined, { duration: 2000 });

    this.browseService
      .startCsvExport(doc.uid)
      .pipe(switchMap((commandId) => this.browseService.pollAndDownloadCsv(commandId)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${doc.title ?? 'export'}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          this.csvExporting.set(false);
          this.snackBar.open('CSV exported successfully', 'OK', { duration: 3000 });
        },
        error: () => {
          this.csvExporting.set(false);
          this.snackBar.open('CSV export failed', 'OK', { duration: 3000 });
        },
      });
  }

  getCellValue(doc: NuxeoDocument, key: string): string {
    switch (key) {
      case 'title':
        return doc.title;
      case 'type':
        return doc.type;
      case 'modified':
        return doc.lastModified ? new Date(doc.lastModified).toLocaleDateString() : '';
      case 'lastContributor':
        return (doc.properties?.['dc:lastContributor'] as string) ?? '';
      case 'state':
        return (doc.properties?.['dc:nature'] as string) ?? '';
      case 'version': {
        const major = doc.properties?.['uid:major_version'];
        return major !== undefined && major !== null
          ? `${major}.${doc.properties?.['uid:minor_version'] ?? 0}`
          : '';
      }
      case 'created':
        return doc.properties?.['dc:created']
          ? new Date(doc.properties['dc:created'] as string).toLocaleDateString()
          : '';
      case 'author':
        return (doc.properties?.['dc:creator'] as string) ?? '';
      case 'nature':
        return (doc.properties?.['dc:nature'] as string) ?? '';
      case 'coverage':
        return (doc.properties?.['dc:coverage'] as string) ?? '';
      case 'subjects': {
        const s = doc.properties?.['dc:subjects'] as string[] | undefined;
        return s?.join(', ') ?? '';
      }
      default:
        return '';
    }
  }

  // ── Action toolbar ──

  openDriveDialog(): void {
    const doc = this.currentDoc();
    const data: BrowseDriveDialogData = {
      docUid: doc?.uid ?? '',
      docPath: doc?.path ?? '/',
    };
    this.dialog.open(BrowseDriveDialogComponent, { data });
  }

  private isBrowseFolderish(doc: NuxeoDocument | null | undefined): boolean {
    if (!doc) return false;
    return doc.type === 'Favorites' || isFolderishDocument(doc);
  }

  isCurrentFolderish(): boolean {
    return this.isBrowseFolderish(this.currentDoc());
  }

  openCreateImportDialog(): void {
    const doc = this.currentDoc();
    if (!doc || !this.isBrowseFolderish(doc)) {
      this.snackBar.open('Open a folder to create or import content.', 'OK', { duration: 4000 });
      return;
    }
    if (!canAddChildren(doc)) {
      this.snackBar.open(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
      return;
    }
    if (isDomainParentType(doc.type) || isRestrictedImportParentPath(doc.path)) {
      this.snackBar.open(DOMAIN_CONTAINER_GUIDANCE, 'OK', { duration: 6000 });
      return;
    }
    this.dialog
      .open(CreateImportDialogComponent, {
        width: '960px',
        height: '680px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        data: { parentPath: doc.path, parentTitle: doc.title },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result?.navigateToUid) {
          void this.router.navigate(['/doc', result.navigateToUid], {
            queryParams: { fresh: '1' },
            state: {
              freshBlobDocument: true,
              freshNote: result.freshNote === true,
            },
          });
          return;
        }
        if (result?.refreshed) this.loadContent();
      });
  }

  openEditDialog(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    if (!canWriteDocument(doc)) {
      this.snackBar.open(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
      return;
    }
    const data: EditMetadataDialogData = {
      uid: doc.uid,
      title: doc.title,
      description: (doc.properties?.['dc:description'] as string) ?? '',
      nature: (doc.properties?.['dc:nature'] as string) ?? '',
      subjects: (doc.properties?.['dc:subjects'] as string[]) ?? [],
      coverage: (doc.properties?.['dc:coverage'] as string) ?? '',
      expires: (doc.properties?.['dc:expired'] as string) ?? null,
    };
    const ref = this.dialog.open(EditMetadataDialogComponent, { data });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) this.loadContent();
      });
  }

  deleteDocument(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    if (!canRemoveDocument(doc)) {
      this.snackBar.open(PERMISSION_DENIED_MESSAGE, 'OK', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Move to Trash',
        message: `Move "${doc.title}" to trash?`,
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.detailService
          .trashDocument(doc.uid)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open('Moved to trash', 'OK', { duration: 3000 });
              void this.router.navigateByUrl('/browse');
            },
            error: () => this.snackBar.open('Failed to delete', 'OK', { duration: 3000 }),
          });
      });
  }

  downloadAll(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    this.detailService.exportZip(doc.uid, `${doc.title}.zip`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Download failed', 'OK', { duration: 3000 }),
    });
  }

  openShareDialog(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    this.dialog.open(ShareDialogComponent, {
      data: { title: doc.title, url: window.location.href } as ShareDialogData,
    });
  }

  toggleNotify(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    const action$ = this.isSubscribed()
      ? this.detailService.unsubscribe(doc.uid)
      : this.detailService.subscribe(doc.uid);
    action$.subscribe({
      next: () => {
        this.browseService.getByPath(this.currentNuxeoPath).subscribe({
          next: (d) => this.currentDoc.set(d),
        });
        this.snackBar.open(
          this.isSubscribed() ? 'Unsubscribed' : 'Subscribed to notifications',
          'OK',
          { duration: 3000 },
        );
      },
      error: () => this.snackBar.open('Failed to update notifications', 'OK', { duration: 3000 }),
    });
  }

  openExportDialog(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    this.dialog.open(ExportDialogComponent, {
      data: {
        documentUid: doc.uid,
        documentTitle: doc.title,
        exportFn: (type: ExportType, uid: string) => {
          switch (type) {
            case 'thumbnail':
              return this.detailService.fetchThumbnail(uid);
            case 'zip':
              return this.detailService.exportZip(uid);
            case 'xml':
              return this.detailService.exportXml(uid);
            default:
              return this.detailService.fetchThumbnail(uid);
          }
        },
      } as ExportDialogData,
    });
  }

  // ── Helpers ──

  /** Same predicate as create/import enablement: facet/type-based folderish, plus Favorites. */
  isFolderish(doc: NuxeoDocument): boolean {
    return this.isBrowseFolderish(doc);
  }

  docIcon(doc: NuxeoDocument): string {
    return docTypeIcon(doc.type);
  }

  lastContributor(doc: NuxeoDocument): string {
    return (doc.properties?.['dc:lastContributor'] as string) ?? '';
  }

  docCreator(doc: NuxeoDocument): string {
    return (doc.properties?.['dc:creator'] as string) ?? '';
  }

  docState(): string {
    const doc = this.currentDoc();
    return (doc?.properties?.['dc:nature'] as string) ?? 'Project';
  }

  isSelected(id: string): boolean {
    return this.selectionService.isSelected(id);
  }

  toggleSelection(id: string): void {
    const doc = this.filteredEntries().find((d) => d.uid === id);
    this.selectionService.toggle(id, doc?.title ?? id, this.thumbnailMap()[id] ?? null);
  }

  onRowClick(doc: NuxeoDocument): void {
    if (this.isFolderish(doc)) {
      void this.router.navigateByUrl(`/browse${doc.path}`);
    } else {
      void this.router.navigateByUrl(`/doc/${doc.uid}`);
    }
  }

  relativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (days >= 1) return days === 1 ? 'a day ago' : `${days} days ago`;
    if (hours >= 1) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
    return minutes <= 1 ? 'just now' : `${minutes} minutes ago`;
  }

  permissionIcon(permission: string): string {
    switch (permission) {
      case 'Everything':
        return 'admin_panel_settings';
      case 'ReadWrite':
        return 'edit';
      case 'Read':
        return 'visibility';
      case 'Write':
        return 'create';
      default:
        return 'lock';
    }
  }

  permissionLabel(permission: string): string {
    const labels: Record<string, string> = {
      Everything: 'Manage everything',
      ReadWrite: 'Edit',
      Read: 'Read',
      Write: 'Write',
      ReadRemove: 'Read & Remove',
      AddChildren: 'Add Children',
      Remove: 'Remove',
      ManageWorkflows: 'Manage Workflows',
      ReadCanCollect: 'Can collect',
    };
    return labels[permission] ?? permission;
  }

  aceTimeFrame(ace: NuxeoAce): string {
    if (!ace.begin && !ace.end) return 'Permanent';
    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    if (!ace.begin && ace.end) return `Until ${fmt(ace.end)}`;
    const parts: string[] = [];
    if (ace.begin) parts.push(`from ${fmt(ace.begin)}`);
    if (ace.end) parts.push(`to ${fmt(ace.end)}`);
    return parts.join(' ');
  }

  displayUsername(ace: NuxeoAce): string {
    return resolveAcePrincipal(ace.username).replace(/^transient\//, '');
  }

  aceGrantedBy(ace: NuxeoAce): string {
    const creator = ace.creator ? resolveAcePrincipal(ace.creator) : '';
    return creator || '—';
  }

  private loadPermissions(force = false): void {
    const doc = this.currentDoc();
    if (!doc || this.permissionsLoading()) return;
    if (this.permissionsLoaded() && !force) return;

    this.permissionsLoading.set(true);
    this.detailService
      .getDocumentPermissions(doc.uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.applyPermissionsDoc(updated);
          this.permissionsLoaded.set(true);
          this.permissionsLoading.set(false);
        },
        error: () => {
          this.permissionsLoading.set(false);
          this.snackBar.open('Failed to load permissions', 'OK', { duration: 4000 });
        },
      });
  }

  private applyPermissionsDoc(updated: NuxeoDocument): void {
    const existing = this.currentDoc();
    if (!existing) {
      this.currentDoc.set(updated);
      return;
    }
    this.currentDoc.set(mergeDocumentPermissionsContext(existing, updated));
  }

  private reloadPermissions(): void {
    this.loadPermissions(true);
  }

  addPermission(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    const dialogRef = this.dialog.open(AddPermissionDialogComponent, {
      data: { documentUid: doc.uid } satisfies AddPermissionDialogData,
      width: '560px',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((created: boolean | undefined) => {
        if (created) {
          this.reloadPermissions();
          this.snackBar.open('Permission added', 'OK', { duration: 3000 });
        }
      });
  }

  editPermission(ace: NuxeoAce): void {
    const doc = this.currentDoc();
    if (!doc) return;
    const dialogRef = this.dialog.open(UpdatePermissionDialogComponent, {
      data: { documentUid: doc.uid, ace } satisfies UpdatePermissionDialogData,
      width: '520px',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated: boolean | undefined) => {
        if (updated) {
          this.reloadPermissions();
          this.snackBar.open('Permission updated', 'OK', { duration: 3000 });
        }
      });
  }

  deletePermission(ace: NuxeoAce): void {
    const doc = this.currentDoc();
    if (!doc) return;
    const dialogRef = this.dialog.open(DeletePermissionDialogComponent, {
      data: {
        documentUid: doc.uid,
        ace,
        permissionLabel: this.permissionLabel(ace.permission),
        timeFrameLabel: this.aceTimeFrame(ace),
      } satisfies DeletePermissionDialogData,
      width: '560px',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((deleted: boolean | undefined) => {
        if (deleted) {
          this.reloadPermissions();
          this.snackBar.open('Permission deleted', 'OK', { duration: 3000 });
        }
      });
  }

  toggleInheritance(): void {
    const doc = this.currentDoc();
    if (!doc || this.actionInProgress()) return;
    this.actionInProgress.set('inheritance');
    const blocked = this.isInheritanceBlocked();
    const op = blocked
      ? this.detailService.unblockPermissionInheritance(doc.uid)
      : this.detailService.blockPermissionInheritance(doc.uid);
    op.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.reloadPermissions();
        this.snackBar.open(blocked ? 'Inheritance unblocked' : 'Inheritance blocked', 'OK', {
          duration: 3000,
        });
      },
      error: () => {
        this.actionInProgress.set(null);
        this.snackBar.open('Action failed', 'OK', { duration: 3000 });
      },
    });
  }

  shareWithExternal(): void {
    const doc = this.currentDoc();
    if (!doc) return;
    const dialogRef = this.dialog.open(ShareExternalDialogComponent, {
      data: { documentUid: doc.uid } satisfies ShareExternalDialogData,
      width: '520px',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((created: boolean | undefined) => {
        if (created) {
          this.reloadPermissions();
          this.snackBar.open('Shared with external user', 'OK', { duration: 3000 });
        }
      });
  }

  editExternalPermission(ace: NuxeoAce): void {
    const doc = this.currentDoc();
    if (!doc) return;
    const dialogRef = this.dialog.open(UpdatePermissionDialogComponent, {
      data: { documentUid: doc.uid, ace, isExternal: true } satisfies UpdatePermissionDialogData,
      width: '520px',
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated: boolean | undefined) => {
        if (updated) {
          this.reloadPermissions();
          this.snackBar.open('Permission updated', 'OK', { duration: 3000 });
        }
      });
  }

  sendNotificationEmail(ace: NuxeoAce): void {
    const doc = this.currentDoc();
    if (!doc || this.actionInProgress()) return;
    this.actionInProgress.set('notify-' + ace.id);
    this.detailService
      .sendNotificationEmailForPermission(doc.uid, ace.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionInProgress.set(null);
          this.snackBar.open('Notification email sent', 'OK', { duration: 3000 });
        },
        error: (err) => {
          this.actionInProgress.set(null);
          const message = isMailSendError(err)
            ? mailSendFailureMessage('send')
            : 'Failed to send notification';
          this.snackBar.open(message, 'OK', { duration: 7000 });
        },
      });
  }
}
