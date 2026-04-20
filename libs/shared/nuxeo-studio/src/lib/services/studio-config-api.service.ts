import { Injectable, inject, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, retry, switchMap, tap, timer } from 'rxjs';

import {
  NuxeoApiBase,
  type NuxeoDocument,
  type NuxeoDocumentList,
} from '@agentic-ui/shared/nuxeo-client';

import type { ActionConfig } from '../models/action.model';
import { layoutKey, type LayoutConfig, type LayoutMode } from '../models/layout.model';
import type { TabConfig } from '../models/tab.model';
import type { DrawerItemConfig } from '../models/drawer.model';
import type { SearchConfig } from '../models/search.model';
import type { ThemeDefinition } from '../models/theme.model';
import type { TranslationConfig } from '../models/translation.model';
import type { DashboardConfig } from '../models/dashboard.model';

type ConfigType =
  | 'actions'
  | 'layouts'
  | 'tabs'
  | 'drawer'
  | 'searches'
  | 'themes'
  | 'translations'
  | 'dashboard';

const CONFIG_ROOT = '/default-domain/studio-configs';
const SEARCH_SCHEMAS = 'dublincore,note,uid';
const JSON_MIME = 'application/json';
const RETRY_CONFIG = { count: 2, delay: (attempt: number) => timer(500 * Math.pow(2, attempt)) };

interface NuxeoCreateBody {
  'entity-type': 'document';
  name: string;
  type: string;
  properties: Record<string, unknown>;
}

interface NuxeoUpdateBody {
  'entity-type': 'document';
  properties: Record<string, unknown>;
}

/**
 * Persists Studio Designer configurations as Note documents in the
 * Nuxeo repository under /default-domain/studio-configs/{type}/.
 *
 * Provides an in-memory signal-based cache populated at startup.
 * Falls back to localStorage when the server is unreachable.
 */
@Injectable({ providedIn: 'root' })
export class StudioConfigApiService {
  private readonly api = inject(NuxeoApiBase);

  private readonly _ready = signal(false);
  readonly ready = this._ready.asReadonly();

  // In-memory caches (populated by init, updated on save/delete)
  private readonly _actions = signal<ActionConfig[]>([]);
  private readonly _layouts = signal<LayoutConfig[]>([]);
  private readonly _tabs = signal<TabConfig[]>([]);
  private readonly _drawer = signal<DrawerItemConfig[]>([]);
  private readonly _searches = signal<SearchConfig[]>([]);
  private readonly _themes = signal<ThemeDefinition[]>([]);
  private readonly _translations = signal<TranslationConfig[]>([]);
  private readonly _dashboard = signal<DashboardConfig | null>(null);

  private readonly docIdMap = new Map<string, string>();
  private readonly changeTokenMap = new Map<string, string>();

  // ── Initialization ──

  init(): Observable<void> {
    return this.ensureConfigWorkspace().pipe(
      switchMap(() => this.loadAllFromServer()),
      tap(() => this._ready.set(true)),
      catchError((err) => {
        console.warn(
          '[StudioConfigApi] Server unreachable, loading from localStorage fallback',
          err,
        );
        this.loadAllFromLocalStorage();
        this._ready.set(true);
        return of(undefined);
      }),
    );
  }

  // ── Actions ──

  getActions(): ActionConfig[] {
    return this._actions();
  }

  saveActions(actions: ActionConfig[]): Observable<void> {
    return this.saveConfigList<ActionConfig>('actions', actions, (a) => a.id).pipe(
      tap(() => {
        this._actions.set(actions);
        this.backupToLocalStorage('nx-studio-actions', actions);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save actions to server', err);
        this._actions.set(actions);
        this.backupToLocalStorage('nx-studio-actions', actions);
        return of(undefined);
      }),
    );
  }

  // ── Layouts ──

  getAllLayoutConfigs(): LayoutConfig[] {
    return this._layouts();
  }

  getLayoutConfig(docType: string, mode: LayoutMode): LayoutConfig | null {
    const key = layoutKey(docType, mode);
    return this._layouts().find((c) => layoutKey(c.docType, c.mode) === key) ?? null;
  }

