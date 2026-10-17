import { type ExtensionConfig } from './extension-config';
import { type RejectedExtensionRoute } from './extension-route-paths';
import { type ExtensionRule, type ExtensionRuleContext, type ExtensionRuleEvaluator } from './extension-rules';
import { type ExtensionElement, type ExtensionSlotId } from './extension-slots';
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
export declare class AppExtensionsService {
    private readonly appConfig;
    private readonly slots;
    private readonly rules;
    /** The merged Layer 1 config, recomputed when the manifest signal changes. */
    private readonly resolved;
    readonly config: import("@angular/core").Signal<ExtensionConfig>;
    /** Layer names referenced but not resolvable — surfaced rather than swallowed. */
    readonly missingLayers: import("@angular/core").Signal<readonly string[]>;
    /**
     * `routes` entries dropped because the router would not have matched their path.
     *
     * Same channel as {@link missingLayers}, for the same reason: an entry that
     * disappears without a word is a manifest you debug by bisection. Recomputes with
     * the manifest signal, which is where a customer-authored path comes from; the
     * packaged descriptors registered at bootstrap are compiled in and valid.
     */
    readonly invalidRoutes: import("@angular/core").Signal<readonly RejectedExtensionRoute[]>;
    private readonly overrides;
    constructor();
    /** Contribute packaged descriptors to a slot. See {@link ExtensionSlotRegistry.register}. */
    register<T extends ExtensionElement>(slot: ExtensionSlotId, entries: readonly T[]): void;
    /** Contribute rule evaluators — the Layer 2 entry point for customer code. */
    registerRules(evaluators: Readonly<Record<string, ExtensionRuleEvaluator>>): void;
    /**
     * The descriptors a slot should render right now.
     *
     * Not memoised: the rule context is caller-supplied and changes with the
     * focused document and the selection, so a cache keyed on the slot alone
     * would serve a stale answer. Resolution is a filter and a sort over a list
     * that is tens of entries long at most.
     */
    resolve<T extends ExtensionElement>(slot: ExtensionSlotId, context?: ExtensionRuleContext): readonly T[];
    /** Evaluate a rule reference directly, for a template that gates one control. */
    evaluateRule(rule: ExtensionRule | null | undefined, context: ExtensionRuleContext): boolean;
    /** Every registered id, for the extension reference doc and diagnostics. */
    inventory(): Readonly<Record<string, readonly string[]>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppExtensionsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AppExtensionsService>;
}
//# sourceMappingURL=app-extensions.service.d.ts.map