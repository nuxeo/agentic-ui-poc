import { Injectable, Type } from '@angular/core';

/**
 * Configuration for a registered slot component.
 */
export interface SlotRegistration {
  /** The named extension point this component fills */
  slotName: string;
  /** Angular component class to render in the slot */
  component: Type<unknown>;
  /** Ordering weight (lower = earlier). Defaults to 0. */
  order?: number;
  /**
   * Optional predicate — only render this slot for a given document type.
   * If omitted, the slot renders for all document types.
   */
  docTypePredicate?: (docType: string) => boolean;
}

/**
 * Registry for extension point slots.
 *
 * Layout authors define named extension points (slots) in their
 * LayoutConfig; at runtime, developers register Angular components
 * to fill those slots. The Layout Engine queries this service to
 * dynamically inject registered components at the right positions.
 *
 * Usage:
 * ```ts
 * slotRegistry.register({
 *   slotName: 'document-actions',
 *   component: CustomActionsComponent,
 *   order: 10,
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SlotRegistryService {
  private readonly slots = new Map<string, SlotRegistration[]>();

  register(registration: SlotRegistration): void {
    const existing = this.slots.get(registration.slotName) ?? [];
    existing.push(registration);
    existing.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.slots.set(registration.slotName, existing);
  }

  registerAll(registrations: SlotRegistration[]): void {
    for (const r of registrations) {
      this.register(r);
    }
  }

  /**
   * Get all registered components for a named slot, optionally filtered
   * by document type.
   */
  getSlotComponents(slotName: string, docType?: string): Type<unknown>[] {
    const registrations = this.slots.get(slotName) ?? [];
    return registrations
      .filter((r) => !r.docTypePredicate || (docType && r.docTypePredicate(docType)))
      .map((r) => r.component);
  }

  has(slotName: string): boolean {
    return this.slots.has(slotName) && (this.slots.get(slotName)?.length ?? 0) > 0;
  }

  getSlotNames(): string[] {
    return Array.from(this.slots.keys());
  }

  remove(slotName: string, component: Type<unknown>): void {
    const existing = this.slots.get(slotName);
    if (!existing) return;
    const filtered = existing.filter((r) => r.component !== component);
    if (filtered.length > 0) {
      this.slots.set(slotName, filtered);
    } else {
      this.slots.delete(slotName);
    }
  }
}
