import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
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
import { CollectionService, SelectionService } from '@agentic-ui/shared/nuxeo-client';
import { SelectionTopbarComponent } from '@agentic-ui/shared/ui';

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
    NavDrawerComponent,
    SelectionTopbarComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
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

  protected readonly navItems = PLATFORM_NAV_ITEMS;

  readonly displayName = computed(() => this.auth.username() ?? 'User');
  readonly drawerOpen = signal(false);
  readonly activeDrawerItem = signal<AppNavItem | null>(null);
  readonly clipboardCount = signal(this.readClipboardCount());
  readonly favoritesCount = signal(0);

  private readonly currentUrl = signal(this.router.url.split('?')[0]);

  readonly pageTitle = computed(() => {
    const url = this.currentUrl();
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
      });

    window.addEventListener('storage', this.storageListener);
    window.addEventListener('clipboard-changed', () => this.refreshClipboardCount());
    window.addEventListener('favorites-changed', () => this.refreshFavoritesCount());
    this.refreshFavoritesCount();
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

  private getDeleteErrorMessage(err: unknown): string {
    if (typeof err === 'string' && err.trim().length > 0) return err;

    const maybeObj = err as { error?: { message?: string }; message?: string } | null;
    const apiMessage = maybeObj?.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) return apiMessage;

    const defaultMessage = maybeObj?.message;
    if (typeof defaultMessage === 'string' && defaultMessage.trim().length > 0) return defaultMessage;

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
