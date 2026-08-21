import { Injectable, inject } from '@angular/core';
import { filterEnabled, sortByOrder } from '@alfresco/adf-extensions';

import {
  EMPTY_EXTENSION_RULE_CONTEXT,
  ExtensionRuleRegistry,
  type ExtensionRule,
  type ExtensionRuleContext,
} from './extension-rules';
import type { ExtensionElement, ExtensionSlotId } from './extension-slots';

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

export const NO_EXTENSION_SLOT_OVERRIDES: ExtensionSlotOverrides = { byId: {}, additions: {} };

/**
 * The addressable surface, keyed by opaque slot id.
 *
 * Registration and resolution are both generic and per-slot. There is no enum,
 * no union and no `switch` on slot identity anywhere below, which is what makes
 * the nine Beta slots extensible to a tenth without touching them — see
 * `extension-slots.ts` and the additivity spec.
 *
 * `filterEnabled` and `sortByOrder` come from `@alfresco/adf-extensions`, so
 * `disabled` and `order` mean exactly what they mean in an ACA manifest rather
 * than approximately.
 */
@Injectable({ providedIn: 'root' })
export class ExtensionSlotRegistry {
  private readonly rules = inject(ExtensionRuleRegistry);
  private readonly slots = new Map<ExtensionSlotId, ExtensionElement[]>();

  /**
   * Contribute descriptors to a slot.
   *
   * Idempotent per id: re-registering an id replaces the previous descriptor in
   * place rather than duplicating it, so a customer library can override a
   * packaged entry and a hot-reloaded bootstrap cannot double the toolbar.
   */
  register<T extends ExtensionElement>(slot: ExtensionSlotId, entries: readonly T[]): void {
    const existing = this.slots.get(slot) ?? [];
    const merged = [...existing];
    for (const entry of entries) {
      const index = merged.findIndex((candidate) => candidate.id === entry.id);
      if (index >= 0) merged[index] = entry;
      else merged.push(entry);
    }
    this.slots.set(slot, merged);
  }

  /** Slot ids with at least one registered descriptor, for the reference doc. */
  registeredSlotIds(): readonly ExtensionSlotId[] {
    return [...this.slots.keys()].sort();
  }

  /** Descriptor ids registered into a slot, in registration order. */
  registeredIds(slot: ExtensionSlotId): readonly string[] {
    return (this.slots.get(slot) ?? []).map((entry) => entry.id);
  }

  /**
   * The descriptors a slot should render: packaged plus manifest additions,
   * with overrides applied, hidden and rule-denied entries removed, ordered.
   *
   * An unknown slot resolves to an empty array rather than throwing, because a
   * manifest may reference a slot a newer build introduced.
   */
  resolve<T extends ExtensionElement>(
    slot: ExtensionSlotId,
    overrides: ExtensionSlotOverrides = NO_EXTENSION_SLOT_OVERRIDES,
    context: ExtensionRuleContext = EMPTY_EXTENSION_RULE_CONTEXT,
  ): readonly T[] {
    // The registry stores descriptors as the `ExtensionElement` base type it
    // shares across slots; the caller knows the concrete shape it registered.
    const packaged = (this.slots.get(slot) ?? []) as readonly unknown[] as readonly T[];
    const added = (overrides.additions[slot] ?? []) as readonly T[];

    const merged: T[] = [...packaged];
    for (const entry of added) {
      const index = merged.findIndex((candidate) => candidate.id === entry.id);
      // A manifest entry that reuses a packaged id patches it rather than
      // appending a second row with the same id.
      if (index >= 0) merged[index] = { ...merged[index], ...entry };
      else merged.push(entry);
    }

    return merged
      .map((entry) => this.applyOverride(entry, overrides.byId[entry.id]))
      .filter((entry) => entry.visible)
      .map((entry) => entry.value)
      .filter(filterEnabled)
      .filter((entry) => this.rules.evaluate(readRule(entry), context))
      .sort(sortByOrder);
  }

  private applyOverride<T extends ExtensionElement>(
    entry: T,
    override: ExtensionOverride | undefined,
  ): { readonly value: T; readonly visible: boolean } {
    if (!override) return { value: entry, visible: true };

    const patch: Record<string, unknown> = {};
    if (typeof override.order === 'number') patch['order'] = override.order;
    if (typeof override.label === 'string') patch['label'] = override.label;
    // `rule: null` in a manifest is an explicit "ungate this", so it must clear
    // the packaged rule rather than be treated as "no opinion".
    if (override.rule !== undefined) patch['rule'] = override.rule;

    return {
      value: { ...entry, ...patch } as T,
      visible: override.visible !== false,
    };
  }
}

function readRule(entry: ExtensionElement): ExtensionRule | null {
  const rule = (entry as { rule?: unknown }).rule;
  if (typeof rule === 'string') return rule;
  if (
    typeof rule === 'object' &&
    rule !== null &&
    typeof (rule as { type?: unknown }).type === 'string'
  ) {
    return rule as ExtensionRule;
  }
  return null;
}
