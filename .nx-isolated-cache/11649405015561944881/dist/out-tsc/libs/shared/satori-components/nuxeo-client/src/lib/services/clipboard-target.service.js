import { Injectable, signal } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Current browse folder used as the paste target for clipboard Copy/Move (Web UI: `target-document`).
 * Updated by {@link BrowseComponent} while the user is browsing.
 */
export class ClipboardTargetService {
    target = signal(null, ...(ngDevMode ? [{ debugName: "target" }] : []));
    setTarget(doc) {
        this.target.set(doc);
    }
    clear() {
        this.target.set(null);
    }
    static ɵfac = function ClipboardTargetService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ClipboardTargetService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ClipboardTargetService, factory: ClipboardTargetService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ClipboardTargetService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=clipboard-target.service.js.map