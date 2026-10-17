import * as i0 from '@angular/core';
import { Injectable, inject, computed, input, signal, Injector, EnvironmentInjector, DestroyRef, effect, untracked, createComponent, reflectComponentType, ViewContainerRef, ViewChild, ChangeDetectionStrategy, Component, provideEnvironmentInitializer, runInInjectionContext, InjectionToken, Pipe } from '@angular/core';
import { canRemoveDocument, canWriteDocument, canPublishDocument, canManageDocumentPermissions, canAddChildren } from '@nuxeo/satori-platform/nuxeo-client';
import { Router } from '@angular/router';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

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
const EXTENSION_SLOTS = {
    /** Primary platform navigation entries. */
    navbar: 'navbar',
    /** Secondary drawer content behind a navbar entry. */
    sidebar: 'sidebar',
    /** Lazily resolved application routes. */
    routes: 'routes',
    /** Document-detail and browse toolbar actions. */
    toolbar: 'toolbar',
    /** The browse "More actions" menu, on the folder or document open. */
    contextMenu: 'contextMenu',
    /** The menu on each row of a document list, acting on that row's document. */
    rowActions: 'rowActions',
    /** Actions over a multi-document selection. */
    'bulk-actions': 'bulk-actions',
    /** Document-detail tab children. */
    tabs: 'tabs',
    /** Document list column descriptors. */
    documentList: 'documentList',
    /**
     * The body of the document-detail View tab, chosen per document by rule.
     *
     * Named for the view alone. Nuxeo Web UI resolves four layouts per type — view, edit,
     * create and metadata. The other three each have a slot of their own below, rather than one
     * `documentLayout` slot whose entries carry a mode, because each mode hands its component a
     * different contract and the create form's rule reads a type, not a document.
     */
    documentView: 'documentView',
    /** A document type's section of the document-detail Properties panel, chosen per document by rule. */
    documentMetadata: 'documentMetadata',
    /** The form editing a document's properties, chosen per document by rule. */
    documentEdit: 'documentEdit',
    /** The form filling in a new document's properties, chosen by rule for the type being created. */
    documentCreate: 'documentCreate',
};

