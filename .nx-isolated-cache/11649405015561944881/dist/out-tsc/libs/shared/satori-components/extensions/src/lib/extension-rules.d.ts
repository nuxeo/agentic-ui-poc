import type { NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/**
 * What a rule may inspect.
 *
 * **This is deliberately not ACA's `RuleContext`** (`@alfresco/adf-extensions`).
 * Upstream's is typed on Alfresco Content Services domain objects — `NodeEntry`,
 * `SiteEntry`, `RepositoryInfo` from `@alfresco/js-api` — which describe a
 * repository we do not talk to. Reusing it would have put ACS types in the
 * signature every customer rule is written against, in breach of the
 * "adf-hx types never appear in our public API" rule in
 * `AGENTS/11-beta-program.md` section 7, and for no benefit: nothing in
 * upstream's runtime reads those fields.
 *
 * The *shape* is upstream's — a context object plus declarative parameters —
 * so the mental model transfers even though the types do not.
 */
export interface ExtensionRuleContext {
    /** The document in focus, e.g. on document detail. */
    readonly document: NuxeoDocument | null;
    /**
     * The current multi-selection as **documents**, for permission rules.
     *
     * Still empty in Beta: `SelectionService` tracks ids, labels and previews, not
     * documents, so nothing can populate this without an extra fetch per selected
     * row. `app.rules.canWriteSelection` and `app.rules.canRemoveSelection` read
     * it and therefore still answer `false`; see `docs/extension-reference.md`.
     */
    readonly selection: readonly NuxeoDocument[];
    /**
     * How many documents are selected.
     *
     * Separate from `selection.length` precisely because the count is knowable
     * without the documents. Collapsing the two would either make the cardinality
     * rules dead alongside the permission ones, or make the permission ones look
     * live when they are not.
     */
    readonly selectionCount: number;
    readonly user: {
        readonly username: string | null;
        readonly isAdministrator: boolean;
    };
    /** Router URL without query string, for route-scoped rules. */
    readonly url: string;
    /**
     * Transient interface state the focused surface publishes about itself.
     *
     * Deliberately a bag of booleans rather than typed fields, because what lives
     * here is not repository data: it is whether the open document is currently
     * favourited, locked, subscribed or in the clipboard, and whether a particular
     * operation is in flight. None of it is derivable from {@link document} —
     * favourite and subscription state are separate fetches, and "in flight" is
     * not a fact about the document at all.
     *
     * It is what makes a **toggle** expressible as two descriptors gated by
     * opposite rules, which is upstream's shape, instead of one descriptor whose
     * label a host rewrites behind the manifest's back. Keys are namespaced by the
     * publishing surface's convention; `busy.<operation>` is read by
     * `app.rules.isNotBusy`.
     */
    readonly flags: Readonly<Record<string, boolean>>;
}
/** An empty context, so a caller with nothing in focus need not build one. */
export declare const EMPTY_EXTENSION_RULE_CONTEXT: ExtensionRuleContext;
/**
 * A reference to a registered rule, as written in a manifest.
 *
 * `type` is the registered evaluator id; `parameters` reach it as written, or as `[]` when they
 * are absent or not an array.
 * A bare string is shorthand for `{ type: <string> }`, which is what most
 * manifest entries want.
 */
export interface ExtensionRuleRef {
    readonly type: string;
    readonly parameters?: readonly unknown[];
}
export type ExtensionRule = string | ExtensionRuleRef;
/**
 * Recursively evaluate a nested rule reference.
 *
 * Passed to every evaluator so that composites (`core.every`, `core.some`,
 * `core.not`) are ordinary registered evaluators rather than special cases in
 * the registry. Nothing in {@link ExtensionRuleRegistry} knows they exist.
 */
export type ExtensionRuleResolver = (rule: ExtensionRule) => boolean;
export type ExtensionRuleEvaluator = (context: ExtensionRuleContext, parameters: readonly unknown[], resolve: ExtensionRuleResolver) => boolean;
/**
 * The three composites, registered like any other evaluator.
 *
 * Named `core.*` following ACA, so a manifest written against ACA's docs works
 * unchanged. `core.every` over an empty list is `true` and `core.some` over an
 * empty list is `false`, which are the identities for those operations and match
 * upstream.
 */
export declare const CORE_RULE_EVALUATORS: Readonly<Record<string, ExtensionRuleEvaluator>>;
/**
 * Rule ids that must fail **closed** when they are not registered.
 *
 * Fail-open is right for the general case — a manifest typo must not strip
 * working actions out of the UI — but it is wrong for the small set of rules
 * whose whole job is to keep a surface away from users who should not see it.
 * `app.rules.hasAdministrationAccess` gates the Administration nav entry; if it
 * resolved `true` merely because registration had not happened yet, every user
 * would be offered Administration.
 *
 * This is a **declared list rather than a property of registration**, and that
 * is the point: the dangerous window is precisely the one in which the id is
 * not yet in the registry, so a marker attached at registration time could not
 * close it. Layer 2 adds to the list with
 * {@link ExtensionRuleRegistry.declareFailClosed}.
 *
 * Fail-closed is still not an authorisation boundary. Nuxeo evaluates the real
 * permission server-side; this only decides what the interface offers.
 */
export declare const SECURITY_RELEVANT_RULE_IDS: readonly string[];
/**
 * Named predicates a manifest may reference by id.
 *
 * Registration is per-id in a `Map`, so a new rule is one `registerRules()`
 * call and touches nothing already registered.
 */
export declare class ExtensionRuleRegistry {
    private readonly evaluators;
    private readonly failClosed;
    /**
     * Mark rule ids as security-relevant, so an unregistered one denies rather
     * than permits. Safe to call before or after the rules themselves register.
     */
    declareFailClosed(ids: readonly string[]): void;
    /** Whether an unregistered `id` would deny. For diagnostics and the reference doc. */
    isFailClosed(id: string): boolean;
    /**
     * Add or replace evaluators. Later registration wins, which is what lets a
     * customer library override a packaged rule by re-registering its id.
     */
    registerRules(evaluators: Readonly<Record<string, ExtensionRuleEvaluator>>): void;
    /** Every registered id, for the reference doc and for diagnostics. */
    registeredRuleIds(): readonly string[];
    has(id: string): boolean;
    /**
     * Evaluate a rule reference against a context.
     *
     * An **unregistered** id evaluates to `true`, not `false`. A manifest that
     * names a rule this build does not have — a typo, or configuration written
     * against a newer release — must not silently strip working actions out of
     * the UI. Failing open here is safe because Layer 1 visibility is not an
     * authorisation boundary: the server-side Nuxeo permission still decides
     * whether the operation succeeds. See `docs/extension-reference.md`.
     *
     * The exception is {@link SECURITY_RELEVANT_RULE_IDS}, which fail closed.
     */
    evaluate(rule: ExtensionRule | null | undefined, context: ExtensionRuleContext): boolean;
    /**
     * Recursion is bounded by **depth**, not by which rule types have been seen.
     *
     * It used to carry a `Set<string>` of visited rule *types* and `return true` on a
     * repeat. That misread ordinary nesting as a cycle: re-using a composite at two
     * depths is a normal manifest shape, and `docs/extension-reference.md` advertises the
     * ACA-compatible `core.*` composites that make it normal. An adversarial review
     * reproduced the consequence —
     *
     *   core.some('app.rules.hasAdministrationAccess', core.some('app.rules.isPowerUser'))
     *
     * returned `true` for a user who is neither, while the flat equivalent correctly
     * returned `false`. A security gate opening because a rule appeared twice.
     *
     * Depth is the right bound because a *cycle* is not expressible in the data: the
     * manifest is JSON, and JSON cannot describe one. What is reachable is deep nesting
     * from a large manifest, and genuine infinite recursion from a **Layer 2 evaluator**
     * that resolves its own id — both of which a depth limit stops and type-tracking
     * did not distinguish from legitimate re-use.
     *
     * On exceeding the limit the answer is `!failClosed.has(type)`, matching the
     * unregistered-rule branch: unknown answers permit, except where the id is declared
     * security-relevant. The old code returned a bare `true` even for those.
     */
    private evaluateRef;
    static ɵfac: i0.ɵɵFactoryDeclaration<ExtensionRuleRegistry, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ExtensionRuleRegistry>;
}
//# sourceMappingURL=extension-rules.d.ts.map