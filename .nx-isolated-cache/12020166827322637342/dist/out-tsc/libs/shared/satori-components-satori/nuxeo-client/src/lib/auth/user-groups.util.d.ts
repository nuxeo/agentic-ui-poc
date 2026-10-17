/** Nuxeo built-in group granting limited administration access in Web UI. */
export declare const NUXEO_POWERUSERS_GROUP = "powerusers";
/** Reads `properties.groups` from Nuxeo `GET /me` (shape varies slightly by version). */
export declare function readGroupsFromMe(me: unknown): string[];
/** True when the user belongs to the `powerusers` group (case-insensitive). */
export declare function isPowerUserFromGroups(groups: readonly string[]): boolean;
//# sourceMappingURL=user-groups.util.d.ts.map