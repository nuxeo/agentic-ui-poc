/**
 * Secondary entry point: the adf-hx POC route, and nothing else.
 *
 * Reachable as `@agentic-ui/feature-browse/adf-hx-poc`, mapped in `tsconfig.base.json`. Same
 * pattern and same reason as `@agentic-ui/shared/adf-hx-bridge/providers`.
 *
 * `BrowseAdfHxPocComponent` imports `@alfresco/adf-hx-content-services/ui` directly. Exported from
 * the feature's **main** barrel, that made adf-hx reachable from anything importing
 * `@agentic-ui/feature-browse` — including production browse, which has nothing to do with adf-hx.
 * A barrel is one module, so the export alone was enough.
 *
 * Caught by the `guardrails` gate the plan asked for: "adf-hx types must never appear in our public
 * API signatures, enforced by a lint or API-extractor gate". It was a hard rule for Phase 3 and had
 * never been enforced; the gate found this on its first run.
 */
export { BrowseAdfHxPocComponent } from './lib/browse-adf-hx-poc/browse-adf-hx-poc';
