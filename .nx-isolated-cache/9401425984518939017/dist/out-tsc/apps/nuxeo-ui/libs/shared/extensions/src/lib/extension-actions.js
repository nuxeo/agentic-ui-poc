import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Handlers, keyed by the id a descriptor names.
 *
 * Separate from {@link ExtensionSlotRegistry} on purpose: *where* an action
 * appears is Layer 1 configuration, and *what it does* is Layer 2 code. Keeping
 * them apart is what lets a manifest move an action between the toolbar and the
 * overflow menu without knowing anything about its implementation.
 *
 * Two tiers, because arrival order cannot decide precedence here. A customer
 * registers from an `APP_INITIALIZER`, as the extension reference tells them to,
 * while a packaged surface registers handlers closing over a component instance
 * in `ngOnInit` — so the packaged registration is always the *later* one, and a
 * single last-wins map would silently outrank every customer override of a
 * packaged id. {@link register} is the customer tier and always wins;
 * {@link registerPackaged} supplies the behaviour used when nobody has.
 */
export class ExtensionActionRegistry {
    overrides = new Map();
    packaged = new Map();
    /**
     * Add or replace handlers. Later registration wins, which is how a customer
     * library replaces a packaged action's behaviour without forking, and it
     * outranks {@link registerPackaged} whenever either was called.
     */
    register(handlers) {
        return this.add(this.overrides, handlers);
    }
    /**
     * Add handlers for the behaviour this build ships, outranked by any
     * {@link register} call.
     *
     * For a packaged surface registering handlers that close over a component
     * instance: withdraw the returned registration when the component is
     * destroyed, or the registry keeps a destroyed component reachable and the
     * next invocation runs against dead state.
     */
    registerPackaged(handlers) {
        return this.add(this.packaged, handlers);
    }
    has(id) {
        return this.resolve(id) !== undefined;
    }
    /** Every registered id, for the reference doc and for diagnostics. */
    registeredActionIds() {
        return [...new Set([...this.overrides.keys(), ...this.packaged.keys()])].sort();
    }
    /**
     * Run the handler a descriptor names.
     *
     * Returns `false` when nothing is registered under the id rather than
     * throwing: a manifest may reference an action a newer build provides, and a
     * click on it should be inert, not a crash in the shell.
     */
    execute(descriptor, context) {
        const handler = this.resolve(descriptor.action ?? descriptor.id);
        if (!handler)
            return false;
        handler.execute(context);
        return true;
    }
    add(tier, handlers) {
        const added = Object.entries(handlers);
        for (const [id, handler] of added) {
            const registered = tier.get(id);
            if (registered)
                registered.push(handler);
            else
                tier.set(id, [handler]);
        }
        return { unregister: () => this.remove(tier, added) };
    }
    /**
     * Within a tier the most recent registration answers, so withdrawing an
     * earlier one must leave the later one in place — hence removing this
     * handler rather than the id.
     */
    remove(tier, added) {
        for (const [id, handler] of added) {
            const registered = tier.get(id);
            const at = registered?.lastIndexOf(handler) ?? -1;
            if (!registered || at === -1)
                continue;
            registered.splice(at, 1);
            if (registered.length === 0)
                tier.delete(id);
        }
    }
    resolve(id) {
        return this.overrides.get(id)?.at(-1) ?? this.packaged.get(id)?.at(-1);
    }
    static ɵfac = function ExtensionActionRegistry_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ExtensionActionRegistry)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ExtensionActionRegistry, factory: ExtensionActionRegistry.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ExtensionActionRegistry, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
/**
 * The text of a descriptor, preferring its translation key over its literal label.
 *
 * For the consumers a template pipe cannot reach — a page heading built in TypeScript, a
 * composed accessible name, and adf-core's `DataColumn.title`, which upstream's own DataTable
 * renders where we have no template at all.
 *
 * `@i18n-contract:descriptor-api-is-framework-agnostic`
 *
 * Takes a resolver rather than `TranslateService` so that **this function, and the descriptor
 * data contract around it, impose no translation library on a caller**: Layer 1 descriptors are
 * data, and which library renders them is the host's business. Callers pass
 * `(key) => translate.instant(key)`.
 *
 * That is narrower than what this comment used to claim, and the difference matters. It said the
 * LIBRARY keeps no dependency on ngx-translate, and that stopped being true in this same
 * change-set — twice. `extension-outlet.component.ts` imports `TranslatePipe` for its `Loading…`
 * live region, and `DescriptorLabelPipe` injects `TranslateService`. A reviewer caught the pipe;
 * the outlet had gone unremarked for several commits.
 *
 * Moving both out was tried and is not viable: the pipe in `shared/ui` importing `descriptorLabel`
 * from here leaves a component undefined at module-initialisation time and takes six `AppShellComponent`
 * specs with it. So the honest statement is the one above — the function and the data contract are
 * agnostic, the library's own Angular components are not, and `@ngx-translate/core` is a declared
 * peer dependency of `@nuxeo/satori-platform` for exactly that reason.
 *
 * Falls back to the literal when a key does not resolve, because ngx-translate passes an
 * unknown key straight through and a column header reading `column.last-contributor` is worse
 * than the English it replaced.
 */
export function descriptorLabel(descriptor, translate) {
    if (!descriptor.labelKey)
        return descriptor.label;
    const resolved = translate(descriptor.labelKey);
    return resolved === descriptor.labelKey ? descriptor.label : resolved;
}
