import type { NamespaceRef, PrincipalRef } from './refs';

/**
 * Open string union: the three cross-backend-stable content types plus any
 * adapter-specific extension token. The `& Record<never, never>` intersection
 * keeps literal auto-completion for the known members without collapsing to `string`.
 */
export type ContentType = 'folder' | 'document' | 'root' | (string & Record<never, never>);

/**
 * A single namespaced property-bag entry used when writing (draft/patch).
 * Reads go through {@link ContentNode.property}, which never exposes the raw bag.
 */
export interface NamespacedProperty {
  readonly namespace: NamespaceRef;
  readonly key: string;
  readonly value: unknown;
}

/**
 * The neutral content node: a narrow typed core plus a namespaced open property bag.
 * Cross-backend semantics are guaranteed only for the typed core — `primaryType`,
 * `mixins` and the bag are backend vocabulary and must not be branched on by
 * backend-neutral callers.
 */
export interface ContentNode {
  readonly id: string;
  readonly parentId?: string;
  readonly name: string;
  readonly path?: string;
  readonly type: ContentType;
  readonly isFolderish: boolean;
  readonly primaryType: string;
  readonly mixins: ReadonlySet<string>;
  readonly createdAt: string;
  readonly modifiedAt: string;
  readonly createdBy: PrincipalRef;
  readonly modifiedBy: PrincipalRef;

  /** Reads a namespaced bag value. Returns `undefined` when the namespace/key is absent. */
  property<T = unknown>(namespace: NamespaceRef, key: string): T | undefined;

  /** Reports whether the adapter populates the given property namespace on this node. */
  hasNamespace(namespace: NamespaceRef): boolean;
}

/** A lightweight handle to a node, used where the full node is not required. */
export interface ContentNodeRef {
  readonly id: string;
}

/** The shape supplied when creating a node under a parent. */
export interface ContentNodeDraft {
  readonly name: string;
  readonly primaryType: string;
  readonly properties?: readonly NamespacedProperty[];
}

/** The shape supplied when updating a node. Absent fields are left untouched. */
export interface ContentNodePatch {
  readonly name?: string;
  readonly properties?: readonly NamespacedProperty[];
}
