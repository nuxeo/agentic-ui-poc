import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/** An empty context, so a caller with nothing in focus need not build one. */
export const EMPTY_EXTENSION_RULE_CONTEXT = {
    document: null,
    selection: [],
    selectionCount: 0,
    user: { username: null, isAdministrator: false },
    url: '',
    flags: {},
};
function asRuleRef(rule) {
    return typeof rule === 'string' ? { type: rule } : rule;
}
/** Rule refs nested inside a composite's `parameters`, ignoring anything else. */
function nestedRules(parameters) {
    return parameters.filter((parameter) => typeof parameter === 'string' ||
        (typeof parameter === 'object' &&
            parameter !== null &&
            typeof parameter.type === 'string'));
}
/**
 * The three composites, registered like any other evaluator.
 *
 * Named `core.*` following ACA, so a manifest written against ACA's docs works
 * unchanged. `core.every` over an empty list is `true` and `core.some` over an
 * empty list is `false`, which are the identities for those operations and match
 * upstream.
 */
export const CORE_RULE_EVALUATORS = {
    'core.every': (_context, parameters, resolve) => nestedRules(parameters).every(resolve),
    'core.some': (_context, parameters, resolve) => nestedRules(parameters).some(resolve),
    // NOR, not NAND. Upstream is `args.every(arg => !evaluator(...))` — every
    // nested rule must be false. `!every(resolve)` agrees for one argument and
    // diverges from two upwards, which would have made a manifest written against
    // ACA's documentation behave differently here.
    'core.not': (_context, parameters, resolve) => nestedRules(parameters).every((rule) => !resolve(rule)),
    /** Escape hatches, so a manifest can pin a slot entry on or off without code. */
    'core.true': () => true,
    'core.false': () => false,
};
/**
 * How deeply a rule reference may nest before the evaluator stops descending.
 *
 * Generous, because legitimate nesting is shallow — `core.every(core.some(a, b), c)` is
 * depth 2 — and the limit exists to stop pathological input, not to police style. A
 * manifest nesting 32 deep is either a mistake or an attack, and either way the honest
 * answer is the same one an unregistered rule gets.
 */
const MAX_RULE_DEPTH = 32;
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
export const SECURITY_RELEVANT_RULE_IDS = [
    'app.rules.isAdministrator',
    'app.rules.isPowerUser',
    'app.rules.hasAdministrationAccess',
];
/**
 * Named predicates a manifest may reference by id.
 *
 * Registration is per-id in a `Map`, so a new rule is one `registerRules()`
 * call and touches nothing already registered.
 */
export class ExtensionRuleRegistry {
    evaluators = new Map(Object.entries(CORE_RULE_EVALUATORS));
    failClosed = new Set(SECURITY_RELEVANT_RULE_IDS);
    /**
     * Mark rule ids as security-relevant, so an unregistered one denies rather
     * than permits. Safe to call before or after the rules themselves register.
     */
    declareFailClosed(ids) {
        for (const id of ids)
            this.failClosed.add(id);
    }
    /** Whether an unregistered `id` would deny. For diagnostics and the reference doc. */
    isFailClosed(id) {
        return this.failClosed.has(id);
    }
    /**
     * Add or replace evaluators. Later registration wins, which is what lets a
     * customer library override a packaged rule by re-registering its id.
     */
    registerRules(evaluators) {
        for (const [id, evaluator] of Object.entries(evaluators)) {
            this.evaluators.set(id, evaluator);
        }
    }
    /** Every registered id, for the reference doc and for diagnostics. */
    registeredRuleIds() {
        return [...this.evaluators.keys()].sort();
    }
    has(id) {
        return this.evaluators.has(id);
    }
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
    evaluate(rule, context) {
        if (rule === null || rule === undefined)
            return true;
        return this.evaluateRef(asRuleRef(rule), context, 0);
    }
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
    evaluateRef(ref, context, depth) {
        const evaluator = this.evaluators.get(ref.type);
        if (!evaluator)
            return !this.failClosed.has(ref.type);
        if (depth >= MAX_RULE_DEPTH)
            return !this.failClosed.has(ref.type);
        // Manifest JSON is validated down to `type` and no further, so `"parameters": "File"` gets
        // here; an evaluator calling `.filter` on it would throw out of slot resolution.
        const parameters = Array.isArray(ref.parameters) ? ref.parameters : [];
        return evaluator(context, parameters, (nested) => this.evaluateRef(asRuleRef(nested), context, depth + 1));
    }
    static ɵfac = function ExtensionRuleRegistry_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ExtensionRuleRegistry)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ExtensionRuleRegistry, factory: ExtensionRuleRegistry.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ExtensionRuleRegistry, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=extension-rules.js.map