/** An empty context, so a caller with nothing in focus need not build one. */
const EMPTY_EXTENSION_RULE_CONTEXT = {
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
const CORE_RULE_EVALUATORS = {
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
const SECURITY_RELEVANT_RULE_IDS = [
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
class ExtensionRuleRegistry {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionRuleRegistry, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionRuleRegistry, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionRuleRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** `Array.prototype.filter` predicate: keep entries that are not disabled. */
function filterEnabled(entry) {
    return !entry.disabled;
}
/**
 * `Array.prototype.sort` comparator: ascending `order`, an absent `order` as `MAX_SAFE_INTEGER`.
 *
 * Equal keys compare as `0`, so registration order survives among them: `sort` is stable.
 */
function sortByOrder(a, b) {
    // `=== undefined`, not `??`: a `null` order must take part in the subtraction and sort as `0`.
    const left = a.order === undefined ? Number.MAX_SAFE_INTEGER : a.order;
    const right = b.order === undefined ? Number.MAX_SAFE_INTEGER : b.order;
    return left - right;
}

const NO_EXTENSION_SLOT_OVERRIDES = { byId: {}, additions: {} };
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
class ExtensionSlotRegistry {
    rules = inject(ExtensionRuleRegistry);
    slots = new Map();
    /**
     * Contribute descriptors to a slot.
     *
     * Idempotent per id: re-registering an id replaces the previous descriptor in
     * place rather than duplicating it, so a customer library can override a
     * packaged entry and a hot-reloaded bootstrap cannot double the toolbar.
     */
    register(slot, entries) {
        const existing = this.slots.get(slot) ?? [];
        const merged = [...existing];
        for (const entry of entries) {
            const index = merged.findIndex((candidate) => candidate.id === entry.id);
            if (index >= 0)
                merged[index] = entry;
            else
                merged.push(entry);
        }
        this.slots.set(slot, merged);
    }
    /** Slot ids with at least one registered descriptor, for the reference doc. */
    registeredSlotIds() {
        return [...this.slots.keys()].sort();
    }
    /** Descriptor ids registered into a slot, in registration order. */
    registeredIds(slot) {
        return (this.slots.get(slot) ?? []).map((entry) => entry.id);
    }
    /**
     * The descriptors a slot should render: packaged plus manifest additions,
     * with overrides applied, hidden and rule-denied entries removed, ordered.
     *
     * An unknown slot resolves to an empty array rather than throwing, because a
     * manifest may reference a slot a newer build introduced.
     */
    resolve(slot, overrides = NO_EXTENSION_SLOT_OVERRIDES, context = EMPTY_EXTENSION_RULE_CONTEXT) {
        // The registry stores descriptors as the `ExtensionElement` base type it
        // shares across slots; the caller knows the concrete shape it registered.
        const packaged = (this.slots.get(slot) ?? []);
        const added = (overrides.additions[slot] ?? []);
        const merged = [...packaged];
        for (const entry of added) {
            const index = merged.findIndex((candidate) => candidate.id === entry.id);
            // A manifest entry that reuses a packaged id patches it rather than
            // appending a second row with the same id.
            //
            // `action` is withheld from that patch. Everything else here is presentation — label, icon,
            // order — but `action` names the handler `ExtensionActionRegistry.execute` will run, so
            // allowing a manifest to set it on a **packaged** id lets one keep our label and icon while
            // pointing the click somewhere else entirely:
            //
            //   { "id": "app.toolbar.addToFavorites", "action": "app.toolbar.delete" }
            //
            // The user sees a star reading "Add to Favorites" and deletes the document, and the server
            // authorises it because it really is that user asking. That is a confused deputy, and it is
            // the one thing a manifest could do that "hiding an action is not a security control" does
            // not cover — this is not hiding, it is rebinding. A manifest can still add a *new* id with
            // its own action, which is the supported way to introduce behaviour.
            if (index >= 0)
                merged[index] = { ...merged[index], ...withoutAction(entry) };
            else
                merged.push(entry);
        }
        return merged
            .map((entry) => this.applyOverride(entry, overrides.byId[entry.id]))
            .filter((entry) => entry.visible)
            .map((entry) => entry.value)
            .filter(filterEnabled)
            .filter((entry) => this.rules.evaluate(readRule(entry), context))
            .sort(sortByOrder);
    }
    applyOverride(entry, override) {
        if (!override)
            return { value: entry, visible: true };
        const patch = {};
        if (typeof override.order === 'number')
            patch['order'] = override.order;
        if (typeof override.label === 'string') {
            patch['label'] = override.label;
            // A manifest `label` is a literal the customer wants on screen, and it must beat the
            // packaged `labelKey` — otherwise the key would still win at the render site and the
            // override would appear to do nothing, which is the single most confusing way this
            // could fail. Clearing the key here puts that precedence in one place rather than
            // asking every render site to remember it.
            //
            // The customer who wants to replace the key's text uses the manifest's `labels` map
            // against the packaged key instead, and does not set `label`. That map is not keyed by
            // language, so either route shows the same text in every language. Both routes are documented in
            // `docs/extension-reference.md`; setting both is defined, not undefined — the override
            // wins and the `labels` entry is inert.
            patch['labelKey'] = undefined;
        }
        // `rule: null` in a manifest is an explicit "ungate this", so it must clear
        // the packaged rule rather than be treated as "no opinion".
        if (override.rule !== undefined)
            patch['rule'] = override.rule;
        return {
            value: { ...entry, ...patch },
            visible: override.visible !== false,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionSlotRegistry, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionSlotRegistry, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionSlotRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * The manifest entry without its `action`, for patching a packaged descriptor.
 *
 * Returned as a copy rather than deleting in place: the entry belongs to the resolved manifest,
 * which is shared, and mutating it would strip the action from a manifest-owned id too.
 */
function withoutAction(entry) {
    if (!('action' in entry))
        return entry;
    const { action: _ignored, ...rest } = entry;
    return rest;
}
function readRule(entry) {
    const rule = entry.rule;
    if (typeof rule === 'string')
        return rule;
    if (typeof rule === 'object' &&
        rule !== null &&
        typeof rule.type === 'string') {
        return rule;
    }
    return null;
}

/**
 * The merge behind `$references`: configuration objects folded left to right, later winning.
 *
 * This is ACA's `mergeObjects`, reproduced from `@alfresco/adf-extensions@9.0.0` branch for
 * branch, so a layer written against ACA merges identically here. `extension-merge.spec.ts`
 * pins every case to the output upstream produced for it, the surprising ones included:
 *
 * - a key ending `.$replace` replaces instead of merging, and any key starting `$` is skipped —
 *   but only where a merge happens, so `$` keys inside a value taken whole survive;
 * - arrays merge **by `id`**: entries with an `id` come first, in the earlier array's order with
 *   integer-like ids ahead of the rest, then the earlier array's entries without one, then the
 *   later array's unmatched entries;
 * - a later value that is not an array is appended to an earlier array;
 * - a later scalar does **not** replace an earlier object: a number or boolean is ignored and a
 *   string is spread into it by index. `"<key>.$replace"` is the way to replace one.
 *
 * It departs from upstream in three places, each where upstream throws or rewrites a prototype
 * rather than producing configuration:
 *
 * 1. **`null` or `undefined` meeting an object.** Upstream throws `TypeError` when an earlier
 *    value is `null` or a later one is `null` or `undefined` over an object, because it calls
 *    `Object.keys` on it. That ran inside a `computed`, so every slot rethrew. Here the later
 *    value wins, which is the scalar rule — and what `"rule": null` is documented to mean.
 * 2. **A `__proto__` key is skipped.** Upstream assigned it, which replaced the merged object's
 *    prototype with a copy of the value, so its keys read as configuration without being own
 *    properties. `Object.prototype` itself was never written by either.
 * 3. **An `id` is only ever data.** Upstream looked ids up in a `{}`, so an entry whose id was
 *    `__proto__` vanished and one whose id named an `Object.prototype` member (`constructor`,
 *    `toString`) merged with that member instead of being appended. The lookup has no prototype.
 */
const REPLACE_SUFFIX = '.$replace';
/**
 * Merge `objects` left to right into a new object. No input is modified.
 *
 * A value seen in only one input is taken by reference, not copied — as upstream does.
 */
function mergeObjects(...objects) {
    const result = {};
    for (const source of objects) {
        for (const key of Object.keys(source))
            mergeKey(result, source, key);
    }
    return result;
}
function mergeKey(result, source, key) {
    const replace = key.endsWith(REPLACE_SUFFIX);
    // `replace` removes the first occurrence, as upstream's does, so a key with the suffix twice
    // reads a different source key below. Kept: it is upstream's output for that key.
    const prop = replace ? key.replace(REPLACE_SUFFIX, '') : key;
    if (prop.startsWith('$') || prop === '__proto__')
        return;
    if (replace) {
        result[prop] = source[`${prop}${REPLACE_SUFFIX}`];
    }
    else {
        result[prop] = Object.hasOwn(result, prop)
            ? mergeValue(result[prop], source[prop])
            : source[prop];
    }
}
function mergeValue(current, incoming) {
    if (Array.isArray(current)) {
        return Array.isArray(incoming) ? mergeArrays(current, incoming) : [...current, incoming];
    }
    if (typeof current !== 'object' || current === null)
        return incoming;
    if (incoming === null || incoming === undefined)
        return incoming;
    // A primitive `incoming` is deliberate: `Object.keys` gives a number or boolean no keys and a
    // string its indices, which is upstream's result for a scalar over an object.
    return mergeObjects(current, incoming);
}
function mergeArrays(left, right) {
    const byId = Object.create(null);
    const rest = [];
    // `forEach`, not `for…of`: it skips the holes of a sparse array, as upstream's did.
    left.forEach((entry) => {
        if (hasId(entry))
            byId[entry.id] = entry;
        else
            rest.push(entry);
    });
    right.forEach((entry) => {
        const match = hasId(entry) ? byId[entry.id] : undefined;
        if (hasId(entry) && match)
            byId[entry.id] = mergeObjects(match, entry);
        else
            rest.push(entry);
    });
    return [...Object.keys(byId).map((id) => byId[id]), ...rest];
}
function hasId(entry) {
    return Boolean(entry) && Object.hasOwn(entry, 'id');
}

function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
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
function mergeExtensionConfigs(...layers) {
    const present = layers.filter((layer) => isRecord(layer));
    if (present.length === 0)
        return {};
    return mergeObjects(...present);
}
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
function resolveExtensionConfig(root, resolveLayer = (name) => root.$layers?.[name] ?? null) {
    const ignored = new Set(root.$ignoreReferenceList ?? []);
    const names = (root.$references ?? []).filter((name) => !ignored.has(name));
    const applied = [];
    const missing = [];
    const bodies = [];
    for (const name of names) {
        const layer = resolveLayer(name);
        if (!layer || !isRecord(layer)) {
            missing.push(name);
            continue;
        }
        applied.push(name);
        bodies.push(layer);
    }
    const merged = mergeExtensionConfigs(root, ...bodies);
    return { config: merged, applied, missing };
}
/**
 * Resolve each package's extension layer on its own, then merge them in contribution order, so
 * a package that depends on another wins over it.
 *
 * Each layer's `$references` resolve against that layer's own `$layers`: one package cannot
 * reach into another's named layers.
 */
function resolveExtensionLayers(layers) {
    const resolved = layers.map((layer) => resolveExtensionConfig(readExtensionConfig(layer)));
    return {
        config: mergeExtensionConfigs(...resolved.map((entry) => entry.config)),
        applied: resolved.flatMap((entry) => entry.applied),
        missing: resolved.flatMap((entry) => entry.missing),
    };
}
/**
 * Read an untrusted value into an {@link ExtensionConfig}.
 *
 * Tolerant in the same way as the Phase 1 loaders: a customer who saves
 * something malformed must get the packaged application back, not a blank
 * screen. Slot entries without a string `id` are dropped, because an entry with
 * no id cannot be addressed, overridden or reasoned about.
 */
function readExtensionConfig(raw) {
    if (!isRecord(raw))
        return {};
    const config = {};
    for (const [key, value] of Object.entries(raw)) {
        if (key.startsWith('$'))
            config[key] = value;
    }
    // Resolution iterates these, so a fragment that gets their shape wrong loses them rather than
    // throwing for every package.
    for (const key of ['$references', '$ignoreReferenceList']) {
        const names = raw[key];
        if (names === undefined)
            continue;
        config[key] = Array.isArray(names)
            ? names.filter((name) => typeof name === 'string')
            : [];
    }
    const layers = raw['$layers'];
    if (layers !== undefined) {
        config['$layers'] = isRecord(layers)
            ? Object.fromEntries(Object.entries(layers)
                .filter(([, layer]) => isRecord(layer))
                .map(([name, layer]) => [name, readExtensionConfig(layer)]))
            : {};
    }
    const slots = raw['slots'];
    if (isRecord(slots)) {
        const readSlots = {};
        for (const [slotId, entries] of Object.entries(slots)) {
            // Assigning it would replace the object's prototype, the thing `mergeObjects` refuses too.
            if (!Array.isArray(entries) || slotId === '__proto__')
                continue;
            readSlots[slotId] = entries.filter((entry) => isRecord(entry) && typeof entry['id'] === 'string' && entry['id'].trim() !== '');
        }
        config['slots'] = readSlots;
    }
    const overrides = raw['overrides'];
    if (isRecord(overrides)) {
        const readOverrides = {};
        for (const [id, override] of Object.entries(overrides)) {
            if (isRecord(override) && id !== '__proto__') {
                readOverrides[id] = override;
            }
        }
        config['overrides'] = readOverrides;
    }
    return config;
}

/** No document in focus is not "not trashed" — both trash rules deny on `null`. */
function isTrashedDocument(document) {
    return document?.isTrashed === true;
}
/** Manifest parameters are untyped JSON; only the strings can name a type or a facet. */
function stringParameters(parameters) {
    return parameters.filter((parameter) => typeof parameter === 'string');
}
/**
 * The document's type is one of `types`, matched exactly. `app.rules.isType` and
 * `app.rules.isNote` both answer through this, so they cannot disagree about a Note.
 */
function documentTypeIsOneOf(document, types) {
    const type = document?.type;
    return type !== undefined && types.includes(type);
}
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
const DOCUMENT_RULE_EVALUATORS = {
    'app.rules.canWrite': (context) => canWriteDocument(context.document),
    'app.rules.canRemove': (context) => canRemoveDocument(context.document),
    'app.rules.canAddChildren': (context) => canAddChildren(context.document),
    'app.rules.canManagePermissions': (context) => canManageDocumentPermissions(context.document),
    /**
     * Web UI's `isPublishable`: not a proxy, a record or trashed, `Publishable`, and `WriteVersion`.
     * True on a version — Web UI publishes one as it is.
     */
    'app.rules.canPublish': (context) => canPublishDocument(context.document),
    'app.rules.hasDocument': (context) => context.document !== null,
    /**
     * The focused document's type is one of `parameters` — `["Case", "Claim"]`. Exact match, as
     * Nuxeo type names are case-sensitive. No parameters means no type matches, so a rule
     * misconfigured that way hides its entry rather than showing it everywhere.
     */
    'app.rules.isType': (context, parameters) => documentTypeIsOneOf(context.document, stringParameters(parameters)),
    /** The focused document carries at least one facet in `parameters` — `["Folderish"]`. */
    'app.rules.hasFacet': (context, parameters) => {
        const facets = context.document?.facets ?? [];
        return stringParameters(parameters).some((facet) => facets.includes(facet));
    },
    /**
     * The focused document holds a main file, `file:content` — what Download downloads. Nuxeo's
     * `Downloadable` facet is not a test for it: Picture holds a file and has no such facet.
     */
    'app.rules.hasFile': (context) => {
        const content = context.document?.properties?.['file:content'];
        return typeof content === 'object' && content !== null && !Array.isArray(content);
    },
    /** The focused document is in the trash — gates the whole write half of the toolbar. */
    'app.rules.isTrashed': (context) => isTrashedDocument(context.document),
    'app.rules.isNotTrashed': (context) => context.document !== null && !isTrashedDocument(context.document),
    // The cardinality rules read `selectionCount`, which the shell can populate
    // from ids alone. The permission rules below read `selection`, which needs the
    // documents and is still empty — see `ExtensionRuleContext`.
    'app.rules.hasSelection': (context) => context.selectionCount > 0,
    'app.rules.hasSingleSelection': (context) => context.selectionCount === 1,
    'app.rules.hasMultipleSelection': (context) => context.selectionCount > 1,
    'app.rules.isAdministrator': (context) => context.user.isAdministrator,
    /** Every selected document is writable — the bulk counterpart of `canWrite`. */
    'app.rules.canWriteSelection': (context) => context.selection.length > 0 && context.selection.every(canWriteDocument),
    /** Every selected document is removable — gates bulk delete. */
    'app.rules.canRemoveSelection': (context) => context.selection.length > 0 && context.selection.every(canRemoveDocument),
};

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
const SURFACE_RULE_EVALUATORS = {
    'app.rules.isFavorite': (context) => context.flags['favorite'] === true,
    'app.rules.isLocked': (context) => context.flags['locked'] === true,
    'app.rules.isSubscribed': (context) => context.flags['subscribed'] === true,
    'app.rules.isInClipboard': (context) => context.flags['inClipboard'] === true,
    /** The focused document has at least one version, which is what publishing needs. */
    'app.rules.hasVersion': (context) => context.flags['hasVersion'] === true,
    /** The AI feature flag, so the AI tab is gateable from a manifest as well as from config. */
    'app.rules.isAiEnabled': (context) => context.flags['aiEnabled'] === true,
    /**
     * The focused document is a Note.
     *
     * A Note's body is edited inline in the View tab, so the toolbar's pencil
     * reaches only its metadata — which is why it is labelled "Edit properties"
     * there and plain "Edit" everywhere else. That is the same shape as the
     * favourite and subscription toggles: two descriptors gated by opposite
     * rules, so a customer relabelling one does not silently lose the other.
     *
     * The one rule in this map that reads the document rather than a flag: it is
     * exactly `app.rules.isType` with `["Note"]`. It read a `note` flag the page
     * derived from that same document, which `ExtensionRuleContext.flags` exists
     * to exclude. It stays in this map so that code registering either map on
     * its own still gets the ids it always did.
     */
    'app.rules.isNote': (context) => documentTypeIsOneOf(context.document, ['Note']),
    /**
     * No named operation is in flight — the `enabledRule` behind every control
     * that used to carry `[disabled]="actionInProgress() === 'trash'"`.
     *
     * Parameterised rather than one id per operation because the operation name is
     * data, not a contract: `{ type: 'app.rules.isNotBusy', parameters: ['trash'] }`.
     * With no parameters it is vacuously true, matching `core.every`'s identity.
     */
    'app.rules.isNotBusy': (context, parameters) => !parameters.some((parameter) => typeof parameter === 'string' && context.flags[`busy.${parameter}`] === true),
};

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
class ExtensionActionRegistry {
    overrides = new Map();
    packaged = new Map();
    /**
     * Add or replace handlers. Later registration wins, which is how a customer
     * library replaces a packaged action's behaviour without forking, and it
     * outranks {@link registerPackaged} whenever either was called.
     */
    register(handlers) {
        return this.add(this.overrides, handlers);
    }
    /**
     * Add handlers for the behaviour this build ships, outranked by any
     * {@link register} call.
     *
     * For a packaged surface registering handlers that close over a component
     * instance: withdraw the returned registration when the component is
     * destroyed, or the registry keeps a destroyed component reachable and the
     * next invocation runs against dead state.
     */
    registerPackaged(handlers) {
        return this.add(this.packaged, handlers);
    }
    has(id) {
        return this.resolve(id) !== undefined;
    }
    /** Every registered id, for the reference doc and for diagnostics. */
    registeredActionIds() {
        return [...new Set([...this.overrides.keys(), ...this.packaged.keys()])].sort();
    }
    /**
     * Run the handler a descriptor names.
     *
     * Returns `false` when nothing is registered under the id rather than
     * throwing: a manifest may reference an action a newer build provides, and a
     * click on it should be inert, not a crash in the shell.
     */
    execute(descriptor, context) {
        const handler = this.resolve(descriptor.action ?? descriptor.id);
        if (!handler)
            return false;
        handler.execute(context);
        return true;
    }
    add(tier, handlers) {
        const added = Object.entries(handlers);
        for (const [id, handler] of added) {
            const registered = tier.get(id);
            if (registered)
                registered.push(handler);
            else
                tier.set(id, [handler]);
        }
        return { unregister: () => this.remove(tier, added) };
    }
    /**
     * Within a tier the most recent registration answers, so withdrawing an
     * earlier one must leave the later one in place — hence removing this
     * handler rather than the id.
     */
    remove(tier, added) {
        for (const [id, handler] of added) {
            const registered = tier.get(id);
            const at = registered?.lastIndexOf(handler) ?? -1;
            if (!registered || at === -1)
                continue;
            registered.splice(at, 1);
            if (registered.length === 0)
                tier.delete(id);
        }
    }
    resolve(id) {
        return this.overrides.get(id)?.at(-1) ?? this.packaged.get(id)?.at(-1);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionActionRegistry, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionActionRegistry, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionActionRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
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
function descriptorLabel(descriptor, translate) {
    if (!descriptor.labelKey)
        return descriptor.label;
    const resolved = translate(descriptor.labelKey);
    return resolved === descriptor.labelKey ? descriptor.label : resolved;
}

/** `core.not` over one rule — the negative half of a toggle, written once. */
function not(rule) {
    return { type: 'core.not', parameters: [rule] };
}
/** `core.every` over the listed rules. */
function every(...rules) {
    return { type: 'core.every', parameters: rules };
}
/** `app.rules.isNotBusy` for one named operation. */
function notBusy(operation) {
    return { type: 'app.rules.isNotBusy', parameters: [operation] };
}
/**
 * Nuxeo Web UI never offers locking on a version, an immutable document or the repository
 * root. Versions carry the `Immutable` facet, so the facet covers both.
 */
const LOCKABLE = [
    not({ type: 'app.rules.hasFacet', parameters: ['Immutable'] }),
    not({ type: 'app.rules.isType', parameters: ['Root'] }),
];
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
const PACKAGED_BULK_ACTIONS = [
    {
        id: 'app.bulkActions.downloadZip',
        labelKey: 'action.bulk-actions-download-zip',
        label: 'Download All as Zip',
        icon: 'download',
        order: 10,
    },
    {
        id: 'app.bulkActions.addToCollection',
        labelKey: 'action.bulk-actions-add-to-collection',
        label: 'Add to Collection',
        icon: 'library_add',
        order: 20,
    },
    {
        id: 'app.bulkActions.compare',
        labelKey: 'action.bulk-actions-compare',
        label: 'Compare',
        icon: 'compare',
        order: 30,
        // Visible but disabled below two documents, which is what the fixed markup's
        // `[disabled]="selectedCount() < 2"` did.
        enabledRule: 'app.rules.hasMultipleSelection',
    },
    {
        id: 'app.bulkActions.addToClipboard',
        labelKey: 'action.bulk-actions-add-to-clipboard',
        label: 'Add to Clipboard',
        icon: 'content_paste',
        order: 40,
    },
    {
        id: 'app.bulkActions.publish',
        labelKey: 'action.bulk-actions-publish',
        label: 'Publish Document',
        icon: 'publish',
        order: 50,
    },
    {
        id: 'app.bulkActions.delete',
        labelKey: 'action.bulk-actions-delete',
        label: 'Delete selected',
        icon: 'delete',
        order: 60,
    },
];
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
const PACKAGED_DOCUMENT_TOOLBAR_ACTIONS = [
    {
        id: 'app.toolbar.edit',
        labelKey: 'action.toolbar-edit',
        label: 'Edit',
        icon: 'edit',
        order: 10,
        // Not `Immutable`: Nuxeo marks versions and publications so, and a version's `permissions`
        // enricher still lists `Write` while the server refuses the edit. Web UI hides Edit on both.
        rule: every('app.rules.isNotTrashed', 'app.rules.canWrite', not({ type: 'app.rules.hasFacet', parameters: ['Immutable'] }), not('app.rules.isNote')),
    },
    {
        // A Note's body belongs to the inline editor in the View tab, so this pencil
        // only ever reaches metadata and says so. Two descriptors rather than a
        // component-swapped label, for the same reason as the toggles above.
        id: 'app.toolbar.editProperties',
        labelKey: 'action.toolbar-edit-properties',
        label: 'Edit properties',
        icon: 'edit',
        order: 10,
        rule: every('app.rules.isNotTrashed', 'app.rules.canWrite', not({ type: 'app.rules.hasFacet', parameters: ['Immutable'] }), 'app.rules.isNote'),
    },
    {
        id: 'app.toolbar.addToCollection',
        labelKey: 'action.toolbar-add-to-collection',
        label: 'Add to collection',
        icon: 'library_add',
        order: 20,
        rule: 'app.rules.isNotTrashed',
    },
    {
        id: 'app.toolbar.delete',
        labelKey: 'action.toolbar-delete',
        label: 'Delete',
        icon: 'delete',
        order: 30,
        rule: every('app.rules.isNotTrashed', 'app.rules.canRemove'),
        enabledRule: notBusy('trash'),
    },
    {
        // The icon shows the document's state, as Web UI's does: open padlock while unlocked.
        id: 'app.toolbar.lock',
        labelKey: 'action.toolbar-lock',
        label: 'Lock',
        icon: 'lock_open',
        order: 40,
        rule: every('app.rules.isNotTrashed', 'app.rules.canWrite', not('app.rules.isLocked'), ...LOCKABLE),
        enabledRule: notBusy('lock'),
    },
    {
        // Shown to anyone who can read a locked document, so they can see who holds it. Nuxeo's
        // default lock policy takes Write on a locked document away from everyone but its owner and
        // administrators, so `canWrite` enables it for exactly them; the server still decides.
        id: 'app.toolbar.unlock',
        labelKey: 'action.toolbar-unlock',
        label: 'Unlock',
        icon: 'lock',
        order: 40,
        rule: every('app.rules.isNotTrashed', 'app.rules.isLocked', ...LOCKABLE),
        enabledRule: every(notBusy('lock'), 'app.rules.canWrite'),
    },
    {
        id: 'app.toolbar.addToFavorites',
        labelKey: 'action.toolbar-add-to-favorites',
        label: 'Add to Favorites',
        icon: 'star_border',
        order: 50,
        overflow: true,
        rule: every('app.rules.isNotTrashed', not('app.rules.isFavorite')),
        enabledRule: notBusy('favorite'),
    },
    {
        id: 'app.toolbar.removeFromFavorites',
        labelKey: 'action.toolbar-remove-from-favorites',
        label: 'Remove from Favorites',
        icon: 'star',
        order: 50,
        overflow: true,
        rule: every('app.rules.isNotTrashed', 'app.rules.isFavorite'),
        enabledRule: notBusy('favorite'),
    },
    {
        id: 'app.toolbar.share',
        labelKey: 'action.toolbar-share',
        label: 'Share',
        icon: 'share',
        order: 60,
        overflow: true,
        rule: 'app.rules.isNotTrashed',
    },
    {
        id: 'app.toolbar.publish',
        labelKey: 'action.toolbar-publish',
        label: 'Publish document',
        icon: 'publish',
        order: 70,
        overflow: true,
        // Web UI's `isPublishable`, which offers a version too: `canWrite` would read the live
        // document's `Write` off a version's enricher, and `hasVersion` is not Web UI's condition.
        rule: every('app.rules.isNotTrashed', 'app.rules.canPublish'),
    },
    {
        id: 'app.toolbar.subscribe',
        labelKey: 'action.toolbar-subscribe',
        label: 'Notify Me',
        icon: 'notifications',
        order: 80,
        overflow: true,
        rule: every('app.rules.isNotTrashed', not('app.rules.isSubscribed')),
        enabledRule: notBusy('subscribe'),
    },
    {
        id: 'app.toolbar.unsubscribe',
        labelKey: 'action.toolbar-unsubscribe',
        label: 'Unsubscribe',
        icon: 'notifications_active',
        order: 80,
        overflow: true,
        rule: every('app.rules.isNotTrashed', 'app.rules.isSubscribed'),
        enabledRule: notBusy('subscribe'),
    },
    {
        id: 'app.toolbar.addToClipboard',
        labelKey: 'action.toolbar-add-to-clipboard',
        label: 'Add to Clipboard',
        icon: 'content_paste',
        order: 90,
        overflow: true,
        rule: every('app.rules.isNotTrashed', not('app.rules.isInClipboard')),
    },
    {
        id: 'app.toolbar.removeFromClipboard',
        labelKey: 'action.toolbar-remove-from-clipboard',
        label: 'Remove from Clipboard',
        icon: 'content_paste_off',
        order: 90,
        overflow: true,
        rule: every('app.rules.isNotTrashed', 'app.rules.isInClipboard'),
    },
    {
        // No rule: Export is the one entry the trashed banner leaves reachable, and
        // it was outside the `@if (!isTrashed())` block for exactly that reason.
        id: 'app.toolbar.export',
        labelKey: 'action.toolbar-export',
        label: 'Export',
        icon: 'download',
        order: 100,
        overflow: true,
        enabledRule: notBusy('export'),
    },
    {
        id: 'app.toolbar.startProcess',
        labelKey: 'action.toolbar-start-process',
        label: 'Start Process',
        icon: 'play_circle',
        order: 110,
        overflow: true,
        rule: 'app.rules.isNotTrashed',
    },
];
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
const PACKAGED_BROWSE_CONTEXT_MENU = [
    {
        id: 'app.contextMenu.share',
        labelKey: 'action.context-menu-share',
        label: 'Share',
        icon: 'share',
        order: 10,
    },
    {
        id: 'app.contextMenu.subscribe',
        labelKey: 'action.context-menu-subscribe',
        label: 'Notify Me',
        icon: 'notifications',
        order: 20,
        rule: not('app.rules.isSubscribed'),
    },
    {
        id: 'app.contextMenu.unsubscribe',
        labelKey: 'action.context-menu-unsubscribe',
        label: 'Unsubscribe',
        icon: 'notifications_off',
        order: 20,
        rule: 'app.rules.isSubscribed',
    },
    {
        id: 'app.contextMenu.export',
        labelKey: 'action.context-menu-export',
        label: 'Export',
        icon: 'ios_share',
        order: 30,
    },
];
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
const PACKAGED_ROW_ACTIONS = [
    {
        id: 'app.rowActions.download',
        labelKey: 'action.row-actions-download',
        label: 'Download',
        icon: 'download',
        order: 10,
        rule: every('app.rules.isNotTrashed', 'app.rules.hasFile'),
    },
    {
        id: 'app.rowActions.rename',
        labelKey: 'action.row-actions-rename',
        label: 'Rename',
        icon: 'drive_file_rename_outline',
        order: 20,
        // Not `Immutable`, as Edit: a version's or publication's `permissions` still list `Write`
        // while the server refuses to change its title.
        rule: every('app.rules.isNotTrashed', 'app.rules.canWrite', not({ type: 'app.rules.hasFacet', parameters: ['Immutable'] })),
    },
    {
        id: 'app.rowActions.copyTo',
        labelKey: 'action.row-actions-copy-to',
        label: 'Copy to…',
        icon: 'file_copy',
        order: 30,
        rule: 'app.rules.isNotTrashed',
    },
    {
        id: 'app.rowActions.moveTo',
        labelKey: 'action.row-actions-move-to',
        label: 'Move to…',
        icon: 'drive_file_move',
        order: 40,
        rule: every('app.rules.isNotTrashed', 'app.rules.canRemove'),
    },
    {
        id: 'app.rowActions.delete',
        labelKey: 'action.row-actions-delete',
        label: 'Delete',
        icon: 'delete',
        order: 50,
        rule: every('app.rules.isNotTrashed', 'app.rules.canRemove'),
    },
];

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
const PACKAGED_DOCUMENT_TABS = [
    { id: 'app.tabs.view', labelKey: 'tab.tabs-view', label: 'View', order: 10 },
    { id: 'app.tabs.annotations', labelKey: 'tab.tabs-annotations', label: 'Annotations', order: 20 },
    { id: 'app.tabs.permissions', labelKey: 'tab.tabs-permissions', label: 'Permissions', order: 30 },
    { id: 'app.tabs.history', labelKey: 'tab.tabs-history', label: 'History', order: 40 },
    { id: 'app.tabs.publishing', labelKey: 'tab.tabs-publishing', label: 'Publishing', order: 50 },
    {
        id: 'app.tabs.aiInsights',
        labelKey: 'tab.tabs-ai-insights',
        label: 'AI Insights',
        icon: 'auto_awesome',
        order: 60,
        rule: 'app.rules.isAiEnabled',
    },
];

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
const PACKAGED_BROWSE_COLUMNS = [
    // `title` is the row's identity. `togglePendingColumn` refuses to switch it off,
    // and that guard is kept rather than expressed here: a manifest may legitimately
    // relabel or reorder it, so `disabled` would be the wrong tool and there is no
    // "required" flag on the descriptor.
    {
        id: 'app.documentList.title',
        labelKey: 'column.document-list-title',
        label: 'Title',
        field: 'title',
        order: 10,
        sortable: true,
    },
    {
        id: 'app.documentList.type',
        labelKey: 'column.document-list-type',
        label: 'Type',
        field: 'type',
        order: 20,
        sortable: true,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.modified',
        labelKey: 'column.document-list-modified',
        label: 'Modified',
        field: 'modified',
        order: 30,
        sortable: true,
    },
    {
        id: 'app.documentList.lastContributor',
        labelKey: 'column.document-list-last-contributor',
        label: 'Last Contributor',
        field: 'lastContributor',
        order: 40,
        sortable: true,
    },
    {
        id: 'app.documentList.state',
        labelKey: 'column.document-list-state',
        label: 'State',
        field: 'state',
        order: 50,
        sortable: true,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.version',
        labelKey: 'column.document-list-version',
        label: 'Version',
        field: 'version',
        order: 60,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.created',
        labelKey: 'column.document-list-created',
        label: 'Created',
        field: 'created',
        order: 70,
        sortable: true,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.author',
        labelKey: 'column.document-list-author',
        label: 'Author',
        field: 'author',
        order: 80,
        sortable: true,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.nature',
        labelKey: 'column.document-list-nature',
        label: 'Nature',
        field: 'nature',
        order: 90,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.coverage',
        labelKey: 'column.document-list-coverage',
        label: 'Coverage',
        field: 'coverage',
        order: 100,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.subjects',
        labelKey: 'column.document-list-subjects',
        label: 'Subjects',
        field: 'subjects',
        order: 110,
        hiddenByDefault: true,
    },
    {
        id: 'app.documentList.flags',
        labelKey: 'column.document-list-flags',
        label: 'Flags',
        field: 'flags',
        order: 120,
        hiddenByDefault: true,
    },
];

/**
 * `?` and `#` end the path in a URL, and whitespace cannot appear in a segment, so a
 * path containing any of them describes a route no navigation can ever reach.
 */
const NOT_A_PATH_SEGMENT = /[\s?#]/;
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
function extensionRoutePathRejection(path) {
    if (typeof path !== 'string') {
        return `path must be a string, not ${path === null ? 'null' : typeof path}`;
    }
    if (path === '') {
        return 'path must not be empty';
    }
    if (path.startsWith('/')) {
        return `path "${path}" must be relative to the host route: Angular rejects a leading slash`;
    }
    if (NOT_A_PATH_SEGMENT.test(path)) {
        return `path "${path}" must not contain whitespace, "?" or "#"`;
    }
    return null;
}
/** Split descriptors into the ones the router can take and the ones it cannot. */
function partitionExtensionRouteDescriptors(descriptors) {
    const accepted = [];
    const rejected = [];
    for (const descriptor of descriptors) {
        const reason = extensionRoutePathRejection(descriptor.path);
        if (reason === null)
            accepted.push(descriptor);
        else
            rejected.push({ id: descriptor.id, reason });
    }
    return { accepted, rejected };
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
class AppExtensionsService {
    appConfig = inject(AppConfigService);
    slots = inject(ExtensionSlotRegistry);
    rules = inject(ExtensionRuleRegistry);
    /** The merged Layer 1 config, recomputed when the manifest signal changes. */
    resolved = computed(() => resolveExtensionLayers(this.appConfig.manifest().extensionLayers), ...(ngDevMode ? [{ debugName: "resolved" }] : []));
    config = computed(() => this.resolved().config, ...(ngDevMode ? [{ debugName: "config" }] : []));
    /** Layer names referenced but not resolvable — surfaced rather than swallowed. */
    missingLayers = computed(() => this.resolved().missing, ...(ngDevMode ? [{ debugName: "missingLayers" }] : []));
    /**
     * `routes` entries dropped because the router would not have matched their path.
     *
     * Same channel as {@link missingLayers}, for the same reason: an entry that
     * disappears without a word is a manifest you debug by bisection. Recomputes with
     * the manifest signal, which is where a customer-authored path comes from; the
     * packaged descriptors registered at bootstrap are compiled in and valid.
     */
    invalidRoutes = computed(() => partitionExtensionRouteDescriptors(this.resolve(EXTENSION_SLOTS.routes)).rejected, ...(ngDevMode ? [{ debugName: "invalidRoutes" }] : []));
    overrides = computed(() => {
        const config = this.config();
        return {
            byId: config.overrides ?? {},
            additions: config.slots ?? {},
        };
    }, ...(ngDevMode ? [{ debugName: "overrides" }] : []));
    constructor() {
        this.rules.registerRules(DOCUMENT_RULE_EVALUATORS);
        this.rules.registerRules(SURFACE_RULE_EVALUATORS);
    }
    /** Contribute packaged descriptors to a slot. See {@link ExtensionSlotRegistry.register}. */
    register(slot, entries) {
        this.slots.register(slot, entries);
    }
    /** Contribute rule evaluators — the Layer 2 entry point for customer code. */
    registerRules(evaluators) {
        this.rules.registerRules(evaluators);
    }
    /**
     * The descriptors a slot should render right now.
     *
     * Not memoised: the rule context is caller-supplied and changes with the
     * focused document and the selection, so a cache keyed on the slot alone
     * would serve a stale answer. Resolution is a filter and a sort over a list
     * that is tens of entries long at most.
     */
    resolve(slot, context = EMPTY_EXTENSION_RULE_CONTEXT) {
        return this.slots.resolve(slot, this.overrides(), context);
    }
    /** Evaluate a rule reference directly, for a template that gates one control. */
    evaluateRule(rule, context) {
        return this.rules.evaluate(rule, context);
    }
    /** Every registered id, for the extension reference doc and diagnostics. */
    inventory() {
        const inventory = {
            'rules (evaluator ids)': this.rules.registeredRuleIds(),
        };
        for (const slot of this.slots.registeredSlotIds()) {
            inventory[slot] = this.slots.registeredIds(slot);
        }
        return inventory;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AppExtensionsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AppExtensionsService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AppExtensionsService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [] });

/**
 * Components a manifest may reference by ID.
 *
 * This is the mechanism behind `extensions.setComponents({...})` in ACA, and
 * the reason Layer 1 stops where it does: a manifest can only wire together
 * components that are already compiled in. Contributing a *new* component is
 * Layer 2 — a customer library calls `register()` with its own IDs.
 */
class ExtensionComponentRegistry {
    sources = new Map();
    resolved = new Map();
    pending = new Map();
    /** Register components by ID. A later registration replaces an earlier one. */
    register(components) {
        for (const [id, source] of Object.entries(components)) {
            this.sources.set(id, source);
            // Drop any cached resolution, or an override would never take effect.
            this.resolved.delete(id);
            this.pending.delete(id);
        }
    }
    registeredComponentIds() {
        return [...this.sources.keys()].sort();
    }
    has(id) {
        return this.sources.has(id);
    }
    /** An already-resolved component, or `null` if it is lazy and not loaded yet. */
    peek(id) {
        const source = this.sources.get(id);
        if (typeof source === 'function' && isComponentType(source))
            return source;
        return this.resolved.get(id) ?? null;
    }
    /**
     * Resolve a component by ID, loading it if it is behind a dynamic import.
     *
     * Returns `null` rather than throwing for an unregistered ID **or a loader
     * that rejects**. A chunk that fails to load is a deployment or network
     * problem, and the caller's job is to render a fallback panel, not to take the
     * application down. In-flight loads are shared, so a slot resolving twice in
     * one change-detection pass does not fetch the chunk twice.
     */
    async resolve(id) {
        const cached = this.peek(id);
        if (cached)
            return cached;
        const source = this.sources.get(id);
        if (!source)
            return null;
        const inFlight = this.pending.get(id);
        if (inFlight)
            return inFlight;
        const load = source()
            .then((component) => {
            this.resolved.set(id, component);
            return component;
        })
            .catch(() => null)
            .finally(() => this.pending.delete(id));
        this.pending.set(id, load);
        return load;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionComponentRegistry, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionComponentRegistry, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionComponentRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
/**
 * Distinguish a component class from a `() => Promise<Type>` loader.
 *
 * Both are functions. Angular decorates component classes with static
 * compilation metadata, and a plain arrow function has none, so the presence of
 * `ɵcmp` is the only reliable discriminator available at runtime. A class
 * without it would be treated as a loader and fail to resolve, which is why
 * only real components should be registered eagerly.
 */
function isComponentType(source) {
    return (typeof source === 'function' &&
        (Object.prototype.hasOwnProperty.call(source, 'ɵcmp') ||
            Object.prototype.hasOwnProperty.call(source, 'ɵdir')));
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
class ExtensionOutletComponent {
    /** Registered component ID to render. Takes precedence over `componentType`. */
    componentId = input(null, ...(ngDevMode ? [{ debugName: "componentId" }] : []));
    /** An already-imported component, for callers that have one in hand. */
    componentType = input(null, ...(ngDevMode ? [{ debugName: "componentType" }] : []));
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
    componentInputs = input({}, ...(ngDevMode ? [{ debugName: "componentInputs" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    /** True when nothing could be resolved, so the host can render a fallback. */
    unresolved = signal(false, ...(ngDevMode ? [{ debugName: "unresolved" }] : []));
    outlet;
    registry = inject(ExtensionComponentRegistry);
    injector = inject(Injector);
    environmentInjector = inject(EnvironmentInjector);
    componentRef = null;
    renderedType = null;
    /** Public names of the inputs the rendered component declares. */
    declaredInputs = new Set();
    /** The declared input names last set, from {@link declaredKeysOf}. */
    appliedKeys = new Set();
    /** Bumped on every request so a slow load cannot overwrite a newer one. */
    generation = 0;
    /** Retries left for the requested id after its loader rejected — {@link retryUnresolved}. */
    retriesLeft = 0;
    /** A retry's load is pending; updates meanwhile ride on it rather than starting another. */
    retrying = false;
    static MAX_RETRIES = 2;
    constructor() {
        inject(DestroyRef).onDestroy(() => this.clear());
        effect(() => {
            const id = this.componentId();
            const type = this.componentType();
            const generation = ++this.generation;
            if (type) {
                untracked(() => this.render(type, generation));
                return;
            }
            if (!id) {
                this.clear();
                this.loading.set(false);
                this.unresolved.set(false);
                return;
            }
            const immediate = this.registry.peek(id);
            if (immediate) {
                untracked(() => this.render(immediate, generation));
                return;
            }
            this.retriesLeft = ExtensionOutletComponent.MAX_RETRIES;
            this.retrying = false;
            untracked(() => this.load(id, generation, false));
        });
        effect(() => {
            const inputs = this.componentInputs() ?? {};
            untracked(() => {
                if (!this.componentRef || !this.renderedType) {
                    this.retryUnresolved();
                    return;
                }
                if (this.setsAppliedKeys(inputs)) {
                    this.applyInputs(this.componentRef, inputs);
                }
                else {
                    this.render(this.renderedType, this.generation);
                }
            });
        });
    }
    /**
     * Resolve `id` and render it, or mark the outlet unresolved.
     *
     * A `retry` leaves the outlet as it is — unresolved, nothing rendered, no loading state —
     * until the load settles, so a host showing its fallback keeps showing it rather than
     * blanking for the length of a chunk request that may fail again.
     */
    load(id, generation, retry) {
        if (!retry) {
            this.clear();
            this.loading.set(true);
            this.unresolved.set(false);
        }
        void this.registry.resolve(id).then((resolvedType) => {
            if (generation !== this.generation)
                return;
            if (retry)
                this.retrying = false;
            this.loading.set(false);
            if (!resolvedType) {
                this.clear();
                this.unresolved.set(true);
                return;
            }
            this.render(resolvedType, generation);
        });
    }
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
    retryUnresolved() {
        const id = this.componentId();
        if (this.retrying || !this.unresolved() || !id || this.componentType())
            return;
        if (this.retriesLeft <= 0 || !this.registry.has(id))
            return;
        this.retriesLeft -= 1;
        this.retrying = true;
        this.load(id, ++this.generation, true);
    }
    render(type, generation) {
        if (generation !== this.generation)
            return;
        this.clear();
        const ref = createComponent(type, {
            environmentInjector: this.environmentInjector,
            elementInjector: this.injector,
        });
        this.declaredInputs = new Set(reflectComponentType(type)?.inputs.map((declared) => declared.templateName) ?? []);
        this.applyInputs(ref, this.componentInputs() ?? {});
        this.outlet.insert(ref.hostView);
        this.componentRef = ref;
        this.renderedType = type;
        this.loading.set(false);
        this.unresolved.set(false);
    }
    /**
     * Set the inputs the component declares, and only those.
     *
     * A descriptor's inputs are customer-authored, and a host may offer an input not every
     * component wants — `documentView` always offers `document`. `setInput` does not throw
     * on an undeclared name; in a development build it logs NG0303 to the console, so the
     * filter is what keeps an unused key silent rather than a `catch` that never fires.
     */
    applyInputs(ref, inputs) {
        this.appliedKeys = this.declaredKeysOf(inputs);
        for (const [name, value] of Object.entries(inputs)) {
            if (!this.declaredInputs.has(name))
                continue;
            // A declared input's `transform` is the component's code, run on customer data;
            // a value it rejects must not blank the panel.
            try {
                ref.setInput(name, value);
            }
            catch {
                /* keep the rest of the inputs and the rendered component */
            }
        }
    }
    /** The declared input names `inputs` sets. */
    declaredKeysOf(inputs) {
        return new Set(Object.keys(inputs).filter((name) => this.declaredInputs.has(name)));
    }
    /** Whether `inputs` sets exactly the declared inputs last applied. */
    setsAppliedKeys(inputs) {
        const keys = this.declaredKeysOf(inputs);
        return (keys.size === this.appliedKeys.size && [...keys].every((name) => this.appliedKeys.has(name)));
    }
    clear() {
        this.outlet?.clear();
        this.componentRef?.destroy();
        this.componentRef = null;
        this.renderedType = null;
        this.declaredInputs = new Set();
        this.appliedKeys = new Set();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionOutletComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: ExtensionOutletComponent, isStandalone: true, selector: "lib-extension-outlet", inputs: { componentId: { classPropertyName: "componentId", publicName: "componentId", isSignal: true, isRequired: false, transformFunction: null }, componentType: { classPropertyName: "componentType", publicName: "componentType", isSignal: true, isRequired: false, transformFunction: null }, componentInputs: { classPropertyName: "componentInputs", publicName: "componentInputs", isSignal: true, isRequired: false, transformFunction: null } }, viewQueries: [{ propertyName: "outlet", first: true, predicate: ["outlet"], descendants: true, read: ViewContainerRef, static: true }], ngImport: i0, template: "@if (loading()) {\n  <div class=\"extension-outlet__loading\" role=\"status\" aria-live=\"polite\">\n    {{ 'extensions.extension-outlet.loading' | translate }}\n  </div>\n}\n<ng-container #outlet />\n", dependencies: [{ kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionOutletComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-extension-outlet', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (loading()) {\n  <div class=\"extension-outlet__loading\" role=\"status\" aria-live=\"polite\">\n    {{ 'extensions.extension-outlet.loading' | translate }}\n  </div>\n}\n<ng-container #outlet />\n" }]
        }], ctorParameters: () => [], propDecorators: { componentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "componentId", required: false }] }], componentType: [{ type: i0.Input, args: [{ isSignal: true, alias: "componentType", required: false }] }], componentInputs: [{ type: i0.Input, args: [{ isSignal: true, alias: "componentInputs", required: false }] }], outlet: [{
                type: ViewChild,
                args: ['outlet', { static: true, read: ViewContainerRef }]
            }] } });

/**
 * Marks a route this file put into the config, so a re-resolve replaces its own
 * contributions and leaves the application's own routes alone.
 */
const EXTENSION_ROUTE_MARKER = 'satoriExtensionRoute';
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
function extensionRoutes(descriptors) {
    return partitionExtensionRouteDescriptors(descriptors).accepted.map((descriptor) => ({
        path: descriptor.path,
        component: ExtensionOutletComponent,
        data: {
            [EXTENSION_ROUTE_MARKER]: true,
            componentId: descriptor.componentId ?? descriptor.id,
            componentInputs: descriptor.inputs ?? {},
        },
    }));
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
function provideExtensionRoutes(options = {}) {
    const parentPath = options.parentPath ?? '';
    return provideEnvironmentInitializer(() => {
        const router = inject(Router);
        const extensions = inject(AppExtensionsService);
        effect(() => {
            const descriptors = extensions.resolve(EXTENSION_SLOTS.routes);
            applyExtensionRoutes(router, parentPath, extensionRoutes(descriptors));
        });
    });
}
function isExtensionRoute(route) {
    return route.data?.[EXTENSION_ROUTE_MARKER] === true;
}
function applyExtensionRoutes(router, parentPath, contributed) {
    const host = router.config.find((route) => route.path === parentPath && Array.isArray(route.children));
    if (!host) {
        router.resetConfig([...router.config.filter((r) => !isExtensionRoute(r)), ...contributed]);
        return;
    }
    router.resetConfig(router.config.map((route) => route === host
        ? {
            ...route,
            // Appended, never prepended: the shell's own `{ path: '', redirectTo }`
            // must keep matching first, and a contributed path must not shadow a
            // packaged one.
            children: [
                ...(route.children ?? []).filter((c) => !isExtensionRoute(c)),
                ...contributed,
            ],
        }
        : route));
}

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
class ExtensionRuleContextService {
    document = signal(null, ...(ngDevMode ? [{ debugName: "document" }] : []));
    selection = signal([], ...(ngDevMode ? [{ debugName: "selection" }] : []));
    selectionCount = signal(0, ...(ngDevMode ? [{ debugName: "selectionCount" }] : []));
    username = signal(null, ...(ngDevMode ? [{ debugName: "username" }] : []));
    isAdministrator = signal(false, ...(ngDevMode ? [{ debugName: "isAdministrator" }] : []));
    url = signal('', ...(ngDevMode ? [{ debugName: "url" }] : []));
    /**
     * Interface state published by whichever surface is in focus. See
     * {@link ExtensionRuleContext.flags}.
     *
     * The publishing surface owns the whole bag and must clear it on destroy, the
     * same contract `document` already has: a stale `favorite: true` left behind
     * by a closed document would gate the next surface's actions on it.
     */
    flags = signal({}, ...(ngDevMode ? [{ debugName: "flags" }] : []));
    context = computed(() => ({
        document: this.document(),
        selection: this.selection(),
        selectionCount: this.selectionCount(),
        user: { username: this.username(), isAdministrator: this.isAdministrator() },
        url: this.url(),
        flags: this.flags(),
    }), ...(ngDevMode ? [{ debugName: "context" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionRuleContextService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionRuleContextService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExtensionRuleContextService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

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
function provideSatoriExtensions(contributor) {
    return provideEnvironmentInitializer(() => {
        const injector = inject(Injector);
        const slots = inject(ExtensionSlotRegistry);
        const rules = inject(ExtensionRuleRegistry);
        const components = inject(ExtensionComponentRegistry);
        const actions = inject(ExtensionActionRegistry);
        // The factory runs in *this* injection context, so a contributed rule may
        // `inject()` its own dependencies. `runInInjectionContext` rather than a
        // bare call, because a factory declared in a customer library has no
        // ambient context of its own.
        const contributions = typeof contributor === 'function'
            ? runInInjectionContext(injector, contributor)
            : contributor;
        // `failClosed` is declared before the evaluators register, because the
        // window it guards is the one *before* registration. The registry accepts
        // the declaration in either order for exactly this reason.
        if (contributions.failClosedRules?.length) {
            rules.declareFailClosed(contributions.failClosedRules);
        }
        if (contributions.rules) {
            rules.registerRules(contributions.rules);
        }
        if (contributions.components) {
            components.register(contributions.components);
        }
        if (contributions.actions) {
            actions.register(contributions.actions);
        }
        for (const [slot, entries] of Object.entries(contributions.slots ?? {})) {
            slots.register(slot, entries);
        }
    });
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
const PACKAGED_NAV_ITEMS = [
    {
        id: 'app.navbar.knowledgeDiscovery',
        labelKey: 'nav.item.knowledge-discovery',
        label: 'Knowledge Discovery',
        path: '/knowledge-discovery',
        icon: 'star',
        order: 10,
    },
    {
        id: 'app.navbar.dashboard',
        labelKey: 'nav.item.dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        order: 20,
    },
    {
        id: 'app.navbar.browse',
        labelKey: 'nav.item.browse',
        label: 'Browse',
        path: '/browse',
        icon: 'folder',
        order: 30,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.recentlyViewed',
        labelKey: 'nav.item.recently-viewed',
        label: 'Recently viewed',
        path: '/recently-viewed',
        icon: 'clock',
        order: 50,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.search',
        labelKey: 'nav.item.search-filters',
        label: 'Search filters',
        path: '/search',
        icon: 'search',
        order: 60,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.expiredQueue',
        labelKey: 'nav.item.expired-queue',
        label: 'Expired Queue',
        path: '/expired-queue',
        icon: 'timer',
        order: 70,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.assets',
        labelKey: 'nav.item.assets',
        label: 'Assets',
        path: '/documents',
        icon: 'document',
        order: 80,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.tasks',
        labelKey: 'nav.item.tasks',
        label: 'Tasks',
        path: '/tasks',
        icon: 'tasks',
        order: 90,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.favorites',
        labelKey: 'nav.item.favorites',
        label: 'Favorites',
        path: '/favorites',
        icon: 'star',
        order: 100,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.collections',
        labelKey: 'nav.item.collections',
        label: 'Collections',
        path: '/collections',
        icon: 'bookmark',
        order: 110,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.personalSpace',
        labelKey: 'nav.item.personal-space',
        label: 'Personal Space',
        path: '/personal-space',
        icon: 'grid_view',
        order: 120,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.clipboard',
        labelKey: 'nav.item.clipboard',
        label: 'Clipboard',
        path: '/clipboard',
        icon: 'notepad',
        order: 130,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.trash',
        labelKey: 'nav.item.trash',
        label: 'Trash',
        path: '/trash',
        icon: 'trash',
        order: 140,
        hasDrawer: true,
    },
    {
        id: 'app.navbar.administration',
        labelKey: 'nav.item.administration',
        label: 'Administration',
        path: '/administration',
        icon: 'settings',
        order: 150,
        hasDrawer: true,
        // The only packaged entry carrying a rule. Before Phase 2 this was a
        // hardcoded `item.path === '/administration'` filter in the shell, which a
        // manifest could neither see nor relax.
        rule: 'app.rules.hasAdministrationAccess',
    },
];
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
const APP_NAV_ITEMS = new InjectionToken('APP_NAV_ITEMS', {
    providedIn: 'root',
    factory: () => {
        const extensions = inject(AppExtensionsService);
        const ruleContext = inject(ExtensionRuleContextService);
        extensions.register(EXTENSION_SLOTS.navbar, PACKAGED_NAV_ITEMS);
        return computed(() => extensions.resolve(EXTENSION_SLOTS.navbar, ruleContext.context()));
    },
});

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
class DescriptorLabelPipe {
    translate = inject(TranslateService);
    transform(descriptor) {
        if (!descriptor)
            return '';
        return descriptorLabel(descriptor, (key) => this.translate.instant(key));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DescriptorLabelPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "20.3.33", ngImport: i0, type: DescriptorLabelPipe, isStandalone: true, name: "descriptorLabel", pure: false });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DescriptorLabelPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'descriptorLabel',
                    standalone: true,
                    pure: false,
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { APP_NAV_ITEMS, AppExtensionsService, CORE_RULE_EVALUATORS, DOCUMENT_RULE_EVALUATORS, DescriptorLabelPipe, EMPTY_EXTENSION_RULE_CONTEXT, EXTENSION_SLOTS, ExtensionActionRegistry, ExtensionComponentRegistry, ExtensionOutletComponent, ExtensionRuleContextService, ExtensionRuleRegistry, ExtensionSlotRegistry, NO_EXTENSION_SLOT_OVERRIDES, PACKAGED_BROWSE_COLUMNS, PACKAGED_BROWSE_CONTEXT_MENU, PACKAGED_BULK_ACTIONS, PACKAGED_DOCUMENT_TABS, PACKAGED_DOCUMENT_TOOLBAR_ACTIONS, PACKAGED_NAV_ITEMS, PACKAGED_ROW_ACTIONS, SECURITY_RELEVANT_RULE_IDS, SURFACE_RULE_EVALUATORS, descriptorLabel, extensionRoutePathRejection, extensionRoutes, mergeExtensionConfigs, partitionExtensionRouteDescriptors, provideExtensionRoutes, provideSatoriExtensions, readExtensionConfig, resolveExtensionConfig };
//# sourceMappingURL=nuxeo-satori-platform-extensions.mjs.map
