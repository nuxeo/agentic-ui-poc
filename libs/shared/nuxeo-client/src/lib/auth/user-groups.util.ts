/** Nuxeo built-in group granting limited administration access in Web UI. */
export const NUXEO_POWERUSERS_GROUP = 'powerusers';

/** Reads `properties.groups` from Nuxeo `GET /me` (shape varies slightly by version). */
export function readGroupsFromMe(me: unknown): string[] {
  if (!me || typeof me !== 'object') return [];
  const props = (me as Record<string, unknown>)['properties'];
  if (!props || typeof props !== 'object') return [];
  const groups = (props as Record<string, unknown>)['groups'];
  if (!Array.isArray(groups)) return [];
  return groups.filter((g): g is string => typeof g === 'string');
}

/** True when the user belongs to the `powerusers` group (case-insensitive). */
export function isPowerUserFromGroups(groups: readonly string[]): boolean {
  return groups.some((g) => g.trim().toLowerCase() === NUXEO_POWERUSERS_GROUP);
}
