import { Injectable, type Type } from '@angular/core';

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
@Injectable({ providedIn: 'root' })
export class ExtensionComponentRegistry {
  private readonly sources = new Map<string, ExtensionComponentSource>();
  private readonly resolved = new Map<string, Type<unknown>>();
  private readonly pending = new Map<string, Promise<Type<unknown> | null>>();

  /** Register components by ID. A later registration replaces an earlier one. */
  register(components: Readonly<Record<string, ExtensionComponentSource>>): void {
    for (const [id, source] of Object.entries(components)) {
      this.sources.set(id, source);
      // Drop any cached resolution, or an override would never take effect.
      this.resolved.delete(id);
      this.pending.delete(id);
    }
  }

  registeredComponentIds(): readonly string[] {
    return [...this.sources.keys()].sort();
  }

  has(id: string): boolean {
    return this.sources.has(id);
  }

  /** An already-resolved component, or `null` if it is lazy and not loaded yet. */
  peek(id: string): Type<unknown> | null {
    const source = this.sources.get(id);
    if (typeof source === 'function' && isComponentType(source)) return source;
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
  async resolve(id: string): Promise<Type<unknown> | null> {
    const cached = this.peek(id);
    if (cached) return cached;

    const source = this.sources.get(id);
    if (!source) return null;

    const inFlight = this.pending.get(id);
    if (inFlight) return inFlight;

    const load = (source as () => Promise<Type<unknown>>)()
      .then((component) => {
        this.resolved.set(id, component);
        return component;
      })
      .catch(() => null)
      .finally(() => this.pending.delete(id));

    this.pending.set(id, load);
    return load;
  }
}

/**
 * Distinguish a component class from a `() => Promise<Type>` loader.
 *
 * Both are functions. Angular decorates component classes with static
 * compilation metadata, and a plain arrow function has none, so the presence of
 * `ɵcmp` is the only reliable discriminator available at runtime. A class
 * without it would be treated as a loader and fail to resolve, which is why
 * only real components should be registered eagerly.
 */
function isComponentType(source: unknown): source is Type<unknown> {
  return (
    typeof source === 'function' &&
    (Object.prototype.hasOwnProperty.call(source, 'ɵcmp') ||
      Object.prototype.hasOwnProperty.call(source, 'ɵdir'))
  );
}
