/**
 * Layer 0/1 runtime manifest.
 *
 * Contributed by Marketplace packages as `manifest` fragments to the server's configuration
 * service and served, in contribution order, at `agentic-ui-config/manifest.json`. The browser
 * folds the fragments over {@link DEFAULT_APP_RUNTIME_MANIFEST} with
 * {@link mergeRuntimeManifest}, so a later package wins key by key.
 */
export interface ManifestNavItem {
    readonly id: string;
    readonly label: string;
    readonly route: string;
    readonly icon: string;
    readonly order: number;
    readonly visible: boolean;
}
export interface ManifestAction {
    /** Hide a packaged action without a rebuild. */
    readonly visible: boolean;
    /** ID of a registered rule that further gates visibility. Resolved in Phase 2. */
    readonly rule: string | null;
    /** Overrides the packaged label when set. */
    readonly label: string | null;
    readonly order: number | null;
}
export interface AppRuntimeManifest {
    /** Schema version of the document, so a future loader can migrate rather than guess. */
    readonly version: number;
    readonly navItems: readonly ManifestNavItem[];
    /** Keyed by registered action ID. */
    readonly actions: Readonly<Record<string, ManifestAction>>;
    /** Keyed by registered rule ID; `false` disables the rule. */
    readonly rules: Readonly<Record<string, boolean>>;
    /** Named parameter sets — search presets, column layouts, import defaults. */
    readonly presets: Readonly<Record<string, unknown>>;
    readonly featureToggles: Readonly<Record<string, boolean>>;
    /**
     * Translation overrides, merged over the shipped catalogue for every language.
     * This is how a customer relabels the product without touching a bundle.
     */
    readonly labels: Readonly<Record<string, string>>;
    /**
     * The Layer 1 extension config of each fragment that has one — slot contributions, per-id
     * overrides and `$references` layering — in contribution order.
     *
     * Kept as layers rather than merged here, and held **opaquely**, on purpose. Their schema
     * and their merge (`mergeExtensionConfigs`) belong to `@nuxeo/satori-platform/extensions`;
     * keeping both out of this library is what stops the configuration loader depending on the
     * registry it configures. Each layer is passed through unvalidated — the registry validates
     * it, and it must tolerate whatever a package contributed.
     */
    readonly extensionLayers: readonly Readonly<Record<string, unknown>>[];
}
/** An empty manifest: no overrides, so the packaged behaviour stands unchanged. */
export declare const DEFAULT_APP_RUNTIME_MANIFEST: AppRuntimeManifest;
/**
 * Overlay one manifest fragment onto the manifest built so far.
 *
 * Total in the same way as {@link mergeBootstrapConfig}: a package that contributes a
 * malformed fragment must get the packaged application back, not a blank screen.
 */
export declare function mergeRuntimeManifest(base: AppRuntimeManifest, patch: unknown): AppRuntimeManifest;
//# sourceMappingURL=runtime-manifest.d.ts.map