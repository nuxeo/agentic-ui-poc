import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Components a manifest may reference by ID.
 *
 * This is the mechanism behind `extensions.setComponents({...})` in ACA, and
 * the reason Layer 1 stops where it does: a manifest can only wire together
 * components that are already compiled in. Contributing a *new* component is
 * Layer 2 — a customer library calls `register()` with its own IDs.
 */
export class ExtensionComponentRegistry {
    sources = new Map();
    resolved = new Map();
    pending = new Map();
    /** Register components by ID. A later registration replaces an earlier one. */
    register(components) {
        for (const [id, source] of Object.entries(components)) {
            this.sources.set(id, source);
            // Drop any cached resolution, or an override would never take effect.
            this.resolved.delete(id);
            this.pending.delete(id);
        }
    }
    registeredComponentIds() {
        return [...this.sources.keys()].sort();
    }
    has(id) {
        return this.sources.has(id);
    }
    /** An already-resolved component, or `null` if it is lazy and not loaded yet. */
    peek(id) {
        const source = this.sources.get(id);
        if (typeof source === 'function' && isComponentType(source))
            return source;
        return this.resolved.get(id) ?? null;
    }
    /**
     * Resolve a component by ID, loading it if it is behind a dynamic import.
     *
     * Returns `null` rather than throwing for an unregistered ID **or a loader
     * that rejects**. A chunk that fails to load is a deployment or network
     * problem, and the caller's job is to render a fallback panel, not to take the
     * application down. In-flight loads are shared, so a slot resolving twice in
     * one change-detection pass does not fetch the chunk twice.
     */
    async resolve(id) {
        const cached = this.peek(id);
        if (cached)
            return cached;
        const source = this.sources.get(id);
        if (!source)
            return null;
        const inFlight = this.pending.get(id);
        if (inFlight)
            return inFlight;
        const load = source()
            .then((component) => {
            this.resolved.set(id, component);
            return component;
        })
            .catch(() => null)
            .finally(() => this.pending.delete(id));
        this.pending.set(id, load);
        return load;
    }
    static ɵfac = function ExtensionComponentRegistry_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ExtensionComponentRegistry)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ExtensionComponentRegistry, factory: ExtensionComponentRegistry.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ExtensionComponentRegistry, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
/**
 * Distinguish a component class from a `() => Promise<Type>` loader.
 *
 * Both are functions. Angular decorates component classes with static
 * compilation metadata, and a plain arrow function has none, so the presence of
 * `ɵcmp` is the only reliable discriminator available at runtime. A class
 * without it would be treated as a loader and fail to resolve, which is why
 * only real components should be registered eagerly.
 */
function isComponentType(source) {
    return (typeof source === 'function' &&
        (Object.prototype.hasOwnProperty.call(source, 'ɵcmp') ||
            Object.prototype.hasOwnProperty.call(source, 'ɵdir')));
}
