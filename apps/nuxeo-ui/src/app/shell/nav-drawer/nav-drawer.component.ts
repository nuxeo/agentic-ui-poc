import { Component, inject, input, output, signal, effect, Type } from '@angular/core';
import { NgTemplateOutlet, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
} from '@agentic-ui/shared/nuxeo-client';
import type { SearchQueryParams } from '@agentic-ui/shared/nuxeo-client';
import type { AssetAggregations } from '@agentic-ui/shared/nuxeo-client';
import { AppNavItem } from '../../platform-nav-items';

export interface FolderNode {
  doc: NuxeoDocument;
  children: FolderNode[];
  expanded: boolean;
  loaded: boolean;
  loading: boolean;
  /** true for the synthetic "Root" node */
  isRoot?: boolean;
}

const FOLDERISH_TYPES = new Set([
  'Domain', 'Folder', 'OrderedFolder', 'Workspace',
  'WorkspaceRoot', 'SectionRoot', 'Section', 'TemplateRoot',
]);

@Component({
  selector: 'app-nav-drawer',
  standalone: true,
  imports: [NgTemplateOutlet, DatePipe, MatIconModule, MatProgressSpinnerModule, DynamicDrawerComponent],
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

  readonly activeItem = input<AppNavItem | null>(null);
  readonly itemSelected = output<string>();
  readonly navigateKeepDrawer = output<string>();
  readonly closeDrawer = output<void>();

  readonly rootNodes = signal<FolderNode[]>([]);
  readonly rootLoading = signal(false);

  readonly collections = signal<NuxeoDocument[]>([]);
  readonly collectionsLoading = signal(false);
  private collectionsLoaded = false;

  readonly assetsDrawerComponent = signal<Type<unknown> | null>(null);
  readonly searchFiltersDrawerComponent = signal<Type<unknown> | null>(null);

  constructor() {
    // Dynamically load drawer components to avoid static import of lazy-loaded libraries
    this.loadDrawerComponents();

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
    });
  }

  private loadSearchAggregations(): void {
    const filters = this.searchAggregationService.drawerFilters();
    const request: SearchQueryParams = {
      q: (filters['q'] ?? '').trim() || undefined,
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
        const aggregations = res.aggregations ?? this.computeAssetAggregationsFromEntries(res.entries ?? []);
        this.assetAggregationService.aggregations.set(aggregations);
      },
      error: () => {
        this.assetAggregationService.aggregations.set({});
      },
    });
  }

  private loadDrawerComponents(): void {
    Promise.all([
      import('@agentic-ui/feature-assets/assets-drawer').then((m) => m.AssetsDrawerComponent),
      import('@agentic-ui/feature-search').then((m) => m.SearchFiltersDrawerComponent),
    ]).then(([assetsComp, searchComp]) => {
      this.assetsDrawerComponent.set(assetsComp);
      this.searchFiltersDrawerComponent.set(searchComp);
    }).catch(() => {
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

  private loadCollections(): void {
    this.collectionsLoading.set(true);
    this.collectionService.getAll().subscribe({
      next: (res) => {
        this.collections.set(res.entries);
        this.collectionsLoading.set(false);
        this.collectionsLoaded = true;
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

  /**
   * Builds the tree starting from a synthetic Root node,
   * auto-expanding Root → Domain to match Nuxeo's native browse view.
   */
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

            // Auto-expand the first domain node and load its children
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

  /**
   * For each unloaded child, fetches its children (pageSize=1) to determine
   * whether it has sub-folders. Marks empty folders as loaded so the
   * expand arrow is hidden immediately.
   */
  private prefetchChildStatus(nodes: FolderNode[]): void {
    const unloaded = nodes.filter((n) => !n.loaded);
    if (unloaded.length === 0) return;

    const checks$ = unloaded.map((n) =>
      this.browseService.getChildren(n.doc.path, 50).pipe(
        catchError(() => of(null)),
      ),
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
}
