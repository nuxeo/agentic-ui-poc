import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import type { ThemeDefinition } from '../models/theme.model';
import { ConfigStorageService } from './config-storage.service';

const THEME_PREF_KEY = 'nx-active-theme-id';

/**
 * Applies Studio Designer theme CSS variables globally at runtime.
 *
 * Resolution:
 *   1. User's preferred theme (by id stored in localStorage)
 *   2. The theme marked isDefault
 *   3. No-op (uses whatever CSS is already present)
 */
@Injectable({ providedIn: 'root' })
export class ThemeEngineService {
  private readonly storage = inject(ConfigStorageService);
  private readonly doc = inject(DOCUMENT);

  private readonly _activeThemeId = signal<string | null>(null);
  readonly activeThemeId = this._activeThemeId.asReadonly();

  /**
   * Called at app startup. Reads the active theme and applies it.
   */
  apply(): void {
    const preferred = localStorage.getItem(THEME_PREF_KEY);
    const allCustom = this.storage.getThemeDefinitions();

    let theme: ThemeDefinition | undefined;

    if (preferred) {
      theme = allCustom.find((t) => t.id === preferred);
    }

    if (!theme) {
      theme = allCustom.find((t) => t.isDefault);
    }

    if (theme) {
      this.applyTheme(theme);
    }
  }

  /**
   * Switch to a specific theme by ID.
   */
  switchTheme(themeId: string): void {
    const allCustom = this.storage.getThemeDefinitions();
    const theme = allCustom.find((t) => t.id === themeId);
    if (theme) {
      this.applyTheme(theme);
      localStorage.setItem(THEME_PREF_KEY, themeId);
    }
  }

  /**
   * Clear the active custom theme, reverting to app defaults.
   */
  clearTheme(): void {
    localStorage.removeItem(THEME_PREF_KEY);
    this._activeThemeId.set(null);
    this.clearCssVariables();
  }

  private applyTheme(theme: ThemeDefinition): void {
    this._activeThemeId.set(theme.id);
    const root = this.doc.documentElement;

    for (const category of theme.categories) {
      for (const variable of category.variables) {
        if (variable.name && variable.value) {
          root.style.setProperty(variable.name, variable.value);
        }
      }
    }
  }

  private clearCssVariables(): void {
    const root = this.doc.documentElement;
    const allCustom = this.storage.getThemeDefinitions();
    const variableNames = new Set<string>();

    for (const theme of allCustom) {
      for (const cat of theme.categories) {
        for (const v of cat.variables) {
          variableNames.add(v.name);
        }
      }
    }

    for (const name of variableNames) {
      root.style.removeProperty(name);
    }
  }
}
