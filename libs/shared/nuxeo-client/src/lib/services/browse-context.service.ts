import { Injectable, signal } from '@angular/core';

import type { NuxeoDocument } from '../models/document.model';
import {
  browseTreeContextPath,
  normalizeNuxeoPath,
  nuxeoPathsEqualFlexible,
  parseBrowseNuxeoPathFromRouterUrl,
} from '../utils/browse-path.utils';

/** Clipboard copy/move completed into a browse folder (Web UI: `clipboard-action-performed`). */
export interface ClipboardPasteEvent {
  targetUid: string;
  documents: NuxeoDocument[];
  action: 'copy' | 'move';
}

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
  /** Incremented when the browse main view should reload folder children (e.g. clipboard paste). */
  readonly contentRefreshTick = signal(0);
  /** Incremented when clipboard copy/move completes so browse can merge API results immediately. */
  readonly clipboardPasteTick = signal(0);

  private pendingClipboardPaste: ClipboardPasteEvent | null = null;

  /** Ask the browse nav drawer to reload its folder tree on next open (or immediately if open). */
  requestTreeRefresh(): void {
    this.treeRefreshTick.update((tick) => tick + 1);
  }

  /** Ask the browse page to reload the current folder listing (e.g. after clipboard copy/move). */
  requestContentRefresh(): void {
    this.contentRefreshTick.update((tick) => tick + 1);
  }

  /** Record clipboard paste results and refresh browse (optimistic merge + delayed server reload). */
  notifyClipboardPasteComplete(event: ClipboardPasteEvent): void {
    this.pendingClipboardPaste = event;
    this.clipboardPasteTick.update((tick) => tick + 1);
  }

  /** Returns the latest clipboard paste payload once per tick (browse consumer). */
  consumeClipboardPasteEvent(): ClipboardPasteEvent | null {
    const event = this.pendingClipboardPaste;
    this.pendingClipboardPaste = null;
    return event;
  }

  /** Reset browse navigation context (e.g. on sign-out / user switch). */
  resetContext(): void {
    this.contextPath.set('/');
    this.treeRefreshTick.set(0);
    this.contentRefreshTick.set(0);
    this.clipboardPasteTick.set(0);
    this.pendingClipboardPaste = null;
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
