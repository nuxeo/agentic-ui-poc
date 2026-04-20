import { Injectable, inject } from '@angular/core';
import { ConfigStorageService } from './config-storage.service';
import type { TabConfig } from '../models/tab.model';

export interface TabContext {
  docType: string;
  facets?: string[];
  permissions?: string[];
  state?: string;
  schemas?: string[];
}

@Injectable({ providedIn: 'root' })
export class TabRegistryService {
  private readonly storage = inject(ConfigStorageService);

  getTabsForContext(ctx: TabContext): TabConfig[] {
    const all = this.storage.getTabs();
    return all
      .filter((t) => t.available && this.matchFilters(t, ctx))
      .sort((a, b) => a.order - b.order);
  }

  private matchFilters(tab: TabConfig, ctx: TabContext): boolean {
    const f = tab.filters;
    if (f.docTypes?.length && !f.docTypes.includes(ctx.docType)) return false;
    if (f.facets?.length && !f.facets.some((fac) => ctx.facets?.includes(fac))) return false;
    if (f.excludeFacets?.length && f.excludeFacets.some((fac) => ctx.facets?.includes(fac)))
      return false;
    if (f.permissions?.length && !f.permissions.some((p) => ctx.permissions?.includes(p)))
      return false;
    if (f.states?.length && ctx.state && !f.states.includes(ctx.state)) return false;
    if (f.excludeStates?.length && ctx.state && f.excludeStates.includes(ctx.state)) return false;
    if (f.schemas?.length && !f.schemas.some((s) => ctx.schemas?.includes(s))) return false;
    return true;
  }
}
