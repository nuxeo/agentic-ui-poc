import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  of,
  switchMap,
  Subscription,
} from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
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
  DocumentDetailService,
  BrowseContextService,
  SearchService,
  SelectionService,
  readClipboardDocs,
  isAdfHxBrowseRouterUrl,
  isBrowseRouterUrl,
  parseAdfHxBrowsePathFromRouterUrl,
  parseBrowseNuxeoPathFromRouterUrl,
  toBrowseRouterUrl,
  type GlobalSearchSuggestion,
  docTypeIcon,
} from '@nuxeo-satori/platform/nuxeo-client';
import {
  AdfHxBrowseContextService,
  toAdfHxBrowseRouterUrl,
} from '@agentic-ui/shared/adf-hx-bridge';
import { SelectionTopbarComponent } from '@nuxeo-satori/platform/ui';
import { AiChatService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';
import { AppConfigService } from '@nuxeo-satori/platform/app-config';
import { APP_NAV_ITEMS, PACKAGED_NAV_ITEMS } from '@nuxeo-satori/platform/extensions';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../auth/auth.service';
import { SessionTimeoutService } from '../auth/session-timeout.service';
import { AppNavItem, SETTINGS_DRAWER_ITEMS, toAppNavItem } from '../platform-nav-items';
import { ThemingFeatureFlagService } from '../theme/theming-feature-flag.service';
import { drawerItemForPath } from './drawer-route-match';
import { NavDrawerComponent } from './nav-drawer/nav-drawer.component';
import { AiMarkdownPipe } from '../pipes/ai-markdown.pipe';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    SatPlatformNavModule,
    SatAppHeaderModule,
    SatLogoModule,
    MatDialogModule,
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
    TranslatePipe,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnDestroy {
  @ViewChild('globalSearchContainer')
  private globalSearchContainer?: ElementRef<HTMLElement>;

  private readonly settingsDrawerItem: AppNavItem = {
    id: 'app.navbar.settings',
    label: 'Settings',
    path: '/settings',
    icon: 'settings',
    hasDrawer: true,
  };

  private readonly router = inject(Router);
  private readonly platformNavState = inject(SatPlatformNavStateService);
  private readonly auth = inject(AuthService);
  private readonly sessionTimeout = inject(SessionTimeoutService);
  private readonly snackBar = inject(MatSnackBar);
  readonly selectionService = inject(SelectionService);
  private readonly collectionService = inject(CollectionService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly searchService = inject(SearchService);
  private readonly browseContext = inject(BrowseContextService);
  private readonly adfHxBrowseContext = inject(AdfHxBrowseContextService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfig = inject(AppConfigService);
  readonly aiChat = inject(AiChatService);
  readonly featureFlags = inject(AiFeatureFlagService);
  readonly themingFlags = inject(ThemingFeatureFlagService);

  readonly aiChatOpen = this.aiChat.panelOpen;
  readonly aiChatInput = signal('');
  private readonly searchInput$ = new Subject<string>();

  /**
   * The navigation, resolved from the extension registry.
   *
   * Nothing is filtered here any more. Administration is hidden by the
   * `app.rules.hasAdministrationAccess` rule on its descriptor, which a manifest
   * can see, override or replace — the previous hardcoded `path === '/administration'`
   * test could do none of those.
   */
  private readonly navDescriptors = inject(APP_NAV_ITEMS);
  protected readonly navItems = computed(() => this.navDescriptors().map(toAppNavItem));

  readonly displayName = computed(() => this.auth.username() ?? 'User');
  readonly drawerOpen = signal(false);
  readonly activeDrawerItem = signal<AppNavItem | null>(null);
  readonly clipboardCount = signal(this.readClipboardCount());
  readonly clipboardBadgeLabel = computed(() => {
    const count = this.clipboardCount();
    return count > 99 ? '99+' : String(count);
  });
  readonly clipboardBadgeCssContent = computed(() => {
    const label = this.clipboardBadgeLabel();
    return this.clipboardCount() > 0 ? `"${label}"` : null;
  });
  readonly favoritesCount = signal(0);
  readonly globalSearchTerm = signal('');
  readonly globalSearchLoading = signal(false);
  readonly globalSearchError = signal<string | null>(null);
  readonly globalSearchResults = signal<GlobalSearchSuggestion[]>([]);
  readonly globalSearchOpen = signal(false);
  readonly thumbnailMap = signal<Record<string, string>>({});
  private thumbnailSubs: Subscription[] = [];

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
    // Resolved entries first so a manifest relabel wins, then the packaged list
    // as a fallback. Matching only against `navItems()` — which is filtered —
    // meant hiding an entry by manifest or rule also stripped its page title,
    // and a user who reached the route directly saw the brand name instead of
    // "Trash". Hiding an entry is a navigation decision, not a route decision:
    // the route still exists and is still reachable. That is also why the
    // unfiltered settings list is used here while the drawer uses
    // `visibleSettingsDrawerItems` — the theming flag hides the *link*, and
    // `themingGuard` closes the *route*; neither should blank the title.
    const candidates = [
      ...this.navItems(),
      ...PACKAGED_NAV_ITEMS.map(toAppNavItem),
      ...SETTINGS_DRAWER_ITEMS,
    ];
    const match = candidates.find((item) => url === item.path || url.startsWith(item.path + '/'));
    // Layer 0: the product name on an unmatched route is branding, not a literal.
    return match?.label ?? this.appConfig.bootstrap().branding.applicationTitle;
  });

  private storageListener = (e: StorageEvent) => {
    if (e.key === 'nuxeo_clipboard') {
      this.clipboardCount.set(this.readClipboardCount());
    }
  };

  private clipboardChangedListener = () => this.refreshClipboardCount();
  private favoritesChangedListener = () => this.refreshFavoritesCount();

  constructor() {
    this.sessionTimeout.start();

    // The browser tab is branding too, and it was previously fixed in index.html
    // where no customer could reach it. An effect rather than a one-off call
    // because the configuration load is asynchronous.
    effect(() => {
      document.title = this.appConfig.bootstrap().branding.documentTitle;
    });

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
        this.syncDrawerToRoute(nextPath);
      });

    window.addEventListener('storage', this.storageListener);
    window.addEventListener('clipboard-changed', this.clipboardChangedListener);
    window.addEventListener('favorites-changed', this.favoritesChangedListener);
    this.refreshFavoritesCount();

    // The subscription above only fires on subsequent navigations, so a deep link or a
    // reload needs the current route applied once here.
    this.syncDrawerToRoute(this.router.url.split('?')[0]);

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
        this.loadThumbnailsForResults(results);
      });
  }

  ngOnDestroy(): void {
    this.sessionTimeout.stop();
    window.removeEventListener('storage', this.storageListener);
    window.removeEventListener('clipboard-changed', this.clipboardChangedListener);
    window.removeEventListener('favorites-changed', this.favoritesChangedListener);
    this.revokeThumbnails();
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
    return readClipboardDocs().length;
  }

  clipboardNavAriaLabel(item: AppNavItem): string | null {
    if (item.path !== '/clipboard' || this.clipboardCount() <= 0) {
      return null;
    }
    const count = this.clipboardCount();
    const noun = count === 1 ? 'item' : 'items';
    return `${item.label}, ${count} ${noun}`;
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
        if (item.path === '/administration') {
          const target = this.auth.isAdministrator()
            ? '/administration/analytics'
            : '/administration/users-groups';
          void this.router.navigateByUrl(target);
        } else if (item.path === '/personal-space') {
          void this.router.navigateByUrl('/personal-space');
        } else if (item.path === '/browse') {
          this.navigateToProductionBrowse();
        } else if (item.path === '/browse-adf-hx') {
          this.navigateToAdfHxBrowse();
        }
      }
    } else {
      this.drawerOpen.set(false);
      this.activeDrawerItem.set(null);
      void this.router.navigateByUrl(item.path);
    }
  }

  onDrawerItemSelected(path: string): void {
    this.clearGlobalSearch();
    const base = path.split('?')[0];
    if (base === '/browse' || base.startsWith('/browse/')) {
      this.browseContext.setFromRouterUrl(path);
    }
    if (base === '/browse-adf-hx') {
      this.adfHxBrowseContext.setFromRouterUrl(path);
    }
    const keepTasksDrawer = /^\/tasks\/[^/]+$/.test(base);
    if (!keepTasksDrawer) {
      this.drawerOpen.set(false);
      this.activeDrawerItem.set(null);
    }
    void this.router.navigateByUrl(path);
  }

  /**
   * Open the drawer belonging to the route being shown, if it has one.
   *
   * Driven from the route rather than from the nav click, so a deep link and a browser
   * back both arrive with the tree already open — which is how the section is meant to
   * look, and previously only happened if the user clicked the nav item themselves.
   */
  private syncDrawerToRoute(currentPath: string): void {
    const matchingItem = drawerItemForPath(this.navItems(), currentPath);

    // Re-setting the same item would reopen a drawer the user has just closed, so a
    // navigation within one section leaves their choice alone.
    if (matchingItem && this.activeDrawerItem()?.path !== matchingItem.path) {
      this.activeDrawerItem.set(matchingItem);
      this.drawerOpen.set(true);
    }

    // Navigating away deliberately does not close it: the drawer is the browse tree, and
    // opening a document from it would otherwise dismiss the tree the user is working in.
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
    const base = path.split('?')[0];
    if (base === '/browse' || base.startsWith('/browse/')) {
      this.browseContext.setFromRouterUrl(path);
    }
    if (base === '/browse-adf-hx') {
      this.adfHxBrowseContext.setFromRouterUrl(path);
    }
    void this.router.navigateByUrl(path, { onSameUrlNavigation: 'reload' });
  }

  onDrawerClose(): void {
    this.drawerOpen.set(false);
    this.activeDrawerItem.set(null);
    this.refreshClipboardCount();
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
    this.revokeThumbnails();
  }

  thumbnailUrl(result: GlobalSearchSuggestion): string | null {
    const uid = result.documentUid ?? result.id;
    return this.thumbnailMap()[uid] ?? null;
  }

  private loadThumbnailsForResults(results: GlobalSearchSuggestion[]): void {
    this.revokeThumbnails();

    const docResults = results.filter((r) => r.kind === 'document');
    for (const result of docResults) {
      const uid = result.documentUid ?? result.id;
      const sub = this.detailService
        .fetchThumbnail(uid)
        .pipe(catchError(() => of(null)))
        .subscribe((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          this.thumbnailMap.update((map) => ({ ...map, [uid]: url }));
        });
      this.thumbnailSubs.push(sub);
    }
  }

  private revokeThumbnails(): void {
    for (const sub of this.thumbnailSubs) sub.unsubscribe();
    this.thumbnailSubs = [];
    const map = this.thumbnailMap();
    for (const url of Object.values(map)) {
      URL.revokeObjectURL(url);
    }
    this.thumbnailMap.set({});
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

  /** Open production browse at the path the user was viewing in adf-hx (or current browse context). */
  private navigateToProductionBrowse(): void {
    const nuxeoPath = this.resolveBrowsePathForProductionSwitch();
    this.browseContext.setFromNuxeoPath(nuxeoPath);
    void this.router.navigateByUrl(toBrowseRouterUrl(nuxeoPath));
  }

  /** Open adf-hx browse at the path the user was viewing in production browse (or current adf-hx context). */
  private navigateToAdfHxBrowse(): void {
    const nuxeoPath = this.resolveBrowsePathForAdfHxSwitch();
    this.adfHxBrowseContext.setFromNuxeoPath(nuxeoPath);
    void this.router.navigateByUrl(toAdfHxBrowseRouterUrl(nuxeoPath));
  }

  /** Prefer the live router URL when switching from adf-hx browse to production browse. */
  private resolveBrowsePathForProductionSwitch(): string {
    const url = this.router.url;
    if (isAdfHxBrowseRouterUrl(url)) {
      return parseAdfHxBrowsePathFromRouterUrl(url);
    }
    if (isBrowseRouterUrl(url)) {
      return parseBrowseNuxeoPathFromRouterUrl(url);
    }
    return this.adfHxBrowseContext.contextPath() || this.browseContext.contextPath();
  }

  /** Prefer the live router URL when switching from production browse to adf-hx browse. */
  private resolveBrowsePathForAdfHxSwitch(): string {
    const url = this.router.url;
    if (isBrowseRouterUrl(url)) {
      return parseBrowseNuxeoPathFromRouterUrl(url);
    }
    if (isAdfHxBrowseRouterUrl(url)) {
      return parseAdfHxBrowsePathFromRouterUrl(url);
    }
    return this.browseContext.contextPath() || this.adfHxBrowseContext.contextPath();
  }
}
