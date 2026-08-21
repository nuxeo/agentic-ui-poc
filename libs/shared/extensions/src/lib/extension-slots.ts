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
 * a tenth slot after Beta ships requires **no change to the nine**, and no
 * change to this library at all. `extension-slot-registry.service.spec.ts`
 * proves it by registering a slot this file has never heard of.
 *
 * The constants below are therefore **documentation and typo protection, not a
 * closed set**. Anything may register any string.
 */

/** The nine slots Beta implements. Not a closed set — see the file comment. */
export const EXTENSION_SLOTS = {
  /** Primary platform navigation entries. */
  navbar: 'navbar',
  /** Secondary drawer content behind a navbar entry. */
  sidebar: 'sidebar',
  /** Lazily resolved application routes. */
  routes: 'routes',
  /** Document-detail and browse toolbar actions. */
  toolbar: 'toolbar',
  /** Row-level context menu on a document list. */
  contextMenu: 'contextMenu',
  /** Actions over a multi-document selection. */
  'bulk-actions': 'bulk-actions',
  /** Document-detail tab children. */
  tabs: 'tabs',
  /** Named rule definitions a slot entry may reference by id. */
  rules: 'rules',
  /** Document list column descriptors. */
  documentList: 'documentList',
} as const;

/** A slot id. Deliberately `string`, not a union over {@link EXTENSION_SLOTS}. */
export type ExtensionSlotId = string;

/**
 * Fields every slot descriptor shares, matching ACA's `ExtensionElement`.
 *
 * `disabled` and `order` are honoured by the registry for every slot without
 * the slot having to opt in, which is what keeps "hide it" and "move it" a
 * pure JSON edit for surfaces nobody has thought about yet.
 */
export interface ExtensionElement {
  /** Stable public contract, `<owner>.<surface>.<name>`. Renaming is breaking. */
  readonly id: string;
  /** Dropped from the resolved list when true. */
  readonly disabled?: boolean;
  /** Ascending. Absent sorts last, stably. */
  readonly order?: number;
}
