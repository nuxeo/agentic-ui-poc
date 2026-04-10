import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Component,
  inject,
  input,
  output,
  signal,
  effect,
  computed,
  DestroyRef,
  Type,
} from '@angular/core';
import { NgTemplateOutlet, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DynamicDrawerComponent } from './dynamic-drawer.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  NuxeoDocument,
  BrowseService,
  CollectionService,
  AssetService,
  AssetAggregationService,
  SearchService,
  SearchAggregationService,
  DocumentService,
  DocumentDetailService,
  TaskService,
  NuxeoTask,
  CURRENT_USERNAME,
  docTypeIcon,
  FOLDERISH_TYPES,
  type SearchQueryParams,
  type AssetAggregations,
} from '@agentic-ui/shared/nuxeo-client';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  AppNavItem,
  SETTINGS_DRAWER_ITEMS,
  ADMINISTRATION_DRAWER_ITEMS,
} from '../../platform-nav-items';

export interface FolderNode {
  doc: NuxeoDocument;
  children: FolderNode[];
  expanded: boolean;
  loaded: boolean;
  loading: boolean;
  isRoot?: boolean;
}

@Component({
  selector: 'app-nav-drawer',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    DatePipe,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    DynamicDrawerComponent,
  ],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent {
  private readonly browseService = inject(BrowseService);
  private readonly collectionService = inject(CollectionService);
  private readonly assetService = inject(AssetService);
  private readonly assetAggregationService = inject(AssetAggregationService);
  private readonly searchService = inject(SearchService);
  private readonly searchAggregationService = inject(SearchAggregationService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly docService = inject(DocumentService);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);

  readonly activeItem = input<AppNavItem | null>(null);
  readonly itemSelected = output<string>();
  readonly navigateKeepDrawer = output<string>();
  readonly signOutSelected = output<void>();
  readonly settingsItems = SETTINGS_DRAWER_ITEMS;
  readonly administrationItems = ADMINISTRATION_DRAWER_ITEMS;

  readonly rootNodes = signal<FolderNode[]>([]);
  readonly rootLoading = signal(false);

  readonly collections = signal<NuxeoDocument[]>([]);
  readonly collectionsLoading = signal(false);
  private collectionsLoaded = false;

  readonly assetsDrawerComponent = signal<Type<unknown> | null>(null);
  readonly searchFiltersDrawerComponent = signal<Type<unknown> | null>(null);
  readonly trashDrawerComponent = signal<Type<unknown> | null>(null);

  // Tasks
  private readonly taskService = inject(TaskService);
  private readonly currentUsername = inject(CURRENT_USERNAME);
  readonly tasks = signal<NuxeoTask[]>([]);
  readonly tasksLoading = signal(false);
  readonly tasksError = signal<string | null>(null);
  readonly clipboardDocs = signal<Array<{ uid: string; title: string }>>(
    JSON.parse(localStorage.getItem('nuxeo_clipboard') ?? '[]'),
  );
  readonly clipboardEmpty = computed(() => this.clipboardDocs().length === 0);

  readonly favorites = signal<NuxeoDocument[]>([]);
  readonly favoritesLoading = signal(false);
  readonly thumbnailMap = signal<Record<string, SafeUrl>>({});

  // Recently Viewed
  readonly recentlyViewed = signal<NuxeoDocument[]>([]);
  readonly recentlyViewedLoading = signal(false);
  readonly recentlyViewedError = signal<string | null>(null);
  private recentlyViewedLoaded = false;

  // Expired Queue
  readonly expiredDocs = signal<NuxeoDocument[]>([]);
  readonly expiredLoading = signal(false);
  readonly expiredError = signal<string | null>(null);
  private expiredLoaded = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Dynamically load drawer components to avoid static import of lazy-loaded libraries
    this.loadDrawerComponents();

    this.taskService.tasksChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTasks());

    effect(() => {
      const item = this.activeItem();
      if (item?.path === '/browse' && this.rootNodes().length === 0) {
        this.loadRootTree();
      }
      if (item?.path === '/collections' && !this.collectionsLoaded) {
        this.loadCollections();
      }
      if (item?.path === '/documents') {
        this.loadAssetAggregations();
      }
      if (item?.path === '/search') {
        this.loadSearchAggregations();
      }
      if (item?.path === '/tasks') {
        this.loadTasks();
      }
      if (item?.path === '/clipboard') {
        this.refreshClipboard();
      }
      if (item?.path === '/favorites') {
        this.loadFavorites();
      }
      if (item?.path === '/recently-viewed' && !this.recentlyViewedLoaded) {
        this.loadRecentlyViewed();
      }
      if (item?.path === '/expired-queue' && !this.expiredLoaded) {
        this.loadExpiredDocuments();
      }
    });

    const onClipboardChanged = () => this.refreshClipboard();
    window.addEventListener('clipboard-changed', onClipboardChanged);

    const onFavoritesChanged = () => this.loadFavorites();
    window.addEventListener('favorites-changed', onFavoritesChanged);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('clipboard-changed', onClipboardChanged);
      window.removeEventListener('favorites-changed', onFavoritesChanged);
    });
  }

  private loadSearchAggregations(): void {
    const filters = this.searchAggregationService.drawerFilters();
    const request: SearchQueryParams = {
      q: (filters['q'] ?? '').trim() || undefined,
      ecmFulltext: (filters['ecm_fulltext'] ?? '').trim() || undefined,
      modifiedDate: (filters['modifiedDate'] ?? '').trim() || undefined,
      author: (filters['author'] ?? '').trim() || undefined,
      collection: (filters['collection'] ?? '').trim() || undefined,
      tag: (filters['tag'] ?? '').trim() || undefined,
      nature: (filters['nature'] ?? '').trim() || undefined,
      subjects: (filters['subjects'] ?? '').trim() || undefined,
      coverage: (filters['coverage'] ?? '').trim() || undefined,
      size: (filters['size'] ?? '').trim() || undefined,
    };

    this.searchService.search(request).subscribe({
      next: (res) => {
        this.searchAggregationService.aggregations.set(res.aggregations);
        this.searchAggregationService.items.set(res.items);
      },
      error: () => {
        this.searchAggregationService.aggregations.set({});
        this.searchAggregationService.items.set([]);
      },
    });
  }

  private computeAssetAggregationsFromEntries(entries: NuxeoDocument[]): AssetAggregations {
    const aggregations: AssetAggregations = {};

    const typeMap = new Map<string, number>();
    const mimeMap = new Map<string, number>();

    for (const doc of entries) {
      typeMap.set(doc.type, (typeMap.get(doc.type) ?? 0) + 1);

      const fileContent = doc.properties['file:content'] as { 'mime-type'?: string } | null;
      const mime = fileContent?.['mime-type'];
      if (mime) {
        mimeMap.set(mime, (mimeMap.get(mime) ?? 0) + 1);
      }
    }

    if (typeMap.size > 0) {
      aggregations.system_primaryType_agg = {
        buckets: Array.from(typeMap.entries()).map(([key, docCount]) => ({ key, docCount })),
      };
    }

    if (mimeMap.size > 0) {
      aggregations.system_mimetype_agg = {
        buckets: Array.from(mimeMap.entries()).map(([key, docCount]) => ({ key, docCount })),
      };
    }

    return aggregations;
  }

  private loadAssetAggregations(): void {
    this.assetService.searchAssets({ pageSize: 200 }).subscribe({
      next: (res) => {
        const aggregations =
          res.aggregations ?? this.computeAssetAggregationsFromEntries(res.entries ?? []);
        this.assetAggregationService.aggregations.set(aggregations);
        this.assetAggregationService.items.set(
          (res.entries ?? []).map((entry) => ({
            id: entry.uid,
            title: entry.title,
            type: entry.type,
            icon: docTypeIcon(entry.type),
          })),
        );
      },
      error: () => {
        this.assetAggregationService.aggregations.set({});
        this.assetAggregationService.items.set([]);
      },
    });
  }

  private loadDrawerComponents(): void {
    Promise.all([
      import('@agentic-ui/feature-assets/assets-drawer').then((m) => m.AssetsDrawerComponent),
      import('@agentic-ui/feature-search').then((m) => m.SearchFiltersDrawerComponent),
      import('@agentic-ui/feature-trash').then((m) => m.TrashFiltersDrawerComponent),
    ])
      .then(([assetsComp, searchComp, trashComp]) => {
        this.assetsDrawerComponent.set(assetsComp);
        this.searchFiltersDrawerComponent.set(searchComp);
        this.trashDrawerComponent.set(trashComp);
      })
      .catch(() => {
        // Silently fail if components don't load
      });
  }

  get isBrowse(): boolean {
    return this.activeItem()?.path === '/browse';
  }

  get isCollections(): boolean {
    return this.activeItem()?.path === '/collections';
  }

  get isAssets(): boolean {
    return this.activeItem()?.path === '/documents';
  }

  get isSearchFilters(): boolean {
    return this.activeItem()?.path === '/search';
  }

  get isClipboard(): boolean {
    return this.activeItem()?.path === '/clipboard';
  }

  get isSettings(): boolean {
    return this.activeItem()?.path === '/settings';
  }

  get isAdministration(): boolean {
    return this.activeItem()?.path === '/administration';
  }

  get isFavorites(): boolean {
    return this.activeItem()?.path === '/favorites';
  }

  get isRecentlyViewed(): boolean {
    return this.activeItem()?.path === '/recently-viewed';
  }

  get isExpiredQueue(): boolean {
    return this.activeItem()?.path === '/expired-queue';
  }

  onSettingsSignOut(): void {
    this.signOutSelected.emit();
  }

  get isTrash(): boolean {
    return this.activeItem()?.path === '/trash';
  }

  // ── Expired Queue ──

  private loadExpiredDocuments(): void {
    this.expiredLoaded = true;
    this.expiredLoading.set(true);
    this.expiredError.set(null);

    this.docService.getExpiredDocuments(20).subscribe({
      next: (res) => {
        this.expiredDocs.set(res.entries);
        this.expiredLoading.set(false);
        this.loadThumbnails(res.entries);
      },
      error: () => {
        this.expiredError.set('Failed to load expired documents.');
        this.expiredLoading.set(false);
        this.expiredLoaded = false;
      },
    });
  }

  refreshExpired(): void {
    this.expiredLoaded = false;
    this.loadExpiredDocuments();
  }

  openExpiredDoc(doc: NuxeoDocument): void {
    this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
  }

  expiredDate(doc: NuxeoDocument): string {
    const expired = doc.properties?.['dc:expired'] as string;
    if (!expired) return '';
    return new Date(expired).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ── Recently Viewed ──

  private loadRecentlyViewed(): void {
    this.recentlyViewedLoaded = true;
    this.recentlyViewedLoading.set(true);
    this.recentlyViewedError.set(null);

    const userId = this.authService.username() ?? 'Administrator';
    this.docService.getRecentlyViewed(userId, 20).subscribe({
      next: (res) => {
        this.recentlyViewed.set(res.entries);
        this.recentlyViewedLoading.set(false);
        this.loadThumbnails(res.entries);
      },
      error: () => {
        this.recentlyViewedError.set('Failed to load recently viewed documents.');
        this.recentlyViewedLoading.set(false);
        this.recentlyViewedLoaded = false;
      },
    });
  }

  refreshRecentlyViewed(): void {
    this.recentlyViewedLoaded = false;
    this.loadRecentlyViewed();
  }

  openRecentlyViewedDoc(doc: NuxeoDocument): void {
    if (doc.type === 'Collection') {
      this.navigateKeepDrawer.emit(`/collections/${doc.uid}`);
      return;
    }

    if (FOLDERISH_TYPES.has(doc.type)) {
      this.navigateKeepDrawer.emit(`/browse${doc.path}`);
      return;
    }

    this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
  }

  docIcon(doc: NuxeoDocument): string {
    return docTypeIcon(doc.type);
  }

  relativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const absDiff = Math.abs(diff);
    const minutes = Math.floor(absDiff / 60_000);
    const hours = Math.floor(absDiff / 3_600_000);
    const days = Math.floor(absDiff / 86_400_000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let label: string;
    if (years >= 1) label = years === 1 ? 'a year' : `${years} years`;
    else if (months >= 1) label = months === 1 ? 'a month' : `${months} months`;
    else if (days >= 1) label = days === 1 ? 'a day' : `${days} days`;
    else if (hours >= 1) label = hours === 1 ? 'an hour' : `${hours} hours`;
    else label = minutes <= 1 ? 'just now' : `${minutes} minutes`;

    if (label === 'just now') return label;
    return diff > 0 ? `${label} ago` : `in ${label}`;
  }

  // ── Collections ──

  private loadCollections(): void {
    this.collectionsLoading.set(true);
    this.collectionService.getAll().subscribe({
      next: (res) => {
        this.collections.set(res.entries);
        this.collectionsLoading.set(false);
        this.collectionsLoaded = true;
        this.loadThumbnailsForIds(res.entries.map((d) => d.uid));
      },
      error: () => {
        this.collectionsLoading.set(false);
      },
    });
  }

  openCollection(col: NuxeoDocument): void {
    this.navigateKeepDrawer.emit(`/collections/${col.uid}`);
  }

  collectionOwner(doc: NuxeoDocument): string {
    return (doc.properties?.['dc:creator'] as string) ?? '';
  }

  collectionOwnerInitial(doc: NuxeoDocument): string {
    const owner = this.collectionOwner(doc);
    return owner ? owner.charAt(0).toUpperCase() : '?';
  }

  // ── Browse tree ──

  private loadRootTree(): void {
    this.rootLoading.set(true);

    this.browseService.getByPath('/').subscribe({
      next: (rootDoc) => {
        const rootNode: FolderNode = {
          doc: rootDoc,
          children: [],
          expanded: true,
          loaded: false,
          loading: true,
          isRoot: true,
        };
        this.rootNodes.set([rootNode]);
        this.rootLoading.set(false);

        this.browseService.getChildren('/', 50).subscribe({
          next: (res) => {
            const domainNodes = this.toFolderNodes(res.entries);
            rootNode.children = domainNodes;
            rootNode.loaded = true;
            rootNode.loading = false;

            const domainNode = domainNodes[0];
            if (domainNode) {
              domainNode.expanded = true;
              domainNode.loading = true;
              this.rootNodes.update((n) => [...n]);

              this.browseService.getChildren(domainNode.doc.path, 50).subscribe({
                next: (domainRes) => {
                  domainNode.children = this.toFolderNodes(domainRes.entries);
                  domainNode.loaded = true;
                  domainNode.loading = false;
                  this.rootNodes.update((n) => [...n]);
                  this.prefetchChildStatus(domainNode.children);
                },
                error: () => {
                  domainNode.loading = false;
                  domainNode.loaded = true;
                  this.rootNodes.update((n) => [...n]);
                },
              });
            } else {
              this.rootNodes.update((n) => [...n]);
            }
          },
          error: () => {
            rootNode.loading = false;
            this.rootNodes.update((n) => [...n]);
          },
        });
      },
      error: () => this.rootLoading.set(false),
    });
  }

  private toFolderNodes(entries: NuxeoDocument[]): FolderNode[] {
    return entries
      .filter((e) => FOLDERISH_TYPES.has(e.type))
      .map((doc) => ({
        doc,
        children: [],
        expanded: false,
        loaded: false,
        loading: false,
      }));
  }

  toggleNode(node: FolderNode): void {
    if (node.expanded) {
      node.expanded = false;
      this.rootNodes.update((nodes) => [...nodes]);
      return;
    }

    if (!node.loaded) {
      node.loading = true;
      this.rootNodes.update((nodes) => [...nodes]);

      this.browseService.getChildren(node.doc.path, 50).subscribe({
        next: (res) => {
          node.children = this.toFolderNodes(res.entries);
          node.loaded = true;
          node.loading = false;
          node.expanded = true;
          this.rootNodes.update((nodes) => [...nodes]);
          this.prefetchChildStatus(node.children);
        },
        error: () => {
          node.loading = false;
          this.rootNodes.update((nodes) => [...nodes]);
        },
      });
    } else {
      node.expanded = true;
      this.rootNodes.update((nodes) => [...nodes]);
    }
  }

  private prefetchChildStatus(nodes: FolderNode[]): void {
    const unloaded = nodes.filter((n) => !n.loaded);
    if (unloaded.length === 0) return;

    const checks$ = unloaded.map((n) =>
      this.browseService.getChildren(n.doc.path, 50).pipe(catchError(() => of(null))),
    );

    forkJoin(checks$).subscribe((results) => {
      results.forEach((res, i) => {
        const node = unloaded[i];
        if (res) {
          node.children = this.toFolderNodes(res.entries);
          node.loaded = true;
        }
      });
      this.rootNodes.update((n) => [...n]);
    });
  }

  navigateToFolder(node: FolderNode): void {
    if (node.isRoot) {
      this.itemSelected.emit('/browse');
      return;
    }
    const nuxeoPath = node.doc.path;
    this.itemSelected.emit(`/browse${nuxeoPath}`);
  }

  folderIcon(node: FolderNode): string {
    if (node.isRoot) return node.expanded ? 'folder_open' : 'folder';
    if (node.expanded) return 'folder_open';
    return 'folder';
  }

  nodeLabel(node: FolderNode): string {
    if (node.isRoot) return 'Root';
    return node.doc.title;
  }

  hasChildren(node: FolderNode): boolean {
    return !node.loaded || node.children.length > 0;
  }

  // ── Tasks panel ──

  get isTasksPanel(): boolean {
    return this.activeItem()?.path === '/tasks';
  }

  loadTasks(): void {
    this.tasksLoading.set(true);
    this.tasksError.set(null);
    const userId = this.currentUsername() ?? 'Administrator';
    this.taskService.getUserTasks(userId, 50).subscribe({
      next: (entries) => {
        this.tasks.set(entries);
        this.tasksLoading.set(false);
      },
      error: () => {
        this.tasksError.set('Failed to load tasks.');
        this.tasksLoading.set(false);
      },
    });
  }

  selectTask(task: NuxeoTask): void {
    this.itemSelected.emit('/tasks/' + task.id);
  }

  /** Highlights the row that matches the current /tasks/:taskId route. */
  isTaskSelected(task: NuxeoTask): boolean {
    const path = this.router.url.split('?')[0];
    const m = /^\/tasks\/([^/]+)/.exec(path);
    return m ? m[1] === task.id : false;
  }

  /** Title row: directive when present (e.g. "Consolidate Review"), else task name. */
  taskPrimaryTitle(task: NuxeoTask): string {
    if (task.directive) {
      const d = task.directive.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
      return d
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\./g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return this.taskLabel(task);
  }

  /** Relative due fragment only (pairs with the "Due"/"Overdue" prefix in the template). */
  dueRelativeOnly(task: NuxeoTask): string {
    if (!task.dueDate) return '';
    const diff = new Date(task.dueDate).getTime() - Date.now();
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / 86_400_000);
    const hours = Math.floor(absDiff / 3_600_000);
    let label: string;
    if (days >= 1) label = days === 1 ? '1 day' : `${days} days`;
    else label = hours <= 1 ? 'less than an hour' : `${hours} hours`;

    if (diff > 0) return `in ${label}`;
    return `by ${label}`;
  }

  /** Workflow as a single sentence-style line (e.g. "Parallel document review"). */
  taskWorkflowSentence(task: NuxeoTask): string {
    const raw = (task.workflowTitle || task.workflowModelName || '').trim();
    if (!raw) return '';
    const key = raw.replace(/^wf\.\w+\./, '');
    const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\./g, ' ');
    const lower = spaced.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  taskLabel(task: NuxeoTask): string {
    const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  isOverdue(task: NuxeoTask): boolean {
    return !!task.dueDate && new Date(task.dueDate) < new Date();
  }

  // ── Clipboard ──

  refreshClipboard(): void {
    const docs: { uid: string; title: string }[] = JSON.parse(
      localStorage.getItem('nuxeo_clipboard') ?? '[]',
    );
    this.clipboardDocs.set(docs);
    this.loadThumbnailsForIds(docs.map((d) => d.uid));
  }

  private loadThumbnailsForIds(uids: string[]): void {
    for (const uid of uids) {
      if (this.thumbnailMap()[uid]) continue;
      this.detailService
        .fetchThumbnail(uid)
        .pipe(catchError(() => of(null)))
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          this.thumbnailMap.update((m) => ({
            ...m,
            [uid]: this.sanitizer.bypassSecurityTrustUrl(url),
          }));
        });
    }
  }

  openClipboardDoc(doc: { uid: string; title: string }): void {
    this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
  }

  removeFromClipboard(doc: { uid: string; title: string }): void {
    const updated = this.clipboardDocs().filter((d) => d.uid !== doc.uid);
    this.clipboardDocs.set(updated);
    localStorage.setItem('nuxeo_clipboard', JSON.stringify(updated));
    window.dispatchEvent(new Event('clipboard-changed'));
  }

  clearClipboard(): void {
    this.clipboardDocs.set([]);
    localStorage.setItem('nuxeo_clipboard', JSON.stringify([]));
    window.dispatchEvent(new Event('clipboard-changed'));
  }

  // ── Favorites ──

  loadFavorites(): void {
    const user = this.authService.username();
    if (!user) return;
    this.favoritesLoading.set(true);
    this.collectionService.getFavorites(user, 50).subscribe({
      next: (res) => {
        this.favorites.set(res.entries);
        this.favoritesLoading.set(false);
        this.loadThumbnails(res.entries);
      },
      error: () => this.favoritesLoading.set(false),
    });
  }

  private loadThumbnails(docs: NuxeoDocument[]): void {
    for (const doc of docs) {
      if (this.thumbnailMap()[doc.uid]) continue;
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

  openFavoriteDoc(doc: NuxeoDocument): void {
    this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
  }

  removeFromFavorites(doc: NuxeoDocument): void {
    this.detailService.removeFromFavorites(doc.uid).subscribe({
      next: () => {
        this.favorites.update((list) => list.filter((d) => d.uid !== doc.uid));
        window.dispatchEvent(new Event('favorites-changed'));
      },
    });
  }

  favoriteContributor(doc: NuxeoDocument): string {
    return (doc.properties?.['dc:lastContributor'] as string) ?? '';
  }

  favoriteContributorInitial(doc: NuxeoDocument): string {
    const c = this.favoriteContributor(doc);
    return c ? c.charAt(0).toUpperCase() : '?';
  }
}
