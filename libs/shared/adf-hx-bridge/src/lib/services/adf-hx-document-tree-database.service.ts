import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable, inject } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { BehaviorSubject, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  isRepositoryRootPath,
  normalizeNuxeoPath,
  nuxeoPathsEqualFlexible,
} from '@agentic-ui/shared/nuxeo-client';
import { isAncestorNuxeoPath, pathPrefixesBelowRoot } from '../utils/adf-hx-browse-tree.utils';
import { AdfHxDocumentService, isHxFolder } from './adf-hx-document.service';

export interface DocumentTreeNode {
  document: Document;
  level: number;
  isExpandable: boolean;
  isLoading?: boolean;
}

@Injectable()
export class AdfHxDocumentTreeDatabaseService implements DataSource<DocumentTreeNode> {
  private readonly documentService = inject(AdfHxDocumentService);

  private readonly getLevel = (node: DocumentTreeNode) => node.level;
  private readonly isExpandable = (node: DocumentTreeNode) => node.isExpandable;

  private readonly dataChange = new BehaviorSubject<DocumentTreeNode[]>([]);
  private readonly _treeControl = new FlatTreeControl<DocumentTreeNode>(
    this.getLevel,
    this.isExpandable,
  );
  private readonly destroy$ = new Subject<void>();
  private syncSubscription?: Subscription;
  private treeRootPath = '/';

  get treeControl(): FlatTreeControl<DocumentTreeNode> {
    return this._treeControl;
  }

  setDocumentTreeRoot(document: Document): void {
    this.treeRootPath = normalizeNuxeoPath(document.sys_path ?? '/');
    this._treeControl.dataNodes = [this.toNode(document, 0)];
    this.dataChange.next(this._treeControl.dataNodes);
  }

  bootstrap(rootDocument: Document): Observable<void> {
    this.syncSubscription?.unsubscribe();
    this.setDocumentTreeRoot(rootDocument);
    const rootNode = this._treeControl.dataNodes[0];
    if (!rootNode?.isExpandable) {
      return of(undefined);
    }
    return this.ensureNodeExpanded(rootNode).pipe(map(() => undefined));
  }

  syncToPath(treeRootPath: string, activePath: string): void {
    this.syncSubscription?.unsubscribe();
    this.treeRootPath = normalizeNuxeoPath(treeRootPath);
    const normalizedActive = normalizeNuxeoPath(activePath);
    this.syncSubscription = this.performSync(normalizedActive).subscribe();
  }

  connect(collectionViewer: CollectionViewer): Observable<DocumentTreeNode[]> {
    this._treeControl.expansionModel.changed.pipe(takeUntil(this.destroy$)).subscribe({
      next: (change: SelectionChange<DocumentTreeNode>) => {
        if (change.added?.length || change.removed?.length) {
          this.handleTreeControl(change);
        }
      },
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this._treeControl.dataNodes),
    );
  }

