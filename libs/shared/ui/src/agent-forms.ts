/**
 * The chat *form* components this library contributes, as their own entry point.
 *
 * Separate from `./agent-widgets.ts` rather than added to it, which is the
 * entry-point half of the two-registry decision recorded in ADR 001. The channels
 * have different prop rules — a widget's props are identifiers and enums and
 * never content, a form's necessarily carry gateway-resolved content — so they
 * get different tokens, different definition types, and different files. Keeping
 * them apart here also keeps the two name-spaces mechanically distinguishable to
 * the conformance test in `apps/agent-gateway/src/agent/render-events.spec.ts`,
 * which reads both off disk because `scope:agent-gateway` may import no workspace
 * library.
 *
 * Separate from the main `@agentic-ui/shared/ui` barrel for the reason
 * `agent-widgets.ts` is: `app.config.ts` is in the initial bundle and that barrel
 * is not tree-shakeable in practice — importing one symbol from it pulled every
 * component in this library into the initial chunk and overran the 2 MB budget by
 * 251 kB. A definition is a few hundred bytes plus a dynamic `import()`, and it
 * has to stay that way or the laziness `load()` buys is spent at registration.
 */
export { documentMetadataForm } from './lib/document-metadata-form/document-metadata-form.agent-form';