  saveLayoutConfig(config: LayoutConfig): Observable<void> {
    const all = [...this._layouts()];
    const key = layoutKey(config.docType, config.mode);
    const idx = all.findIndex((c) => layoutKey(c.docType, c.mode) === key);
    if (idx >= 0) all[idx] = config;
    else all.push(config);

    return this.saveConfigList<LayoutConfig>('layouts', all, (l) =>
      layoutKey(l.docType, l.mode),
    ).pipe(
      tap(() => {
        this._layouts.set(all);
        this.backupToLocalStorage('nx-studio-layouts', all);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save layout to server', err);
        this._layouts.set(all);
        this.backupToLocalStorage('nx-studio-layouts', all);
        return of(undefined);
      }),
    );
  }

  deleteLayoutConfig(docType: string, mode: LayoutMode): Observable<void> {
    const key = layoutKey(docType, mode);
    const docId = this.docIdMap.get(`layouts:${key}`);
    const all = this._layouts().filter((c) => layoutKey(c.docType, c.mode) !== key);

    const delete$ = docId
      ? this.api.delete(`/nuxeo/api/v1/id/${docId}`).pipe(
          retry(RETRY_CONFIG),
          map(() => undefined as void),
          catchError(() => of(undefined)),
        )
      : of(undefined);

    return delete$.pipe(
      tap(() => {
        this._layouts.set(all);
        this.backupToLocalStorage('nx-studio-layouts', all);
      }),
    );
  }

  // ── Tabs ──

  getTabs(): TabConfig[] {
    return this._tabs();
  }

  saveTabs(tabs: TabConfig[]): Observable<void> {
    return this.saveConfigList<TabConfig>('tabs', tabs, (t) => t.id).pipe(
      tap(() => {
        this._tabs.set(tabs);
        this.backupToLocalStorage('nx-studio-tabs', tabs);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save tabs to server', err);
        this._tabs.set(tabs);
        this.backupToLocalStorage('nx-studio-tabs', tabs);
        return of(undefined);
      }),
    );
  }

  // ── Drawer Items ──

  getDrawerItems(): DrawerItemConfig[] {
    return this._drawer();
  }

  saveDrawerItems(items: DrawerItemConfig[]): Observable<void> {
    return this.saveConfigList<DrawerItemConfig>('drawer', items, (d) => d.id).pipe(
      tap(() => {
        this._drawer.set(items);
        this.backupToLocalStorage('nx-studio-drawer', items);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save drawer items to server', err);
        this._drawer.set(items);
        this.backupToLocalStorage('nx-studio-drawer', items);
        return of(undefined);
      }),
    );
  }

  // ── Searches / Page Providers ──

  getSearches(): SearchConfig[] {
    return this._searches();
  }

  saveSearches(searches: SearchConfig[]): Observable<void> {
    return this.saveConfigList<SearchConfig>('searches', searches, (s) => s.id).pipe(
      tap(() => {
        this._searches.set(searches);
        this.backupToLocalStorage('nx-studio-searches', searches);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save searches to server', err);
        this._searches.set(searches);
        this.backupToLocalStorage('nx-studio-searches', searches);
        return of(undefined);
      }),
    );
  }

  // ── Themes ──

  getThemeDefinitions(): ThemeDefinition[] {
    return this._themes();
  }

  getThemeDefinition(id: string): ThemeDefinition | null {
    return this._themes().find((t) => t.id === id) ?? null;
  }

  saveThemeDefinition(theme: ThemeDefinition): Observable<void> {
    const all = [...this._themes()];
    const idx = all.findIndex((t) => t.id === theme.id);
    if (idx >= 0) all[idx] = theme;
    else all.push(theme);

    return this.saveConfigList<ThemeDefinition>('themes', all, (t) => t.id).pipe(
      tap(() => {
        this._themes.set(all);
        this.backupToLocalStorage('nx-studio-themes', all);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save theme to server', err);
        this._themes.set(all);
        this.backupToLocalStorage('nx-studio-themes', all);
        return of(undefined);
      }),
    );
  }

