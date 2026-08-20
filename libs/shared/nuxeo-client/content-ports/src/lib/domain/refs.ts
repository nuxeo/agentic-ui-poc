/**
 * A branded namespace identifier for the open property bag.
 *
 * Branding stops raw string literals being passed where a namespace is expected.
 * The concrete constants are owned by this package; adapters must not mint their own.
 */
export type NamespaceRef = string & { readonly __brand: 'NamespaceRef' };

/**
 * A neutral reference to a principal (user or group).
 *
 * Minimal by design: a stable identifier plus an optional display name, so that
 * email and internal uid are not carried around where an id is sufficient.
 */
export interface PrincipalRef {
  readonly id: string;
  readonly displayName?: string;
}
