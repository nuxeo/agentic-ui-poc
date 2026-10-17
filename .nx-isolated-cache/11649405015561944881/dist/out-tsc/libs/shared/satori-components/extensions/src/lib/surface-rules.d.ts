import type { ExtensionRuleEvaluator } from './extension-rules';
/**
 * Rules over `ExtensionRuleContext.flags` — the interface state a surface
 * publishes about itself.
 *
 * These exist so a **toggle** is two descriptors rather than one descriptor with
 * a host-rewritten label. `app.toolbar.addToFavorites` and
 * `app.toolbar.removeFromFavorites` are separate ids gated by opposite rules, so
 * a customer can hide, reorder or relabel either half independently, and the
 * label a manifest sets is the label that renders. A single descriptor whose
 * label the component swapped at runtime would silently discard that override.
 *
 * Only the positive form of each is registered: the negative half is
 * `{ type: 'core.not', parameters: ['app.rules.isFavorite'] }`, which is an
 * ordinary composite a manifest can write too.
 *
 * As with every rule here, this decides what the interface offers and nothing
 * else. Nuxeo evaluates the real permission server-side on every operation.
 */
export declare const SURFACE_RULE_EVALUATORS: Readonly<Record<string, ExtensionRuleEvaluator>>;
//# sourceMappingURL=surface-rules.d.ts.map