  deleteThemeDefinition(id: string): Observable<void> {
    const docId = this.docIdMap.get(`themes:${id}`);
    const all = this._themes().filter((t) => t.id !== id);

    const delete$ = docId
      ? this.api.delete(`/nuxeo/api/v1/id/${docId}`).pipe(
          retry(RETRY_CONFIG),
          map(() => undefined as void),
          catchError(() => of(undefined)),
        )
      : of(undefined);

    return delete$.pipe(
      tap(() => {
        this._themes.set(all);
        this.backupToLocalStorage('nx-studio-themes', all);
      }),
    );
  }

  // ── Translations ──

  getTranslations(): TranslationConfig[] {
    return this._translations();
  }

  saveTranslations(translations: TranslationConfig[]): Observable<void> {
    return this.saveConfigList<TranslationConfig>(
      'translations',
      translations,
      (t) => t.locale,
    ).pipe(
      tap(() => {
        this._translations.set(translations);
        this.backupToLocalStorage('nx-studio-translations', translations);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save translations to server', err);
        this._translations.set(translations);
        this.backupToLocalStorage('nx-studio-translations', translations);
        return of(undefined);
      }),
    );
  }

  // ── Dashboard ──

  getDashboard(): DashboardConfig | null {
    return this._dashboard();
  }

  saveDashboard(config: DashboardConfig): Observable<void> {
    return this.saveConfigDoc('dashboard', 'dashboard-config', config).pipe(
      tap(() => {
        this._dashboard.set(config);
        this.backupToLocalStorage('nx-studio-dashboard', config);
      }),
      catchError((err) => {
        console.error('[StudioConfigApi] Failed to save dashboard to server', err);
        this._dashboard.set(config);
        this.backupToLocalStorage('nx-studio-dashboard', config);
        return of(undefined);
      }),
    );
  }

  // ── Refresh ──

  refresh(): Observable<void> {
    return this.loadAllFromServer();
  }

  // ── Private: Workspace Bootstrap ──

  private static readonly CONFIG_SUBDIRS: ConfigType[] = [
    'actions',
    'layouts',
    'tabs',
    'drawer',
    'searches',
    'themes',
    'translations',
    'dashboard',
  ];

  private ensureConfigWorkspace(): Observable<void> {
    return this.api
      .get<NuxeoDocument>(`/nuxeo/api/v1/path${CONFIG_ROOT}`, undefined, { schemas: '*' })
      .pipe(
        switchMap((doc) => {
          if (doc.type === 'Folder') {
            return this.migrateToHidden().pipe(map(() => undefined as void));
          }
          return of(undefined as void);
        }),
        catchError(() =>
          this.createFolder('/default-domain', 'studio-configs').pipe(
            switchMap(() =>
              forkJoin(
                StudioConfigApiService.CONFIG_SUBDIRS.map((name) =>
                  this.createFolder(CONFIG_ROOT, name),
                ),
              ),
            ),
            map(() => undefined as void),
          ),
        ),
      );
  }

  /**
   * One-time migration: add HiddenInNavigation to the root and every
   * subfolder that was created as a plain Folder before the fix.
   */
  private migrateToHidden(): Observable<unknown> {
    const paths = [
      CONFIG_ROOT,
      ...StudioConfigApiService.CONFIG_SUBDIRS.map((d) => `${CONFIG_ROOT}/${d}`),
    ];
    return forkJoin(
      paths.map((p) =>
        this.api.get<NuxeoDocument>(`/nuxeo/api/v1/path${p}`).pipe(
          switchMap((d) =>
            d.facets?.includes('HiddenInNavigation') ? of(null) : this.addHiddenFacet(d.uid),
          ),
          catchError(() => of(null)),
        ),
      ),
    );
  }

  /**
   * Adds the HiddenInNavigation facet to an existing folder so it
   * no longer appears in Nuxeo's browse tree or default content views.
   */
  private addHiddenFacet(docUid: string): Observable<unknown> {
    return this.api
      .post<unknown>(`/nuxeo/api/v1/id/${docUid}/@op/Document.AddFacet`, {
        params: { facet: 'HiddenInNavigation' },
      })
      .pipe(catchError(() => of(null)));
  }

