import { Component, effect, inject, input, output, signal } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatTreeModule } from '@angular/material/tree';

import { NgClass } from '@angular/common';

import type { Document } from '@hylandsoftware/hxcs-js-client';

import {
  normalizeNuxeoPath,
  nuxeoPathsEqualFlexible,
  nuxeoPathSegments,
} from '@agentic-ui/shared/nuxeo-client';

import { finalize, Observable, of, switchMap } from 'rxjs';

import {
  AdfHxDocumentTreeDatabaseService,
  type DocumentTreeNode,
} from '../../services/adf-hx-document-tree-database.service';

import { AdfHxDocumentService, isHxFolder } from '../../services/adf-hx-document.service';

import { NuxeoDocumentRouterService } from '../../services/nuxeo-document-router.service';

import { adfHxBrowseTreeScopeKey, isAncestorNuxeoPath } from '../../utils/adf-hx-browse-tree.utils';

@Component({
  selector: 'hxp-document-tree',

  standalone: true,

  templateUrl: './hxp-document-tree.component.html',

  styleUrl: './hxp-document-tree.component.scss',

  imports: [MatTreeModule, MatIconModule, MatProgressSpinnerModule, NgClass],

  providers: [AdfHxDocumentTreeDatabaseService],

  host: {
    class: 'hxp-document-tree',

    '[class.hxp-document-tree--nav]': 'variant() === "nav"',
  },
})
export class HxpDocumentTreeComponent {
  private readonly database = inject(AdfHxDocumentTreeDatabaseService);

  private readonly documentService = inject(AdfHxDocumentService);

  private readonly router = inject(NuxeoDocumentRouterService);

  readonly rootDocument = input.required<Document>();

  readonly activePath = input('/');

  readonly navigateOnSelect = input(true);

  readonly variant = input<'default' | 'nav'>('default');

  readonly treeRefreshTick = input(0);

  readonly folderSelected = output<Document>();

  protected readonly bootstrapping = signal(false);

  readonly treeControl = this.database.treeControl;

  readonly dataSource = this.database;

  private bootstrapGeneration = 0;

  private lastScopeKey = '';

  private lastRefreshTick = -1;

  constructor() {
    effect(() => {
      const path = normalizeNuxeoPath(this.activePath());

      const refreshTick = this.treeRefreshTick();

      const scopeKey = adfHxBrowseTreeScopeKey(path);

      const forceBootstrap = refreshTick !== this.lastRefreshTick || scopeKey !== this.lastScopeKey;

      if (forceBootstrap) {
        this.lastRefreshTick = refreshTick;

        this.lastScopeKey = scopeKey;

        this.rebuildTree(path, scopeKey);
      } else {
        this.syncTreeToPath(path, scopeKey);
      }
    });
  }

  hasChild = (_: number, node: DocumentTreeNode) => node.isExpandable;

  onNodeClick(node: DocumentTreeNode, event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button[matTreeNodeToggle]')) {
      return;
    }

    this.folderSelected.emit(node.document);

    if (this.navigateOnSelect()) {
      this.router.navigateTo(node.document);
    }
  }

  isNodeActive(node: DocumentTreeNode): boolean {
    const active = normalizeNuxeoPath(this.activePath());

    const nodePath = normalizeNuxeoPath(node.document.sys_path ?? '/');

    if (nuxeoPathsEqualFlexible(nodePath, active)) {
      return true;
    }

    const activeSegments = nuxeoPathSegments(active);

    const nodeSegments = nuxeoPathSegments(nodePath);

    if (activeSegments.length <= nodeSegments.length) {
      return false;
    }

    if (!isAncestorNuxeoPath(nodePath, active)) {
      return false;
    }

    if (!this.treeControl.isExpanded(node)) {
      return true;
    }

    const children = this.database.getDirectChildNodes(node);

    if (children.length === 0) {
      return true;
    }

    return !children.some((child) => this.isNodeOrAncestorOfActivePath(child, activeSegments));
  }

  nodeLabel(node: DocumentTreeNode): string {
    return node.document.sys_title ?? node.document.sys_name ?? 'Untitled';
  }

  iconFor(document: Document): string {
    return isHxFolder(document) ? 'folder' : 'description';
  }

  private rebuildTree(path: string, scopeKey: string): void {
    const generation = ++this.bootstrapGeneration;

    this.bootstrapping.set(true);

    this.resolveTreeRootDocument(scopeKey)

      .pipe(
        switchMap((rootDoc) => this.database.bootstrap(rootDoc)),

        finalize(() => {
          if (generation === this.bootstrapGeneration) {
            this.bootstrapping.set(false);
          }
        }),
      )

      .subscribe({
        next: () => {
          if (generation !== this.bootstrapGeneration) {
            return;
          }

          this.syncTreeToPath(path, scopeKey);
        },
      });
  }

  private syncTreeToPath(path: string, scopeKey: string): void {
    const rootPath = scopeKey === '/' ? '/' : scopeKey;

    this.database.syncToPath(rootPath, path);
  }

  private resolveTreeRootDocument(scopeKey: string): Observable<Document> {
    if (scopeKey === '/') {
      return of(this.rootDocument());
    }

    return this.documentService.getDocumentByPath(scopeKey);
  }

  private isNodeOrAncestorOfActivePath(node: DocumentTreeNode, activeSegments: string[]): boolean {
    const nodeSegments = nuxeoPathSegments(node.document.sys_path ?? '/');

    if (nodeSegments.length > activeSegments.length) {
      return false;
    }

    return nodeSegments.every((segment, index) => segment === activeSegments[index]);
  }
}
