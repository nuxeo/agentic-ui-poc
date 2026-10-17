/** Nuxeo built-in group granting limited administration access in Web UI. */
export const NUXEO_POWERUSERS_GROUP = 'powerusers';
/** Reads `properties.groups` from Nuxeo `GET /me` (shape varies slightly by version). */
export function readGroupsFromMe(me) {
    if (!me || typeof me !== 'object')
        return [];
    const props = me['properties'];
    if (!props || typeof props !== 'object')
        return [];
    const groups = props['groups'];
    if (!Array.isArray(groups))
        return [];
    return groups.filter((g) => typeof g === 'string');
}
/** True when the user belongs to the `powerusers` group (case-insensitive). */
export function isPowerUserFromGroups(groups) {
    return groups.some((g) => g.trim().toLowerCase() === NUXEO_POWERUSERS_GROUP);
}
//# sourceMappingURL=user-groups.util.js.map