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

/**
 * A document-detail tab.
 *
 * A packaged tab's content is compiled in and keyed by `id`. A tab a manifest
 * adds names a **registered component** instead, which `ExtensionOutletComponent`
 * resolves — so contributing a tab is a manifest edit plus a Layer 2 component,
 * not a change to the host template.
 */
export interface ExtensionTabDescriptor extends ExtensionElement {
  readonly label: string;
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
 * A route contributed by id — `path` plus the component that answers it.
 *
 * The component is resolved through `ExtensionComponentRegistry`, so a manifest
 * can only place a component that is already compiled in; contributing a new one
 * is Layer 2. Guards are deliberately absent: a route a manifest can add must
 * not be able to claim it has *removed* access to anything, because the surface
 * it renders is still gated by Nuxeo server-side.
 */
export interface ExtensionRouteDescriptor extends ExtensionElement {
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
export interface ExtensionActionHandler {
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
export interface ExtensionActionRegistration {
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
@Injectable({ providedIn: 'root' })
export class ExtensionActionRegistry {
  private readonly overrides = new Map<string, ExtensionActionHandler[]>();
  private readonly packaged = new Map<string, ExtensionActionHandler[]>();

  /**
   * Add or replace handlers. Later registration wins, which is how a customer
   * library replaces a packaged action's behaviour without forking, and it
   * outranks {@link registerPackaged} whenever either was called.
   */
  register(
    handlers: Readonly<Record<string, ExtensionActionHandler>>,
  ): ExtensionActionRegistration {
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
  registerPackaged(
    handlers: Readonly<Record<string, ExtensionActionHandler>>,
  ): ExtensionActionRegistration {
    return this.add(this.packaged, handlers);
  }

  has(id: string): boolean {
    return this.resolve(id) !== undefined;
  }

  /** Every registered id, for the reference doc and for diagnostics. */
  registeredActionIds(): readonly string[] {
    return [...new Set([...this.overrides.keys(), ...this.packaged.keys()])].sort();
  }

  /**
   * Run the handler a descriptor names.
   *
   * Returns `false` when nothing is registered under the id rather than
   * throwing: a manifest may reference an action a newer build provides, and a
   * click on it should be inert, not a crash in the shell.
   */
  execute(descriptor: ExtensionActionDescriptor, context: ExtensionRuleContext): boolean {
    const handler = this.resolve(descriptor.action ?? descriptor.id);
    if (!handler) return false;
    handler.execute(context);
    return true;
  }

  private add(
    tier: Map<string, ExtensionActionHandler[]>,
    handlers: Readonly<Record<string, ExtensionActionHandler>>,
  ): ExtensionActionRegistration {
    const added = Object.entries(handlers);
    for (const [id, handler] of added) {
      const registered = tier.get(id);
      if (registered) registered.push(handler);
      else tier.set(id, [handler]);
    }
    return { unregister: () => this.remove(tier, added) };
  }

  /**
   * Within a tier the most recent registration answers, so withdrawing an
   * earlier one must leave the later one in place — hence removing this
   * handler rather than the id.
   */
  private remove(
    tier: Map<string, ExtensionActionHandler[]>,
    added: readonly [string, ExtensionActionHandler][],
  ): void {
    for (const [id, handler] of added) {
      const registered = tier.get(id);
      const at = registered?.lastIndexOf(handler) ?? -1;
      if (!registered || at === -1) continue;
      registered.splice(at, 1);
      if (registered.length === 0) tier.delete(id);
    }
  }

  private resolve(id: string): ExtensionActionHandler | undefined {
    return this.overrides.get(id)?.at(-1) ?? this.packaged.get(id)?.at(-1);
  }
}
