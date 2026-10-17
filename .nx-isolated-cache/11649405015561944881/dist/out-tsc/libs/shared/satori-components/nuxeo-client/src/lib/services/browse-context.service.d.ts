import type { NuxeoDocument } from '../models/document.model';
import * as i0 from "@angular/core";
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
export declare class BrowseContextService {
    readonly contextPath: import("@angular/core").WritableSignal<string>;
    /** Incremented when the browse nav tree should reload (e.g. after domain creation). */
    readonly treeRefreshTick: import("@angular/core").WritableSignal<number>;
    /** Incremented when the browse main view should reload folder children (e.g. after domain creation). */
    readonly contentRefreshTick: import("@angular/core").WritableSignal<number>;
    /** Incremented when clipboard copy/move completes so browse can merge API results immediately. */
    readonly clipboardPasteTick: import("@angular/core").WritableSignal<number>;
    private pendingClipboardPaste;
    /** Ask the browse nav drawer to reload its folder tree on next open (or immediately if open). */
    requestTreeRefresh(): void;
    /** Ask the browse page to reload the current folder listing (e.g. after domain creation). */
    requestContentRefresh(): void;
    /** Record clipboard paste results and refresh browse (optimistic merge + delayed server reload). */
    notifyClipboardPasteComplete(event: ClipboardPasteEvent): void;
    /** Returns the latest clipboard paste payload once per tick (browse consumer). */
    consumeClipboardPasteEvent(): ClipboardPasteEvent | null;
    /** Reset browse navigation context (e.g. on sign-out / user switch). */
    resetContext(): void;
    setFromRouterUrl(routerUrl: string): void;
    setFromDocument(doc: NuxeoDocument): void;
    setFromNuxeoPath(nuxeoPath: string): void;
    private setPath;
    static ɵfac: i0.ɵɵFactoryDeclaration<BrowseContextService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BrowseContextService>;
}
//# sourceMappingURL=browse-context.service.d.ts.map