import { Injectable, computed, inject } from '@angular/core';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { resolveExtensionLayers, } from './extension-config';
import { DOCUMENT_RULE_EVALUATORS } from './document-rules';
import { partitionExtensionRouteDescriptors, } from './extension-route-paths';
import { EMPTY_EXTENSION_RULE_CONTEXT, ExtensionRuleRegistry, } from './extension-rules';
import { ExtensionSlotRegistry, } from './extension-slot-registry.service';
import { EXTENSION_SLOTS } from './extension-slots';
import { SURFACE_RULE_EVALUATORS } from './surface-rules';
import * as i0 from "@angular/core";
/**
 * The single thing the application injects to read the addressable surface.
 *
 * It joins the two halves: descriptors and rules registered in **code** at
 * bootstrap, and contributions and overrides loaded from the **manifest** by
 * `AppConfigService`. Everything a consumer needs is `resolve(slot, context)`.
 *
 * The packaged document rules are registered in the constructor, so any
 * injector that reaches this service has them — a consumer cannot forget to
 * bootstrap the rules and then silently resolve every rule-gated entry to
 * `true`.
 */
export class AppExtensionsService {
    appConfig = inject(AppConfigService);
    slots = inject(ExtensionSlotRegistry);
    rules = inject(ExtensionRuleRegistry);
    /** The merged Layer 1 config, recomputed when the manifest signal changes. */
    resolved = computed(() => resolveExtensionLayers(this.appConfig.manifest().extensionLayers), ...(ngDevMode ? [{ debugName: "resolved" }] : []));
    config = computed(() => this.resolved().config, ...(ngDevMode ? [{ debugName: "config" }] : []));
    /** Layer names referenced but not resolvable — surfaced rather than swallowed. */
    missingLayers = computed(() => this.resolved().missing, ...(ngDevMode ? [{ debugName: "missingLayers" }] : []));
    /**
     * `routes` entries dropped because the router would not have matched their path.
     *
     * Same channel as {@link missingLayers}, for the same reason: an entry that
     * disappears without a word is a manifest you debug by bisection. Recomputes with
     * the manifest signal, which is where a customer-authored path comes from; the
     * packaged descriptors registered at bootstrap are compiled in and valid.
     */
    invalidRoutes = computed(() => partitionExtensionRouteDescriptors(this.resolve(EXTENSION_SLOTS.routes)).rejected, ...(ngDevMode ? [{ debugName: "invalidRoutes" }] : []));
    overrides = computed(() => {
        const config = this.config();
        return {
            byId: config.overrides ?? {},
            additions: config.slots ?? {},
        };
    }, ...(ngDevMode ? [{ debugName: "overrides" }] : []));
    constructor() {
        this.rules.registerRules(DOCUMENT_RULE_EVALUATORS);
        this.rules.registerRules(SURFACE_RULE_EVALUATORS);
    }
    /** Contribute packaged descriptors to a slot. See {@link ExtensionSlotRegistry.register}. */
    register(slot, entries) {
        this.slots.register(slot, entries);
    }
    /** Contribute rule evaluators — the Layer 2 entry point for customer code. */
    registerRules(evaluators) {
        this.rules.registerRules(evaluators);
    }
    /**
     * The descriptors a slot should render right now.
     *
     * Not memoised: the rule context is caller-supplied and changes with the
     * focused document and the selection, so a cache keyed on the slot alone
     * would serve a stale answer. Resolution is a filter and a sort over a list
     * that is tens of entries long at most.
     */
    resolve(slot, context = EMPTY_EXTENSION_RULE_CONTEXT) {
        return this.slots.resolve(slot, this.overrides(), context);
    }
    /** Evaluate a rule reference directly, for a template that gates one control. */
    evaluateRule(rule, context) {
        return this.rules.evaluate(rule, context);
    }
    /** Every registered id, for the extension reference doc and diagnostics. */
    inventory() {
        const inventory = {
            'rules (evaluator ids)': this.rules.registeredRuleIds(),
        };
        for (const slot of this.slots.registeredSlotIds()) {
            inventory[slot] = this.slots.registeredIds(slot);
        }
        return inventory;
    }
    static ɵfac = function AppExtensionsService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppExtensionsService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AppExtensionsService, factory: AppExtensionsService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppExtensionsService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
