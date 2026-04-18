import { Injectable } from '@angular/core';

import type { ActionConfig } from '../models/action.model';
import { type LayoutConfig, type LayoutMode, layoutKey } from '../models/layout.model';

const ACTIONS_KEY = 'nx-studio-actions';
const LAYOUTS_KEY = 'nx-studio-layouts';

/**
 * Persists Studio Designer configurations.
 *
 * POC uses localStorage. Production would swap in Nuxeo REST API
 * (store configs as Note documents with JSON content).
 */
@Injectable({ providedIn: 'root' })
export class ConfigStorageService {
  // ── Actions ──

  getActions(): ActionConfig[] {
    const raw = localStorage.getItem(ACTIONS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as ActionConfig[];
    } catch {
      return [];
    }
  }

  saveActions(actions: ActionConfig[]): void {
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(actions));
  }

  // ── Layouts ──

  getAllLayoutConfigs(): LayoutConfig[] {
    const raw = localStorage.getItem(LAYOUTS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as LayoutConfig[];
    } catch {
      return [];
    }
  }

  getLayoutConfig(docType: string, mode: LayoutMode): LayoutConfig | null {
    const key = layoutKey(docType, mode);
    const all = this.getAllLayoutConfigs();
    return all.find((c) => layoutKey(c.docType, c.mode) === key) ?? null;
  }

  saveLayoutConfig(config: LayoutConfig): void {
    const all = this.getAllLayoutConfigs();
    const key = layoutKey(config.docType, config.mode);
    const idx = all.findIndex((c) => layoutKey(c.docType, c.mode) === key);
    if (idx >= 0) {
      all[idx] = config;
    } else {
      all.push(config);
    }
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(all));
  }

  deleteLayoutConfig(docType: string, mode: LayoutMode): void {
    const key = layoutKey(docType, mode);
    const all = this.getAllLayoutConfigs().filter((c) => layoutKey(c.docType, c.mode) !== key);
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(all));
  }
}
