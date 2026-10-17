/**
 * The response the server's configuration service sends for one layer.
 *
 * `nuxeo-agentic-core` serves `bootstrap.json` and `manifest.json` as an envelope of ordered
 * fragments, one per contribution, each naming the package component that contributed it. The
 * browser applies them in that order, so a package that depends on another wins over it.
 */
export declare const APP_CONFIG_FORMAT = "nuxeo-agentic-ui-config/1";
export type AppConfigLayer = 'bootstrap' | 'manifest';
/** Where a fragment came from, as the server reports it. */
export interface AppConfigFragmentInfo {
    readonly name: string;
    readonly component: string;
    readonly bundle: string;
    /** The resource path inside the contributing bundle, or `inline`. */
    readonly source: string;
}
export interface AppConfigFragment extends AppConfigFragmentInfo {
    readonly content: Readonly<Record<string, unknown>>;
}
/** A contribution the server rejected, replaced or removed, as it reported it. */
export interface AppConfigServerDiagnostic {
    readonly level: string;
    readonly code: string;
    readonly message: string;
    readonly component: string | null;
}
export interface AppConfigResponse {
    readonly fragments: readonly AppConfigFragment[];
    readonly diagnostics: readonly AppConfigServerDiagnostic[];
}
/**
 * Read a configuration response, or say why it is not one.
 *
 * Only the envelope is accepted. A bare JSON object — what an edited `bootstrap.json` used to be —
 * is refused rather than applied, because nothing on the server serves one: accepting it would
 * keep a second, unattributed format alive for no deployment that can produce it.
 *
 * A fragment whose `content` is not an object is skipped; the rest still apply.
 */
export declare function readConfigResponse(raw: unknown, layer: AppConfigLayer): AppConfigResponse | {
    readonly invalid: string;
};
//# sourceMappingURL=config-response.d.ts.map