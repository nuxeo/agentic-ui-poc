import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import {
  NuxeoApiBase,
  type NuxeoDocument,
  type NuxeoDocumentList,
} from '@agentic-ui/shared/nuxeo-client';

import { ConfigStorageService } from './config-storage.service';
import {
  createDefaultDashboard,
  type DashboardConfig,
  type DashboardWidgetConfig,
} from '../models/dashboard.model';

export interface WidgetData {
  config: DashboardWidgetConfig;
  documents: NuxeoDocument[];
  loading: boolean;
  error: string | null;
}

const RECENT_DOCS_QUERY = `SELECT * FROM Document WHERE ecm:mixinType != 'HiddenInNavigation' AND ecm:isTrashed = 0 AND ecm:isVersion = 0 ORDER BY dc:modified DESC`;
const FAVORITES_QUERY = `SELECT * FROM Document WHERE ecm:mixinType = 'Favorite' AND ecm:isTrashed = 0 ORDER BY dc:modified DESC`;
const COLLECTIONS_QUERY = `SELECT * FROM Collection WHERE ecm:isTrashed = 0 ORDER BY dc:modified DESC`;

/**
 * Drives the runtime dashboard from the stored DashboardConfig.
 * Maps each widget type to real Nuxeo queries and returns the data.
 */
@Injectable({ providedIn: 'root' })
export class DashboardRuntimeService {
  private readonly storage = inject(ConfigStorageService);
  private readonly api = inject(NuxeoApiBase);

  private readonly _widgetData = signal<WidgetData[]>([]);
  readonly widgetData = this._widgetData.asReadonly();

  readonly dashboardConfig = computed<DashboardConfig>(() => {
    return this.storage.getDashboard() ?? createDefaultDashboard();
  });

  readonly visibleWidgets = computed(() => {
    return this.dashboardConfig().widgets.filter((w) => w.available);
  });

  /**
   * Load data for all configured widgets. Call on dashboard init.
   */
  loadAll(userId: string): void {
    const config = this.dashboardConfig();
    const activeWidgets = config.widgets.filter((w) => w.available);

    const initial = activeWidgets.map((w) => ({
      config: w,
      documents: [],
      loading: true,
      error: null,
    }));
    this._widgetData.set(initial);

    for (const widget of activeWidgets) {
      this.loadWidgetData(widget, userId);
    }
  }

  private loadWidgetData(widget: DashboardWidgetConfig, userId: string): void {
    const query$ = this.getQueryForWidget(widget, userId);

    query$.subscribe({
      next: (docs) => {
        this._widgetData.update((all) =>
          all.map((wd) =>
            wd.config.id === widget.id ? { ...wd, documents: docs, loading: false } : wd,
          ),
        );
      },
      error: () => {
        this._widgetData.update((all) =>
          all.map((wd) =>
            wd.config.id === widget.id
              ? { ...wd, loading: false, error: 'Failed to load data' }
              : wd,
          ),
        );
      },
    });
  }

  private getQueryForWidget(
    widget: DashboardWidgetConfig,
    userId: string,
  ): Observable<NuxeoDocument[]> {
    const pageSize = (widget.properties['pageSize'] as number) ?? 10;

    switch (widget.type) {
      case 'recent-documents':
        return this.executeNxql(RECENT_DOCS_QUERY, pageSize);
      case 'favorites':
        return this.executeNxql(FAVORITES_QUERY, pageSize);
      case 'collections':
        return this.executeNxql(COLLECTIONS_QUERY, pageSize);
      case 'tasks':
        return this.fetchTasks(userId, pageSize);
      case 'saved-searches':
      case 'analytics':
      case 'custom':
        return of([]);
      default:
        return of([]);
    }
  }

  private executeNxql(query: string, pageSize: number): Observable<NuxeoDocument[]> {
    const params = new HttpParams().set('query', query).set('pageSize', pageSize.toString());
    const headers = { properties: 'dublincore,uid' };

    return this.api
      .get<NuxeoDocumentList>('/nuxeo/api/v1/search/lang/NXQL/execute', params, headers)
      .pipe(
        map((res) => res.entries),
        catchError(() => of([])),
      );
  }

  private fetchTasks(_userId: string, _pageSize: number): Observable<NuxeoDocument[]> {
    return of([]);
  }
}
