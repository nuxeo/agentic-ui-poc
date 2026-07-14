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
