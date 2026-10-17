/** Nuxeo may return a plain string or an enriched user/group entity when fetch-acls is set. */
export function resolveAcePrincipal(value) {
    if (typeof value === 'string')
        return value;
    if (!value || typeof value !== 'object')
        return '';
    const entity = value;
    return (entity.properties?.username ??
        entity.properties?.groupname ??
        entity.groupname ??
        entity.id ??
        entity.name ??
        entity.grouplabel ??
        '');
}
/**
 * The display name of an extended ACE principal (`fetch-acls: extended`): a user's first and last
 * name, or a group's label. Empty when the server sent only the id, or no name beyond it.
 */
function resolveAcePrincipalLabel(value) {
    if (!value || typeof value !== 'object')
        return '';
    const entity = value;
    const text = (v) => (typeof v === 'string' ? v.trim() : '');
    const person = [text(entity.properties?.firstName), text(entity.properties?.lastName)]
        .filter(Boolean)
        .join(' ');
    return person || text(entity.grouplabel) || text(entity.properties?.grouplabel);
}
/**
 * Prefer a non-empty enricher value from `updated`; fall back to `existing`.
 * Empty arrays are treated as absent so a PUT without enrichers (or with
 * `permissions: []`) does not wipe known permissions — including masking a
 * genuine server-side revocation until the next full fetch.
 */
export function preferEnricherValue(updated, existing) {
    if (Array.isArray(updated)) {
        return updated.length > 0 ? updated : existing;
    }
    return updated ?? existing;
}
function mergeEnricherValue(updated, existing, treatEmptyAsAbsent) {
    if (treatEmptyAsAbsent) {
        return preferEnricherValue(updated, existing);
    }
    return updated !== undefined ? updated : existing;
}
/**
 * Merges context enrichers from a permissions fetch or document update into an existing document.
 * Spreads enrichers from `updated`, then overlays `acls` and `permissions`.
 */
export function mergeDocumentPermissionsContext(existing, updated, options) {
    const treatEmptyAsAbsent = options?.treatEmptyEnricherAsAbsent ?? false;
    const normalized = normalizeDocumentAcls(updated);
    return {
        ...existing,
        contextParameters: {
            ...existing.contextParameters,
            ...normalized.contextParameters,
            acls: mergeEnricherValue(normalized.contextParameters?.['acls'], existing.contextParameters?.['acls'], treatEmptyAsAbsent),
            permissions: mergeEnricherValue(normalized.contextParameters?.['permissions'], existing.contextParameters?.['permissions'], treatEmptyAsAbsent),
        },
    };
}
/** Normalizes ACL username/creator fields to strings for UI and automation calls. */
export function normalizeDocumentAcls(doc) {
    const acls = doc.contextParameters?.['acls'];
    if (!acls?.length)
        return doc;
    const normalizedAcls = acls.map((acl) => ({
        ...acl,
        aces: acl.aces.map((ace) => {
            const label = resolveAcePrincipalLabel(ace.username);
            return {
                ...ace,
                username: resolveAcePrincipal(ace.username),
                ...(label ? { usernameLabel: label } : {}),
                creator: ace.creator ? resolveAcePrincipal(ace.creator) : null,
            };
        }),
    }));
    return {
        ...doc,
        contextParameters: {
            ...doc.contextParameters,
            acls: normalizedAcls,
        },
    };
}
