import type { PrincipalRef } from './refs';

/**
 * Open string union of permission names. Adapters MUST translate the known members
 * (`Read`/`Write`/`Everything`) exactly across backends; the open tail allows
 * backend-specific names that callers branch on explicitly.
 */
export type PermissionName = 'Read' | 'Write' | 'Everything' | (string & Record<never, never>);

/**
 * A neutral permission entry (ACE). The optional temporal fields are honoured by
 * adapters that support them and degraded with a documented contract by those that
 * do not; {@link PermissionsCapabilities} reports which an adapter honours.
 */
export interface Permission {
  readonly id: string;
  readonly principal: PrincipalRef;
  readonly permission: PermissionName;
  /** `true` for a grant, `false` for an explicit deny. */
  readonly granted: boolean;
  /** Whether this ACE is effective (resolved) rather than directly set. */
  readonly effective: boolean;
  /** Where the ACE originates (e.g. local vs inherited); adapter-defined vocabulary. */
  readonly source?: string;
  readonly begin?: string;
  readonly end?: string;
}

/** The shape supplied when granting a permission — {@link Permission} minus server-assigned fields. */
export type NewPermission = Omit<Permission, 'id' | 'effective' | 'source'>;
