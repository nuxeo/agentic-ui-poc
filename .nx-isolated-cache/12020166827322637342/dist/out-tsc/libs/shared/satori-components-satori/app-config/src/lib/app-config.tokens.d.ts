import { InjectionToken } from '@angular/core';
/** Directory name, relative to the application bundle's parent, the configuration is served from. */
export declare const APP_CONFIG_DIRECTORY = "agentic-ui-config";
export declare const APP_BOOTSTRAP_CONFIG_FILE = "bootstrap.json";
export declare const APP_MANIFEST_CONFIG_FILE = "manifest.json";
/**
 * Resolve the bootstrap configuration URL as a **sibling** of the application bundle rather than
 * a file inside it.
 *
 * Production base href is `/nuxeo/agentic-ui/`, giving `/nuxeo/agentic-ui-config/bootstrap.json`,
 * which the configuration servlet in `nuxeo-agentic-core` answers with the bootstrap fragments
 * every installed package contributed. Nothing on the server's disk is served at that path.
 *
 * Under `nx serve` the base href is `/`, where `../` clamps to the root and gives
 * `/agentic-ui-config/bootstrap.json`, served from the gitignored
 * `apps/nuxeo-ui/public/agentic-ui-config/` when a developer puts a response there.
 *
 * @param baseUri normally `document.baseURI`
 */
export declare function resolveBootstrapConfigUrl(baseUri: string): string;
/** The manifest response, served beside the bootstrap one. */
export declare function resolveManifestConfigUrl(bootstrapUrl: string): string;
/**
 * Where the bootstrap configuration is fetched from. Overridable so tests and
 * alternative deployment layouts do not have to fake `document.baseURI`.
 */
export declare const APP_BOOTSTRAP_CONFIG_URL: InjectionToken<string>;
/** Where the manifest is fetched from: beside the bootstrap response unless overridden. */
export declare const APP_MANIFEST_CONFIG_URL: InjectionToken<string>;
//# sourceMappingURL=app-config.tokens.d.ts.map