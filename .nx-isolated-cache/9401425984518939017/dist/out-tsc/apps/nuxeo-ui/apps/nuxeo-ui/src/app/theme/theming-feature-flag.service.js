import { Injectable, computed } from '@angular/core';
import { isLocalEnvironment } from './is-local-environment';
import * as i0 from "@angular/core";
/** Gates the Themes settings UI and custom theme selection to local development only. */
export class ThemingFeatureFlagService {
    themingEnabled = computed(() => isLocalEnvironment(), ...(ngDevMode ? [{ debugName: "themingEnabled" }] : []));
    static ɵfac = function ThemingFeatureFlagService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ThemingFeatureFlagService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ThemingFeatureFlagService, factory: ThemingFeatureFlagService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ThemingFeatureFlagService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
