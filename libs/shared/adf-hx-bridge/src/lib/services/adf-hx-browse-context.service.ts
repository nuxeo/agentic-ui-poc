import { Injectable, signal } from '@angular/core';
import { normalizeNuxeoPath, nuxeoPathsEqualFlexible } from '@nuxeo-satori/platform/nuxeo-client';
import { parseAdfHxBrowsePathFromRouterUrl } from '../utils/adf-hx-browse-path.utils';

/** Tracks the Nuxeo path driving the adf-hx browse nav tree and main view. */
@Injectable({ providedIn: 'root' })
export class AdfHxBrowseContextService {
  readonly contextPath = signal('/');
  /** Increment to force the nav tree to reload (same as production browse refresh). */
  readonly treeRefreshTick = signal(0);

  setFromNuxeoPath(nuxeoPath: string): void {
    const normalized = normalizeNuxeoPath(nuxeoPath);
    if (!nuxeoPathsEqualFlexible(this.contextPath(), normalized)) {
      this.contextPath.set(normalized);
    }
  }

  setFromRouterUrl(routerUrl: string): void {
    this.setFromNuxeoPath(parseAdfHxBrowsePathFromRouterUrl(routerUrl));
  }

  resetContext(): void {
    this.contextPath.set('/');
  }

  requestTreeRefresh(): void {
    this.treeRefreshTick.update((tick) => tick + 1);
  }
}
