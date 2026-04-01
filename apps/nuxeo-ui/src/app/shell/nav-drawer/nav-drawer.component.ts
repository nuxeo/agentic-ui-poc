import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, input, output, signal, effect, computed, DestroyRef } from '@angular/core';
import { NgTemplateOutlet, DatePipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NuxeoDocument, BrowseService, CollectionService, TaskService, NuxeoTask, CURRENT_USERNAME } from '@agentic-ui/shared/nuxeo-client';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../auth/auth.service';
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
  imports: [NgTemplateOutlet, DatePipe, MatListModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule, MatTooltipModule],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent {
  private readonly browseService = inject(BrowseService);
  private readonly collectionService = inject(CollectionService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly activeItem = input<AppNavItem | null>(null);
  readonly itemSelected = output<string>();
  readonly navigateKeepDrawer = output<string>();

  readonly rootNodes = signal<FolderNode[]>([]);
  readonly rootLoading = signal(false);

  readonly collections = signal<NuxeoDocument[]>([]);
  readonly collectionsLoading = signal(false);
  private collectionsLoaded = false;

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

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Auto-refresh nav task list when tasks are mutated elsewhere
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
      if (item?.path === '/tasks') {
        this.loadTasks();
      }
      if (item?.path === '/clipboard') {
        this.refreshClipboard();
      }
      if (item?.path === '/favorites') {
        this.loadFavorites();
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

  get isBrowse(): boolean {
    return this.activeItem()?.path === '/browse';
  }

  get isCollections(): boolean {
    return this.activeItem()?.path === '/collections';
  }

  get isClipboard(): boolean {
    return this.activeItem()?.path === '/clipboard';
  }

  get isFavorites(): boolean {
    return this.activeItem()?.path === '/favorites';
  }

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

  /* ─── Tasks panel ─── */

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

  taskLabel(task: NuxeoTask): string {
    const key = task.name
      .replace(/^wf\.\w+\./, '')
      .replace(/\.(title|directive)$/i, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  dueLabel(task: NuxeoTask): string {
    if (!task.dueDate) return '';
    const diff = new Date(task.dueDate).getTime() - Date.now();
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / 86_400_000);
    const hours = Math.floor(absDiff / 3_600_000);
    let label: string;
    if (days >= 1) label = days === 1 ? '1 day' : `${days} days`;
    else label = hours <= 1 ? 'less than an hour' : `${hours} hours`;
    return diff > 0 ? `Due in ${label}` : `${label} overdue`;
  }

  isOverdue(task: NuxeoTask): boolean {
    return !!task.dueDate && new Date(task.dueDate) < new Date();
  refreshClipboard(): void {
    const docs: { uid: string; title: string }[] =
      JSON.parse(localStorage.getItem('nuxeo_clipboard') ?? '[]');
    this.clipboardDocs.set(docs);
    this.loadThumbnailsForIds(docs.map((d) => d.uid));
  }

  private loadThumbnailsForIds(uids: string[]): void {
    for (const uid of uids) {
      if (this.thumbnailMap()[uid]) continue;
      this.detailService.fetchThumbnail(uid).pipe(
        catchError(() => of(null)),
      ).subscribe((blob) => {
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
      this.detailService.fetchThumbnail(doc.uid).pipe(
        catchError(() => of(null)),
      ).subscribe((blob) => {
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