  private createFolder(parentPath: string, name: string): Observable<NuxeoDocument> {
    const body: NuxeoCreateBody = {
      'entity-type': 'document',
      name,
      type: 'HiddenFolder',
      properties: { 'dc:title': name },
    };
    return this.api
      .post<NuxeoDocument>(`/nuxeo/api/v1/path${parentPath}`, body)
      .pipe(
        catchError(() => this.api.get<NuxeoDocument>(`/nuxeo/api/v1/path${parentPath}/${name}`)),
      );
  }

  // ── Private: Load All ──

  private loadAllFromServer(): Observable<void> {
    return forkJoin({
      actions: this.fetchConfigDocs<ActionConfig>('actions'),
      layouts: this.fetchConfigDocs<LayoutConfig>('layouts'),
      tabs: this.fetchConfigDocs<TabConfig>('tabs'),
      drawer: this.fetchConfigDocs<DrawerItemConfig>('drawer'),
      searches: this.fetchConfigDocs<SearchConfig>('searches'),
      themes: this.fetchConfigDocs<ThemeDefinition>('themes'),
      translations: this.fetchConfigDocs<TranslationConfig>('translations'),
      dashboard: this.fetchConfigDocs<DashboardConfig>('dashboard'),
    }).pipe(
      map((results) => {
        this._actions.set(this.mergeWithLocal(results.actions, 'nx-studio-actions'));
        this._layouts.set(this.mergeWithLocal(results.layouts, 'nx-studio-layouts'));
        this._tabs.set(this.mergeWithLocal(results.tabs, 'nx-studio-tabs'));
        this._drawer.set(this.mergeWithLocal(results.drawer, 'nx-studio-drawer'));
        this._searches.set(this.mergeWithLocal(results.searches, 'nx-studio-searches'));
        this._themes.set(this.mergeWithLocal(results.themes, 'nx-studio-themes'));
        this._translations.set(this.mergeWithLocal(results.translations, 'nx-studio-translations'));

        const dashboard =
          results.dashboard[0] ?? this.readLocalStorage<DashboardConfig>('nx-studio-dashboard');
        this._dashboard.set(dashboard ?? null);

        if (this._actions().length) this.backupToLocalStorage('nx-studio-actions', this._actions());
        if (this._layouts().length) this.backupToLocalStorage('nx-studio-layouts', this._layouts());
        if (this._tabs().length) this.backupToLocalStorage('nx-studio-tabs', this._tabs());
        if (this._drawer().length) this.backupToLocalStorage('nx-studio-drawer', this._drawer());
        if (this._searches().length)
          this.backupToLocalStorage('nx-studio-searches', this._searches());
        if (this._themes().length) this.backupToLocalStorage('nx-studio-themes', this._themes());
        if (this._translations().length)
          this.backupToLocalStorage('nx-studio-translations', this._translations());
        if (dashboard) this.backupToLocalStorage('nx-studio-dashboard', dashboard);
      }),
    );
  }

  private fetchConfigDocs<T>(type: ConfigType): Observable<T[]> {
    const query = `SELECT * FROM Note WHERE ecm:path STARTSWITH '${CONFIG_ROOT}/${type}' AND ecm:isTrashed = 0`;
    const params = new HttpParams().set('query', query).set('pageSize', '100');
    const headers: Record<string, string> = { properties: SEARCH_SCHEMAS };

    return this.api
      .get<NuxeoDocumentList>('/nuxeo/api/v1/search/lang/NXQL/execute', params, headers)
      .pipe(
        retry(RETRY_CONFIG),
        map((result) => {
          const items: T[] = [];
          for (const doc of result.entries) {
            const json = doc.properties['note:note'] as string;
            if (json) {
              try {
                const parsed = JSON.parse(json) as T;
                items.push(parsed);
                const configKey = (doc.properties['dc:description'] as string) || doc.title;
                this.docIdMap.set(`${type}:${configKey}`, doc.uid);
                const changeToken =
                  (doc.properties['uid:changeToken'] as string) ??
                  ((doc as unknown as Record<string, unknown>)['changeToken'] as string);
                if (changeToken) {
                  this.changeTokenMap.set(`${type}:${configKey}`, changeToken);
                }
              } catch {
                console.warn(`[StudioConfigApi] Invalid JSON in ${type} doc ${doc.uid}`);
              }
            }
          }
          return items;
        }),
        catchError((err) => {
          console.warn(`[StudioConfigApi] Failed to fetch ${type} from server`, err);
          return of([]);
        }),
      );
  }

