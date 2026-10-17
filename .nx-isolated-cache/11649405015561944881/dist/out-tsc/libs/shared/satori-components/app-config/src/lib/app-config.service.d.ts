import { AppBootstrapConfig, AppThemeConfig } from './bootstrap-config';
import { AppConfigFragmentInfo, AppConfigServerDiagnostic } from './config-response';
import { AppRuntimeManifest } from './runtime-manifest';
import * as i0 from "@angular/core";
/**
 * How long each half may take before the application starts on the packaged defaults instead.
 * `load()` runs as an `APP_INITIALIZER` and `HttpClient` has no timeout of its own, so a server that
 * accepts the request and never answers would otherwise hold the first render forever.
 */
export declare const CONFIG_LOAD_TIMEOUT_MS = 10000;
/** Where a loaded half of the configuration came from, so the shell can show it rather than guess. */
export type AppConfigSource = 'packaged-default' | 'configuration-service';
export interface AppConfigDiagnostics {
    readonly bootstrapSource: AppConfigSource;
    readonly manifestSource: AppConfigSource;
    /** The fragments applied, in order, with the package component that contributed each. */
    readonly bootstrapFragments: readonly AppConfigFragmentInfo[];
    readonly manifestFragments: readonly AppConfigFragmentInfo[];
    /** What the server reported about contributions it rejected, replaced or removed. */
    readonly serverDiagnostics: readonly AppConfigServerDiagnostic[];
    /** Human-readable reasons a load fell back or a preset was refused, in the order they happened. */
    readonly messages: readonly string[];
}
/** The presales preset in force, for the badge that says so. */
export interface AppActivePreset {
    readonly name: string;
    readonly label: string;
}
/**
 * Loads the two halves of the Layer 0/1 configuration and exposes them as signals.
 *
 * Both come from the server's configuration service: `bootstrap.json` and `manifest.json`, each an
 * ordered list of fragments contributed by Marketplace packages. Both are anonymous, so they are
 * fetched once, together, before sign-in, and nothing about them changes with the session.
 *
 * Uses an `HttpClient` of its own, built on `HttpBackend`, which the repository otherwise reserves
 * for `NuxeoApiBase`. That is deliberate and confined to this service: these two requests skip
 * every interceptor. An interceptor that reads configuration — the host application's auth
 * interceptor resolves the Nuxeo API origin and the sign-in services — would otherwise resolve it
 * while it is still loading, and Angular keeps a token's first value for the life of the
 * application, so every package-contributed value it read would be replaced by its default. Both
 * halves are anonymous, so skipping the interceptor also keeps the signed-in user's
 * `Authorization` header off them.
 *
 * The load is **tolerant by contract**. An unreachable service, an error status, a malformed
 * response or no answer within {@link CONFIG_LOAD_TIMEOUT_MS} falls back to the packaged defaults
 * and records why. The application must start on a server where nothing is configured.
 */
export declare class AppConfigService {
    private readonly http;
    private readonly bootstrapUrl;
    private readonly manifestUrl;
    private readonly document;
    private readonly bootstrapConfig;
    private readonly runtimeManifest;
    private readonly presetState;
    private loading;
    private readonly diagnosticsState;
    readonly bootstrap: import("@angular/core").Signal<AppBootstrapConfig>;
    readonly manifest: import("@angular/core").Signal<AppRuntimeManifest>;
    readonly diagnostics: import("@angular/core").Signal<AppConfigDiagnostics>;
    /** The presales preset in force, or `null`. Only ever set where a package enables switching. */
    readonly activePreset: import("@angular/core").Signal<AppActivePreset | null>;
    /** Themes available to the theme picker — packaged ones merged with configured ones. */
    readonly themes: import("@angular/core").Signal<readonly AppThemeConfig[]>;
    /**
     * The configured logo with its `src` resolved to the URL an `<img>` loads, or `null` to keep the
     * Satori marks. Resolved here because only this service knows where `bootstrap.json` came from.
     */
    readonly brandingLogo: import("@angular/core").Signal<{
        readonly url: string;
        readonly alt: string;
    } | null>;
    /**
     * Fetch both halves, choose the preset, and apply everything in order. Never rejects, so it is
     * safe as an `APP_INITIALIZER`.
     *
     * Runs once: a later call returns the first call's promise. That is what lets another
     * initializer wait for the configuration instead of racing it, since Angular runs
     * `APP_INITIALIZER` functions concurrently.
     */
    load(): Promise<void>;
    private fetchAndApply;
    /** The active theme definition for a stored or configured theme id. */
    resolveTheme(id: string | null): AppThemeConfig;
    /** A manifest feature toggle, or `fallback` when no package has set it. */
    featureToggle(id: string, fallback: boolean): boolean;
    private fetch;
    /**
     * The preset to apply, if switching is enabled and one is chosen. The URL wins over the stored
     * choice and replaces it; an unknown name is reported and forgotten.
     */
    private choosePreset;
    private stored;
    private store;
    /** Recorded and logged: the product app has no page showing diagnostics, so the console is where support finds them. */
    private note;
    static ɵfac: i0.ɵɵFactoryDeclaration<AppConfigService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AppConfigService>;
}
//# sourceMappingURL=app-config.service.d.ts.map