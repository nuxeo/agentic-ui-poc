import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, filter, finalize, forkJoin, of, switchMap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import {
  SatPlatformNavModule,
  SatPlatformNavStateService,
} from '@hylandsoftware/satori-ui/platform-nav';
import {
  CollectionService,
  DocumentDetailService,
  NuxeoDocument,
  SearchService,
  SelectionService,
  type GlobalSearchSuggestion,
} from '@agentic-ui/shared/nuxeo-client';
import { SelectionTopbarComponent } from '@agentic-ui/shared/ui';
import {
  AddToCollectionDialogComponent,
  PublishDialogComponent,
  type PublishDialogData,
} from '@agentic-ui/feature-document-detail';

import { AuthService } from '../auth/auth.service';
import { AppNavItem, PLATFORM_NAV_ITEMS, SETTINGS_DRAWER_ITEMS } from '../platform-nav-items';
import { NavDrawerComponent } from './nav-drawer/nav-drawer.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    SatPlatformNavModule,
    SatAppHeaderModule,
    SatLogoModule,
    MatDialogModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSidenavModule,
    NavDrawerComponent,
    SelectionTopbarComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  @ViewChild('globalSearchContainer')
  private globalSearchContainer?: ElementRef<HTMLElement>;

  private readonly settingsDrawerItem: AppNavItem = {
    label: 'Settings',
    path: '/settings',
    icon: 'settings',
    hasDrawer: true,
  };

  private readonly router = inject(Router);
  private readonly platformNavState = inject(SatPlatformNavStateService);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  readonly selectionService = inject(SelectionService);
  private readonly collectionService = inject(CollectionService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly searchService = inject(SearchService);
  private readonly searchInput$ = new Subject<string>();

  /** Hides Administration for non-administrators. */
  protected readonly navItems = computed(() => {
    if (!this.auth.isAdministrator()) {
      return PLATFORM_NAV_ITEMS.filter((i) => i.path !== '/administration');
    }
    return PLATFORM_NAV_ITEMS;
  });

  readonly displayName = computed(() => this.auth.username() ?? 'User');
  readonly drawerOpen = signal(false);
  readonly activeDrawerItem = signal<AppNavItem | null>(null);
  readonly clipboardCount = signal(this.readClipboardCount());
  readonly favoritesCount = signal(0);
  readonly globalSearchTerm = signal('');
  readonly globalSearchLoading = signal(false);
  readonly globalSearchError = signal<string | null>(null);
  readonly globalSearchResults = signal<GlobalSearchSuggestion[]>([]);
  readonly globalSearchOpen = signal(false);

  readonly highlightedSearchTerm = computed(() => this.globalSearchTerm().trim());

  private readonly currentUrl = signal(this.router.url.split('?')[0]);

  readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    const parts = url.split('/').filter(Boolean);
    if (parts[0] === 'administration') {
      const seg = parts[1] ?? 'analytics';
      if (seg === 'users-groups' && parts[2] === 'user' && parts[3]) {
        return `User: ${parts[3]}`;
      }
      if (seg === 'users-groups' && parts[2] === 'group' && parts[3]) {
        return `Group: ${parts[3]}`;
      }
      const titles: Record<string, string> = {
        analytics: 'Analytics',
        'users-groups': 'Users & Groups',
        vocabularies: 'Vocabularies',
        audit: 'Audit',
        'cloud-services': 'Cloud Services',
        'nxql-search': 'NXQL Search',
      };
      return titles[seg] ?? 'Administration';
    }
    const match = [...PLATFORM_NAV_ITEMS, ...SETTINGS_DRAWER_ITEMS].find(
      (item) => url === item.path || url.startsWith(item.path + '/'),
    );
    return match?.label ?? 'Hyland Nuxeo';
  });

  private storageListener = (e: StorageEvent) => {
    if (e.key === 'nuxeo_clipboard') {
      this.clipboardCount.set(this.readClipboardCount());
    }
  };

  constructor() {
    if (!this.platformNavState.collapsed()) {
      this.platformNavState.toggleCollapsed();
    }

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        const nextPath = e.urlAfterRedirects.split('?')[0];
        const previousPath = this.currentUrl();
        if (previousPath !== nextPath) {
          this.selectionService.clear();
        }
        this.currentUrl.set(nextPath);
        this.refreshClipboardCount();
        this.clearGlobalSearch();
      });

    window.addEventListener('storage', this.storageListener);
    window.addEventListener('clipboard-changed', () => this.refreshClipboardCount());
    window.addEventListener('favorites-changed', () => this.refreshFavoritesCount());
    this.refreshFavoritesCount();

    this.searchInput$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((value) => {
          const term = value.trim();
          if (term.length < 2) {
            this.globalSearchLoading.set(false);
            this.globalSearchError.set(null);
            return of<GlobalSearchSuggestion[]>([]);
          }

          this.globalSearchLoading.set(true);
          this.globalSearchError.set(null);

          return this.searchService.suggestFromSuggestersLauncher(term).pipe(
            finalize(() => this.globalSearchLoading.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((results) => {
        this.globalSearchResults.set(results);
        this.globalSearchOpen.set(this.globalSearchTerm().trim().length >= 2);
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const searchContainer = this.globalSearchContainer?.nativeElement;
    const clickPath = event.composedPath?.() ?? [];
    if (
      searchContainer &&
      (clickPath.includes(searchContainer) || searchContainer.contains(event.target as Node))
    ) {
      return;
    }
    this.globalSearchOpen.set(false);
  }

  private readClipboardCount(): number {
    try {
      const items = JSON.parse(localStorage.getItem('nuxeo_clipboard') ?? '[]');
      return Array.isArray(items) ? items.length : 0;
    } catch {
      return 0;
    }
  }

  isActive(path: string): boolean {
    const activeDrawer = this.activeDrawerItem();
    if (activeDrawer && this.drawerOpen()) {
      return activeDrawer.path === path;
    }
    const url = this.router.url.split('?')[0];
    return url === path || url.startsWith(path + '/');
  }

  onNavClick(item: AppNavItem, event: Event): void {
    this.refreshClipboardCount();
    this.clearGlobalSearch();

    if (!this.platformNavState.collapsed()) {
      this.platformNavState.toggleCollapsed();
    }

    if (item.hasDrawer) {
      event.preventDefault();
      event.stopPropagation();

      if (this.activeDrawerItem()?.path === item.path && this.drawerOpen()) {
        this.drawerOpen.set(false);
        this.activeDrawerItem.set(null);
      } else {
        this.activeDrawerItem.set(item);
        this.drawerOpen.set(true);
      }
    } else {
      this.drawerOpen.set(false);
      this.activeDrawerItem.set(null);
      void this.router.navigateByUrl(item.path);
    }
  }

  onDrawerItemSelected(path: string): void {
    this.drawerOpen.set(false);
    this.activeDrawerItem.set(null);
    this.clearGlobalSearch();
    void this.router.navigateByUrl(path);
  }

  toggleSettingsDrawer(): void {
    if (this.activeDrawerItem()?.path === this.settingsDrawerItem.path && this.drawerOpen()) {
      this.drawerOpen.set(false);
      this.activeDrawerItem.set(null);
      return;
    }

    if (!this.platformNavState.collapsed()) {
      this.platformNavState.toggleCollapsed();
    }

    this.activeDrawerItem.set(this.settingsDrawerItem);
    this.drawerOpen.set(true);
  }

  onNavigateKeepDrawer(path: string): void {
    this.clearGlobalSearch();
    void this.router.navigateByUrl(path);
  }

  onDrawerClose(): void {
    this.drawerOpen.set(false);
    this.activeDrawerItem.set(null);
    this.refreshClipboardCount();
  }

  onDeleteSelected(): void {
    const count = this.selectionService.selectedCount();
    if (count === 0) return;

    const confirmed = window.confirm(
      `Delete ${count} selected item${count === 1 ? '' : 's'}? This action cannot be undone.`,
    );

    if (!confirmed) {
      this.selectionService.clear();
      return;
    }

    this.selectionService.deleteSelected().subscribe({
      error: (err) => {
        console.error('Failed to delete selected documents', err);
        const message = this.getDeleteErrorMessage(err);
        this.snackBar.open(message, 'Dismiss', { duration: 5000 });
        this.selectionService.clear();
      },
    });
  }

  onPublishSelected(): void {
    const selected = this.selectionService.selectedItems();
    if (selected.length === 0) return;

    const first = selected[0];
    if (selected.length > 1) {
      this.snackBar.open('Opening publish dialog for the first selected item.', 'Dismiss', {
        duration: 3000,
      });
    }

    const openDialog = (versions: NuxeoDocument[]) => {
      const data: PublishDialogData = {
        documentUid: first.id,
        documentTitle: first.name,
        versionLabel: 'Current',
        renditions: [
          { name: 'thumbnail', label: 'Thumbnail' },
          { name: 'pdf', label: 'PDF' },
          { name: 'zipExport', label: 'ZIP Export' },
          { name: 'xmlExport', label: 'XML Export' },
        ],
        versions,
      };

      this.dialog.open(PublishDialogComponent, {
        width: '620px',
        panelClass: 'publish-dialog-panel',
        data,
      });
    };

    this.detailService.getVersions(first.id).subscribe({
      next: (res) => openDialog(res.entries ?? []),
      error: () => openDialog([]),
    });
  }

  onAddSelectedToClipboard(): void {
    const selected = this.selectionService.selectedItems();
    if (selected.length === 0) return;

    let current: Array<{ uid: string; title: string }> = [];
    try {
      current = JSON.parse(localStorage.getItem('nuxeo_clipboard') ?? '[]') as Array<{
        uid: string;
        title: string;
      }>;
    } catch {
      current = [];
    }

    const existing = new Set(current.map((item) => item.uid));
    const additions = selected
      .filter((item) => !existing.has(item.id))
      .map((item) => ({ uid: item.id, title: item.name }));

    const updated = [...current, ...additions];
    localStorage.setItem('nuxeo_clipboard', JSON.stringify(updated));
    window.dispatchEvent(new Event('clipboard-changed'));

    this.snackBar.open(
      additions.length > 0
        ? `Added ${additions.length} item(s) to clipboard.`
        : 'Selected items are already in clipboard.',
      'Dismiss',
      { duration: 3000 },
    );
  }

  onAddSelectedToCollection(): void {
    const selected = this.selectionService.selectedItems();
    if (selected.length === 0) return;

    const ref = this.dialog.open(AddToCollectionDialogComponent, {
      width: '440px',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((collectionId: string | undefined) => {
      if (!collectionId) return;

      forkJoin(
        selected.map((item) =>
          this.detailService
            .addToCollection(item.id, collectionId)
            .pipe(catchError(() => of(null))),
        ),
      ).subscribe((results) => {
        const success = results.filter((r) => !!r).length;
        this.snackBar.open(`Added ${success} item(s) to collection.`, 'Dismiss', {
          duration: 3000,
        });
      });
    });
  }

  onDownloadSelectedAsZip(): void {
    const selected = this.selectionService.selectedItems();
    if (selected.length === 0) return;

    const ids = selected.map((item) => item.id);
    const zipFileName = `selected-documents-${Date.now()}.zip`;
    this.detailService
      .bulkDownload(ids, zipFileName)
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = zipFileName;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => {
          this.snackBar.open('Failed to download selected documents as ZIP.', 'Dismiss', {
            duration: 4000,
          });
        },
      });
  }

  onGlobalSearchInput(value: string): void {
    this.globalSearchTerm.set(value);
    const hasEnoughChars = value.trim().length >= 2;
    this.globalSearchOpen.set(hasEnoughChars);
    this.searchInput$.next(value);
  }

  onGlobalSearchFocus(): void {
    this.globalSearchOpen.set(this.globalSearchTerm().trim().length >= 2);
  }

  onGlobalSearchFocusOut(event: FocusEvent): void {
    const container = this.globalSearchContainer?.nativeElement;
    const nextTarget = event.relatedTarget as Node | null;

    if (container && nextTarget && container.contains(nextTarget)) {
      return;
    }

    this.clearGlobalSearch();
  }

  onGlobalSearchSelect(result: GlobalSearchSuggestion): void {
    this.clearGlobalSearch();
    if (result.kind === 'user') {
      void this.router.navigate(['/administration/users-groups/user', result.id]);
    } else if (result.kind === 'group') {
      void this.router.navigate(['/administration/users-groups/group', result.id]);
    } else {
      const documentUid = result.documentUid ?? result.id;
      void this.router.navigate(['/doc', documentUid]);
    }
  }

  private clearGlobalSearch(): void {
    this.globalSearchTerm.set('');
    this.globalSearchLoading.set(false);
    this.globalSearchError.set(null);
    this.globalSearchResults.set([]);
    this.globalSearchOpen.set(false);
  }

  documentPreviewUrl(result: GlobalSearchSuggestion): string {
    const documentUid = result.documentUid ?? result.id;
    return `/nuxeo/api/v1/id/${encodeURIComponent(documentUid)}/@rendition/thumbnail`;
  }

  userGroupIcon(result: GlobalSearchSuggestion): string {
    if (result.kind === 'group') return 'group';
    if (result.kind === 'user') return 'person';
    return 'insert_drive_file';
  }

  userGroupSubtext(result: GlobalSearchSuggestion): string {
    return result.kind === 'group' ? 'Group' : 'User';
  }

  highlightText(value: string | null | undefined): Array<{ text: string; matched: boolean }> {
    const text = value ?? '';
    const term = this.highlightedSearchTerm();
    if (!text || term.length < 2) {
      return [{ text, matched: false }];
    }

    const loweredText = text.toLowerCase();
    const loweredTerm = term.toLowerCase();
    const parts: Array<{ text: string; matched: boolean }> = [];

    let from = 0;
    while (from < text.length) {
      const matchStart = loweredText.indexOf(loweredTerm, from);
      if (matchStart === -1) {
        parts.push({ text: text.slice(from), matched: false });
        break;
      }

      if (matchStart > from) {
        parts.push({ text: text.slice(from, matchStart), matched: false });
      }

      const matchEnd = matchStart + loweredTerm.length;
      parts.push({ text: text.slice(matchStart, matchEnd), matched: true });
      from = matchEnd;
    }

    return parts.length > 0 ? parts : [{ text, matched: false }];
  }

  labelHighlightParts(result: GlobalSearchSuggestion): Array<{ text: string; matched: boolean }> {
    return result.displayLabelHighlights?.length
      ? result.displayLabelHighlights
      : this.highlightText(result.displayLabel);
  }

  subtextHighlightParts(result: GlobalSearchSuggestion): Array<{ text: string; matched: boolean }> {
    if (result.kind === 'document') {
      if (result.pathHighlights?.length) return result.pathHighlights;
      return this.highlightText(result.path || '/');
    }

    return this.highlightText(this.userGroupSubtext(result));
  }

  private getDeleteErrorMessage(err: unknown): string {
    if (typeof err === 'string' && err.trim().length > 0) return err;

    const maybeObj = err as { error?: { message?: string }; message?: string } | null;
    const apiMessage = maybeObj?.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) return apiMessage;

    const defaultMessage = maybeObj?.message;
    if (typeof defaultMessage === 'string' && defaultMessage.trim().length > 0)
      return defaultMessage;

    return 'Failed to delete selected documents. Please try again.';
  }

  refreshClipboardCount(): void {
    this.clipboardCount.set(this.readClipboardCount());
  }

  refreshFavoritesCount(): void {
    const user = this.auth.username();
    if (!user) return;
    this.collectionService.getFavorites(user, 1).subscribe({
      next: (res) => this.favoritesCount.set(res.totalSize ?? res.entries?.length ?? 0),
      error: () => this.favoritesCount.set(0),
    });
  }

  togglePlatformNav(): void {
    this.platformNavState.toggleCollapsed();
  }

  signOut(): void {
    this.drawerOpen.set(false);
    this.activeDrawerItem.set(null);
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
