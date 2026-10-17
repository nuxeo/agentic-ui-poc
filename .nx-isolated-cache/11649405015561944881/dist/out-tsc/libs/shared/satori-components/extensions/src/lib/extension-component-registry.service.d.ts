import { type Type } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * A component contributed by ID, either eagerly or behind a dynamic import.
 *
 * The lazy form matters: routes, tabs and drawer panels all live in
 * lazy-loaded feature libraries, and a registry that only accepted a `Type`
 * would force the shell to statically import every one of them and defeat code
 * splitting. `nav-drawer.component.ts` already worked around this with an
 * ad-hoc `Promise.all` of dynamic imports; the loader form replaces it.
 */
export type ExtensionComponentSource = Type<unknown> | (() => Promise<Type<unknown>>);
/**
 * Components a manifest may reference by ID.
 *
 * This is the mechanism behind `extensions.setComponents({...})` in ACA, and
 * the reason Layer 1 stops where it does: a manifest can only wire together
 * components that are already compiled in. Contributing a *new* component is
 * Layer 2 — a customer library calls `register()` with its own IDs.
 */
export declare class ExtensionComponentRegistry {
    private readonly sources;
    private readonly resolved;
    private readonly pending;
    /** Register components by ID. A later registration replaces an earlier one. */
    register(components: Readonly<Record<string, ExtensionComponentSource>>): void;
    registeredComponentIds(): readonly string[];
    has(id: string): boolean;
    /** An already-resolved component, or `null` if it is lazy and not loaded yet. */
    peek(id: string): Type<unknown> | null;
    /**
     * Resolve a component by ID, loading it if it is behind a dynamic import.
     *
     * Returns `null` rather than throwing for an unregistered ID **or a loader
     * that rejects**. A chunk that fails to load is a deployment or network
     * problem, and the caller's job is to render a fallback panel, not to take the
     * application down. In-flight loads are shared, so a slot resolving twice in
     * one change-detection pass does not fetch the chunk twice.
     */
    resolve(id: string): Promise<Type<unknown> | null>;
    static ɵfac: i0.ɵɵFactoryDeclaration<ExtensionComponentRegistry, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ExtensionComponentRegistry>;
}
//# sourceMappingURL=extension-component-registry.service.d.ts.map