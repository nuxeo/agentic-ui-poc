/**
 * `@agentic-ui/acme-extensions` — the public surface of this extension library.
 *
 * Deliberately narrow. An application needs exactly one thing from a Layer 2
 * library: the provider. Everything else is an implementation detail, and
 * exporting it invites an application to reach past the contract and depend on a
 * class name that should have been free to change.
 */
export { provideAcmeExtensions } from './lib/extensions';

/** Exported for tests and diagnostics — every ID this library registers. */
export { ACME_EXTENSIONS_EXTENSION_IDS } from './lib/extensions';
