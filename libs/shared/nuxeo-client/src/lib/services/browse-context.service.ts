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
 * External share recovery reference for transient-user navigation.
 */
export interface SharedDocumentRef {
  uid: string;
  title: string;
}

const SHARED_DOCUMENT_STORAGE_KEY = 'agentic_ui_external_share_doc';

/**
 * Tracks the Nuxeo path that drives the browse nav tree, matching Nuxeo Web UI:
 * folder/workspace navigation updates the path; opening a document keeps the tree
 * aligned to the containing folder (or the folder itself when folderish).
 */
@Injectable({ providedIn: 'root' })
export class BrowseContextService {
  readonly contextPath = signal('/');
  /** Document opened via an external share link; used for access-denied recovery UX. */
  readonly sharedDocument = signal<SharedDocumentRef | null>(null);
  /** Principal {@link sharedDocument} was established for; guards against cross-user reuse. */
  private sharedDocumentOwner: string | null = null;
  /** Incremented when the browse nav tree should reload (e.g. after domain creation). */
  readonly treeRefreshTick = signal(0);
  /** Incremented when the browse main view should reload folder children (e.g. after domain creation). */
  readonly contentRefreshTick = signal(0);
  /** Incremented when clipboard copy/move completes so browse can merge API results immediately. */
  readonly clipboardPasteTick = signal(0);

  private pendingClipboardPaste: ClipboardPasteEvent | null = null;

  constructor() {
    this.restoreSharedDocument();
  }

  /** Ask the browse nav drawer to reload its folder tree on next open (or immediately if open). */
  requestTreeRefresh(): void {
    this.treeRefreshTick.update((tick) => tick + 1);
  }

  /** Ask the browse page to reload the current folder listing (e.g. after domain creation). */
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

  /**
   * Remember the externally shared document for transient-user navigation recovery.
   * Preserves the first document established for the share session.
   *
   * `owner` binds the target to the principal it was established for; see
   * {@link retainSharedDocumentFor}.
   */
  setSharedDocument(doc: SharedDocumentRef, owner: string | null = null): void {
    if (this.sharedDocument()) {
      return;
    }
    this.sharedDocumentOwner = owner;
    this.sharedDocument.set(doc);
    this.persistSharedDocument(doc, owner);
  }

  /**
   * Drops the recovery target unless it belongs to `username`.
   *
   * The target outlives a reload in session storage, so a hydration that resolves a
   * different `transient/*` principal would otherwise hand the new user the previous
   * user's document title and a Back action pointing at their UID.
   */
  retainSharedDocumentFor(username: string | null): void {
    // No principal means "not hydrated yet" rather than "somebody else": clearing here
    // would discard the target restored for a reload before auth catches up.
    if (!username || !this.sharedDocument()) {
      return;
    }
    if (this.sharedDocumentOwner === username) {
      return;
    }
    this.clearSharedDocument();
  }

  /** Reset browse navigation context (e.g. after trashing the current folder). */
  resetContext(): void {
    this.contextPath.set('/');
    this.treeRefreshTick.set(0);
    this.contentRefreshTick.set(0);
    this.clipboardPasteTick.set(0);
    this.pendingClipboardPaste = null;
  }

  /** Clear externally shared document recovery state (sign-out / user switch). */
  clearSharedDocument(): void {
    this.sharedDocument.set(null);
    this.sharedDocumentOwner = null;
    this.clearPersistedSharedDocument();
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

  private restoreSharedDocument(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      const raw = sessionStorage.getItem(SHARED_DOCUMENT_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      const stored = parseStoredSharedDocument(parsed);
      if (stored) {
        this.sharedDocumentOwner = stored.owner;
        this.sharedDocument.set({ uid: stored.uid, title: stored.title });
      } else {
        this.clearPersistedSharedDocument();
      }
    } catch {
      this.clearPersistedSharedDocument();
    }
  }

  private persistSharedDocument(doc: SharedDocumentRef, owner: string | null): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      sessionStorage.setItem(SHARED_DOCUMENT_STORAGE_KEY, JSON.stringify({ ...doc, owner }));
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  private clearPersistedSharedDocument(): void {
    if (typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      sessionStorage.removeItem(SHARED_DOCUMENT_STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }
}

function parseStoredSharedDocument(
  value: unknown,
): (SharedDocumentRef & { owner: string | null }) | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const uid = record['uid'];
  const title = record['title'];
  if (typeof uid !== 'string' || typeof title !== 'string') {
    return null;
  }
  const trimmedUid = uid.trim();
  if (!trimmedUid) {
    return null;
  }
  const owner = record['owner'];
  // An untitled document is still a usable recovery target — the access-denied copy
  // falls back to generic wording — so only the UID is required.
  return {
    uid: trimmedUid,
    title: title.trim(),
    owner: typeof owner === 'string' && owner.trim() ? owner : null,
  };
}
