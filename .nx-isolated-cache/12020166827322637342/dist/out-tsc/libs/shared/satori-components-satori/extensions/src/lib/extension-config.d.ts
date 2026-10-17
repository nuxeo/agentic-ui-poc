import type { ExtensionElement, ExtensionSlotId } from './extension-slots';
import type { ExtensionOverride } from './extension-slot-registry.service';
/**
 * The Layer 1 half of the runtime manifest, as a customer writes it.
 *
 * `$`-prefixed keys are **metadata and do not merge** — that is ACA's rule, and
 * `mergeObjects` reproduces it exactly (see `extension-merge.ts`). So `$references`
 * itself never leaks from a referenced layer into the merged result, and a layer
 * can carry `$name`/`$version` for diagnostics without polluting configuration.
 */
export interface ExtensionConfig {
    /** Layer names to merge over this object, in ascending `order`. Later wins. */
    readonly $references?: readonly string[];
    /** Layer names to drop even when `$references` lists them. */
    readonly $ignoreReferenceList?: readonly string[];
    /** Named layers, so a single manifest fragment can carry a whole stack. */
    readonly $layers?: Readonly<Record<string, ExtensionConfig>>;
    /** Free-form metadata for diagnostics. */
    readonly $name?: string;
    readonly $version?: string;
    /** Descriptors contributed per slot id. */
    readonly slots?: Readonly<Record<ExtensionSlotId, readonly ExtensionElement[]>>;
    /** Overrides for packaged descriptors, keyed by descriptor id. */
    readonly overrides?: Readonly<Record<string, ExtensionOverride>>;
}
/** Where a layer's body came from, so a failure to resolve one is reportable. */
export type ExtensionLayerResolver = (name: string) => ExtensionConfig | null;
export interface ResolvedExtensionConfig {
    readonly config: ExtensionConfig;
    /** Layer names merged, in the order applied. */
    readonly applied: readonly string[];
    /** Layer names listed but not resolvable, so the shell can report rather than guess. */
    readonly missing: readonly string[];
}
/**
 * Merge configuration layers left to right, later winning.
 *
 * A thin wrapper over `mergeObjects`, which reproduces ACA's merge and is pinned to it case by
 * case in `extension-merge.spec.ts`:
 *
 * - arrays of objects merge **by `id`**, so a layer patches one toolbar entry
 *   without restating the toolbar;
 * - `"<key>.$replace"` replaces rather than merges, for the cases where a
 *   customer genuinely wants to drop our list;
 * - `$`-prefixed keys are skipped at the top level, and inside any object that
 *   two layers both set.
 */
export declare function mergeExtensionConfigs(...layers: readonly ExtensionConfig[]): ExtensionConfig;
/**
 * Resolve `$references` against a layer lookup and merge the result.
 *
 * Layers are applied in the order `$references` lists them, so the **last file
 * wins** — a customer layer placed after ours overrides ours. Names in
 * `$ignoreReferenceList` are dropped even if referenced, which is how a
 * deployment disables a layer it cannot edit.
 *
 * References are resolved one level deep on purpose. A referenced layer's own
 * `$references` is metadata and is skipped by the merge, so nesting would be
 * silently ignored rather than half-honoured; keeping it flat means what a
 * customer reads in the JSON is what happens.
 */
export declare function resolveExtensionConfig(root: ExtensionConfig, resolveLayer?: ExtensionLayerResolver): ResolvedExtensionConfig;
/**
 * Resolve each package's extension layer on its own, then merge them in contribution order, so
 * a package that depends on another wins over it.
 *
 * Each layer's `$references` resolve against that layer's own `$layers`: one package cannot
 * reach into another's named layers.
 */
export declare function resolveExtensionLayers(layers: readonly unknown[]): ResolvedExtensionConfig;
/**
 * Read an untrusted value into an {@link ExtensionConfig}.
 *
 * Tolerant in the same way as the Phase 1 loaders: a customer who saves
 * something malformed must get the packaged application back, not a blank
 * screen. Slot entries without a string `id` are dropped, because an entry with
 * no id cannot be addressed, overridden or reasoned about.
 */
export declare function readExtensionConfig(raw: unknown): ExtensionConfig;
//# sourceMappingURL=extension-config.d.ts.map