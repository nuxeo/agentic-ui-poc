/**
 * Per-type layouts: what a configuration package contributes, and what the panel renders.
 *
 * A layout is chosen per document type and mode, as in Nuxeo Web UI. A package contributes one
 * through `org.nuxeo.agentic.ui.config` (`<layout type="Claim" mode="metadata" src="…"/>`); with
 * none, the layout is generated from the type's own schemas and those the document's dynamic
 * facets add. A contributed layout replaces the generated one whole — nothing is merged.
 */
