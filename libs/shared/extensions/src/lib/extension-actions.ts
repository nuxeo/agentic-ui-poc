import { Injectable } from '@angular/core';

import type { ExtensionRule, ExtensionRuleContext } from './extension-rules';
import type { ExtensionElement } from './extension-slots';

/**
 * A user-invocable action, as a descriptor rather than as markup.
 *
 * The shape follows adf-hx's action services (`content-delete`,
 * `content-share`, `single-item-download`, `permissions-management` in the
 * published package's `/ui` entry point): a declarative descriptor naming a
 * service that performs the work. Phase 3 adopts those components, so matching
 * the pattern now is what avoids migrating the action surface twice.
 *
 * **A descriptor is not a permission.** `rule` decides what the interface
 * offers; Nuxeo evaluates the real permission server-side on every operation.
 * Hiding an action does not prevent the corresponding REST call.
 */
export interface ExtensionActionDescriptor extends ExtensionElement {
  /** Text shown in a menu, and the accessible name of an icon-only control. */
  readonly label: string;
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
export interface ExtensionColumnDescriptor extends ExtensionElement {
  readonly label: string;
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

/** A document-detail tab. Content is compiled in and keyed by `id`. */
export interface ExtensionTabDescriptor extends ExtensionElement {
  readonly label: string;
  readonly rule?: ExtensionRule;
}

/**
 * What a registered action does.
 *
 * Deliberately an object with `execute` rather than a bare function, because
 * that is adf-hx's shape and because a customer's handler is normally an
 * injectable service with its own dependencies.
 */
export interface ExtensionActionHandler {
  execute(context: ExtensionRuleContext): void;
}

/**
 * Handlers, keyed by the id a descriptor names.
 *
 * Separate from {@link ExtensionSlotRegistry} on purpose: *where* an action
 * appears is Layer 1 configuration, and *what it does* is Layer 2 code. Keeping
 * them apart is what lets a manifest move an action between the toolbar and the
 * overflow menu without knowing anything about its implementation.
 */
@Injectable({ providedIn: 'root' })
export class ExtensionActionRegistry {
  private readonly handlers = new Map<string, ExtensionActionHandler>();

  /**
   * Add or replace handlers. Later registration wins, which is how a customer
   * library replaces a packaged action's behaviour without forking.
   */
  register(handlers: Readonly<Record<string, ExtensionActionHandler>>): void {
    for (const [id, handler] of Object.entries(handlers)) {
      this.handlers.set(id, handler);
    }
  }

  /**
   * Withdraw handlers.
   *
   * A component that registers handlers closing over itself must call this when
   * it is destroyed, or the registry keeps a destroyed component reachable and
   * the next invocation runs against dead state.
   */
  unregister(ids: readonly string[]): void {
    for (const id of ids) this.handlers.delete(id);
  }

  has(id: string): boolean {
    return this.handlers.has(id);
  }

  /** Every registered id, for the reference doc and for diagnostics. */
  registeredActionIds(): readonly string[] {
    return [...this.handlers.keys()].sort();
  }

  /**
   * Run the handler a descriptor names.
   *
   * Returns `false` when nothing is registered under the id rather than
   * throwing: a manifest may reference an action a newer build provides, and a
   * click on it should be inert, not a crash in the shell.
   */
  execute(descriptor: ExtensionActionDescriptor, context: ExtensionRuleContext): boolean {
    const handler = this.handlers.get(descriptor.action ?? descriptor.id);
    if (!handler) return false;
    handler.execute(context);
    return true;
  }
}
