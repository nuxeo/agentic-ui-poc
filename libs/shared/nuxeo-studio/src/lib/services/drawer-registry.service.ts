import { Injectable, inject } from '@angular/core';
import { ConfigStorageService } from './config-storage.service';
import type { DrawerItemConfig } from '../models/drawer.model';

export interface DrawerContext {
  permissions?: string[];
  groups?: string[];
  isAdmin?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DrawerRegistryService {
  private readonly storage = inject(ConfigStorageService);

  getDrawerItems(ctx: DrawerContext): DrawerItemConfig[] {
    const all = this.storage.getDrawerItems();
    return all
      .filter((d) => d.available && this.matchFilters(d, ctx))
      .sort((a, b) => a.order - b.order);
  }

  private matchFilters(item: DrawerItemConfig, ctx: DrawerContext): boolean {
    const f = item.filters;
    if (f.permissions?.length && !f.permissions.some((p) => ctx.permissions?.includes(p)))
      return false;
    if (f.groups?.length && !f.groups.some((g) => ctx.groups?.includes(g))) return false;
    if (f.isAdmin && !ctx.isAdmin) return false;
    return true;
  }
}
