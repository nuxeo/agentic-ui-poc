import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of, map } from 'rxjs';

import type { ActionConfig } from '../models/action.model';
import type { LayoutConfig } from '../models/layout.model';
import type { TabConfig } from '../models/tab.model';
import type { DrawerItemConfig } from '../models/drawer.model';
import type { SearchConfig } from '../models/search.model';
import type { ThemeConfig, ThemeDefinition } from '../models/theme.model';
import type { TranslationConfig } from '../models/translation.model';
import type { DashboardConfig } from '../models/dashboard.model';
import { StudioConfigApiService } from './studio-config-api.service';

const THEME_KEY = 'nx-studio-theme';

/**
 * Unified storage facade for Studio Designer configurations.
 *
 * Delegates to StudioConfigApiService for Nuxeo REST persistence.
 * Read methods are synchronous (backed by in-memory cache).
 * Write methods trigger async server persistence and return Observables,
 * but also update the local cache immediately for zero-latency reads.
 *
 * Legacy callers that don't subscribe to the returned Observable
 * still get the benefit of local cache + localStorage fallback.
 */
@Injectable({ providedIn: 'root' })
export class ConfigStorageService {
  private readonly backend = inject(StudioConfigApiService);

  /**
   * Initialize the storage layer: preload all configs from the server
   * into the in-memory cache. Must be called at app startup.
   */
  init(): Observable<void> {
    return this.backend.init();
  }

  get ready(): boolean {
    return this.backend.ready();
  }

  /** Re-fetch all configs from the server. */
  refresh(): Observable<void> {
    return this.backend.refresh();
  }

  // ── Actions ──

  getActions(): ActionConfig[] {
    return this.backend.getActions();
  }

  saveActions(actions: ActionConfig[]): void {
    this.backend.saveActions(actions).subscribe();
  }

  saveActionsAsync(actions: ActionConfig[]): Observable<void> {
    return this.backend.saveActions(actions);
  }

  // ── Layouts ──

  getAllLayoutConfigs(): LayoutConfig[] {
    return this.backend.getAllLayoutConfigs();
  }

  getLayoutConfig(docType: string, mode: LayoutMode): LayoutConfig | null {
    return this.backend.getLayoutConfig(docType, mode);
  }

  saveLayoutConfig(config: LayoutConfig): void {
    this.backend.saveLayoutConfig(config).subscribe();
  }

  saveLayoutConfigAsync(config: LayoutConfig): Observable<void> {
    return this.backend.saveLayoutConfig(config);
  }

  deleteLayoutConfig(docType: string, mode: LayoutMode): void {
    this.backend.deleteLayoutConfig(docType, mode).subscribe();
  }

  deleteLayoutConfigAsync(docType: string, mode: LayoutMode): Observable<void> {
    return this.backend.deleteLayoutConfig(docType, mode);
  }

  // ── Tabs ──

  getTabs(): TabConfig[] {
    return this.backend.getTabs();
  }

  saveTabs(tabs: TabConfig[]): void {
    this.backend.saveTabs(tabs).subscribe();
  }

  saveTabsAsync(tabs: TabConfig[]): Observable<void> {
    return this.backend.saveTabs(tabs);
  }

  // ── Drawer Items ──

  getDrawerItems(): DrawerItemConfig[] {
    return this.backend.getDrawerItems();
  }

  saveDrawerItems(items: DrawerItemConfig[]): void {
    this.backend.saveDrawerItems(items).subscribe();
  }

  saveDrawerItemsAsync(items: DrawerItemConfig[]): Observable<void> {
    return this.backend.saveDrawerItems(items);
  }

  // ── Searches ──

  getSearches(): SearchConfig[] {
    return this.backend.getSearches();
  }

  saveSearches(searches: SearchConfig[]): void {
    this.backend.saveSearches(searches).subscribe();
  }

  saveSearchesAsync(searches: SearchConfig[]): Observable<void> {
    return this.backend.saveSearches(searches);
  }

  // ── Theme (legacy single) ──

