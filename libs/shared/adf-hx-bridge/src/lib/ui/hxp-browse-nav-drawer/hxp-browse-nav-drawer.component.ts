import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { HxpDocumentTreeComponent as UpstreamDocumentTreeComponent } from '@alfresco/adf-hx-content-services/ui';
import { DocumentTreeDatabaseService } from '@alfresco/adf-hx-content-services/services';
import { catchError, map, of } from 'rxjs';

import { normalizeNuxeoPath } from '@nuxeo-satori/platform/nuxeo-client';
import { ADF_HX_NUXEO_BRIDGE_PROVIDERS } from '../../providers/provide-adf-hx-nuxeo-bridge';
import { AdfHxBrowseContextService } from '../../services/adf-hx-browse-context.service';
import { AdfHxDocumentService } from '../../services/adf-hx-document.service';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpDocumentTreeToggleNameDirective } from '../hxp-document-tree-toggle-name/hxp-document-tree-toggle-name.directive';
import { HXP_HAS_SUBFOLDERS, ROOT_DOCUMENT } from '../../tokens/adf-hx-bridge.tokens';
import {
  hxTopLevelFolderPath,
  hxTreeBranchFromRoot,
  hxTreeNodeIsExpandable,
  hxTreeNodesToCollapse,
} from '../../utils/adf-hx-browse-tree.utils';
import { TranslatePipe } from '@ngx-translate/core';

const REPOSITORY_ROOT = ROOT_DOCUMENT as Document;

