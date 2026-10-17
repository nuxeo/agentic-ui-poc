/** True when an ACE principal matches a logical user or group id (with optional prefixes). */
export function matchesPrincipal(aceUsername, logicalPrincipal) {
    if (aceUsername === logicalPrincipal)
        return true;
    if (aceUsername === `user:${logicalPrincipal}`)
        return true;
    if (aceUsername === `group:${logicalPrincipal}`)
        return true;
    return aceUsername.replace(/^(user:|group:)/, '') === logicalPrincipal;
}
//# sourceMappingURL=principal-match.utils.js.map