  getTheme(): ThemeConfig | null {
    const raw = localStorage.getItem(THEME_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ThemeConfig;
    } catch {
      return null;
    }
  }

  saveTheme(theme: ThemeConfig): void {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  }

  // ── Translations ──

  getTranslations(): TranslationConfig[] {
    return this.backend.getTranslations();
  }

  saveTranslations(translations: TranslationConfig[]): void {
    this.backend.saveTranslations(translations).subscribe();
  }

  saveTranslationsAsync(translations: TranslationConfig[]): Observable<void> {
    return this.backend.saveTranslations(translations);
  }

  // ── Dashboard ──

  getDashboard(): DashboardConfig | null {
    return this.backend.getDashboard();
  }

  saveDashboard(config: DashboardConfig): void {
    this.backend.saveDashboard(config).subscribe();
  }

  saveDashboardAsync(config: DashboardConfig): Observable<void> {
    return this.backend.saveDashboard(config);
  }

  // ── Themes (multi) ──

  getThemeDefinitions(): ThemeDefinition[] {
    return this.backend.getThemeDefinitions();
  }

  saveThemeDefinitions(themes: ThemeDefinition[]): void {
    for (const theme of themes) {
      this.backend.saveThemeDefinition(theme).subscribe();
    }
  }

  getThemeDefinition(id: string): ThemeDefinition | null {
    return this.backend.getThemeDefinition(id);
  }

  saveThemeDefinition(theme: ThemeDefinition): void {
    this.backend.saveThemeDefinition(theme).subscribe();
  }

  saveThemeDefinitionAsync(theme: ThemeDefinition): Observable<void> {
    return this.backend.saveThemeDefinition(theme);
  }

  deleteThemeDefinition(id: string): void {
    this.backend.deleteThemeDefinition(id).subscribe();
  }

  deleteThemeDefinitionAsync(id: string): Observable<void> {
    return this.backend.deleteThemeDefinition(id);
  }

  // ── Import / Export ──

  exportAll(): string {
    const bundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      actions: this.getActions(),
      layouts: this.getAllLayoutConfigs(),
      tabs: this.getTabs(),
      drawer: this.getDrawerItems(),
      searches: this.getSearches(),
      themes: this.getThemeDefinitions(),
      translations: this.getTranslations(),
      dashboard: this.getDashboard(),
    };
    return JSON.stringify(bundle, null, 2);
  }

  importAll(json: string): Observable<void> {
    const bundle = JSON.parse(json) as Record<string, unknown>;

    const saves: Observable<void>[] = [];

    if (Array.isArray(bundle['actions'])) {
      saves.push(this.saveActionsAsync(bundle['actions'] as ActionConfig[]));
    }
    if (Array.isArray(bundle['tabs'])) {
      saves.push(this.saveTabsAsync(bundle['tabs'] as TabConfig[]));
    }
    if (Array.isArray(bundle['drawer'])) {
      saves.push(this.saveDrawerItemsAsync(bundle['drawer'] as DrawerItemConfig[]));
    }
    if (Array.isArray(bundle['searches'])) {
      saves.push(this.saveSearchesAsync(bundle['searches'] as SearchConfig[]));
    }
    if (Array.isArray(bundle['translations'])) {
      saves.push(this.saveTranslationsAsync(bundle['translations'] as TranslationConfig[]));
    }
    if (bundle['dashboard']) {
      saves.push(this.saveDashboardAsync(bundle['dashboard'] as DashboardConfig));
    }

    if (Array.isArray(bundle['layouts'])) {
      for (const layout of bundle['layouts'] as LayoutConfig[]) {
        saves.push(this.saveLayoutConfigAsync(layout));
      }
    }
    if (Array.isArray(bundle['themes'])) {
      for (const theme of bundle['themes'] as ThemeDefinition[]) {
        saves.push(this.saveThemeDefinitionAsync(theme));
      }
    }

    if (saves.length === 0) return of(undefined);
    return forkJoin(saves).pipe(map(() => undefined));
  }
}
