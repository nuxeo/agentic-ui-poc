import {
  Component,
  ElementRef,
  HostListener,
  Pipe,
  PipeTransform,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, filter, finalize, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import {
  SatPlatformNavModule,
  SatPlatformNavStateService,
} from '@hylandsoftware/satori-ui/platform-nav';
import {
  CollectionService,
  SearchService,
  SelectionService,
  type GlobalSearchSuggestion,
  docTypeIcon,
} from '@agentic-ui/shared/nuxeo-client';
import { SelectionTopbarComponent } from '@agentic-ui/shared/ui';
import { AiChatService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';

@Pipe({ name: 'aiMarkdown', standalone: true })
export class AiMarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    let html = this.escapeHtml(value);

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    html = html.replace(/^(\d+)\.\s+(.*)$/gm, '<li class="ai-ol-item" value="$1">$2</li>');
    html = html.replace(
      /((?:<li class="ai-ol-item"[^>]*>.*?<\/li>\n?)+)/g,
      '<ol class="ai-list">$1</ol>',
    );

    html = html.replace(/^[-•]\s+(.*)$/gm, '<li class="ai-ul-item">$1</li>');
    html = html.replace(
      /((?:<li class="ai-ul-item">.*?<\/li>\n?)+)/g,
      '<ul class="ai-list">$1</ul>',
    );

    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<\/?(?:ol|ul|li)[^>]*>)<br>/g, '$1');
    html = html.replace(/<br>(<\/?(?:ol|ul|li)[^>]*>)/g, '$1');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return text.replace(/[&<>"]/g, (c) => map[c]);
  }
}

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
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatTooltipModule,
    NavDrawerComponent,
    SelectionTopbarComponent,
    FormsModule,
    AiMarkdownPipe,
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
  readonly selectionService = inject(SelectionService);
  private readonly collectionService = inject(CollectionService);
  private readonly searchService = inject(SearchService);
  readonly aiChat = inject(AiChatService);
  readonly featureFlags = inject(AiFeatureFlagService);

  readonly aiChatOpen = this.aiChat.panelOpen;
  readonly aiChatInput = signal('');
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
        this.currentUrl.set(e.urlAfterRedirects.split('?')[0]);
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

          return this.searchService
            .suggestFromSuggestersLauncher(term)
            .pipe(finalize(() => this.globalSearchLoading.set(false)));
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

  toggleAiChat(): void {
    this.aiChat.togglePanel();
    const url = this.router.url;
    const docMatch = url.match(/\/doc\/([a-f0-9-]+)/i);
    this.aiChat.setContext({
      docId: docMatch?.[1],
      page: url,
    });
  }

  sendAiMessage(): void {
    const msg = this.aiChatInput().trim();
    if (!msg) return;
    this.aiChat.send(msg);
    this.aiChatInput.set('');
  }

  clearAiChat(): void {
    this.aiChat.clear();
  }

  openAiSource(uid: string, type?: string, path?: string): void {
    this.aiChatOpen.set(false);
    if (type === 'Collection') {
      void this.router.navigate(['/collections', uid]);
    } else if ((type === 'Folder' || type === 'OrderedFolder' || type === 'Workspace') && path) {
      void this.router.navigateByUrl(`/browse${path}`);
    } else {
      void this.router.navigate(['/doc', uid]);
    }
  }

  docTypeIcon(type: string): string {
    return docTypeIcon(type);
  }
}