@Component({
  selector: 'hxp-browse-nav-drawer',
  standalone: true,
  templateUrl: './hxp-browse-nav-drawer.component.html',
  styleUrl: './hxp-browse-nav-drawer.component.scss',
  imports: [
    TranslatePipe,
    HxpIconComponent,
    UpstreamDocumentTreeComponent,
    HxpDocumentTreeToggleNameDirective,
  ],
  providers: [
    ...ADF_HX_NUXEO_BRIDGE_PROVIDERS,
    // `DocumentTreeDatabaseService` is upstream's tree data source and carries no
    // `providedIn`, so it has to be provided. It injects `DocumentService`, which the
    // application injector already supplies.
    DocumentTreeDatabaseService,
  ],
})
export class HxpBrowseNavDrawerComponent {
  private readonly browseContext = inject(AdfHxBrowseContextService);
  private readonly documentService = inject(AdfHxDocumentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tree = viewChild(UpstreamDocumentTreeComponent);

  readonly title = input('Browse');
  readonly navigatePath = output<string>();

  private readonly activePath = computed(() =>
    normalizeNuxeoPath(this.browseContext.contextPath()),
  );

  /**
   * The domain the tree is scoped to, or `null` at the repository root.
   *
   * Production browse's rule: at the root the tree lists every domain; inside one it shows only
   * that domain's branch, with a way back to the root.
   */
  private readonly scopePath = computed(() => hxTopLevelFolderPath(this.activePath()));
  protected readonly showRootBack = computed(() => this.scopePath() !== null);

  /** Upstream's tree walks down from here. */
  protected readonly treeRoot = signal<Document>(REPOSITORY_ROOT);

  /** The folder on screen, which upstream highlights. */
  protected readonly selected = signal<Document[]>([]);

  /** The folder on screen and every folder above it, root first. */
  private readonly activeChain = signal<Document[] | null>(null);

  /**
   * Upstream's tree reads `rootDocument` once, in `ngOnInit`, and has no reload. Changing this
   * key re-creates it, which is both how the scope changes and how Refresh reloads it.
   */
  protected readonly treeKey = computed(
    () => `${this.treeRoot().sys_id}#${this.browseContext.treeRefreshTick()}`,
  );

  private scopeRequestId = 0;
  private activeRequestId = 0;

  constructor() {
    effect(() => {
      const scope = this.scopePath();
      untracked(() => this.resolveScope(scope));
    });

    effect(() => {
      const active = this.activePath();
      untracked(() => this.resolveActive(active));
    });

    // Runs again whenever the tree is re-created or the location changes.
    effect(() => {
      const tree = this.tree();
      const chain = this.activeChain();
      if (!tree) return;
      untracked(() => {
        this.hideArrowsOnLeafFolders(tree);
        if (chain) this.openAlongActivePath(tree, chain);
      });
    });
  }

  /**
   * Upstream's tree emits the selected `Document`; ours emitted a path string.
   *
   * The path is taken from `sys_path` rather than resolved through the router service,
   * because the host also needs it to update `AdfHxBrowseContextService` — the tree and the
   * document list have to agree on where they are, and the context is what keeps them in
   * step.
   */
  protected onDocumentSelected(document: Document): void {
    this.onNavigate(document.sys_path ?? '/');
  }

  protected onNavigate(path: string): void {
    const normalized = normalizeNuxeoPath(path);
    this.browseContext.setFromNuxeoPath(normalized);
    this.navigatePath.emit(normalized);
  }

  protected navigateToRoot(): void {
    this.onNavigate('/');
  }

  /** Reloads the tree only. The document list has its own reload. */
  protected refreshTree(): void {
    this.browseContext.requestTreeRefresh();
  }

  private resolveScope(scope: string | null): void {
    const requestId = ++this.scopeRequestId;
    if (!scope) {
      this.treeRoot.set(REPOSITORY_ROOT);
      return;
    }
    this.documentService
      .getDocumentByPath(scope)
      .pipe(
        catchError(() => of(REPOSITORY_ROOT)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((domain) => {
        if (requestId === this.scopeRequestId && domain.sys_id !== this.treeRoot().sys_id) {
          this.treeRoot.set(domain);
        }
      });
  }

  private resolveActive(active: string): void {
    const requestId = ++this.activeRequestId;
    if (active === '/') {
      this.selected.set([REPOSITORY_ROOT]);
      this.activeChain.set([REPOSITORY_ROOT]);
      return;
    }
    this.documentService
      .getDocumentByPath(active)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (current) => {
          if (requestId !== this.activeRequestId) return;
          this.selected.set([current]);
          this.documentService
            .getAncestors(current.sys_id ?? '')
            .pipe(
              map((ancestors) => [...ancestors, current]),
              catchError(() => of([REPOSITORY_ROOT, current])),
              takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((chain) => {
              if (requestId === this.activeRequestId) this.activeChain.set(chain);
            });
        },
        error: () => {
          /* the tree stays as it was; the list reports the failed load */
        },
      });
  }

  /**
   * Opens the branch down to the folder on screen and closes the others, as production does.
   *
   * Upstream's own `[documents]` expansion walks the chain from the repository root and stops at
   * the first node it cannot find, so a tree scoped to a domain never opened past it.
   */
  private openAlongActivePath(tree: UpstreamDocumentTreeComponent, chain: Document[]): void {
    const control = tree.dataSource.treeControl;
    const states = (control.dataNodes ?? []).map((node) => ({
      node,
      path: node.document.sys_path ?? '/',
      level: node.level,
      expanded: control.isExpanded(node),
      skeleton: node.isSkeleton,
    }));
    for (const { node } of hxTreeNodesToCollapse(states, this.activePath())) {
      control.collapse(node);
    }
    tree.dataSource.openNodes(hxTreeBranchFromRoot(chain, this.treeRoot().sys_id));
  }

  /**
   * WORKAROUND(adf-hx): W18 — upstream decides expandability with `isFolder(child)`, so every
   * folder shows an arrow even when it holds only files, which browse does not list. Its own
   * comment says it should rely on whether the folder has children. The `QUERY` port marks tree
   * children with `HXP_HAS_SUBFOLDERS`, and this makes the data source honour it.
   *
   * The data source is provided by the tree component itself, so it cannot be substituted
   * through DI; `isExpandable` is private in its typings, hence `Reflect.set`. An unmarked folder
   * keeps upstream's answer.
   */
  private hideArrowsOnLeafFolders(tree: UpstreamDocumentTreeComponent): void {
    Reflect.set(tree.dataSource, 'isExpandable', (document: Document) =>
      hxTreeNodeIsExpandable(document, HXP_HAS_SUBFOLDERS),
    );
  }
}
