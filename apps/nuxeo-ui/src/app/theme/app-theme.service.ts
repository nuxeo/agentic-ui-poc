import { Injectable, inject, signal } from '@angular/core';

import { APP_THEME_STORAGE_KEY, AppThemeId, isAppThemeId, migrateLegacyThemeId } from './app-theme';
import { ThemingFeatureFlagService } from './theming-feature-flag.service';

@Injectable({ providedIn: 'root' })
export class AppThemeService {
  private readonly themingFlags = inject(ThemingFeatureFlagService);

  readonly themeId = signal<AppThemeId>('nuxeo');

  applyStoredOrDefault(): void {
    if (!this.themingFlags.themingEnabled()) {
      this.setTheme('nuxeo', false);
      return;
    }

    try {
      const raw = localStorage.getItem(APP_THEME_STORAGE_KEY);
      const hasValidStoredTheme = raw !== null && isAppThemeId(raw);
      const migrated = migrateLegacyThemeId(raw);
      const id: AppThemeId = hasValidStoredTheme ? raw : (migrated ?? 'nuxeo');
      this.setTheme(id, !hasValidStoredTheme);
    } catch {
      this.setTheme('nuxeo', false);
    }
  }

  setTheme(id: AppThemeId, persist = true): void {
    this.themeId.set(id);
    document.documentElement.setAttribute('data-app-theme', id);
    if (persist) {
      try {
        localStorage.setItem(APP_THEME_STORAGE_KEY, id);
      } catch {
        /* ignore */
      }
    }
  }
}
