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
  untracked,
} from '@angular/core';
import { NgTemplateOutlet, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DynamicDrawerComponent } from './dynamic-drawer.component';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import {
  NuxeoDocument,
  BrowseService,
  BrowseContextService,
  ClipboardTargetService,
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
  isFolderishDocument,
  isBrowsableNavNode,
  isRepositoryRootPath,
  cumulativeNuxeoPathPrefixes,
  normalizeNuxeoPath,
  nuxeoPathsEqualFlexible,
  nuxeoPathSegments,
  toBrowseRouterUrl,
  topLevelNuxeoFolderPath,
  type SearchQueryParams,
  type AssetAggregations,
  canPasteClipboard,
  readClipboardDocs,
  writeClipboardDocs,
  type ClipboardDoc,
} from '@agentic-ui/shared/nuxeo-client';
import {
  HxpBrowseNavDrawerComponent,
  toAdfHxBrowseRouterUrl,
} from '@agentic-ui/shared/adf-hx-bridge';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  AppNavItem,
  SETTINGS_DRAWER_ITEMS,
  ADMINISTRATION_DRAWER_ITEMS,
  POWERUSER_ADMINISTRATION_DRAWER_ITEMS,
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
    MatSnackBarModule,
    DynamicDrawerComponent,
    HxpBrowseNavDrawerComponent,
  ],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent {
  private readonly browseService = inject(BrowseService);
  private readonly browseContext = inject(BrowseContextService);
  private readonly clipboardTargetService = inject(ClipboardTargetService);
  private readonly snackBar = inject(MatSnackBar);
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
  readonly administrationItems = computed(() =>
    this.authService.isAdministrator()
      ? ADMINISTRATION_DRAWER_ITEMS
      : POWERUSER_ADMINISTRATION_DRAWER_ITEMS,
  );

  readonly rootNodes = signal<FolderNode[]>([]);
  readonly rootLoading = signal(false);
  private pendingBrowseSyncPath: string | null = null;

  /** Web UI pattern: at repository root show all domains; inside a domain show only that branch. */
  readonly browseDisplayNodes = computed((): FolderNode[] => {
    const roots = this.rootNodes();
    if (roots.length === 0) return [];

    const activePath = normalizeNuxeoPath(this.browseContext.contextPath());
    if (isRepositoryRootPath(activePath)) {
      return roots;
    }

    const domainPath = topLevelNuxeoFolderPath(activePath);
    if (!domainPath) return roots;

    const domainNode = roots[0].children.find((child) =>
      nuxeoPathsEqualFlexible(child.doc.path, domainPath),
    );
    return domainNode ? [domainNode] : roots;
  });

  readonly browseTreeShowRootBack = computed(
    () =>
      !isRepositoryRootPath(normalizeNuxeoPath(this.browseContext.contextPath())) &&
      this.rootNodes().length > 0,
  );

  readonly personalSpaceNodes = signal<FolderNode[]>([]);
  readonly personalSpaceLoading = signal(false);
  readonly personalSpaceError = signal<string | null>(null);
  private personalSpaceLoaded = false;

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
  readonly clipboardDocs = signal<ClipboardDoc[]>(readClipboardDocs());
  readonly clipboardEmpty = computed(() => this.clipboardDocs().length === 0);
  readonly clipboardCanPaste = computed(() =>
    canPasteClipboard(this.clipboardDocs(), this.clipboardTargetService.target()),
  );
  readonly clipboardActionLoading = signal(false);

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
  /** Tracks which user the drawer caches belong to — cleared on sign-out or user switch. */
  private drawerSessionUser: string | null = null;
  private browseTreeLoadedForUser: string | null = null;
  /** Bumped on user switch / refresh so stale HTTP responses cannot overwrite the tree. */
  private browseTreeLoadGen = 0;

  constructor() {
    // Dynamically load drawer components to avoid static import of lazy-loaded libraries
    this.loadDrawerComponents();

    this.taskService.tasksChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTasks());

    effect(() => {
      const username = this.authService.username() ?? null;
      if (username !== this.drawerSessionUser) {
        this.clearUserScopedDrawerCaches();
        this.drawerSessionUser = username;
      }
    });

    effect(() => {
      const refreshTick = this.browseContext.treeRefreshTick();
      if (refreshTick > 0) {
        untracked(() => {
          this.browseTreeLoadedForUser = null;
          this.rootNodes.set([]);
          const item = this.activeItem();
          const username = this.authService.username();
          if (item?.path === '/browse' && username) {
            this.refreshBrowseTree();
          }
        });
      }
    });

    effect(() => {
      const item = this.activeItem();
      const contextPath = this.browseContext.contextPath();
      const username = this.authService.username();

      if (item?.path === '/browse' && username) {
        untracked(() => {
          const needsReload =
            this.browseTreeLoadedForUser !== username || this.rootNodes().length === 0;
          if (needsReload) {
            this.pendingBrowseSyncPath = contextPath;
            this.browseTreeLoadedForUser = username;
            this.loadRootTree();
            return;
          }
          this.syncBrowseTreeToPath(contextPath);
        });
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
      if (item?.path === '/personal-space' && !this.personalSpaceLoaded) {
        this.loadPersonalSpaceTree();
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

  get isBrowseAdfHx(): boolean {
    return this.activeItem()?.path === '/browse-adf-hx';
  }

  onAdfHxBrowseNavigate(nuxeoPath: string): void {
    this.navigateKeepDrawer.emit(toAdfHxBrowseRouterUrl(nuxeoPath));
  }

  get isPersonalSpace(): boolean {
    return this.activeItem()?.path === '/personal-space';
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

  isAdminDrawerPathActive(path: string): boolean {
    const url = this.router.url.split('?')[0];
    if (path === '/administration/users-groups') {
      return url === path || url.startsWith(`${path}/`);
    }
    return url === path;
  }

  onAdministrationItemClick(path: string): void {
    this.navigateKeepDrawer.emit(path);
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

    if (isFolderishDocument(doc)) {
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
    const loadGen = ++this.browseTreeLoadGen;
    const username = this.authService.username();
    this.rootLoading.set(true);

    this.browseService
      .getNavTreeBootstrap()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ root: rootDoc, entries }) => {
          if (loadGen !== this.browseTreeLoadGen || username !== this.authService.username()) {
            return;
          }
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

          const topNodes = this.toFolderNodes(entries);
          rootNode.children = topNodes;
          rootNode.loaded = true;
          rootNode.loading = false;
          this.rootNodes.update((n) => [...n]);
          this.prefetchChildStatus(topNodes);

          const syncPath = this.pendingBrowseSyncPath ?? this.browseContext.contextPath();
          this.pendingBrowseSyncPath = null;
          this.syncBrowseTreeToPath(syncPath);
        },
        error: () => {
          if (loadGen !== this.browseTreeLoadGen || username !== this.authService.username()) {
            return;
          }
          this.rootLoading.set(false);
        },
      });
  }

  refreshBrowseTree(): void {
    this.pendingBrowseSyncPath = this.browseContext.contextPath();
    this.browseTreeLoadGen++;
    this.browseTreeLoadedForUser = null;
    this.rootNodes.set([]);
    const username = this.authService.username();
    if (username) {
      this.browseTreeLoadedForUser = username;
    }
    this.loadRootTree();
  }

  isNodeActive(node: FolderNode): boolean {
    const activePath = normalizeNuxeoPath(this.browseContext.contextPath());
    if (node.isRoot) {
      return isRepositoryRootPath(activePath);
    }

    const nodePath = node.doc.path;
    if (nuxeoPathsEqualFlexible(nodePath, activePath)) {
      return true;
    }

    const activeSegments = nuxeoPathSegments(activePath);
    const nodeSegments = nuxeoPathSegments(nodePath);
    if (activeSegments.length <= nodeSegments.length) {
      return false;
    }

    const isAncestor = nodeSegments.every((segment, index) => segment === activeSegments[index]);
    if (!isAncestor) {
      return false;
    }

    if (!node.expanded || node.children.length === 0) {
      return true;
    }

    const hasVisibleDeeperMatch = node.children.some((child) =>
      this.isNodeOrAncestorOfActivePath(child, activeSegments),
    );
    return !hasVisibleDeeperMatch;
  }

  private isNodeOrAncestorOfActivePath(node: FolderNode, activeSegments: string[]): boolean {
    const nodeSegments = nuxeoPathSegments(node.doc.path);
    if (nodeSegments.length > activeSegments.length) {
      return false;
    }
    return nodeSegments.every((segment, index) => segment === activeSegments[index]);
  }

  private findTreeNodeByPath(nodes: FolderNode[], targetPath: string): FolderNode | undefined {
    return nodes.find((n) => nuxeoPathsEqualFlexible(n.doc.path, targetPath));
  }

  private syncBrowseTreeToPath(nuxeoPath: string): void {
    const normalized = normalizeNuxeoPath(nuxeoPath);
    const roots = this.rootNodes();
    if (roots.length === 0) {
      this.pendingBrowseSyncPath = normalized;
      return;
    }

    const rootNode = roots[0];
    rootNode.expanded = true;

    if (normalized === '/') {
      for (const child of rootNode.children) {
        this.collapseTreeNodes(child);
      }
      this.notifyActiveTreeChanged();
      return;
    }

    this.collapseSiblingsNotOnActivePath(rootNode.children, normalized);

    const pathsToExpand = cumulativeNuxeoPathPrefixes(normalized);
    if (pathsToExpand.length === 0) {
      this.notifyActiveTreeChanged();
      return;
    }

    this.expandAlongPrefixes(rootNode.children, pathsToExpand, 0, normalized);
  }

  navigateToBrowseRoot(): void {
    this.browseContext.setFromNuxeoPath('/');
    this.navigateKeepDrawer.emit('/browse');
  }

  private isAncestorOfActivePath(nodePath: string, activePath: string): boolean {
    const nodeSegments = nuxeoPathSegments(nodePath);
    const activeSegments = nuxeoPathSegments(activePath);
    if (nodeSegments.length >= activeSegments.length) {
      return false;
    }
    return nodeSegments.every((segment, index) => segment === activeSegments[index]);
  }

  private collapseSiblingsNotOnActivePath(nodes: FolderNode[], activePath: string): void {
    for (const node of nodes) {
      const nodePath = node.doc.path;
      const isOnPath =
        nuxeoPathsEqualFlexible(nodePath, activePath) ||
        this.isAncestorOfActivePath(nodePath, activePath);
      if (!isOnPath) {
        this.collapseTreeNodes(node);
      }
    }
  }

  private collapseTreeNodes(node: FolderNode): void {
    node.expanded = false;
    for (const child of node.children) {
      this.collapseTreeNodes(child);
    }
  }

  private expandAlongPrefixes(
    nodes: FolderNode[],
    prefixes: string[],
    index: number,
    activePath: string,
  ): void {
    if (index >= prefixes.length) {
      this.finishTreeSync(activePath);
      return;
    }

    const targetPath = normalizeNuxeoPath(prefixes[index]);
    const node = this.findTreeNodeByPath(nodes, targetPath);
    if (!node) {
      if (index === 0 && !this.rootLoading()) {
        this.pendingBrowseSyncPath = activePath;
        this.refreshBrowseTree();
        return;
      }
      this.finishTreeSync(activePath);
      return;
    }

    this.collapseSiblingsNotOnActivePath(nodes, activePath);

    const continueExpansion = () => {
      node.expanded = true;
      this.expandAlongPrefixes(node.children, prefixes, index + 1, activePath);
    };

    const needsChildLoad = !node.loaded;

    if (needsChildLoad) {
      node.loading = true;
      this.notifyActiveTreeChanged();

      this.browseService
        .getNavTreeChildren(node.doc)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            node.children = this.toFolderNodes(res.entries);
            node.loaded = true;
            node.loading = false;
            continueExpansion();
          },
          error: () => {
            node.loading = false;
            node.loaded = true;
            node.children = [];
            this.finishTreeSync(activePath);
          },
        });
      return;
    }

    continueExpansion();
  }

  /** Collapse nested folders that are deeper than the current browse location. */
  private finishTreeSync(activePath: string): void {
    const roots = this.rootNodes();
    if (roots.length === 0) {
      this.notifyActiveTreeChanged();
      return;
    }

    const domainPath = topLevelNuxeoFolderPath(activePath);
    if (domainPath) {
      const domainNode = this.findTreeNodeByPath(roots[0].children, domainPath);
      if (domainNode) {
        this.collapseDescendantsOffActivePath(domainNode, activePath);
      }
    }

    this.notifyActiveTreeChanged();
  }

  private collapseDescendantsOffActivePath(node: FolderNode, activePath: string): void {
    if (!node.expanded) {
      return;
    }

    for (const child of node.children) {
      const childPath = child.doc.path;
      const isOnPath =
        nuxeoPathsEqualFlexible(childPath, activePath) ||
        this.isAncestorOfActivePath(childPath, activePath);

      if (!isOnPath) {
        this.collapseTreeNodes(child);
      } else {
        this.collapseDescendantsOffActivePath(child, activePath);
      }
    }
  }

  private clearUserScopedDrawerCaches(): void {
    this.pendingBrowseSyncPath = null;
    this.browseTreeLoadGen++;
    this.browseTreeLoadedForUser = null;
    this.rootNodes.set([]);
    this.rootLoading.set(false);
    this.collectionsLoaded = false;
    this.collections.set([]);
    this.collectionsLoading.set(false);
    this.recentlyViewedLoaded = false;
    this.recentlyViewed.set([]);
    this.recentlyViewedLoading.set(false);
    this.recentlyViewedError.set(null);
    this.expiredLoaded = false;
    this.expiredDocs.set([]);
    this.expiredLoading.set(false);
    this.expiredError.set(null);
    this.personalSpaceLoaded = false;
    this.personalSpaceNodes.set([]);
    this.personalSpaceLoading.set(false);
    this.personalSpaceError.set(null);
    this.favorites.set([]);
    this.favoritesLoading.set(false);
    this.tasks.set([]);
    this.tasksLoading.set(false);
    this.tasksError.set(null);
  }

  refreshPersonalSpaceTree(): void {
    this.personalSpaceLoaded = false;
    this.loadPersonalSpaceTree();
  }

  private loadPersonalSpaceTree(): void {
    this.personalSpaceLoaded = true;
    this.personalSpaceLoading.set(true);
    this.personalSpaceError.set(null);

    this.browseService
      .getUserWorkspace()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (workspace) => {
          const rootNode: FolderNode = {
            doc: workspace,
            children: [],
            expanded: true,
            loaded: false,
            loading: true,
          };
          this.personalSpaceNodes.set([rootNode]);
          this.personalSpaceLoading.set(false);

          this.browseService
            .getNavTreeChildren(workspace)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res) => {
                rootNode.children = this.toFolderNodes(res.entries ?? []);
                rootNode.loaded = true;
                rootNode.loading = false;
                this.personalSpaceNodes.update((nodes) => [...nodes]);
                this.prefetchChildStatus(rootNode.children);
              },
              error: () => {
                rootNode.loading = false;
                rootNode.loaded = true;
                rootNode.children = [];
                this.personalSpaceNodes.update((nodes) => [...nodes]);
                this.personalSpaceError.set('Failed to load workspace folders.');
              },
            });
        },
        error: () => {
          this.personalSpaceError.set('Failed to load personal workspace.');
          this.personalSpaceLoading.set(false);
          this.personalSpaceLoaded = false;
        },
      });
  }

  private notifyActiveTreeChanged(): void {
    if (this.isPersonalSpace) {
      this.personalSpaceNodes.update((nodes) => [...nodes]);
    } else {
      this.rootNodes.update((nodes) => [...nodes]);
    }
  }

  private toFolderNodes(entries: NuxeoDocument[]): FolderNode[] {
    return (entries ?? [])
      .filter((e) => isBrowsableNavNode(e))
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
      this.notifyActiveTreeChanged();
      return;
    }

    if (!node.loaded) {
      node.loading = true;
      this.notifyActiveTreeChanged();

      this.browseService
        .getNavTreeChildren(node.doc)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            node.children = this.toFolderNodes(res.entries);
            node.loaded = true;
            node.loading = false;
            node.expanded = true;
            this.notifyActiveTreeChanged();
            this.prefetchChildStatus(node.children);
          },
          error: () => {
            node.loading = false;
            node.loaded = true;
            node.children = [];
            this.notifyActiveTreeChanged();
          },
        });
    } else {
      node.expanded = true;
      this.notifyActiveTreeChanged();
    }
  }

  private prefetchChildStatus(nodes: FolderNode[]): void {
    const unloaded = nodes.filter((n) => !n.loaded);
    if (unloaded.length === 0) return;

    const checks$ = unloaded.map((n) =>
      this.browseService.getNavTreeChildren(n.doc).pipe(catchError(() => of(null))),
    );

    forkJoin(checks$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        results.forEach((res, i) => {
          const node = unloaded[i];
          if (res) {
            node.loaded = true;
            node.children = this.toFolderNodes(res.entries ?? []);
          }
        });
        this.notifyActiveTreeChanged();
      });
  }

  navigateToFolder(node: FolderNode): void {
    if (node.isRoot) {
      const soleChild = node.children.length === 1 ? node.children[0] : null;
      if (soleChild && !soleChild.isRoot) {
        this.browseContext.setFromNuxeoPath(soleChild.doc.path);
        this.navigateKeepDrawer.emit(toBrowseRouterUrl(soleChild.doc.path));
        return;
      }
      this.browseContext.setFromNuxeoPath('/');
      this.navigateKeepDrawer.emit('/browse');
      return;
    }
    const nuxeoPath = node.doc.path;
    this.browseContext.setFromNuxeoPath(nuxeoPath);
    this.navigateKeepDrawer.emit(toBrowseRouterUrl(nuxeoPath));
  }

  nodeLabel(node: FolderNode): string {
    if (node.isRoot) return 'Root';
    return node.doc.title;
  }

  hasChildren(node: FolderNode): boolean {
    if (node.loading) {
      return true;
    }
    if (!node.loaded) {
      return true;
    }
    if (node.children.length > 0) {
      return true;
    }
    // Nuxeo Web UI keeps disclosure triangles on folderish nodes even when empty.
    return isFolderishDocument(node.doc) || !!node.isRoot;
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
    const docs = readClipboardDocs();
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

  openClipboardDoc(doc: ClipboardDoc): void {
    this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
  }

  removeFromClipboard(doc: ClipboardDoc): void {
    const updated = this.clipboardDocs().filter((d) => d.uid !== doc.uid);
    this.clipboardDocs.set(updated);
    writeClipboardDocs(updated);
    window.dispatchEvent(new Event('clipboard-changed'));
  }

  clearClipboard(): void {
    this.clipboardDocs.set([]);
    writeClipboardDocs([]);
    window.dispatchEvent(new Event('clipboard-changed'));
  }

  copyClipboard(): void {
    this.executeClipboardAction('copy');
  }

  moveClipboard(): void {
    this.executeClipboardAction('move');
  }

  private executeClipboardAction(action: 'copy' | 'move'): void {
    const target = this.clipboardTargetService.target();
    const uids = this.clipboardDocs().map((doc) => doc.uid);
    if (
      !target ||
      uids.length === 0 ||
      !this.clipboardCanPaste() ||
      this.clipboardActionLoading()
    ) {
      return;
    }

    this.clipboardActionLoading.set(true);
    const request$ =
      action === 'copy'
        ? this.browseService.copyDocuments(uids, target.uid)
        : this.browseService.moveDocuments(uids, target.uid);

    request$
      .pipe(
        finalize(() => this.clipboardActionLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (results) => {
          if (results.length === 0) {
            this.snackBar.open(
              action === 'copy'
                ? 'Failed to copy clipboard items.'
                : 'Failed to move clipboard items.',
              'Dismiss',
              { duration: 4000 },
            );
            return;
          }
          const count = results.length;
          this.clearClipboard();
          this.browseContext.notifyClipboardPasteComplete({
            targetUid: target.uid,
            documents: results,
            action,
          });
          this.browseContext.requestTreeRefresh();
          if (this.browseTreeLoadedForUser) {
            this.refreshBrowseTree();
          }
          const verb = action === 'copy' ? 'Copied' : 'Moved';
          this.snackBar.open(
            `${verb} ${count} item${count === 1 ? '' : 's'} to ${target.title ?? 'folder'}.`,
            'Dismiss',
            { duration: 4000 },
          );
        },
        error: () => {
          this.snackBar.open(
            action === 'copy'
              ? 'Failed to copy clipboard items.'
              : 'Failed to move clipboard items.',
            'Dismiss',
            { duration: 4000 },
          );
        },
      });
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
