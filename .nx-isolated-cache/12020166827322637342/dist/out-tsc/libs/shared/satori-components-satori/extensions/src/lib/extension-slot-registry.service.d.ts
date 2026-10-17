import { type ExtensionRule, type ExtensionRuleContext } from './extension-rules';
import type { ExtensionElement, ExtensionSlotId } from './extension-slots';
import * as i0 from "@angular/core";
/**
 * Per-descriptor manifest override.
 *
 * Keyed by descriptor **id**, never by slot, so a slot invented after Beta
 * ships needs no manifest schema change to become hideable, reorderable,
 * relabellable and rule-gateable.
 */
export interface ExtensionOverride {
    readonly visible?: boolean;
    readonly order?: number | null;
    readonly label?: string | null;
    /** Registered rule id, or a nested rule reference. */
    readonly rule?: ExtensionRule | null;
}
/** What a slot's resolution needs from the manifest. */
export interface ExtensionSlotOverrides {
    /** Overrides for packaged **and** manifest-added descriptors, keyed by id. */
    readonly byId: Readonly<Record<string, ExtensionOverride>>;
    /** Extra descriptors contributed by the manifest, keyed by slot id. */
    readonly additions: Readonly<Record<ExtensionSlotId, readonly ExtensionElement[]>>;
}
export declare const NO_EXTENSION_SLOT_OVERRIDES: ExtensionSlotOverrides;
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
export declare class ExtensionSlotRegistry {
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
    static ɵfac: i0.ɵɵFactoryDeclaration<ExtensionSlotRegistry, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ExtensionSlotRegistry>;
}
//# sourceMappingURL=extension-slot-registry.service.d.ts.map