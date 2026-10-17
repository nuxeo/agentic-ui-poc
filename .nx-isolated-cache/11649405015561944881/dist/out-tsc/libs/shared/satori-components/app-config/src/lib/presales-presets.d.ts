/**
 * Presales presets: named sets of configuration a demo package ships, so one demo server can be
 * shown to several prospects without redeploying.
 *
 * A bootstrap fragment declares them under `presales`:
 *
 * ```json
 * "presales": {
 *   "presetSwitching": true,
 *   "presets": {
 *     "acme": { "label": "Acme Insurance", "bootstrap": { ... }, "manifest": { ... } }
 *   }
 * }
 * ```
 *
 * A browser chooses one with `?preset=<name>`, which is remembered in `localStorage`;
 * `?preset=` with no name clears it. The chosen preset's `bootstrap` and `manifest` are applied
 * after every package's fragments, so it wins over all of them. **Nothing happens unless a
 * package sets `presetSwitching: true`** — a customer's server ignores the parameter and the
 * stored choice alike. Presets are package content, served anonymously like every fragment, and
 * the parameter only picks among them.
 */
export declare const PRESET_QUERY_PARAM = "preset";
export declare const PRESET_STORAGE_KEY = "agentic-ui.preset";
export interface AppPreset {
    readonly name: string;
    readonly label: string;
    readonly bootstrap: Readonly<Record<string, unknown>> | null;
    readonly manifest: Readonly<Record<string, unknown>> | null;
}
export interface AppPresalesConfig {
    readonly presetSwitching: boolean;
    readonly presets: Readonly<Record<string, AppPreset>>;
}
/**
 * Collect `presales` across bootstrap fragments in order. A later `presetSwitching` wins, and a
 * later preset with the same name replaces the earlier one whole.
 */
export declare function readPresales(fragments: readonly unknown[]): AppPresalesConfig;
/**
 * The preset the URL asks for: a name, `''` to clear the remembered one, or `undefined` when the
 * URL does not mention it. Read from the query and from the hash's query, because the app routes
 * with `withHashLocation()` and a link may put the parameter on either side of the `#`.
 */
export declare function requestedPreset(location: Pick<Location, 'search' | 'hash'>): string | undefined;
//# sourceMappingURL=presales-presets.d.ts.map