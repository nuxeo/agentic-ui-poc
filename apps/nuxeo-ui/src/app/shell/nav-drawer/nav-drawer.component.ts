import { Component, inject, input, output, signal, effect } from '@angular/core';
import { NgTemplateOutlet, DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NuxeoDocument, BrowseService, CollectionService } from '@agentic-ui/shared/nuxeo-client';
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
  imports: [NgTemplateOutlet, DatePipe, MatListModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent {
  private readonly browseService = inject(BrowseService);
  private readonly collectionService = inject(CollectionService);

  readonly activeItem = input<AppNavItem | null>(null);
  readonly itemSelected = output<string>();
  readonly navigateKeepDrawer = output<string>();

  readonly rootNodes = signal<FolderNode[]>([]);
  readonly rootLoading = signal(false);

  readonly collections = signal<NuxeoDocument[]>([]);
  readonly collectionsLoading = signal(false);
  private collectionsLoaded = false;

  constructor() {
    effect(() => {
      const item = this.activeItem();
      if (item?.path === '/browse' && this.rootNodes().length === 0) {
        this.loadRootTree();
      }
      if (item?.path === '/collections' && !this.collectionsLoaded) {
        this.loadCollections();
      }
    });
  }

  get isBrowse(): boolean {
    return this.activeItem()?.path === '/browse';
  }

  get isCollections(): boolean {
    return this.activeItem()?.path === '/collections';
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
