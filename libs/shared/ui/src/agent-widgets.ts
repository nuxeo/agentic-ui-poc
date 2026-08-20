/**
 * The chat widgets this library contributes, as a separate entry point from
 * `@agentic-ui/shared/ui`.
 *
 * Separate because `app.config.ts` is in the initial bundle and the main barrel
 * is not tree-shakeable in practice: importing one symbol from it pulled every
 * component in `libs/shared/ui` into the initial chunk and blew the 2 MB budget
 * by 251 kB. A widget definition is a few hundred bytes of data plus a dynamic
 * `import()`, and it has to stay that way or the laziness `load()` buys is
 * spent at registration.
 *
 * A widget package published outside this repository should do the same: export
 * definitions from an entry point that pulls no component.
 */
export {
  documentCardWidget,
  type DocumentCardWidgetProps,
} from './lib/document-metadata-card/document-metadata-card.agent-widget';
