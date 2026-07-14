import { Injectable, signal } from '@angular/core';

import type { NuxeoDocument } from '../models/document.model';

/**
 * Current browse folder used as the paste target for clipboard Copy/Move (Web UI: `target-document`).
 * Updated by {@link BrowseComponent} while the user is browsing.
 */
@Injectable({ providedIn: 'root' })
export class ClipboardTargetService {
  readonly target = signal<NuxeoDocument | null>(null);

  setTarget(doc: NuxeoDocument | null): void {
    this.target.set(doc);
  }

  clear(): void {
    this.target.set(null);
  }
}
