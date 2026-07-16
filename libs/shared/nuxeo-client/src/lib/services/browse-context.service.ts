import { Injectable, signal } from '@angular/core';

import type { NuxeoDocument } from '../models/document.model';
import {
  browseTreeContextPath,
  normalizeNuxeoPath,
  nuxeoPathsEqualFlexible,
  parseBrowseNuxeoPathFromRouterUrl,
} from '../utils/browse-path.utils';

/**
 * Tracks the Nuxeo path that drives the browse nav tree, matching Nuxeo Web UI:
 * folder/workspace navigation updates the path; opening a document keeps the tree
 * aligned to the containing folder (or the folder itself when folderish).
 */
@Injectable({ providedIn: 'root' })
export class BrowseContextService {
  readonly contextPath = signal('/');
  /** Incremented when the browse nav tree should reload (e.g. after domain creation). */
  readonly treeRefreshTick = signal(0);

  /** Ask the browse nav drawer to reload its folder tree on next open (or immediately if open). */
  requestTreeRefresh(): void {
    this.treeRefreshTick.update((tick) => tick + 1);
  }

  /** Reset browse navigation context (e.g. on sign-out / user switch). */
  resetContext(): void {
    this.contextPath.set('/');
  }

  setFromRouterUrl(routerUrl: string): void {
    this.setPath(parseBrowseNuxeoPathFromRouterUrl(routerUrl));
  }

  setFromDocument(doc: NuxeoDocument): void {
    this.setPath(browseTreeContextPath(doc));
  }

  setFromNuxeoPath(nuxeoPath: string): void {
    this.setPath(nuxeoPath);
  }

  private setPath(path: string): void {
    const normalized = normalizeNuxeoPath(path);
    if (!nuxeoPathsEqualFlexible(this.contextPath(), normalized)) {
      this.contextPath.set(normalized);
    }
  }
}
