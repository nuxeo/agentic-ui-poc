import { type Type } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Renders a component resolved from the registry, by ID or by type.
 *
 * This is the **shared component-resolution primitive** that route, tab, viewer
 * and drawer extensions all need. It generalises the shell's
 * `DynamicDrawerComponent`, which took only an eagerly imported
 * `Type<unknown>`, in three ways that each unblock a slot:
 *
 * - accepts a registered **ID**, which is what a manifest can name;
 * - resolves **lazily loaded** components, so a tab or route panel in a
 *   lazy feature library does not have to be statically imported by the shell;
 * - binds **inputs**, so a descriptor can pass configuration to the component it
 *   names.
 *
 * It uses `createComponent()` rather than `ViewContainerRef.createComponent()`
 * because the former accepts `bindings`/`environmentInjector` explicitly, which
 * is what makes input binding to a dynamically chosen component possible at all.
 *
 * A change to `componentInputs` values is applied to the live instance. The `documentView`
 * slot feeds the focused document, which is a new object on every refetch, and recreating
 * on each one would discard whatever state the rendered view holds. A change of component,
 * or of which declared inputs are set, recreates it: in place, an input the new inputs
 * omit would keep its previous value. While a lazy component loads, nothing is shown.
 * After a loader rejects, the next `componentInputs` change retries it, at most twice.
 */
export declare class ExtensionOutletComponent {
    /** Registered component ID to render. Takes precedence over `componentType`. */
    readonly componentId: import("@angular/core").InputSignal<string | null>;
    /** An already-imported component, for callers that have one in hand. */
    readonly componentType: import("@angular/core").InputSignal<Type<unknown> | null>;
    /**
     * Inputs to set on the rendered component. Unknown keys are ignored.
     *
     * The `?? {}` in the effect below is not defensive padding. `withComponentInputBinding()`
     * sets **every declared input** from route data, passing `undefined` for keys the
     * route does not supply — which overrides this default. So routing straight to this
     * component with `data: { componentId: '...' }` made `componentInputs()` `undefined`
     * and `Object.entries()` threw, blanking the route. Both this template and the
     * product bootstrap with `withComponentInputBinding()`, so the crash was reachable
     * from either.
     */
    readonly componentInputs: import("@angular/core").InputSignal<Readonly<Record<string, unknown>> | null | undefined>;
    readonly loading: import("@angular/core").WritableSignal<boolean>;
    /** True when nothing could be resolved, so the host can render a fallback. */
    readonly unresolved: import("@angular/core").WritableSignal<boolean>;
    private outlet;
    private readonly registry;
    private readonly injector;
    private readonly environmentInjector;
    private componentRef;
    private renderedType;
    /** Public names of the inputs the rendered component declares. */
    private declaredInputs;
    /** The declared input names last set, from {@link declaredKeysOf}. */
    private appliedKeys;
    /** Bumped on every request so a slow load cannot overwrite a newer one. */
    private generation;
    /** Retries left for the requested id after its loader rejected — {@link retryUnresolved}. */
    private retriesLeft;
    /** A retry's load is pending; updates meanwhile ride on it rather than starting another. */
    private retrying;
    private static readonly MAX_RETRIES;
    constructor();
    /**
     * Resolve `id` and render it, or mark the outlet unresolved.
     *
     * A `retry` leaves the outlet as it is — unresolved, nothing rendered, no loading state —
     * until the load settles, so a host showing its fallback keeps showing it rather than
     * blanking for the length of a chunk request that may fail again.
     */
    private load;
    /**
     * Ask again for a registered component whose loader rejected.
     *
     * The registry does not cache a rejection, so a transient chunk failure is recoverable —
     * but only if something asks. A new `componentInputs` value is a fresh render request
     * (for `documentView`, a refetched or different document), so it retries. Bounded by
     * {@link MAX_RETRIES} per requested id, so a loader that always fails is called three
     * times in all rather than on every refetch. An id nothing registered is not retried:
     * that is a missing library, not a transient failure.
     *
     * An update while a retry is still loading starts nothing and spends nothing: the
     * registry would fold it onto the pending load, and the retry renders with whatever
     * inputs are current when it lands.
     */
    private retryUnresolved;
    private render;
    /**
     * Set the inputs the component declares, and only those.
     *
     * A descriptor's inputs are customer-authored, and a host may offer an input not every
     * component wants — `documentView` always offers `document`. `setInput` does not throw
     * on an undeclared name; in a development build it logs NG0303 to the console, so the
     * filter is what keeps an unused key silent rather than a `catch` that never fires.
     */
    private applyInputs;
    /** The declared input names `inputs` sets. */
    private declaredKeysOf;
    /** Whether `inputs` sets exactly the declared inputs last applied. */
    private setsAppliedKeys;
    private clear;
    static ɵfac: i0.ɵɵFactoryDeclaration<ExtensionOutletComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ExtensionOutletComponent, "lib-extension-outlet", never, { "componentId": { "alias": "componentId"; "required": false; "isSignal": true; }; "componentType": { "alias": "componentType"; "required": false; "isSignal": true; }; "componentInputs": { "alias": "componentInputs"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=extension-outlet.component.d.ts.map