import { Injectable } from '@angular/core';

import type { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

/**
 * What a rule may inspect.
 *
 * **This is deliberately not `RuleContext` from `@alfresco/adf-extensions`.**
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
  /** The current multi-selection, for bulk actions. */
  readonly selection: readonly NuxeoDocument[];
  readonly user: {
    readonly username: string | null;
    readonly isAdministrator: boolean;
  };
  /** Router URL without query string, for route-scoped rules. */
  readonly url: string;
}

/** An empty context, so a caller with nothing in focus need not build one. */
export const EMPTY_EXTENSION_RULE_CONTEXT: ExtensionRuleContext = {
  document: null,
  selection: [],
  user: { username: null, isAdministrator: false },
  url: '',
};

/**
 * A reference to a registered rule, as written in a manifest.
 *
 * `type` is the registered evaluator id; `parameters` are passed to it verbatim.
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

export type ExtensionRuleEvaluator = (
  context: ExtensionRuleContext,
  parameters: readonly unknown[],
  resolve: ExtensionRuleResolver,
) => boolean;

function asRuleRef(rule: ExtensionRule): ExtensionRuleRef {
  return typeof rule === 'string' ? { type: rule } : rule;
}

/** Rule refs nested inside a composite's `parameters`, ignoring anything else. */
function nestedRules(parameters: readonly unknown[]): ExtensionRule[] {
  return parameters.filter(
    (parameter): ExtensionRule =>
      typeof parameter === 'string' ||
      (typeof parameter === 'object' &&
        parameter !== null &&
        typeof (parameter as { type?: unknown }).type === 'string'),
  ) as ExtensionRule[];
}

/**
 * The three composites, registered like any other evaluator.
 *
 * Named `core.*` following ACA, so a manifest written against ACA's docs works
 * unchanged. `core.every` over an empty list is `true` and `core.some` over an
 * empty list is `false`, which are the identities for those operations and match
 * upstream.
 */
export const CORE_RULE_EVALUATORS: Readonly<Record<string, ExtensionRuleEvaluator>> = {
  'core.every': (_context, parameters, resolve) => nestedRules(parameters).every(resolve),
  'core.some': (_context, parameters, resolve) => nestedRules(parameters).some(resolve),
  'core.not': (_context, parameters, resolve) => !nestedRules(parameters).every(resolve),
  /** Escape hatches, so a manifest can pin a slot entry on or off without code. */
  'core.true': () => true,
  'core.false': () => false,
};

/**
 * Named predicates a manifest may reference by id.
 *
 * Registration is per-id in a `Map`, so a new rule is one `registerRules()`
 * call and touches nothing already registered.
 */
@Injectable({ providedIn: 'root' })
export class ExtensionRuleRegistry {
  private readonly evaluators = new Map<string, ExtensionRuleEvaluator>(
    Object.entries(CORE_RULE_EVALUATORS),
  );

  /**
   * Add or replace evaluators. Later registration wins, which is what lets a
   * customer library override a packaged rule by re-registering its id.
   */
  registerRules(evaluators: Readonly<Record<string, ExtensionRuleEvaluator>>): void {
    for (const [id, evaluator] of Object.entries(evaluators)) {
      this.evaluators.set(id, evaluator);
    }
  }

  /** Every registered id, for the reference doc and for diagnostics. */
  registeredRuleIds(): readonly string[] {
    return [...this.evaluators.keys()].sort();
  }

  has(id: string): boolean {
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
   */
  evaluate(rule: ExtensionRule | null | undefined, context: ExtensionRuleContext): boolean {
    if (rule === null || rule === undefined) return true;
    return this.evaluateRef(asRuleRef(rule), context, new Set<string>());
  }

  private evaluateRef(
    ref: ExtensionRuleRef,
    context: ExtensionRuleContext,
    seen: Set<string>,
  ): boolean {
    const evaluator = this.evaluators.get(ref.type);
    if (!evaluator) return true;

    // A manifest is customer-authored data, so a composite that references
    // itself is a reachable input, not a hypothetical. Break the cycle rather
    // than overflow the stack.
    if (seen.has(ref.type)) return true;
    const guarded = new Set(seen).add(ref.type);

    const parameters = ref.parameters ?? [];
    return evaluator(context, parameters, (nested) =>
      this.evaluateRef(asRuleRef(nested), context, guarded),
    );
  }
}
