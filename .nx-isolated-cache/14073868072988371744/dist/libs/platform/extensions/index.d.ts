import { NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import * as _angular_core from '@angular/core';
import { EnvironmentProviders, Type, InjectionToken, Signal, PipeTransform } from '@angular/core';
import { Routes } from '@angular/router';

/**
 * Layer 1 addressable surface — the slot vocabulary.
 *
 * A **slot** is a named, ordered list of descriptors that a manifest may extend,
 * reorder, relabel, gate or hide. The vocabulary is ACA's rather than a new
 * invention, so a customer or an agent that has seen Alfresco Content
 * Application already knows the shape.
 *
 * ## Slots are additive and independent, by construction
 *
 * The registry keys slots by **plain string**. There is no enum a slot must be
 * added to, no union type to widen, and no `switch` anywhere in this library
 * that dispatches on slot identity. `ExtensionSlotRegistry.register()` and
 * `.resolve()` are generic over the descriptor type and treat the slot id as
 * opaque data.
 *
 * The practical consequence — and the thing that turns the "addressable
 * ceiling" from an irreversible decision into ordinary backlog — is that adding
 * a slot after Beta ships requires **no change to the existing ones**, and no
 * change to this library at all. `extension-slot-registry.service.spec.ts`
 * proves it by registering a slot this file has never heard of.
 *
 * The constants below are therefore **documentation and typo protection, not a
 * closed set**. Anything may register any string.
 */
/**
 * The slots Beta implements. Not a closed set — see the file comment.
 *
 * `rules` used to be listed here and was removed: rules are not descriptors and
 * do not live in a slot. They are registered in `ExtensionRuleRegistry`, so a
 * manifest writing `slots.rules` was silently inert while the constant implied
 * otherwise.
 */
declare const EXTENSION_SLOTS: {
    /** Primary platform navigation entries. */
    readonly navbar: "navbar";
    /** Secondary drawer content behind a navbar entry. */
    readonly sidebar: "sidebar";
    /** Lazily resolved application routes. */
    readonly routes: "routes";
    /** Document-detail and browse toolbar actions. */
    readonly toolbar: "toolbar";
    /** The browse "More actions" menu, on the folder or document open. */
    readonly contextMenu: "contextMenu";
    /** The menu on each row of a document list, acting on that row's document. */
    readonly rowActions: "rowActions";
    /** Actions over a multi-document selection. */
    readonly 'bulk-actions': "bulk-actions";
    /** Document-detail tab children. */
    readonly tabs: "tabs";
    /** Document list column descriptors. */
    readonly documentList: "documentList";
    /**
     * The body of the document-detail View tab, chosen per document by rule.
     *
     * Named for the view alone. Nuxeo Web UI resolves four layouts per type — view, edit,
     * create and metadata. The other three each have a slot of their own below, rather than one
     * `documentLayout` slot whose entries carry a mode, because each mode hands its component a
     * different contract and the create form's rule reads a type, not a document.
     */
    readonly documentView: "documentView";
    /** A document type's section of the document-detail Properties panel, chosen per document by rule. */
    readonly documentMetadata: "documentMetadata";
    /** The form editing a document's properties, chosen per document by rule. */
    readonly documentEdit: "documentEdit";
    /** The form filling in a new document's properties, chosen by rule for the type being created. */
    readonly documentCreate: "documentCreate";
};
/** A slot id. Deliberately `string`, not a union over {@link EXTENSION_SLOTS}. */
type ExtensionSlotId = string;
/**
 * Fields every slot descriptor shares, matching ACA's `ExtensionElement`.
 *
 * `disabled` and `order` are honoured by the registry for every slot without
 * the slot having to opt in, which is what keeps "hide it" and "move it" a
 * pure JSON edit for surfaces nobody has thought about yet.
 */
interface ExtensionElement {
    /** Stable public contract, `<owner>.<surface>.<name>`. Renaming is breaking. */
    readonly id: string;
    /** Dropped from the resolved list when true. */
    readonly disabled?: boolean;
    /** Ascending. Absent sorts as `Number.MAX_SAFE_INTEGER`, after any ordinary number, stably. */
    readonly order?: number;
}

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
interface ExtensionRuleContext {
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
declare const EMPTY_EXTENSION_RULE_CONTEXT: ExtensionRuleContext;
/**
 * A reference to a registered rule, as written in a manifest.
 *
 * `type` is the registered evaluator id; `parameters` reach it as written, or as `[]` when they
 * are absent or not an array.
 * A bare string is shorthand for `{ type: <string> }`, which is what most
 * manifest entries want.
 */
interface ExtensionRuleRef {
    readonly type: string;
    readonly parameters?: readonly unknown[];
}
type ExtensionRule = string | ExtensionRuleRef;
/**
 * Recursively evaluate a nested rule reference.
 *
 * Passed to every evaluator so that composites (`core.every`, `core.some`,
 * `core.not`) are ordinary registered evaluators rather than special cases in
 * the registry. Nothing in {@link ExtensionRuleRegistry} knows they exist.
 */
type ExtensionRuleResolver = (rule: ExtensionRule) => boolean;
type ExtensionRuleEvaluator = (context: ExtensionRuleContext, parameters: readonly unknown[], resolve: ExtensionRuleResolver) => boolean;
/**
 * The three composites, registered like any other evaluator.
 *
 * Named `core.*` following ACA, so a manifest written against ACA's docs works
 * unchanged. `core.every` over an empty list is `true` and `core.some` over an
 * empty list is `false`, which are the identities for those operations and match
 * upstream.
 */
declare const CORE_RULE_EVALUATORS: Readonly<Record<string, ExtensionRuleEvaluator>>;
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
declare const SECURITY_RELEVANT_RULE_IDS: readonly string[];
/**
 * Named predicates a manifest may reference by id.
 *
 * Registration is per-id in a `Map`, so a new rule is one `registerRules()`
 * call and touches nothing already registered.
 */
declare class ExtensionRuleRegistry {
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ExtensionRuleRegistry, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ExtensionRuleRegistry>;
}

/**
 * Per-descriptor manifest override.
 *
 * Keyed by descriptor **id**, never by slot, so a slot invented after Beta
 * ships needs no manifest schema change to become hideable, reorderable,
 * relabellable and rule-gateable.
 */
interface ExtensionOverride {
    readonly visible?: boolean;
    readonly order?: number | null;
    readonly label?: string | null;
    /** Registered rule id, or a nested rule reference. */
    readonly rule?: ExtensionRule | null;
}
/** What a slot's resolution needs from the manifest. */
interface ExtensionSlotOverrides {
    /** Overrides for packaged **and** manifest-added descriptors, keyed by id. */
    readonly byId: Readonly<Record<string, ExtensionOverride>>;
    /** Extra descriptors contributed by the manifest, keyed by slot id. */
    readonly additions: Readonly<Record<ExtensionSlotId, readonly ExtensionElement[]>>;
}
declare const NO_EXTENSION_SLOT_OVERRIDES: ExtensionSlotOverrides;
/**
 * The addressable surface, keyed by opaque slot id.
 *
 * Registration and resolution are both generic and per-slot. There is no enum,
 * no union and no `switch` on slot identity anywhere below, which is what makes
 * the nine Beta slots extensible to a tenth without touching them — see
 * `extension-slots.ts` and the additivity spec.
 *
 * `filterEnabled` and `sortByOrder` reproduce ACA's, pinned case by case to
 * `@alfresco/adf-extensions@9.0.0`, so `disabled` and `order` mean exactly
 * what they mean in an ACA manifest rather than approximately.
 */
declare class ExtensionSlotRegistry {
    private readonly rules;
    private readonly slots;
    /**
     * Contribute descriptors to a slot.
     *
     * Idempotent per id: re-registering an id replaces the previous descriptor in
     * place rather than duplicating it, so a customer library can override a
     * packaged entry and a hot-reloaded bootstrap cannot double the toolbar.
     */
    register<T extends ExtensionElement>(slot: ExtensionSlotId, entries: readonly T[]): void;
    /** Slot ids with at least one registered descriptor, for the reference doc. */
    registeredSlotIds(): readonly ExtensionSlotId[];
    /** Descriptor ids registered into a slot, in registration order. */
    registeredIds(slot: ExtensionSlotId): readonly string[];
    /**
     * The descriptors a slot should render: packaged plus manifest additions,
     * with overrides applied, hidden and rule-denied entries removed, ordered.
     *
     * An unknown slot resolves to an empty array rather than throwing, because a
     * manifest may reference a slot a newer build introduced.
     */
    resolve<T extends ExtensionElement>(slot: ExtensionSlotId, overrides?: ExtensionSlotOverrides, context?: ExtensionRuleContext): readonly T[];
    private applyOverride;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ExtensionSlotRegistry, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ExtensionSlotRegistry>;
}

/**
 * The Layer 1 half of the runtime manifest, as a customer writes it.
 *
 * `$`-prefixed keys are **metadata and do not merge** — that is ACA's rule, and
 * `mergeObjects` reproduces it exactly (see `extension-merge.ts`). So `$references`
 * itself never leaks from a referenced layer into the merged result, and a layer
 * can carry `$name`/`$version` for diagnostics without polluting configuration.
 */
interface ExtensionConfig {
    /** Layer names to merge over this object, in ascending `order`. Later wins. */
    readonly $references?: readonly string[];
    /** Layer names to drop even when `$references` lists them. */
    readonly $ignoreReferenceList?: readonly string[];
    /** Named layers, so a single manifest fragment can carry a whole stack. */
    readonly $layers?: Readonly<Record<string, ExtensionConfig>>;
    /** Free-form metadata for diagnostics. */
    readonly $name?: string;
    readonly $version?: string;
    /** Descriptors contributed per slot id. */
    readonly slots?: Readonly<Record<ExtensionSlotId, readonly ExtensionElement[]>>;
    /** Overrides for packaged descriptors, keyed by descriptor id. */
    readonly overrides?: Readonly<Record<string, ExtensionOverride>>;
}
/** Where a layer's body came from, so a failure to resolve one is reportable. */
type ExtensionLayerResolver = (name: string) => ExtensionConfig | null;
interface ResolvedExtensionConfig {
    readonly config: ExtensionConfig;
    /** Layer names merged, in the order applied. */
    readonly applied: readonly string[];
    /** Layer names listed but not resolvable, so the shell can report rather than guess. */
    readonly missing: readonly string[];
}
/**
 * Merge configuration layers left to right, later winning.
 *
 * A thin wrapper over `mergeObjects`, which reproduces ACA's merge and is pinned to it case by
 * case in `extension-merge.spec.ts`:
 *
 * - arrays of objects merge **by `id`**, so a layer patches one toolbar entry
 *   without restating the toolbar;
 * - `"<key>.$replace"` replaces rather than merges, for the cases where a
 *   customer genuinely wants to drop our list;
 * - `$`-prefixed keys are skipped at the top level, and inside any object that
 *   two layers both set.
 */
declare function mergeExtensionConfigs(...layers: readonly ExtensionConfig[]): ExtensionConfig;
/**
 * Resolve `$references` against a layer lookup and merge the result.
 *
 * Layers are applied in the order `$references` lists them, so the **last file
 * wins** — a customer layer placed after ours overrides ours. Names in
 * `$ignoreReferenceList` are dropped even if referenced, which is how a
 * deployment disables a layer it cannot edit.
 *
 * References are resolved one level deep on purpose. A referenced layer's own
 * `$references` is metadata and is skipped by the merge, so nesting would be
 * silently ignored rather than half-honoured; keeping it flat means what a
 * customer reads in the JSON is what happens.
 */
declare function resolveExtensionConfig(root: ExtensionConfig, resolveLayer?: ExtensionLayerResolver): ResolvedExtensionConfig;
/**
 * Read an untrusted value into an {@link ExtensionConfig}.
 *
 * Tolerant in the same way as the Phase 1 loaders: a customer who saves
 * something malformed must get the packaged application back, not a blank
 * screen. Slot entries without a string `id` are dropped, because an entry with
 * no id cannot be addressed, overridden or reasoned about.
 */
declare function readExtensionConfig(raw: unknown): ExtensionConfig;

/**
 * The packaged document rules, as manifest-referenceable ids.
 *
 * These wrap the pure predicates already in
 * `libs/shared/nuxeo-client/src/lib/utils/document-permissions.ts`. They are
 * already `(doc) => boolean`, so this is **registration, not a rewrite** — the
 * permission logic is unchanged and still has its own tests next to it.
 *
 * `app.rules.hasSelection` and `app.rules.isAdministrator` are here because
 * every bulk action needs the first and several administration entries need the
 * second, and without them a manifest could not express "show this only when
 * something is selected" at all.
 *
 * **These are not a security control.** Nuxeo evaluates the real permission
 * server-side on every operation. A rule that returns `true` does not grant
 * anything, and hiding an action does not prevent an API call. See
 * `docs/extension-reference.md`.
 */
declare const DOCUMENT_RULE_EVALUATORS: Readonly<Record<string, ExtensionRuleEvaluator>>;

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
declare const SURFACE_RULE_EVALUATORS: Readonly<Record<string, ExtensionRuleEvaluator>>;

/**
 * A user-invocable action, as a descriptor rather than as markup.
 *
 * The shape follows adf-hx's action services (`content-delete`,
 * `content-share`, `single-item-download`, `permissions-management` in the
 * published package's `/ui` entry point): a declarative descriptor naming a
 * service that performs the work. It was matched so that adopting those
 * components would not mean migrating the action surface twice; adf-hx was
 * removed instead, and the shape stays because handlers are written against it.
 *
 * **A descriptor is not a permission.** `rule` decides what the interface
 * offers; Nuxeo evaluates the real permission server-side on every operation.
 * Hiding an action does not prevent the corresponding REST call.
 */
interface ExtensionActionDescriptor extends ExtensionElement {
    /** Text shown in a menu, and the accessible name of an icon-only control. */
    readonly label: string;
    /**
     * A translation key for the text, preferred over `label` when it resolves.
     *
     * `label` stays a literal and stays what a manifest's `overrides[id].label` replaces. See
     * `NavItemDescriptor.labelKey` for why this is a second field rather than a reinterpretation
     * of a published one, and `ExtensionSlotRegistry.applyOverride` for why an override clears it.
     */
    readonly labelKey?: string;
    /** Icon name understood by the host's icon set. */
    readonly icon?: string;
    /** Hover text. Falls back to `label`. */
    readonly tooltip?: string;
    /** Registered rule id, or a nested rule reference, gating visibility. */
    readonly rule?: ExtensionRule;
    /**
     * Registered rule deciding whether the control is **enabled**.
     *
     * Distinct from `rule` because "offered but not currently applicable" and
     * "not offered at all" are different affordances, and today's UI uses both —
     * bulk Compare is visible and disabled below two selected documents. Absent
     * means always enabled.
     */
    readonly enabledRule?: ExtensionRule;
    /**
     * Render in the overflow menu rather than inline on the toolbar.
     *
     * A manifest promotes an overflow item to the toolbar by contributing an
     * entry with the same id and `"overflow": false`, which merges over ours.
     */
    readonly overflow?: boolean;
    /**
     * Registered handler id. Defaults to the descriptor `id`, so the common case
     * — one descriptor, one handler — needs no second identifier.
     */
    readonly action?: string;
}
/** A column of a document list, addressable so a customer can change the set. */
interface ExtensionColumnDescriptor extends ExtensionElement {
    readonly label: string;
    /**
     * A translation key for the text, preferred over `label` when it resolves.
     *
     * `label` stays a literal and stays what a manifest's `overrides[id].label` replaces. See
     * `NavItemDescriptor.labelKey` for why this is a second field rather than a reinterpretation
     * of a published one, and `ExtensionSlotRegistry.applyOverride` for why an override clears it.
     */
    readonly labelKey?: string;
    /** Property key the host reads off a document, e.g. `dc:title`. */
    readonly field: string;
    readonly sortable?: boolean;
    readonly rule?: ExtensionRule;
    /**
     * Not shown until the user turns it on, but still offered in the column picker.
     *
     * Deliberately **not** `disabled`, which the registry drops from the resolved
     * list entirely. The two are different affordances and browse already uses both:
     * eight of its twelve columns ship switched off yet selectable, whereas a column
     * a customer has genuinely removed should not appear in the picker at all.
     * Collapsing them would make "hide by default" indistinguishable from "delete",
     * and a manifest could then only ever remove a column, never pre-fold one.
     */
    readonly hiddenByDefault?: boolean;
}
/**
 * A document-detail tab.
 *
 * A packaged tab's content is compiled in and keyed by `id`. A tab a manifest
 * adds names a **registered component** instead, which `ExtensionOutletComponent`
 * resolves — so contributing a tab is a manifest edit plus a Layer 2 component,
 * not a change to the host template.
 */
interface ExtensionTabDescriptor extends ExtensionElement {
    readonly label: string;
    /**
     * A translation key for the text, preferred over `label` when it resolves.
     *
     * `label` stays a literal and stays what a manifest's `overrides[id].label` replaces. See
     * `NavItemDescriptor.labelKey` for why this is a second field rather than a reinterpretation
     * of a published one, and `ExtensionSlotRegistry.applyOverride` for why an override clears it.
     */
    readonly labelKey?: string;
    /** Icon rendered before the label. Absent renders a text-only tab. */
    readonly icon?: string;
    readonly rule?: ExtensionRule;
    /**
     * Registered component id rendering the tab body.
     *
     * Ignored for the packaged ids, whose content is markup in the host template.
     * Defaults to the descriptor `id`, so a customer who registers a component
     * under the same id as the tab needs only one identifier.
     */
    readonly componentId?: string;
}
/**
 * What the document-detail View tab renders for the documents a rule selects.
 *
 * The host resolves the `documentView` slot against the focused document and renders the
 * first entry, by `order`, whose component is registered. Nothing resolving leaves the
 * packaged view in place, so a manifest that contributes nothing changes nothing.
 *
 * `rule` is what makes it per type: `{ "type": "app.rules.isType", "parameters": ["Claim"] }`.
 * Any registered rule works. An entry with no rule matches every document.
 *
 * The rendered component receives the focused document as a `document` input when it
 * declares one, plus `inputs`. `document` is the host's: an `inputs.document` is overwritten,
 * so a manifest cannot hand a view a document other than the one on screen.
 */
interface ExtensionDocumentViewDescriptor extends ExtensionElement {
    readonly rule?: ExtensionRule;
    /** Registered component id rendering the View tab body. Defaults to the descriptor `id`. */
    readonly componentId?: string;
    /** Static values set on the component's declared inputs. Unknown keys are ignored. */
    readonly inputs?: Readonly<Record<string, unknown>>;
}
/**
 * Replaces a document type's layout in one mode for the documents a rule selects: the type's
 * section of the Properties panel (`documentMetadata`), the edit form (`documentEdit`) or the
 * create form (`documentCreate`).
 *
 * Resolved like `documentView`: the first entry, by `order`, whose rule passes and whose
 * component is registered renders; nothing resolving leaves the layout — a contributed file or
 * the generated one — in place. For `documentCreate` the rule reads the type being created,
 * not the folder it is created in.
 *
 * What the rendered component receives depends on the mode, and the host's values overwrite
 * `inputs` of the same name: `document` for metadata and edit; `type` and `parentPath` for
 * create; and, for edit and create, `showErrors` and an `onChange` callback taking a
 * {@link DocumentLayoutChange}. The host still owns Save.
 */
interface ExtensionDocumentLayoutDescriptor extends ExtensionElement {
    readonly rule?: ExtensionRule;
    /** Registered component id rendering the layout. Defaults to the descriptor `id`. */
    readonly componentId?: string;
    /** Static values set on the component's declared inputs. Unknown keys are ignored. */
    readonly inputs?: Readonly<Record<string, unknown>>;
}
/**
 * What a `documentEdit` or `documentCreate` component reports through its `onChange` input,
 * each time its values change: the properties to save, by xpath, and whether they may be.
 *
 * For an edit, send only what the user changed; for a create, everything the new document
 * should have. While `valid` is `false` the host does not save, and the component shows why.
 */
interface DocumentLayoutChange {
    readonly properties: Readonly<Record<string, unknown>>;
    readonly valid: boolean;
}
/**
 * A route contributed by id — `path` plus the component that answers it.
 *
 * The component is resolved through `ExtensionComponentRegistry`, so a manifest
 * can only place a component that is already compiled in; contributing a new one
 * is Layer 2. Guards are deliberately absent: a route a manifest can add must
 * not be able to claim it has *removed* access to anything, because the surface
 * it renders is still gated by Nuxeo server-side.
 */
interface ExtensionRouteDescriptor extends ExtensionElement {
    /** Path relative to the host route, e.g. `contracts` or `reports/:id`. */
    readonly path: string;
    /** Registered component id. Defaults to the descriptor `id`. */
    readonly componentId?: string;
    /** Inputs set on the rendered component. Unknown keys are ignored. */
    readonly inputs?: Readonly<Record<string, unknown>>;
}
/**
 * What a registered action does.
 *
 * Deliberately an object with `execute` rather than a bare function, because
 * that is adf-hx's shape and because a customer's handler is normally an
 * injectable service with its own dependencies.
 */
interface ExtensionActionHandler {
    execute(context: ExtensionRuleContext): void;
}
/**
 * What one call to {@link ExtensionActionRegistry.register} or
 * {@link ExtensionActionRegistry.registerPackaged} added, and the only way to
 * take it back.
 *
 * Withdrawal is by registration rather than by id because an id is shared: the
 * packaged toolbar and a customer library both register `app.toolbar.delete`,
 * and either withdrawing "the handlers for these ids" would delete the other's.
 */
interface ExtensionActionRegistration {
    /** Withdraw exactly the handlers this call added. Idempotent. */
    unregister(): void;
}
/**
 * Handlers, keyed by the id a descriptor names.
 *
 * Separate from {@link ExtensionSlotRegistry} on purpose: *where* an action
 * appears is Layer 1 configuration, and *what it does* is Layer 2 code. Keeping
 * them apart is what lets a manifest move an action between the toolbar and the
 * overflow menu without knowing anything about its implementation.
 *
 * Two tiers, because arrival order cannot decide precedence here. A customer
 * registers from an `APP_INITIALIZER`, as the extension reference tells them to,
 * while a packaged surface registers handlers closing over a component instance
 * in `ngOnInit` — so the packaged registration is always the *later* one, and a
 * single last-wins map would silently outrank every customer override of a
 * packaged id. {@link register} is the customer tier and always wins;
 * {@link registerPackaged} supplies the behaviour used when nobody has.
 */
declare class ExtensionActionRegistry {
    private readonly overrides;
    private readonly packaged;
    /**
     * Add or replace handlers. Later registration wins, which is how a customer
     * library replaces a packaged action's behaviour without forking, and it
     * outranks {@link registerPackaged} whenever either was called.
     */
    register(handlers: Readonly<Record<string, ExtensionActionHandler>>): ExtensionActionRegistration;
    /**
     * Add handlers for the behaviour this build ships, outranked by any
     * {@link register} call.
     *
     * For a packaged surface registering handlers that close over a component
     * instance: withdraw the returned registration when the component is
     * destroyed, or the registry keeps a destroyed component reachable and the
     * next invocation runs against dead state.
     */
    registerPackaged(handlers: Readonly<Record<string, ExtensionActionHandler>>): ExtensionActionRegistration;
    has(id: string): boolean;
    /** Every registered id, for the reference doc and for diagnostics. */
    registeredActionIds(): readonly string[];
    /**
     * Run the handler a descriptor names.
     *
     * Returns `false` when nothing is registered under the id rather than
     * throwing: a manifest may reference an action a newer build provides, and a
     * click on it should be inert, not a crash in the shell.
     */
    execute(descriptor: ExtensionActionDescriptor, context: ExtensionRuleContext): boolean;
    private add;
    /**
     * Within a tier the most recent registration answers, so withdrawing an
     * earlier one must leave the later one in place — hence removing this
     * handler rather than the id.
     */
    private remove;
    private resolve;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ExtensionActionRegistry, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ExtensionActionRegistry>;
}
/**
 * The text of a descriptor, preferring its translation key over its literal label.
 *
 * For the consumers a template pipe cannot reach — a page heading built in TypeScript, a
 * composed accessible name, and adf-core's `DataColumn.title`, which upstream's own DataTable
 * renders where we have no template at all.
 *
 * `@i18n-contract:descriptor-api-is-framework-agnostic`
 *
 * Takes a resolver rather than `TranslateService` so that **this function, and the descriptor
 * data contract around it, impose no translation library on a caller**: Layer 1 descriptors are
 * data, and which library renders them is the host's business. Callers pass
 * `(key) => translate.instant(key)`.
 *
 * That is narrower than what this comment used to claim, and the difference matters. It said the
 * LIBRARY keeps no dependency on ngx-translate, and that stopped being true in this same
 * change-set — twice. `extension-outlet.component.ts` imports `TranslatePipe` for its `Loading…`
 * live region, and `DescriptorLabelPipe` injects `TranslateService`. A reviewer caught the pipe;
 * the outlet had gone unremarked for several commits.
 *
 * Moving both out was tried and is not viable: the pipe in `shared/ui` importing `descriptorLabel`
 * from here leaves a component undefined at module-initialisation time and takes six `AppShellComponent`
 * specs with it. So the honest statement is the one above — the function and the data contract are
 * agnostic, the library's own Angular components are not, and `@ngx-translate/core` is a declared
 * peer dependency of `@nuxeo/satori-platform` for exactly that reason.
 *
 * Falls back to the literal when a key does not resolve, because ngx-translate passes an
 * unknown key straight through and a column header reading `column.last-contributor` is worse
 * than the English it replaced.
 */
declare function descriptorLabel(descriptor: {
    readonly label: string;
    readonly labelKey?: string;
}, translate: (key: string) => string): string;

/**
 * The bulk actions the product ships with.
 *
 * The same six controls, in the same order, with the same icons and tooltips
 * that `selection-topbar.component.html` held as fixed markup before this
 * change — reproducing today's behaviour exactly is the requirement. What
 * changed is that each is now **addressable by id**, so hiding, reordering,
 * relabelling or rule-gating one is a manifest edit, and adding one is a
 * registration rather than an edit to three files across two projects.
 *
 * Note what is deliberately **not** here: permission rules. Today's topbar
 * offers all six regardless of what the user may do with the selection, and
 * `ExtensionRuleContext.selection` is still empty, so adding
 * `app.rules.canRemoveSelection` to Delete would hide it from everyone. The
 * server-side Nuxeo permission is, as always, the thing that actually decides.
 */
declare const PACKAGED_BULK_ACTIONS: readonly ExtensionActionDescriptor[];
/**
 * The document-detail toolbar and its overflow menu.
 *
 * The same controls, in the same order, with the same icons, tooltips and
 * gating that `document-detail.html` held as fixed markup — the `@if`
 * conditions that wrapped each button are now `rule`s, and the `[disabled]`
 * bindings that read `actionInProgress()` are now `enabledRule`s over
 * `app.rules.isNotBusy`. The lock pair has since moved to Web UI's behaviour:
 * its icon shows the document's state and Unlock is shown to every reader.
 *
 * `overflow: true` puts an entry behind the "More actions" menu. A manifest
 * promotes one to the toolbar by restating its id with `"overflow": false`.
 *
 * Each toggle is **two descriptors gated by opposite rules** rather than one
 * whose label the component swaps, so a customer relabelling "Notify Me"
 * without relabelling "Unsubscribe" gets exactly that.
 *
 * The knowledge-enrichment and Content Lake controls are **not** here. They
 * render progress spinners and a three-state ingest marker rather than a
 * button, so a descriptor cannot express them; they remain markup.
 */
declare const PACKAGED_DOCUMENT_TOOLBAR_ACTIONS: readonly ExtensionActionDescriptor[];
/**
 * The browse document context menu — the "More actions" menu on the browse
 * header, acting on the folder or document currently open.
 *
 * Named `contextMenu` because that is the slot it fills. **Browse has no
 * per-row menu**, in this build or before it: the slot's one-line description
 * said "row-level menu on a document list" while the only menu in
 * `browse.html` was this one. The id is the contract, so it stays; the
 * description in `docs/extension-reference.md` was corrected instead.
 */
declare const PACKAGED_BROWSE_CONTEXT_MENU: readonly ExtensionActionDescriptor[];
/**
 * The menu on each row of browse's document list, acting on that row's document.
 *
 * Each row resolves this slot with the row's document as the focused one, so `rule` and
 * `enabledRule` read that document's own permissions and properties, not the folder's. Rename
 * changes `dc:title`, as Web UI's title edit does; Copy to and Move to choose a destination folder
 * and run `Document.Copy` and `Document.Move`; Delete moves the document to the trash.
 *
 * As everywhere, these rules decide what the interface offers. Nuxeo checks the permission on the
 * request itself.
 */
declare const PACKAGED_ROW_ACTIONS: readonly ExtensionActionDescriptor[];

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
declare const PACKAGED_DOCUMENT_TABS: readonly ExtensionTabDescriptor[];

/**
 * The browse document-list columns the product ships with.
 *
 * The same twelve columns, in the same order, with the same labels and the same
 * four switched on by default that `column-settings-dialog.ts` held as a
 * hardcoded `ALL_COLUMNS` const before this change — reproducing today's
 * behaviour exactly is the requirement. What changed is that each is now
 * **addressable by id**, so hiding, reordering or relabelling one is a manifest
 * edit rather than a source change.
 *
 * `ExtensionColumnDescriptor` existed before anything registered or read it, and
 * `documentList` was one of the five reserved slot ids that
 * `AGENTS/11-beta-program.md` section 3 warns about: "a slot id existing does not
 * mean anything reads it. Do not describe a reserved id as an extension point."
 * This is the registration and the consumer that make it real.
 *
 * ## Precedence
 *
 * Three layers, narrowest last:
 *
 * 1. these descriptors — what the product ships
 * 2. the manifest — a customer hides, reorders or relabels by id (Layer 1)
 * 3. the user's own column picker, persisted in `localStorage` — visibility only
 *
 * A customer who `disabled`s a column removes it from the picker too, so a user
 * preference cannot resurrect it. A customer who sets `hiddenByDefault` only
 * changes the starting state, and a user may still switch it on.
 *
 * ## `field` values
 *
 * These are the keys the browse row template already reads off its view model,
 * not raw Nuxeo property paths. `title` is not `dc:title` because the row binds
 * a computed display title. Phase 3 expected to migrate them to Nuxeo paths for
 * the adf-hx `document-list`, which was removed instead.
 */
declare const PACKAGED_BROWSE_COLUMNS: readonly ExtensionColumnDescriptor[];

/**
 * Turn route descriptors into `Routes` answered by {@link ExtensionOutletComponent}.
 *
 * Exported because it is the whole of the mapping and a caller that builds its
 * own router config statically may want it without the live re-registration
 * below.
 *
 * The component is named by id and resolved from `ExtensionComponentRegistry`,
 * which is what keeps this Layer 1: a manifest places a component that is
 * already compiled in, and contributing a new one is Layer 2.
 *
 * A descriptor whose `path` the router would refuse is dropped here rather than
 * handed to `resetConfig`, which validates only under `ngDevMode` and would
 * otherwise reject the **whole batch** — one typo taking down a customer's working
 * routes with it. What was dropped is on `AppExtensionsService.invalidRoutes`.
 */
declare function extensionRoutes(descriptors: readonly ExtensionRouteDescriptor[]): Routes;
interface ExtensionRoutesOptions {
    /**
     * Path of the top-level route whose `children` the contributions join.
     *
     * Defaults to `''`, which is the authenticated shell in this application.
     * A contributed route therefore renders inside the shell — with the navigation
     * drawer and the header — rather than replacing it, which is what a customer
     * adding a page expects. If no top-level route has that path, contributions
     * are appended at the top level instead.
     */
    readonly parentPath?: string;
}
/**
 * Register the manifest's `routes` slot with the router, and keep it current.
 *
 * ## Why this is an effect rather than a one-shot
 *
 * The manifest is fetched by `AppConfigService.load()` in an `APP_INITIALIZER`,
 * which nothing guarantees has settled when `provideRouter()` builds the config,
 * so there may be nothing to contribute yet. Re-resolving on the manifest signal
 * is what makes a manifest-declared route exist as soon as the manifest lands,
 * rather than only on the next full page load.
 *
 * ## What it deliberately does not do
 *
 * Descriptors are resolved against an **empty rule context**. A `rule` on a
 * route would otherwise be evaluated once, at registration, against whatever
 * happened to be in focus then — an answer that would look like authorisation
 * and be nothing of the kind. Use `disabled`, or a `visible: false` override, to
 * withdraw a route.
 *
 * A route contributed here carries **no guard**, and adding one from a manifest
 * is not offered. Nuxeo evaluates permissions server-side; a page reachable by
 * URL is not a page whose data the user may read.
 *
 * The registration is late by construction, so a deep link typed before the
 * manifest has loaded does not match. The route works from the moment the
 * manifest arrives; it is not a substitute for a compiled-in route.
 */
declare function provideExtensionRoutes(options?: ExtensionRoutesOptions): EnvironmentProviders;

/**
 * A route descriptor the router would not have accepted, and why.
 *
 * Reported rather than dropped for the same reason `ResolvedExtensionConfig.missing`
 * is: a customer whose entry vanished needs to be told which one and what was wrong
 * with it, or the manifest becomes something you debug by bisection.
 */
interface RejectedExtensionRoute {
    /** Descriptor id, so the entry is findable in the manifest that declared it. */
    readonly id: string;
    /** Human-readable cause, quoting the offending path when there is one. */
    readonly reason: string;
}
interface PartitionedExtensionRoutes {
    readonly accepted: readonly ExtensionRouteDescriptor[];
    readonly rejected: readonly RejectedExtensionRoute[];
}
/**
 * Why the router would refuse this path, or `null` when it would accept it.
 *
 * `Router.resetConfig` validates only under `ngDevMode`, so an invalid path is a
 * thrown `RuntimeError` in development and a permanently unmatchable route in a
 * production build. Checking here makes the two agree, and makes them both agree
 * with the tolerant-manifest contract the config loaders state: a customer who saves
 * something invalid gets the packaged application back, not a blank screen.
 *
 * The empty path is rejected even though Angular permits it. Contributions are
 * appended to the host route's children, after the shell's own `{ path: '' }`, so an
 * empty contributed path is matched by nothing and only looks like a working route.
 */
declare function extensionRoutePathRejection(path: unknown): string | null;
/** Split descriptors into the ones the router can take and the ones it cannot. */
declare function partitionExtensionRouteDescriptors(descriptors: readonly ExtensionRouteDescriptor[]): PartitionedExtensionRoutes;

/**
 * The live rule context, as signals.
 *
 * Rules need the focused document, the selection, the signed-in user and the
 * current URL. Those are owned by four different places in the shell, and a
 * slot consumer should not have to know any of them — it asks for
 * `context()` and re-resolves when it changes.
 *
 * The shell writes into this service; slot consumers only read. Keeping the
 * writes in one place is what stops the toolbar and the bulk bar disagreeing
 * about what is selected.
 */
declare class ExtensionRuleContextService {
    readonly document: _angular_core.WritableSignal<NuxeoDocument | null>;
    readonly selection: _angular_core.WritableSignal<readonly NuxeoDocument[]>;
    readonly selectionCount: _angular_core.WritableSignal<number>;
    readonly username: _angular_core.WritableSignal<string | null>;
    readonly isAdministrator: _angular_core.WritableSignal<boolean>;
    readonly url: _angular_core.WritableSignal<string>;
    /**
     * Interface state published by whichever surface is in focus. See
     * {@link ExtensionRuleContext.flags}.
     *
     * The publishing surface owns the whole bag and must clear it on destroy, the
     * same contract `document` already has: a stale `favorite: true` left behind
     * by a closed document would gate the next surface's actions on it.
     */
    readonly flags: _angular_core.WritableSignal<Readonly<Record<string, boolean>>>;
    readonly context: _angular_core.Signal<ExtensionRuleContext>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ExtensionRuleContextService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ExtensionRuleContextService>;
}

/**
 * A component contributed by ID, either eagerly or behind a dynamic import.
 *
 * The lazy form matters: routes, tabs and drawer panels all live in
 * lazy-loaded feature libraries, and a registry that only accepted a `Type`
 * would force the shell to statically import every one of them and defeat code
 * splitting. `nav-drawer.component.ts` already worked around this with an
 * ad-hoc `Promise.all` of dynamic imports; the loader form replaces it.
 */
type ExtensionComponentSource = Type<unknown> | (() => Promise<Type<unknown>>);
/**
 * Components a manifest may reference by ID.
 *
 * This is the mechanism behind `extensions.setComponents({...})` in ACA, and
 * the reason Layer 1 stops where it does: a manifest can only wire together
 * components that are already compiled in. Contributing a *new* component is
 * Layer 2 — a customer library calls `register()` with its own IDs.
 */
declare class ExtensionComponentRegistry {
    private readonly sources;
    private readonly resolved;
    private readonly pending;
    /** Register components by ID. A later registration replaces an earlier one. */
    register(components: Readonly<Record<string, ExtensionComponentSource>>): void;
    registeredComponentIds(): readonly string[];
    has(id: string): boolean;
    /** An already-resolved component, or `null` if it is lazy and not loaded yet. */
    peek(id: string): Type<unknown> | null;
    /**
     * Resolve a component by ID, loading it if it is behind a dynamic import.
     *
     * Returns `null` rather than throwing for an unregistered ID **or a loader
     * that rejects**. A chunk that fails to load is a deployment or network
     * problem, and the caller's job is to render a fallback panel, not to take the
     * application down. In-flight loads are shared, so a slot resolving twice in
     * one change-detection pass does not fetch the chunk twice.
     */
    resolve(id: string): Promise<Type<unknown> | null>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ExtensionComponentRegistry, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ExtensionComponentRegistry>;
}

/**
 * Renders a component resolved from the registry, by ID or by type.
 *
 * This is the **shared component-resolution primitive** that route, tab, viewer
 * and drawer extensions all need. It generalises the shell's
 * `DynamicDrawerComponent`, which took only an eagerly imported
 * `Type<unknown>`, in three ways that each unblock a slot:
 *
 * - accepts a registered **ID**, which is what a manifest can name;
 * - resolves **lazily loaded** components, so a tab or route panel in a
 *   lazy feature library does not have to be statically imported by the shell;
 * - binds **inputs**, so a descriptor can pass configuration to the component it
 *   names.
 *
 * It uses `createComponent()` rather than `ViewContainerRef.createComponent()`
 * because the former accepts `bindings`/`environmentInjector` explicitly, which
 * is what makes input binding to a dynamically chosen component possible at all.
 *
 * A change to `componentInputs` values is applied to the live instance. The `documentView`
 * slot feeds the focused document, which is a new object on every refetch, and recreating
 * on each one would discard whatever state the rendered view holds. A change of component,
 * or of which declared inputs are set, recreates it: in place, an input the new inputs
 * omit would keep its previous value. While a lazy component loads, nothing is shown.
 * After a loader rejects, the next `componentInputs` change retries it, at most twice.
 */
declare class ExtensionOutletComponent {
    /** Registered component ID to render. Takes precedence over `componentType`. */
    readonly componentId: _angular_core.InputSignal<string | null>;
    /** An already-imported component, for callers that have one in hand. */
    readonly componentType: _angular_core.InputSignal<Type<unknown> | null>;
    /**
     * Inputs to set on the rendered component. Unknown keys are ignored.
     *
     * The `?? {}` in the effect below is not defensive padding. `withComponentInputBinding()`
     * sets **every declared input** from route data, passing `undefined` for keys the
     * route does not supply — which overrides this default. So routing straight to this
     * component with `data: { componentId: '...' }` made `componentInputs()` `undefined`
     * and `Object.entries()` threw, blanking the route. Both this template and the
     * product bootstrap with `withComponentInputBinding()`, so the crash was reachable
     * from either.
     */
    readonly componentInputs: _angular_core.InputSignal<Readonly<Record<string, unknown>> | null | undefined>;
    readonly loading: _angular_core.WritableSignal<boolean>;
    /** True when nothing could be resolved, so the host can render a fallback. */
    readonly unresolved: _angular_core.WritableSignal<boolean>;
    private outlet;
    private readonly registry;
    private readonly injector;
    private readonly environmentInjector;
    private componentRef;
    private renderedType;
    /** Public names of the inputs the rendered component declares. */
    private declaredInputs;
    /** The declared input names last set, from {@link declaredKeysOf}. */
    private appliedKeys;
    /** Bumped on every request so a slow load cannot overwrite a newer one. */
    private generation;
    /** Retries left for the requested id after its loader rejected — {@link retryUnresolved}. */
    private retriesLeft;
    /** A retry's load is pending; updates meanwhile ride on it rather than starting another. */
    private retrying;
    private static readonly MAX_RETRIES;
    constructor();
    /**
     * Resolve `id` and render it, or mark the outlet unresolved.
     *
     * A `retry` leaves the outlet as it is — unresolved, nothing rendered, no loading state —
     * until the load settles, so a host showing its fallback keeps showing it rather than
     * blanking for the length of a chunk request that may fail again.
     */
    private load;
    /**
     * Ask again for a registered component whose loader rejected.
     *
     * The registry does not cache a rejection, so a transient chunk failure is recoverable —
     * but only if something asks. A new `componentInputs` value is a fresh render request
     * (for `documentView`, a refetched or different document), so it retries. Bounded by
     * {@link MAX_RETRIES} per requested id, so a loader that always fails is called three
     * times in all rather than on every refetch. An id nothing registered is not retried:
     * that is a missing library, not a transient failure.
     *
     * An update while a retry is still loading starts nothing and spends nothing: the
     * registry would fold it onto the pending load, and the retry renders with whatever
     * inputs are current when it lands.
     */
    private retryUnresolved;
    private render;
    /**
     * Set the inputs the component declares, and only those.
     *
     * A descriptor's inputs are customer-authored, and a host may offer an input not every
     * component wants — `documentView` always offers `document`. `setInput` does not throw
     * on an undeclared name; in a development build it logs NG0303 to the console, so the
     * filter is what keeps an unused key silent rather than a `catch` that never fires.
     */
    private applyInputs;
    /** The declared input names `inputs` sets. */
    private declaredKeysOf;
    /** Whether `inputs` sets exactly the declared inputs last applied. */
    private setsAppliedKeys;
    private clear;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<ExtensionOutletComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<ExtensionOutletComponent, "lib-extension-outlet", never, { "componentId": { "alias": "componentId"; "required": false; "isSignal": true; }; "componentType": { "alias": "componentType"; "required": false; "isSignal": true; }; "componentInputs": { "alias": "componentInputs"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * The single thing the application injects to read the addressable surface.
 *
 * It joins the two halves: descriptors and rules registered in **code** at
 * bootstrap, and contributions and overrides loaded from the **manifest** by
 * `AppConfigService`. Everything a consumer needs is `resolve(slot, context)`.
 *
 * The packaged document rules are registered in the constructor, so any
 * injector that reaches this service has them — a consumer cannot forget to
 * bootstrap the rules and then silently resolve every rule-gated entry to
 * `true`.
 */
declare class AppExtensionsService {
    private readonly appConfig;
    private readonly slots;
    private readonly rules;
    /** The merged Layer 1 config, recomputed when the manifest signal changes. */
    private readonly resolved;
    readonly config: _angular_core.Signal<ExtensionConfig>;
    /** Layer names referenced but not resolvable — surfaced rather than swallowed. */
    readonly missingLayers: _angular_core.Signal<readonly string[]>;
    /**
     * `routes` entries dropped because the router would not have matched their path.
     *
     * Same channel as {@link missingLayers}, for the same reason: an entry that
     * disappears without a word is a manifest you debug by bisection. Recomputes with
     * the manifest signal, which is where a customer-authored path comes from; the
     * packaged descriptors registered at bootstrap are compiled in and valid.
     */
    readonly invalidRoutes: _angular_core.Signal<readonly RejectedExtensionRoute[]>;
    private readonly overrides;
    constructor();
    /** Contribute packaged descriptors to a slot. See {@link ExtensionSlotRegistry.register}. */
    register<T extends ExtensionElement>(slot: ExtensionSlotId, entries: readonly T[]): void;
    /** Contribute rule evaluators — the Layer 2 entry point for customer code. */
    registerRules(evaluators: Readonly<Record<string, ExtensionRuleEvaluator>>): void;
    /**
     * The descriptors a slot should render right now.
     *
     * Not memoised: the rule context is caller-supplied and changes with the
     * focused document and the selection, so a cache keyed on the slot alone
     * would serve a stale answer. Resolution is a filter and a sort over a list
     * that is tens of entries long at most.
     */
    resolve<T extends ExtensionElement>(slot: ExtensionSlotId, context?: ExtensionRuleContext): readonly T[];
    /** Evaluate a rule reference directly, for a template that gates one control. */
    evaluateRule(rule: ExtensionRule | null | undefined, context: ExtensionRuleContext): boolean;
    /** Every registered id, for the extension reference doc and diagnostics. */
    inventory(): Readonly<Record<string, readonly string[]>>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<AppExtensionsService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<AppExtensionsService>;
}

/**
 * Everything a layer may contribute to the addressable surface, in one object.
 *
 * This is the **Layer 2 contract** — the shape a customer's extension library
 * hands us, and our equivalent of ACA's `setComponents`, `setEvaluators` and
 * `setActions`. It is deliberately one declarative object rather than four
 * imperative calls against four registries: a customer should not have to know
 * that slots, rules, components and handlers live in different services, nor
 * which of them must be touched before the first slot resolves.
 *
 * Every field is optional, so a library contributing only a rule writes
 * `{ rules: { ... } }`.
 */
interface SatoriExtensionContributions {
    /**
     * Descriptors per slot — *where* something appears and *when*.
     *
     * Keys are slot ids. {@link ExtensionSlotId} is `string` by construction, so a
     * slot this build has never heard of is registerable and a later release can
     * read it; see the note on additive slots in `extension-slots.ts`.
     */
    readonly slots?: Readonly<Record<ExtensionSlotId, readonly ExtensionElement[]>>;
    /**
     * Named predicates a manifest may reference by id.
     *
     * Re-registering a packaged id overrides it, which is how a customer changes
     * when an action is offered without forking the descriptor.
     */
    readonly rules?: Readonly<Record<string, ExtensionRuleEvaluator>>;
    /**
     * Rule ids that must **deny** when unregistered rather than permit.
     *
     * An unknown rule id normally fails *open*, because Layer 1 visibility is not
     * an authorisation boundary and a manifest typo must not strip working actions
     * out of the UI. That default is wrong for a rule that gates an
     * administrative surface: the unsafe window is precisely the one before
     * registration happens, and failing open there once offered Administration to
     * every user. Declare those ids here.
     *
     * This is **not** a security control on its own — the server-side Nuxeo
     * permission still decides whether an operation succeeds.
     */
    readonly failClosedRules?: readonly string[];
    /**
     * Components a manifest may place by id — *what renders*.
     *
     * A `() => Promise<Type>` loader keeps the component in its own lazy chunk, so
     * contributing one does not pull it into the initial bundle.
     */
    readonly components?: Readonly<Record<string, ExtensionComponentSource>>;
    /** Handlers a descriptor names — *what an action does*. */
    readonly actions?: Readonly<Record<string, ExtensionActionHandler>>;
}
/**
 * Contributions, or a factory that produces them inside an injection context.
 *
 * The factory form exists because real contributions need dependencies: the
 * application's own `app.rules.hasAdministrationAccess` reads `AuthService`, and
 * a customer's action handler is normally an injectable service. A plain object
 * cannot `inject()`; a factory can.
 *
 * The factory runs before the configuration loads, and a configuration token
 * keeps the first value it resolves to. So a service that reads one when it is
 * constructed — every `NuxeoApiBase` service reads `NUXEO_API_ORIGIN` — belongs
 * behind an `Injector` lookup inside the rule or handler, not in the factory.
 */
type SatoriExtensionContributor = SatoriExtensionContributions | (() => SatoriExtensionContributions);
/**
 * Register a layer's contributions to the addressable surface.
 *
 * Call it in `bootstrapApplication`'s providers, once per contributing layer:
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     ...provideAppConfig(),
 *     provideSatoriExtensions(PACKAGED_CONTRIBUTIONS),
 *     provideSatoriExtensions(() => {
 *       const injector = inject(Injector);
 *       return {
 *         rules: { 'acme.rules.isPilotUser': () => injector.get(AcmeService).isPilot() },
 *         components: { 'acme.sidebar.reports': () => import('./reports').then((m) => m.Reports) },
 *       };
 *     }),
 *   ],
 * });
 * ```
 *
 * ## Ordering, which is the reason this is a provider and not a service call
 *
 * Contributions are applied in an **environment initializer**, so every id is
 * registered before the first component resolves a slot. Registering from a
 * component constructor instead leaves a window in which a rule id is unknown,
 * and an unknown rule fails open — which is how the Administration nav entry
 * came to flash for a non-administrator. An environment initializer runs earlier
 * than `APP_INITIALIZER`, so it closes that window rather than narrowing it.
 *
 * Multiple calls **layer** in provider order, and later wins per id, which is
 * what makes a customer layer able to override a packaged rule, component or
 * handler. Slot descriptors accumulate rather than replace; use the manifest's
 * `overrides` to hide or reorder a packaged entry.
 *
 * Returns `EnvironmentProviders`, so it cannot be mistakenly listed in a
 * component's `providers` — where it would run too late to be worth anything.
 */
declare function provideSatoriExtensions(contributor: SatoriExtensionContributor): EnvironmentProviders;

/**
 * A platform navigation entry, in a shape that owes nothing to Satori.
 *
 * The shell maps this to `SatNavigationItemWithIcon` when it renders. Keeping
 * the descriptor neutral means a customer's manifest and a customer's extension
 * library are written against our vocabulary, not against the nav component we
 * happen to use this quarter.
 */
interface NavItemDescriptor extends ExtensionElement {
    /**
     * The entry's text, as a literal.
     *
     * Still required, still a literal, and still what a manifest's
     * `overrides[id].label` replaces. Nothing about this field changed when `labelKey` arrived,
     * which is the point: it is documented in `docs/extension-reference.md` with worked examples
     * a customer has copied, and reinterpreting it as a translation key would have turned every
     * one of those literals into a lookup that misses.
     *
     * When `labelKey` is present this is the **fallback**, used only if the key does not resolve.
     */
    readonly label: string;
    /**
     * A translation key for the entry's text, preferred over `label` when it resolves.
     *
     * ## Why a second field rather than treating `label` as a key
     *
     * `label` is published API — it is on eight interfaces in `docs/api/platform.api.md` and
     * documented as customer-settable. A customer writing `"label": "Repository"` expects that
     * string on screen. Piping it would make it a catalogue lookup that survives only by
     * ngx-translate's key passthrough, and a label containing a dot — `"v2.0 Archive"` — would
     * attempt a *nested* lookup and could resolve to something else entirely.
     *
     * So the packaged entries carry both: `labelKey` for translation, `label` for the English
     * text and for any consumer that has not been taught the key. A customer who only knows
     * about `label` keeps working unchanged.
     *
     * ## Which mechanism a customer should reach for
     *
     * | Want | Use | Scope |
     * | --- | --- | --- |
     * | One label, every language | `overrides[id].label` | Wins outright; bypasses translation |
     * | Replace the key's text | `labels['nav.item.browse']` in the manifest | Wherever the key resolves; same text in every language |
     *
     * Setting **both** means the override wins and the `labels` entry is silently inert. That is
     * the documented precedence, not an accident, and `docs/extension-reference.md` says so.
     */
    readonly labelKey?: string;
    /** Router path, e.g. `/browse`. */
    readonly path: string;
    /** Icon name understood by the shell's icon set. */
    readonly icon: string;
    /** When true, clicking opens the secondary drawer instead of navigating directly. */
    readonly hasDrawer?: boolean;
    /** Registered rule id gating visibility. */
    readonly rule?: ExtensionRule;
}
/**
 * The navigation the product ships with.
 *
 * Phase 2 took the compiled `const` that `apps/nuxeo-ui/src/app/platform-nav-items.ts`
 * held and **registered it into a slot** instead, so a manifest can reorder it, relabel
 * it, hide entries, gate them behind a rule, or add its own. Reproducing the pre-Phase-2
 * navigation exactly was that phase's requirement, and it did.
 *
 * One browse surface is offered, at `/browse`. The adf-hx proof of concept's
 * `app.navbar.browseAdfHx` stood beside it, with this entry disabled, until both its route and
 * its ID were retired. Anything reading this list as "what the user sees" must still filter it,
 * because a manifest can disable or gate any entry — `resolve()` does, `pageTitle` deliberately
 * does not.
 *
 * `order` is explicit and spaced by ten so a customer can insert between two
 * packaged entries without restating the list.
 */
declare const PACKAGED_NAV_ITEMS: readonly NavItemDescriptor[];
/**
 * The navigation to render: packaged entries merged with the manifest's, with
 * overrides applied, rules evaluated and order honoured.
 *
 * A **signal** behind a token rather than a compiled array, for two reasons the
 * `const` could not satisfy. The manifest arrives asynchronously in
 * `APP_INITIALIZER`, so an eagerly evaluated array would capture the packaged
 * list; and nav rules such as `app.rules.isAdministrator` depend on the
 * signed-in user, so the answer changes after sign-in.
 */
declare const APP_NAV_ITEMS: InjectionToken<Signal<readonly NavItemDescriptor[]>>;

/** The two fields every Layer 1 descriptor carries for its text. */
interface LabelledDescriptor {
    readonly label: string;
    readonly labelKey?: string;
}
/**
 * A descriptor's text, with the literal `label` as a real fallback.
 *
 * ## What this replaces, and why it is a pipe rather than a convention
 *
 * Thirty-eight templates wrote the fallback by hand:
 *
 * ```html
 * {{ item.labelKey ? (item.labelKey | translate) : item.label }}
 * ```
 *
 * That is not a fallback. ngx-translate returns an unresolved key **unchanged**, so when the app
 * catalogue has not loaded — the compiled fallback map holds accessible names only, not visible
 * nav labels — every one of those bindings rendered `nav.browse` at the user instead of `Browse`.
 * A raw key on screen is worse than the English it replaced, which is the whole reason the
 * two-field contract exists.
 *
 * `descriptorLabel` already implemented the correct rule and `AppShellComponent.navText` already
 * used it, for text built in TypeScript. The ternary was the template half of the same idea,
 * written thirty-eight times and wrong every time. One pipe means the rule has one definition.
 *
 * ## Why it is impure
 *
 * `translate.instant` is not reactive, so a pure pipe would resolve once and keep whatever
 * language was active then. `TranslatePipe` is impure for exactly this reason; this follows it
 * rather than inventing a different answer.
 */
declare class DescriptorLabelPipe implements PipeTransform {
    private readonly translate;
    transform(descriptor: LabelledDescriptor | null | undefined): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<DescriptorLabelPipe, never>;
    static ɵpipe: _angular_core.ɵɵPipeDeclaration<DescriptorLabelPipe, "descriptorLabel", true>;
}

export { APP_NAV_ITEMS, AppExtensionsService, CORE_RULE_EVALUATORS, DOCUMENT_RULE_EVALUATORS, DescriptorLabelPipe, EMPTY_EXTENSION_RULE_CONTEXT, EXTENSION_SLOTS, ExtensionActionRegistry, ExtensionComponentRegistry, ExtensionOutletComponent, ExtensionRuleContextService, ExtensionRuleRegistry, ExtensionSlotRegistry, NO_EXTENSION_SLOT_OVERRIDES, PACKAGED_BROWSE_COLUMNS, PACKAGED_BROWSE_CONTEXT_MENU, PACKAGED_BULK_ACTIONS, PACKAGED_DOCUMENT_TABS, PACKAGED_DOCUMENT_TOOLBAR_ACTIONS, PACKAGED_NAV_ITEMS, PACKAGED_ROW_ACTIONS, SECURITY_RELEVANT_RULE_IDS, SURFACE_RULE_EVALUATORS, descriptorLabel, extensionRoutePathRejection, extensionRoutes, mergeExtensionConfigs, partitionExtensionRouteDescriptors, provideExtensionRoutes, provideSatoriExtensions, readExtensionConfig, resolveExtensionConfig };
export type { DocumentLayoutChange, ExtensionActionDescriptor, ExtensionActionHandler, ExtensionActionRegistration, ExtensionColumnDescriptor, ExtensionComponentSource, ExtensionConfig, ExtensionDocumentLayoutDescriptor, ExtensionDocumentViewDescriptor, ExtensionElement, ExtensionLayerResolver, ExtensionOverride, ExtensionRouteDescriptor, ExtensionRoutesOptions, ExtensionRule, ExtensionRuleContext, ExtensionRuleEvaluator, ExtensionRuleRef, ExtensionRuleResolver, ExtensionSlotId, ExtensionSlotOverrides, ExtensionTabDescriptor, LabelledDescriptor, NavItemDescriptor, PartitionedExtensionRoutes, RejectedExtensionRoute, ResolvedExtensionConfig, SatoriExtensionContributions, SatoriExtensionContributor };
//# sourceMappingURL=index.d.ts.map
