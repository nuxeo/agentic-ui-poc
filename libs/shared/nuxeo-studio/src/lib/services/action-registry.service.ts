import { Injectable, inject } from '@angular/core';

import type { ActionConfig, ActionFilter, ActionSlot } from '../models/action.model';
import { ConfigStorageService } from './config-storage.service';

interface DocumentContext {
  type?: string;
  facets?: string[];
  state?: string;
  contextParameters?: Record<string, unknown>;
}

/**
 * Resolves configured custom actions for a given document context.
 * Applies type/facet/permission/state filters to determine visibility.
 */
@Injectable({ providedIn: 'root' })
export class ActionRegistryService {
  private readonly storage = inject(ConfigStorageService);

  getActionsForDocument(doc: DocumentContext, slot: ActionSlot): ActionConfig[] {
    return this.storage
      .getActions()
      .filter((a) => a.enabled && a.slot === slot)
      .filter((a) => this.matchesFilters(a.filters, doc))
      .sort((a, b) => a.order - b.order);
  }

  private matchesFilters(filters: ActionFilter, doc: DocumentContext): boolean {
    if (filters.docTypes && filters.docTypes.length > 0) {
      if (!doc.type || !filters.docTypes.includes(doc.type)) return false;
    }

    if (filters.facets && filters.facets.length > 0) {
      const docFacets = doc.facets ?? [];
      if (!filters.facets.every((f) => docFacets.includes(f))) return false;
    }

    if (filters.excludeFacets && filters.excludeFacets.length > 0) {
      const docFacets = doc.facets ?? [];
      if (filters.excludeFacets.some((f) => docFacets.includes(f))) return false;
    }

    if (filters.states && filters.states.length > 0) {
      if (!doc.state || !filters.states.includes(doc.state)) return false;
    }

    if (filters.excludeStates && filters.excludeStates.length > 0) {
      if (doc.state && filters.excludeStates.includes(doc.state)) return false;
    }

    if (filters.permissions && filters.permissions.length > 0) {
      const docPerms = (doc.contextParameters?.['permissions'] as string[]) ?? [];
      if (!filters.permissions.every((p) => docPerms.includes(p))) return false;
    }

    return true;
  }
}
