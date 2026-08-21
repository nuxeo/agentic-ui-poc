import { InjectionToken } from '@angular/core';

/** Directory name, relative to the application bundle's parent, holding the deployed configuration. */
export const APP_CONFIG_DIRECTORY = 'agentic-ui-config';

export const APP_BOOTSTRAP_CONFIG_FILE = 'bootstrap.json';

/**
 * Resolve the bootstrap configuration URL as a **sibling** of the application
 * bundle rather than a file inside it.
 *
 * That single `../` is the whole point of the path. The marketplace installer
 * copies the packaged `web` directory over the deployed one with
 * `overwrite="true"`, so a configuration file inside `.../agentic-ui/` is
 * silently replaced by ours on every upgrade. `.../agentic-ui-config/` is
 * outside that copy's source tree and is installed by a separate,
 * non-overwriting step, so customer edits survive.
 *
 * Production base href is `/nuxeo/agentic-ui/`, giving
 * `/nuxeo/agentic-ui-config/bootstrap.json`. The `nuxeo` Tomcat context has
 * `docBase="../nxserver/nuxeo.war"`, so that URL is served from
 * `<server.home>/nxserver/nuxeo.war/agentic-ui-config/` — which is exactly the
 * `todir` of the non-overwriting copy in `install.xml`. Note that
 * `<server.home>/nxserver/web` holds only `root.war` and is not a docBase;
 * installing there produces a permanent 404.
 *
 * Under `nx serve` the base href is `/`, where `../` clamps to the root and
 * gives `/agentic-ui-config/bootstrap.json`.
 *
 * @param baseUri normally `document.baseURI`
 */
export function resolveBootstrapConfigUrl(baseUri: string): string {
  const url = new URL(`../${APP_CONFIG_DIRECTORY}/${APP_BOOTSTRAP_CONFIG_FILE}`, baseUri);
  return `${url.pathname}${url.search}`;
}

/**
 * Where the bootstrap configuration is fetched from. Overridable so tests and
 * alternative deployment layouts do not have to fake `document.baseURI`.
 */
export const APP_BOOTSTRAP_CONFIG_URL = new InjectionToken<string>('APP_BOOTSTRAP_CONFIG_URL', {
  providedIn: 'root',
  factory: () => resolveBootstrapConfigUrl(document.baseURI),
});