  disconnect(): void {
    this.syncSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  findNodeByPath(targetPath: string): DocumentTreeNode | undefined {
    const normalized = normalizeNuxeoPath(targetPath);
    return this._treeControl.dataNodes.find((node) =>
      nuxeoPathsEqualFlexible(node.document.sys_path ?? '/', normalized),
    );
  }

  getDirectChildNodes(node: DocumentTreeNode): DocumentTreeNode[] {
    const index = this._treeControl.dataNodes.indexOf(node);
    if (index < 0) {
      return [];
    }

    const children: DocumentTreeNode[] = [];
    for (let i = index + 1; i < this._treeControl.dataNodes.length; i += 1) {
      const current = this._treeControl.dataNodes[i];
      if (current.level <= node.level) {
        break;
      }
      if (current.level === node.level + 1) {
        children.push(current);
      }
    }
    return children;
  }

  private performSync(activePath: string): Observable<void> {
    const rootNode = this._treeControl.dataNodes[0];
    if (!rootNode) {
      return of(undefined);
    }

    if (isRepositoryRootPath(activePath) && this.treeRootPath === '/') {
      return this.ensureNodeExpanded(rootNode).pipe(
        tap(() => this.collapseDomainSubtrees(rootNode)),
        map(() => undefined),
      );
    }

    const prefixes = pathPrefixesBelowRoot(this.treeRootPath, activePath);
    if (prefixes.length === 0) {
      return of(undefined).pipe(tap(() => this.collapseSiblingsNotOnActivePath(activePath)));
    }

    return this.expandAlongPrefixes(prefixes, activePath).pipe(
      tap(() => this.collapseSiblingsNotOnActivePath(activePath)),
    );
  }

  private expandAlongPrefixes(prefixes: string[], activePath: string): Observable<void> {
    if (prefixes.length === 0) {
      return of(undefined);
    }

    const targetPath = normalizeNuxeoPath(prefixes[0]);
    const node = this.findNodeByPath(targetPath);
    if (!node) {
      return of(undefined);
    }

    return this.ensureNodeExpanded(node).pipe(
      switchMap(() => this.expandAlongPrefixes(prefixes.slice(1), activePath)),
    );
  }

  private ensureNodeExpanded(node: DocumentTreeNode): Observable<void> {
    return this.loadChildrenIfNeeded(node).pipe(
      tap(() => {
        if (node.isExpandable && !this._treeControl.isExpanded(node)) {
          this._treeControl.expand(node);
        }
      }),
      map(() => undefined),
    );
  }

  private loadChildrenIfNeeded(node: DocumentTreeNode): Observable<DocumentTreeNode[]> {
    if (!node.isExpandable) {
      return of([]);
    }

    if (this.hasLoadedChildren(node)) {
      return of(this.getDirectChildNodes(node));
    }

    if (node.isLoading) {
      return of([]);
    }

    node.isLoading = true;
    this.dataChange.next([...this._treeControl.dataNodes]);

    return this.documentService
      .getFolderChildren(node.document.sys_id ?? '', undefined, { limit: 50 })
      .pipe(
        map((result) => result.documents.filter((doc) => isHxFolder(doc))),
        catchError(() => of([] as Document[])),
        tap((children) => {
          const index = this._treeControl.dataNodes.indexOf(node);
          if (index < 0) {
            return;
          }
          const childNodes = children.map((child) => this.toNode(child, node.level + 1));
          this._treeControl.dataNodes.splice(index + 1, 0, ...childNodes);
          this.dataChange.next([...this._treeControl.dataNodes]);
        }),
        map(() => this.getDirectChildNodes(node)),
        finalize(() => {
          node.isLoading = false;
          this.dataChange.next([...this._treeControl.dataNodes]);
        }),
      );
  }

  private collapseDomainSubtrees(rootNode: DocumentTreeNode): void {
    for (const domainNode of this.getDirectChildNodes(rootNode)) {
      this.collapseNodeRecursively(domainNode);
    }
  }

  private collapseNodeRecursively(node: DocumentTreeNode): void {
    if (this._treeControl.isExpanded(node)) {
      this._treeControl.collapse(node);
    }
  }

  private collapseSiblingsNotOnActivePath(activePath: string): void {
    const normalized = normalizeNuxeoPath(activePath);
    for (const node of [...this._treeControl.dataNodes]) {
      if (!this._treeControl.isExpanded(node)) {
        continue;
      }
      const nodePath = normalizeNuxeoPath(node.document.sys_path ?? '/');
      const onPath =
        nuxeoPathsEqualFlexible(nodePath, normalized) || isAncestorNuxeoPath(nodePath, normalized);
      if (!onPath) {
        this._treeControl.collapse(node);
      }
    }
  }

  private hasLoadedChildren(node: DocumentTreeNode): boolean {
    const index = this._treeControl.dataNodes.indexOf(node);
    if (index < 0 || index + 1 >= this._treeControl.dataNodes.length) {
      return false;
    }
    return this._treeControl.dataNodes[index + 1].level > node.level;
  }

  private handleTreeControl(change: SelectionChange<DocumentTreeNode>): void {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  private toggleNode(node: DocumentTreeNode, expand: boolean): void {
    if (!expand) {
      const index = this._treeControl.dataNodes.indexOf(node);
      if (index < 0) {
        return;
      }
      let count = 0;
      for (let i = index + 1; i < this._treeControl.dataNodes.length; i += 1) {
        if (this._treeControl.dataNodes[i].level > node.level) {
          count += 1;
        } else {
          break;
        }
      }
      this._treeControl.dataNodes.splice(index + 1, count);
      this.dataChange.next(this._treeControl.dataNodes);
      return;
    }

    if (!node.isExpandable || node.isLoading || this.hasLoadedChildren(node)) {
      return;
    }

    this.loadChildrenIfNeeded(node).subscribe();
  }

  private toNode(document: Document, level: number): DocumentTreeNode {
    return {
      document,
      level,
      isExpandable: isHxFolder(document),
    };
  }
}
