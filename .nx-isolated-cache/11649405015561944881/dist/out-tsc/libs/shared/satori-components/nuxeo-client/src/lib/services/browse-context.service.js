import { Injectable, signal } from '@angular/core';
import { browseTreeContextPath, normalizeNuxeoPath, nuxeoPathsEqualFlexible, parseBrowseNuxeoPathFromRouterUrl, } from '../utils/browse-path.utils';
import * as i0 from "@angular/core";
/**
 * Tracks the Nuxeo path that drives the browse nav tree, matching Nuxeo Web UI:
 * folder/workspace navigation updates the path; opening a document keeps the tree
 * aligned to the containing folder (or the folder itself when folderish).
 */
export class BrowseContextService {
    contextPath = signal('/', ...(ngDevMode ? [{ debugName: "contextPath" }] : []));
    /** Incremented when the browse nav tree should reload (e.g. after domain creation). */
    treeRefreshTick = signal(0, ...(ngDevMode ? [{ debugName: "treeRefreshTick" }] : []));
    /** Incremented when the browse main view should reload folder children (e.g. after domain creation). */
    contentRefreshTick = signal(0, ...(ngDevMode ? [{ debugName: "contentRefreshTick" }] : []));
    /** Incremented when clipboard copy/move completes so browse can merge API results immediately. */
    clipboardPasteTick = signal(0, ...(ngDevMode ? [{ debugName: "clipboardPasteTick" }] : []));
    pendingClipboardPaste = null;
    /** Ask the browse nav drawer to reload its folder tree on next open (or immediately if open). */
    requestTreeRefresh() {
        this.treeRefreshTick.update((tick) => tick + 1);
    }
    /** Ask the browse page to reload the current folder listing (e.g. after domain creation). */
    requestContentRefresh() {
        this.contentRefreshTick.update((tick) => tick + 1);
    }
    /** Record clipboard paste results and refresh browse (optimistic merge + delayed server reload). */
    notifyClipboardPasteComplete(event) {
        this.pendingClipboardPaste = event;
        this.clipboardPasteTick.update((tick) => tick + 1);
    }
    /** Returns the latest clipboard paste payload once per tick (browse consumer). */
    consumeClipboardPasteEvent() {
        const event = this.pendingClipboardPaste;
        this.pendingClipboardPaste = null;
        return event;
    }
    /** Reset browse navigation context (e.g. on sign-out / user switch). */
    resetContext() {
        this.contextPath.set('/');
        this.treeRefreshTick.set(0);
        this.contentRefreshTick.set(0);
        this.clipboardPasteTick.set(0);
        this.pendingClipboardPaste = null;
    }
    setFromRouterUrl(routerUrl) {
        this.setPath(parseBrowseNuxeoPathFromRouterUrl(routerUrl));
    }
    setFromDocument(doc) {
        this.setPath(browseTreeContextPath(doc));
    }
    setFromNuxeoPath(nuxeoPath) {
        this.setPath(nuxeoPath);
    }
    setPath(path) {
        const normalized = normalizeNuxeoPath(path);
        if (!nuxeoPathsEqualFlexible(this.contextPath(), normalized)) {
            this.contextPath.set(normalized);
        }
    }
    static ɵfac = function BrowseContextService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BrowseContextService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: BrowseContextService, factory: BrowseContextService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BrowseContextService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=browse-context.service.js.map