  // ── Private: Save ──

  private saveConfigList<T>(
    type: ConfigType,
    items: T[],
    keyFn: (item: T) => string,
  ): Observable<void> {
    if (items.length === 0) {
      return of(undefined);
    }

    const saves = items.map((item) => {
      const configKey = keyFn(item);
      return this.saveConfigDoc(type, configKey, item);
    });

    return forkJoin(saves).pipe(map(() => undefined));
  }

  private saveConfigDoc<T>(type: ConfigType, configKey: string, data: T): Observable<void> {
    const mapKey = `${type}:${configKey}`;
    const docId = this.docIdMap.get(mapKey);
    const json = JSON.stringify(data);

    if (docId) {
      const body: NuxeoUpdateBody = {
        'entity-type': 'document',
        properties: {
          'note:note': json,
          'note:mime_type': JSON_MIME,
        },
      };
      const headers: Record<string, string> = { 'X-Versioning-Option': 'MINOR' };
      const changeToken = this.changeTokenMap.get(mapKey);
      if (changeToken) {
        headers['If-Match'] = changeToken;
      }
      return this.api.put<NuxeoDocument>(`/nuxeo/api/v1/id/${docId}`, body, headers).pipe(
        retry(RETRY_CONFIG),
        tap((doc) => {
          const newToken =
            (doc.properties?.['uid:changeToken'] as string) ??
            ((doc as unknown as Record<string, unknown>)['changeToken'] as string);
          if (newToken) this.changeTokenMap.set(mapKey, newToken);
        }),
        map(() => undefined),
      );
    }

    const safeName = configKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    const body: NuxeoCreateBody = {
      'entity-type': 'document',
      name: safeName,
      type: 'Note',
      properties: {
        'dc:title': configKey,
        'dc:description': configKey,
        'dc:nature': type,
        'note:note': json,
        'note:mime_type': JSON_MIME,
      },
    };

    return this.api.post<NuxeoDocument>(`/nuxeo/api/v1/path${CONFIG_ROOT}/${type}`, body).pipe(
      retry(RETRY_CONFIG),
      tap((doc) => {
        this.docIdMap.set(mapKey, doc.uid);
        const newToken =
          (doc.properties?.['uid:changeToken'] as string) ??
          ((doc as unknown as Record<string, unknown>)['changeToken'] as string);
        if (newToken) this.changeTokenMap.set(mapKey, newToken);
      }),
      map(() => undefined),
    );
  }

  // ── Private: localStorage Fallback ──

  private loadAllFromLocalStorage(): void {
    this._actions.set(this.readLocalStorage<ActionConfig[]>('nx-studio-actions') ?? []);
    this._layouts.set(this.readLocalStorage<LayoutConfig[]>('nx-studio-layouts') ?? []);
    this._tabs.set(this.readLocalStorage<TabConfig[]>('nx-studio-tabs') ?? []);
    this._drawer.set(this.readLocalStorage<DrawerItemConfig[]>('nx-studio-drawer') ?? []);
    this._searches.set(this.readLocalStorage<SearchConfig[]>('nx-studio-searches') ?? []);
    this._themes.set(this.readLocalStorage<ThemeDefinition[]>('nx-studio-themes') ?? []);
    this._translations.set(
      this.readLocalStorage<TranslationConfig[]>('nx-studio-translations') ?? [],
    );
    this._dashboard.set(this.readLocalStorage<DashboardConfig>('nx-studio-dashboard') ?? null);
  }

  /**
   * If the server returned data, use it. If server returned empty but
   * localStorage has data (e.g. saved locally while server was down),
   * prefer the local data so it isn't silently lost.
   */
  private mergeWithLocal<T>(serverData: T[], localStorageKey: string): T[] {
    if (serverData.length > 0) return serverData;
    return this.readLocalStorage<T[]>(localStorageKey) ?? [];
  }

  private readLocalStorage<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private backupToLocalStorage(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable — non-critical
    }
  }
}
