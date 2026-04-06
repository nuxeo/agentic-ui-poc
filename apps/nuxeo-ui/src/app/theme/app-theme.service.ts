import { Injectable, signal } from '@angular/core';

import { APP_THEME_STORAGE_KEY, AppThemeId, isAppThemeId, migrateLegacyThemeId } from './app-theme';

@Injectable({ providedIn: 'root' })
export class AppThemeService {
  readonly themeId = signal<AppThemeId>('nuxeo');

  applyStoredOrDefault(): void {
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
