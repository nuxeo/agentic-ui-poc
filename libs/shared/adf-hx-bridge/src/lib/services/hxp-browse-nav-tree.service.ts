import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  normalizeNuxeoPath,
  nuxeoPathsEqualFlexible,
  nuxeoPathSegments,
} from '@agentic-ui/shared/nuxeo-client';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import type { HxpBrowseFolderNode } from '../models/hxp-browse-folder-node';
import { ROOT_DOCUMENT, isHxRootDocument } from '../tokens/adf-hx-bridge.tokens';
import {
  cumulativeNuxeoPathPrefixes,
  hxDocPath,
  hxTopLevelFolderPath,
  isHxAncestorPath,
  isHxRepositoryRootPath,
} from '../utils/adf-hx-browse-tree.utils';
import { AdfHxBrowseContextService } from './adf-hx-browse-context.service';
import { AdfHxDocumentService, isHxFolder } from './adf-hx-document.service';

const NAV_TREE_PAGE_SIZE = 50;

@Injectable()
export class HxpBrowseNavTreeService {
  private readonly documentService = inject(AdfHxDocumentService);
  private readonly browseContext = inject(AdfHxBrowseContextService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rootNodes = signal<HxpBrowseFolderNode[]>([]);
  readonly rootLoading = signal(false);

  private pendingSyncPath: string | null = null;
  private loadGeneration = 0;
  private lastHandledRefreshTick = -1;

  readonly displayNodes = computed((): HxpBrowseFolderNode[] => {
    const roots = this.rootNodes();
    if (roots.length === 0) {
      return [];
    }

    const activePath = normalizeNuxeoPath(this.browseContext.contextPath());
    if (isHxRepositoryRootPath(activePath)) {
      return roots;
    }

    const domainPath = hxTopLevelFolderPath(activePath);
    if (!domainPath) {
      return roots;
    }

    const domainNode = roots[0].children.find((child) =>
      nuxeoPathsEqualFlexible(hxDocPath(child.doc), domainPath),
    );
    return domainNode ? [domainNode] : roots;
  });

  readonly showRootBack = computed(
    () =>
      !isHxRepositoryRootPath(normalizeNuxeoPath(this.browseContext.contextPath())) &&
      this.rootNodes().length > 0,
  );

  constructor() {
    effect(() => {
      const refreshTick = this.browseContext.treeRefreshTick();
      if (refreshTick > 0 && refreshTick !== this.lastHandledRefreshTick) {
        this.lastHandledRefreshTick = refreshTick;
        untracked(() => this.refresh());
      }
    });

    effect(() => {
      const contextPath = this.browseContext.contextPath();
      untracked(() => {
        if (this.rootNodes().length === 0 && !this.rootLoading()) {
          this.pendingSyncPath = contextPath;
          this.loadRootTree();
          return;
        }
        if (this.rootNodes().length > 0) {
          this.syncToPath(contextPath);
        }
      });
    });
  }

  loadRootTree(): void {
    const loadGen = ++this.loadGeneration;
    this.rootLoading.set(true);

    this.loadTreeChildren({ ...ROOT_DOCUMENT })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          if (loadGen !== this.loadGeneration) {
            return;
          }

          const rootNode: HxpBrowseFolderNode = {
            doc: { ...ROOT_DOCUMENT },
            children: [],
            expanded: true,
            loaded: true,
            loading: false,
            isRoot: true,
          };
          rootNode.children = this.toFolderNodes(entries);
          this.rootNodes.set([rootNode]);
          this.rootLoading.set(false);
          this.prefetchChildStatus(rootNode.children);

          const syncPath = this.pendingSyncPath ?? this.browseContext.contextPath();
          this.pendingSyncPath = null;
          this.syncToPath(syncPath);
        },
        error: () => {
          if (loadGen !== this.loadGeneration) {
            return;
          }
          this.rootLoading.set(false);
        },
      });
  }

  refresh(): void {
    this.pendingSyncPath = this.browseContext.contextPath();
    this.loadGeneration++;
    this.rootNodes.set([]);
    this.loadRootTree();
  }

  syncToPath(nuxeoPath: string): void {
    const normalized = normalizeNuxeoPath(nuxeoPath);
    const roots = this.rootNodes();
    if (roots.length === 0) {
      this.pendingSyncPath = normalized;
      return;
    }

    const rootNode = roots[0];
    rootNode.expanded = true;

    if (normalized === '/') {
      for (const child of rootNode.children) {
        this.collapseTreeNodes(child);
      }
      this.notifyTreeChanged();
      return;
    }

    this.collapseSiblingsNotOnActivePath(rootNode.children, normalized);

    const pathsToExpand = cumulativeNuxeoPathPrefixes(normalized);
    if (pathsToExpand.length === 0) {
      this.notifyTreeChanged();
      return;
    }

    this.expandAlongPrefixes(rootNode.children, pathsToExpand, 0, normalized);
  }

  toggleNode(node: HxpBrowseFolderNode): void {
    if (node.expanded) {
      node.expanded = false;
      this.notifyTreeChanged();
      return;
    }

    if (!node.loaded) {
      node.loading = true;
      this.notifyTreeChanged();

      this.loadTreeChildren(node.doc)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (entries) => {
            node.children = this.toFolderNodes(entries);
            node.loaded = true;
            node.loading = false;
            node.expanded = true;
            this.notifyTreeChanged();
            this.prefetchChildStatus(node.children);
          },
          error: () => {
            node.loading = false;
            node.loaded = true;
            node.children = [];
            this.notifyTreeChanged();
          },
        });
      return;
    }

    node.expanded = true;
    this.notifyTreeChanged();
  }

  resolveNavigatePath(node: HxpBrowseFolderNode): string {
    if (node.isRoot) {
      const soleChild = node.children.length === 1 ? node.children[0] : null;
      if (soleChild && !soleChild.isRoot) {
        return hxDocPath(soleChild.doc);
      }
      return '/';
    }
    return hxDocPath(node.doc);
  }

  isNodeActive(node: HxpBrowseFolderNode): boolean {
    const activePath = normalizeNuxeoPath(this.browseContext.contextPath());
    if (node.isRoot) {
      return isHxRepositoryRootPath(activePath);
    }

    const nodePath = hxDocPath(node.doc);
    if (nuxeoPathsEqualFlexible(nodePath, activePath)) {
      return true;
    }

    const activeSegments = nuxeoPathSegments(activePath);
    const nodeSegments = nuxeoPathSegments(nodePath);
    if (activeSegments.length <= nodeSegments.length) {
      return false;
    }

    if (!isHxAncestorPath(nodePath, activePath)) {
      return false;
    }

    if (!node.expanded || node.children.length === 0) {
      return true;
    }

    return !node.children.some((child) => this.isNodeOrAncestorOfActivePath(child, activeSegments));
  }

  nodeLabel(node: HxpBrowseFolderNode): string {
    if (node.isRoot) {
      return 'Root';
    }
    return node.doc.sys_title ?? node.doc.sys_name ?? 'Untitled';
  }

  hasChildren(node: HxpBrowseFolderNode): boolean {
    if (node.loading || !node.loaded) {
      return true;
    }
    if (node.children.length > 0) {
      return true;
    }
    return isHxFolder(node.doc) || isHxRootDocument(node.doc) || !!node.isRoot;
  }

  private loadTreeChildren(parent: Document) {
    const parentId = parent.sys_id ?? ROOT_DOCUMENT.sys_id;
    return this.documentService
      .getFolderChildren(parentId, undefined, { limit: NAV_TREE_PAGE_SIZE })
      .pipe(map((result) => result.documents.filter((doc) => isHxFolder(doc))));
  }

  private expandAlongPrefixes(
    nodes: HxpBrowseFolderNode[],
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
        this.pendingSyncPath = activePath;
        this.refresh();
      }
      this.finishTreeSync(activePath);
      return;
    }

    this.collapseSiblingsNotOnActivePath(nodes, activePath);

    const continueExpansion = () => {
      node.expanded = true;
      this.expandAlongPrefixes(node.children, prefixes, index + 1, activePath);
    };

    if (!node.loaded) {
      node.loading = true;
      this.notifyTreeChanged();

      this.loadTreeChildren(node.doc)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (entries) => {
            node.children = this.toFolderNodes(entries);
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

  private finishTreeSync(activePath: string): void {
    const roots = this.rootNodes();
    if (roots.length === 0) {
      this.notifyTreeChanged();
      return;
    }

    const domainPath = hxTopLevelFolderPath(activePath);
    if (domainPath) {
      const domainNode = this.findTreeNodeByPath(roots[0].children, domainPath);
      if (domainNode) {
        this.collapseDescendantsOffActivePath(domainNode, activePath);
      }
    }

    this.notifyTreeChanged();
  }

  private collapseDescendantsOffActivePath(node: HxpBrowseFolderNode, activePath: string): void {
    if (!node.expanded) {
      return;
    }

    for (const child of node.children) {
      const childPath = hxDocPath(child.doc);
      const isOnPath =
        nuxeoPathsEqualFlexible(childPath, activePath) || isHxAncestorPath(childPath, activePath);

      if (!isOnPath) {
        this.collapseTreeNodes(child);
      } else {
        this.collapseDescendantsOffActivePath(child, activePath);
      }
    }
  }

  private collapseSiblingsNotOnActivePath(nodes: HxpBrowseFolderNode[], activePath: string): void {
    for (const node of nodes) {
      const nodePath = hxDocPath(node.doc);
      const isOnPath =
        nuxeoPathsEqualFlexible(nodePath, activePath) || isHxAncestorPath(nodePath, activePath);
      if (!isOnPath) {
        this.collapseTreeNodes(node);
      }
    }
  }

  private collapseTreeNodes(node: HxpBrowseFolderNode): void {
    node.expanded = false;
    for (const child of node.children) {
      this.collapseTreeNodes(child);
    }
  }

  private findTreeNodeByPath(
    nodes: HxpBrowseFolderNode[],
    targetPath: string,
  ): HxpBrowseFolderNode | undefined {
    return nodes.find((node) => nuxeoPathsEqualFlexible(hxDocPath(node.doc), targetPath));
  }

  private isNodeOrAncestorOfActivePath(
    node: HxpBrowseFolderNode,
    activeSegments: string[],
  ): boolean {
    const nodeSegments = nuxeoPathSegments(hxDocPath(node.doc));
    if (nodeSegments.length > activeSegments.length) {
      return false;
    }
    return nodeSegments.every((segment, index) => segment === activeSegments[index]);
  }

  private prefetchChildStatus(nodes: HxpBrowseFolderNode[]): void {
    const unloaded = nodes.filter((node) => !node.loaded);
    if (unloaded.length === 0) {
      return;
    }

    const checks$ = unloaded.map((node) =>
      this.loadTreeChildren(node.doc).pipe(catchError(() => of([] as Document[]))),
    );

    forkJoin(checks$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        results.forEach((entries, index) => {
          const node = unloaded[index];
          node.loaded = true;
          node.children = this.toFolderNodes(entries);
        });
        this.notifyTreeChanged();
      });
  }

  private toFolderNodes(docs: Document[]): HxpBrowseFolderNode[] {
    return docs.map((doc) => ({
      doc,
      children: [],
      expanded: false,
      loaded: false,
      loading: false,
    }));
  }

  private notifyTreeChanged(): void {
    this.rootNodes.update((nodes) => [...nodes]);
  }
}
