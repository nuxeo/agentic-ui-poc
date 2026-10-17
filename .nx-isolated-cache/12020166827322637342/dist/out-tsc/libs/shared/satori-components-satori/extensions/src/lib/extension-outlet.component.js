import { ChangeDetectionStrategy, Component, DestroyRef, EnvironmentInjector, Injector, ViewChild, ViewContainerRef, createComponent, effect, inject, input, reflectComponentType, signal, untracked, } from '@angular/core';
import { ExtensionComponentRegistry } from './extension-component-registry.service';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
const _c0 = ["outlet"];
function ExtensionOutletComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 1);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "extensions.extension-outlet.loading"), " ");
} }
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
export class ExtensionOutletComponent {
    /** Registered component ID to render. Takes precedence over `componentType`. */
    componentId = input(null, ...(ngDevMode ? [{ debugName: "componentId" }] : []));
    /** An already-imported component, for callers that have one in hand. */
    componentType = input(null, ...(ngDevMode ? [{ debugName: "componentType" }] : []));
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
    componentInputs = input({}, ...(ngDevMode ? [{ debugName: "componentInputs" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    /** True when nothing could be resolved, so the host can render a fallback. */
    unresolved = signal(false, ...(ngDevMode ? [{ debugName: "unresolved" }] : []));
    outlet;
    registry = inject(ExtensionComponentRegistry);
    injector = inject(Injector);
    environmentInjector = inject(EnvironmentInjector);
    componentRef = null;
    renderedType = null;
    /** Public names of the inputs the rendered component declares. */
    declaredInputs = new Set();
    /** The declared input names last set, from {@link declaredKeysOf}. */
    appliedKeys = new Set();
    /** Bumped on every request so a slow load cannot overwrite a newer one. */
    generation = 0;
    /** Retries left for the requested id after its loader rejected — {@link retryUnresolved}. */
    retriesLeft = 0;
    /** A retry's load is pending; updates meanwhile ride on it rather than starting another. */
    retrying = false;
    static MAX_RETRIES = 2;
    constructor() {
        inject(DestroyRef).onDestroy(() => this.clear());
        effect(() => {
            const id = this.componentId();
            const type = this.componentType();
            const generation = ++this.generation;
            if (type) {
                untracked(() => this.render(type, generation));
                return;
            }
            if (!id) {
                this.clear();
                this.loading.set(false);
                this.unresolved.set(false);
                return;
            }
            const immediate = this.registry.peek(id);
            if (immediate) {
                untracked(() => this.render(immediate, generation));
                return;
            }
            this.retriesLeft = ExtensionOutletComponent.MAX_RETRIES;
            this.retrying = false;
            untracked(() => this.load(id, generation, false));
        });
        effect(() => {
            const inputs = this.componentInputs() ?? {};
            untracked(() => {
                if (!this.componentRef || !this.renderedType) {
                    this.retryUnresolved();
                    return;
                }
                if (this.setsAppliedKeys(inputs)) {
                    this.applyInputs(this.componentRef, inputs);
                }
                else {
                    this.render(this.renderedType, this.generation);
                }
            });
        });
    }
    /**
     * Resolve `id` and render it, or mark the outlet unresolved.
     *
     * A `retry` leaves the outlet as it is — unresolved, nothing rendered, no loading state —
     * until the load settles, so a host showing its fallback keeps showing it rather than
     * blanking for the length of a chunk request that may fail again.
     */
    load(id, generation, retry) {
        if (!retry) {
            this.clear();
            this.loading.set(true);
            this.unresolved.set(false);
        }
        void this.registry.resolve(id).then((resolvedType) => {
            if (generation !== this.generation)
                return;
            if (retry)
                this.retrying = false;
            this.loading.set(false);
            if (!resolvedType) {
                this.clear();
                this.unresolved.set(true);
                return;
            }
            this.render(resolvedType, generation);
        });
    }
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
    retryUnresolved() {
        const id = this.componentId();
        if (this.retrying || !this.unresolved() || !id || this.componentType())
            return;
        if (this.retriesLeft <= 0 || !this.registry.has(id))
            return;
        this.retriesLeft -= 1;
        this.retrying = true;
        this.load(id, ++this.generation, true);
    }
    render(type, generation) {
        if (generation !== this.generation)
            return;
        this.clear();
        const ref = createComponent(type, {
            environmentInjector: this.environmentInjector,
            elementInjector: this.injector,
        });
        this.declaredInputs = new Set(reflectComponentType(type)?.inputs.map((declared) => declared.templateName) ?? []);
        this.applyInputs(ref, this.componentInputs() ?? {});
        this.outlet.insert(ref.hostView);
        this.componentRef = ref;
        this.renderedType = type;
        this.loading.set(false);
        this.unresolved.set(false);
    }
    /**
     * Set the inputs the component declares, and only those.
     *
     * A descriptor's inputs are customer-authored, and a host may offer an input not every
     * component wants — `documentView` always offers `document`. `setInput` does not throw
     * on an undeclared name; in a development build it logs NG0303 to the console, so the
     * filter is what keeps an unused key silent rather than a `catch` that never fires.
     */
    applyInputs(ref, inputs) {
        this.appliedKeys = this.declaredKeysOf(inputs);
        for (const [name, value] of Object.entries(inputs)) {
            if (!this.declaredInputs.has(name))
                continue;
            // A declared input's `transform` is the component's code, run on customer data;
            // a value it rejects must not blank the panel.
            try {
                ref.setInput(name, value);
            }
            catch {
                /* keep the rest of the inputs and the rendered component */
            }
        }
    }
    /** The declared input names `inputs` sets. */
    declaredKeysOf(inputs) {
        return new Set(Object.keys(inputs).filter((name) => this.declaredInputs.has(name)));
    }
    /** Whether `inputs` sets exactly the declared inputs last applied. */
    setsAppliedKeys(inputs) {
        const keys = this.declaredKeysOf(inputs);
        return (keys.size === this.appliedKeys.size && [...keys].every((name) => this.appliedKeys.has(name)));
    }
    clear() {
        this.outlet?.clear();
        this.componentRef?.destroy();
        this.componentRef = null;
        this.renderedType = null;
        this.declaredInputs = new Set();
        this.appliedKeys = new Set();
    }
    static ɵfac = function ExtensionOutletComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ExtensionOutletComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ExtensionOutletComponent, selectors: [["lib-extension-outlet"]], viewQuery: function ExtensionOutletComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 7, ViewContainerRef);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.outlet = _t.first);
        } }, inputs: { componentId: [1, "componentId"], componentType: [1, "componentType"], componentInputs: [1, "componentInputs"] }, decls: 3, vars: 1, consts: [["outlet", ""], ["role", "status", "aria-live", "polite", 1, "extension-outlet__loading"]], template: function ExtensionOutletComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, ExtensionOutletComponent_Conditional_0_Template, 3, 3, "div", 1);
            i0.ɵɵdomElementContainer(1, null, 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.loading() ? 0 : -1);
        } }, dependencies: [TranslatePipe], encapsulation: 2, changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ExtensionOutletComponent, [{
        type: Component,
        args: [{ selector: 'lib-extension-outlet', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (loading()) {\n  <div class=\"extension-outlet__loading\" role=\"status\" aria-live=\"polite\">\n    {{ 'extensions.extension-outlet.loading' | translate }}\n  </div>\n}\n<ng-container #outlet />\n" }]
    }], () => [], { componentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "componentId", required: false }] }], componentType: [{ type: i0.Input, args: [{ isSignal: true, alias: "componentType", required: false }] }], componentInputs: [{ type: i0.Input, args: [{ isSignal: true, alias: "componentInputs", required: false }] }], outlet: [{
            type: ViewChild,
            args: ['outlet', { static: true, read: ViewContainerRef }]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ExtensionOutletComponent, { className: "ExtensionOutletComponent", filePath: "libs/shared/extensions/src/lib/extension-outlet.component.ts", lineNumber: 55 }); })();
//# sourceMappingURL=extension-outlet.component.js.map