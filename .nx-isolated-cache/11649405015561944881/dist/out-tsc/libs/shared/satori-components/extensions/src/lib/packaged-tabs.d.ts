import type { ExtensionTabDescriptor } from './extension-actions';
/**
 * The document-detail tabs.
 *
 * The same six tabs, in the same order, with the same labels and the same
 * gating that `document-detail.html` held as fixed `<mat-tab>` children. The
 * AI tab's `@if (featureFlags.aiEnabled())` is now `app.rules.isAiEnabled`,
 * which reads the same flag through the rule context, so a manifest can gate
 * the tab as well as the feature flag can.
 *
 * The five bodies remain markup in the host template and are matched by id. A
 * tab a customer adds names a registered component instead — see
 * `ExtensionTabDescriptor.componentId`. That asymmetry is deliberate: extracting
 * a thousand lines of tab body into separately registered components would be a
 * rewrite, and this makes the tab strip addressable without one.
 */
export declare const PACKAGED_DOCUMENT_TABS: readonly ExtensionTabDescriptor[];
//# sourceMappingURL=packaged-tabs.d.ts.map