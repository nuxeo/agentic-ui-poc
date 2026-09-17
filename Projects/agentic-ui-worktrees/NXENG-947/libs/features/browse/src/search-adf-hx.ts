/**
 * Secondary entry point: the adf-hx search route, and nothing else.
 *
 * Reachable as `@agentic-ui/feature-browse/search-adf-hx`, mapped in `tsconfig.base.json`. Same
 * pattern and same reason as `@agentic-ui/feature-browse/adf-hx-poc`.
 *
 * `SearchAdfHxComponent` imports `@alfresco/adf-hx-content-services/ui` directly. Exported from
 * the feature's **main** barrel, that would make adf-hx reachable from anything importing
 * `@agentic-ui/feature-browse` — including production browse, which has nothing to do with adf-hx.
 * A barrel is one module, so the export alone would be enough to contaminate the entire surface.
 */
export { SearchAdfHxComponent } from './lib/search-adf-hx/search-adf-hx';
