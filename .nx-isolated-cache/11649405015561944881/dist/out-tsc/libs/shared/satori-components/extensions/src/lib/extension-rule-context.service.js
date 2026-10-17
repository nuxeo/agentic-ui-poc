import { Injectable, computed, signal } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * The live rule context, as signals.
 *
 * Rules need the focused document, the selection, the signed-in user and the
 * current URL. Those are owned by four different places in the shell, and a
 * slot consumer should not have to know any of them — it asks for
 * `context()` and re-resolves when it changes.
 *
 * The shell writes into this service; slot consumers only read. Keeping the
 * writes in one place is what stops the toolbar and the bulk bar disagreeing
 * about what is selected.
 */
export class ExtensionRuleContextService {
    document = signal(null, ...(ngDevMode ? [{ debugName: "document" }] : []));
    selection = signal([], ...(ngDevMode ? [{ debugName: "selection" }] : []));
    selectionCount = signal(0, ...(ngDevMode ? [{ debugName: "selectionCount" }] : []));
    username = signal(null, ...(ngDevMode ? [{ debugName: "username" }] : []));
    isAdministrator = signal(false, ...(ngDevMode ? [{ debugName: "isAdministrator" }] : []));
    url = signal('', ...(ngDevMode ? [{ debugName: "url" }] : []));
    /**
     * Interface state published by whichever surface is in focus. See
     * {@link ExtensionRuleContext.flags}.
     *
     * The publishing surface owns the whole bag and must clear it on destroy, the
     * same contract `document` already has: a stale `favorite: true` left behind
     * by a closed document would gate the next surface's actions on it.
     */
    flags = signal({}, ...(ngDevMode ? [{ debugName: "flags" }] : []));
    context = computed(() => ({
        document: this.document(),
        selection: this.selection(),
        selectionCount: this.selectionCount(),
        user: { username: this.username(), isAdministrator: this.isAdministrator() },
        url: this.url(),
        flags: this.flags(),
    }), ...(ngDevMode ? [{ debugName: "context" }] : []));
    static ɵfac = function ExtensionRuleContextService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ExtensionRuleContextService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ExtensionRuleContextService, factory: ExtensionRuleContextService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ExtensionRuleContextService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=extension-rule-context.service.js.map