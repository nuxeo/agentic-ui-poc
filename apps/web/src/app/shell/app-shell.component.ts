import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import {
  SatPlatformNavModule,
  SatPlatformNavStateService,
} from '@hylandsoftware/satori-ui/platform-nav';

import { AuthService } from '../auth/auth.service';
import { PLATFORM_NAV_ITEMS } from '../platform-nav-items';

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
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly platformNavState = inject(SatPlatformNavStateService);
  private readonly auth = inject(AuthService);

  protected readonly navItems = PLATFORM_NAV_ITEMS;

  readonly displayName = computed(() => this.auth.username() ?? 'User');

  private readonly currentUrl = signal(this.router.url.split('?')[0]);

  readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    const match = PLATFORM_NAV_ITEMS.find(
      (item) => url === item.path || url.startsWith(item.path + '/'),
    );
    return match?.label ?? 'Hyland Nuxeo';
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects.split('?')[0]));
  }

  isActive(path: string): boolean {
    const url = this.router.url.split('?')[0];
    if (url === path) {
      return true;
    }
    return url.startsWith(path + '/');
  }

  togglePlatformNav(): void {
    this.platformNavState.toggleCollapsed();
  }

  signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
